"""
Dobby — Job Analyzer Service
Uses Google Gemini to score job descriptions against user profiles.
Falls back to a local Ollama instance if Gemini is unavailable.
"""

import json
import logging
from typing import Dict, Any
import google.generativeai as genai
import httpx
from pydantic import BaseModel, Field

from config.settings import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

# We define the JSON schema we want Gemini to return
class JobAnalysisResult(BaseModel):
    relevance_score: float = Field(description="A score from 0.0 to 10.0 indicating how well the job matches the user's profile and preferences. 10 is a perfect match.")
    skill_match: float = Field(description="A percentage score from 0.0 to 100.0 indicating how many of the required skills the user possesses.")
    ats_score: float = Field(description="A percentage score from 0.0 to 100.0 predicting how well the user's profile would pass an ATS (Applicant Tracking System) for this specific job.")
    should_apply: bool = Field(description="Boolean indicating whether the user should apply for this job based on the relevance score (e.g., score >= 7.0) and their preferences.")
    analysis: str = Field(description="A Markdown-formatted brief analysis (2-3 paragraphs max) explaining the pros, cons, and missing skills for this job fit. Be direct and objective.")


# ─── Shared Prompt Builder ────────────────────────────────────

def _build_analysis_prompt(
    job_details: Dict[str, Any],
    profile: Dict[str, Any],
    preferences: Dict[str, Any],
) -> str:
    jd = job_details.get("description", "")[:5000]
    return f"""You are Dobby, an expert AI Technical Recruiter and Career Coach.
Your task is to analyze a job posting against a candidate's profile and preferences.

# Candidate Profile
Name: {profile.get("name")}
Location: {profile.get("location")}
Education: {profile.get("education")}
Experience: {profile.get("experience")}
Skills: {", ".join(profile.get("skills", []))}
Projects/Portfolio: {profile.get("projects")}

# Candidate Preferences
Target Roles: {", ".join(preferences.get("target_roles", []))}
Target Locations: {", ".join(preferences.get("locations", []))}
Remote Preference: {preferences.get("remote_preference")}

# Job Posting
Role/Title: {job_details.get("role")}
Company: {job_details.get("company")}
Location: {job_details.get("location")}
Description:
{jd}

Analyze the fit objectively. Pay close attention to required years of experience vs candidate experience, required tech stack vs candidate skills, and location preferences vs job location.

Return the result strictly as a valid JSON object with these exact keys:
- "relevance_score": number 0.0-10.0 (how well the job matches the candidate)
- "skill_match": number 0.0-100.0 (percentage of required skills the candidate has)
- "ats_score": number 0.0-100.0 (ATS pass probability)
- "should_apply": boolean (true if relevance_score >= 7.0 and good overall fit)
- "analysis": string (2-3 paragraph Markdown analysis of pros, cons, missing skills)

Return ONLY the JSON object. DO NOT wrap it in markdown codeblocks or add any other text."""


# ─── Gemini Backend ──────────────────────────────────────────

async def _analyze_with_gemini(
    prompt: str,
) -> Dict[str, Any]:
    """Call Gemini with structured output."""
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=JobAnalysisResult,
            temperature=0.2,
        ),
    )
    return json.loads(response.text)


# ─── Ollama Backend ──────────────────────────────────────────

async def _analyze_with_ollama(
    prompt: str,
    model_name: str = "llama3.1:8b",
) -> Dict[str, Any]:
    """Call a local Ollama instance as LLM fallback."""
    ollama_url = f"{settings.ollama_base_url}/api/generate"

    payload = {
        "model": model_name,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.2,
            "num_predict": 2048,
        },
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(ollama_url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    raw_text = data.get("response", "")
    result = json.loads(raw_text)

    # Validate / clamp values coming from potentially less-capable local model
    result["relevance_score"] = max(0.0, min(10.0, float(result.get("relevance_score", 0))))
    result["skill_match"] = max(0.0, min(100.0, float(result.get("skill_match", 0))))
    result["ats_score"] = max(0.0, min(100.0, float(result.get("ats_score", 0))))
    result["should_apply"] = bool(result.get("should_apply", False))
    result["analysis"] = str(result.get("analysis", "No analysis provided."))
    return result


# ─── Main Analyzer Class ────────────────────────────────────

class JobAnalyzer:
    """Service to analyze job relevance using LLMs (Gemini → Ollama fallback)."""

    async def analyze_job_match(
        self,
        job_details: Dict[str, Any],
        profile: Dict[str, Any],
        preferences: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Analyzes a job description against a user's profile.
        Tries Gemini first; falls back to Ollama if unavailable.
        """
        jd = job_details.get("description", "")
        if not jd:
            logger.warning("No job description provided for analysis.")
            return self._fallback_response("No job description text available.")

        prompt = _build_analysis_prompt(job_details, profile, preferences)

        # ── Strategy 1: Gemini ────────────────────────────────
        if settings.gemini_api_key:
            try:
                logger.info("Analyzing via Gemini…")
                result = await _analyze_with_gemini(prompt)
                result["_provider"] = "gemini"
                return result
            except Exception as e:
                logger.warning(f"Gemini analysis failed, falling back to Ollama: {e}")
        else:
            logger.info("No Gemini API key — skipping directly to Ollama.")

        # ── Strategy 2: Ollama ────────────────────────────────
        try:
            logger.info("Analyzing via Ollama…")
            result = await _analyze_with_ollama(prompt)
            result["_provider"] = "ollama"
            return result
        except httpx.ConnectError:
            logger.error("Ollama is not running at %s", settings.ollama_base_url)
            return self._fallback_response(
                f"Both Gemini and Ollama are unavailable. "
                f"Start Ollama (`ollama serve`) or set GEMINI_API_KEY."
            )
        except Exception as e:
            logger.error(f"Ollama analysis also failed: {e}")
            return self._fallback_response(str(e))

    def _fallback_response(self, error: str = "") -> Dict[str, Any]:
        return {
            "relevance_score": 0.0,
            "skill_match": 0.0,
            "ats_score": 0.0,
            "should_apply": False,
            "analysis": f"**Analysis Unavailable**\nDobby was unable to process this job description. {error}",
            "_provider": "none",
        }
