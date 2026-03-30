"""
Dobby — Documents API Routes
Endpoints for generating and downloading tailored resumes and cover letters.
"""

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from database.supabase_client import get_supabase_client
from services.document_builder import generate_tailored_resume, generate_cover_letter, create_docx_from_resume_data

router = APIRouter(prefix="/documents", tags=["documents"])

class DocumentGenerateRequest(BaseModel):
    profile_id: str
    job_id: str

@router.post("/resume/generate")
async def generate_resume_endpoint(req: DocumentGenerateRequest):
    """Generates a tailored resume for a specific job and saves the structured data."""
    client = get_supabase_client()
    
    # Fetch profile and job
    profile_res = client.table("profiles").select("*").eq("id", req.profile_id).execute()
    job_res = client.table("jobs").select("*").eq("id", req.job_id).execute()
    
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not job_res.data:
        raise HTTPException(status_code=404, detail="Job not found")
        
    profile = profile_res.data[0]
    job = job_res.data[0]
    
    # Generate content via Gemini
    try:
        tailored_data = await generate_tailored_resume(profile, job)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # Save the generated JSON to the resumes table
    label = f"{job['company']} - {job['role']}"
    resume_entry = {
        "profile_id": req.profile_id,
        "label": label,
        "content": json.dumps(tailored_data),
        "is_master": False
    }
    
    res = client.table("resumes").insert(resume_entry).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to save resume")
        
    # Also update the application record if it exists, or create one
    app_res = client.table("applications").select("*").eq("job_id", req.job_id).eq("profile_id", req.profile_id).execute()
    if not app_res.data:
         client.table("applications").insert({
            "job_id": req.job_id,
            "profile_id": req.profile_id,
            "resume_version_id": res.data[0]["id"],
            "status": "saved"
         }).execute()
    else:
         client.table("applications").update({"resume_version_id": res.data[0]["id"]}).eq("id", app_res.data[0]["id"]).execute()
         
    return res.data[0]

@router.post("/cover-letter/generate")
async def generate_cover_letter_endpoint(req: DocumentGenerateRequest):
    """Generates a tailored cover letter and saves it to the specific application."""
    client = get_supabase_client()
    
    profile_res = client.table("profiles").select("*").eq("id", req.profile_id).execute()
    job_res = client.table("jobs").select("*").eq("id", req.job_id).execute()
    
    if not profile_res.data or not job_res.data:
         raise HTTPException(status_code=404, detail="Profile or job not found")
         
    profile, job = profile_res.data[0], job_res.data[0]
    
    try:
        body = await generate_cover_letter(profile, job)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # Ensure application exists to attach cover letter
    app_res = client.table("applications").select("*").eq("job_id", req.job_id).eq("profile_id", req.profile_id).execute()
    if app_res.data:
         client.table("applications").update({"cover_letter": body}).eq("id", app_res.data[0]["id"]).execute()
    else:
         client.table("applications").insert({
             "job_id": req.job_id,
             "profile_id": req.profile_id,
             "cover_letter": body,
             "status": "saved"
         }).execute()
         
    return {"message": "Cover letter generated successfully", "cover_letter": body}


@router.get("/resume/{resume_id}/download")
async def download_resume_docx(resume_id: str):
    """Fetches a resume, parses its JSON content, and streams a dynamically generated .docx file."""
    client = get_supabase_client()
    res = client.table("resumes").select("*").eq("id", resume_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    resume_db = res.data[0]
    if not resume_db.get("content"):
        raise HTTPException(status_code=400, detail="Resume has no generated content")
        
    try:
        resume_data = json.loads(resume_db["content"])
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Stored resume content is not valid JSON")

    docx_stream = create_docx_from_resume_data(resume_data)
    
    # Sanitize label for filename
    safe_label = "".join(c for c in resume_db["label"] if c.isalnum() or c in (' ', '-', '_')).rstrip()
    filename = f"{safe_label}_Resume.docx"
    
    return StreamingResponse(
        docx_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/resumes")
async def get_resumes(profile_id: str):
    """Gets all generated resumes for a profile."""
    client = get_supabase_client()
    res = client.table("resumes").select("*").eq("profile_id", profile_id).order("created_at", desc=True).execute()
    return res.data
