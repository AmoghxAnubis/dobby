"""
Dobby — Resume Parser Service
Extracts text from PDF/DOCX files and uses Gemini to map it to a Profile structure.
"""

import io
import json
import logging
from typing import Dict, Any
import google.generativeai as genai
from PyPDF2 import PdfReader

from config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from a PDF file."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise ValueError("Could not parse PDF file. Ensure it is a valid PDF document.")

async def parse_resume_to_profile(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Parses a PDF resume and uses LLM to map the contents to a Profile schema mapping.
    """
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured.")
        
    text = ""
    if filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    else:
        # For MVP we focus on PDF.
        raise ValueError("Unsupported file format. Please upload a PDF.")

    if not text.strip():
        raise ValueError("No extractable text found in the document. Is it an image-based PDF?")

    prompt = f"""You are an expert Resume Parser.
I am providing you the raw extracted text from a candidate's resume/CV.
Your task is to accurately extract the information into the following JSON schema:
{{
  "name": "Candidate Full Name",
  "email": "Candidate Email (or empty string)",
  "phone": "Candidate Phone (or empty string)",
  "location": "Candidate Location (or empty string)",
  "education": "A concise summary string of their education (e.g., 'B.S. Computer Science, University of X, 2020')",
  "skills": ["List", "Of", "Core", "Skills", "Extracted"],
  "experience": "A concise summary string of their work experience (e.g., 'Software Engineer at X (2020-Present), Junior Developer at Y (2018-2020)')"
}}

Rules:
- Do NOT hallucinate information. If a field is not present in the resume, leave it as an empty string.
- Keep `education` and `experience` as concise text summaries. We do not need the full bullet points for this base profile.
- Extract up to 15 of their top technical and professional skills into the `skills` array.

Raw Resume Text:
{text[:15000]}
"""

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )
    
    try:
        parsed_data = json.loads(response.text)
        return parsed_data
    except Exception as e:
        logger.error(f"Failed to parse LLM JSON response: {e}")
        raise ValueError("Failed to parse resume into structured format.")
