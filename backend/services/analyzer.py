"""
Dobby — Job Analyzer Service
Uses Google Gemini to score job descriptions against user profiles.
"""

import json
import logging
from typing import Dict, Any
import google.generativeai as genai
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

class JobAnalyzer:
    """Service to analyze job relevance using LLMs."""

    def __init__(self):
        # We use gemini-2.5-flash as it's fast, cheap, and very capable
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    async def analyze_job_match(
        self, 
        job_details: Dict[str, Any], 
        profile: Dict[str, Any], 
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyzes a job description against a user's profile and preferences.
        Returns a structured dictionary matching the JobAnalysisResult schema.
        """
        if not settings.gemini_api_key:
            logger.error("Gemini API key not configured.")
            return self._fallback_response()

        jd = job_details.get("description", "")
        if not jd:
            logger.warning("No job description provided for analysis.")
            return self._fallback_response()

        prompt = f"""
You are Dobby, an expert AI Technical Recruiter and Career Coach.
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
{jd[:5000]}  # Truncated to avoid context length issues if it's ridiculously long

Analyze the fit objectively. Pay close attention to required years of experience vs candidate experience, required tech stack vs candidate skills, and location preferences vs job location.
Return the result strictly as a valid JSON object matching the requested schema. DO NOT wrap it in markdown codeblocks.
"""
        
        try:
            # Using the new structured outputs feature in Gemini API
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=JobAnalysisResult,
                    temperature=0.2, # Low temp for analytical consistency
                ),
            )
            
            # The response text should be a valid JSON string matching the schema
            result_json = response.text
            result_dict = json.loads(result_json)
            return result_dict
            
        except Exception as e:
            logger.error(f"Failed to analyze job match via Gemini: {e}")
            return self._fallback_response(str(e))

    def _fallback_response(self, error: str = "") -> Dict[str, Any]:
        return {
            "relevance_score": 0.0,
            "skill_match": 0.0,
            "ats_score": 0.0,
            "should_apply": False,
            "analysis": f"**Analysis Unavailable**\nDobby was unable to process this job description. {error}"
        }
