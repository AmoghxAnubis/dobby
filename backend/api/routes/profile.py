"""
Dobby — Profile API Routes
CRUD endpoints for user profile and job preferences.
"""

from fastapi import APIRouter, HTTPException, File, UploadFile
from database.supabase_client import get_supabase_client
from database.models import (
    ProfileCreate,
    ProfileUpdate,
    JobPreferencesBase,
    JobPreferencesUpdate,
)
from services.resume_parser import parse_resume_to_profile

router = APIRouter(prefix="/profile", tags=["profile"])


# ─── Profile CRUD ─────────────────────────────────────────

@router.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    """Uploads a PDF resume and extracts the fields using Gemini."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported at this time.")
    
    try:
        content = await file.read()
        parsed_data = await parse_resume_to_profile(content, file.filename)
        return {"status": "success", "data": parsed_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_profile(profile: ProfileCreate):
    """Create a new user profile."""
    client = get_supabase_client()
    data = profile.model_dump()
    result = client.table("profiles").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create profile")
    return result.data[0]


@router.get("/")
async def get_profiles():
    """Get all profiles (single-user for now, returns list)."""
    client = get_supabase_client()
    result = client.table("profiles").select("*").execute()
    return result.data


@router.get("/{profile_id}")
async def get_profile(profile_id: str):
    """Get a specific profile by ID."""
    client = get_supabase_client()
    result = client.table("profiles").select("*").eq("id", profile_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data[0]


@router.patch("/{profile_id}")
async def update_profile(profile_id: str, profile: ProfileUpdate):
    """Update an existing profile."""
    client = get_supabase_client()
    data = profile.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = client.table("profiles").update(data).eq("id", profile_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data[0]


@router.delete("/{profile_id}")
async def delete_profile(profile_id: str):
    """Delete a profile."""
    client = get_supabase_client()
    result = client.table("profiles").delete().eq("id", profile_id).execute()
    return {"message": "Profile deleted", "id": profile_id}


# ─── Job Preferences CRUD ─────────────────────────────────

@router.post("/{profile_id}/preferences")
async def create_preferences(profile_id: str, prefs: JobPreferencesBase):
    """Create job preferences for a profile."""
    client = get_supabase_client()
    data = prefs.model_dump()
    data["profile_id"] = profile_id
    result = client.table("job_preferences").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create preferences")
    return result.data[0]


@router.get("/{profile_id}/preferences")
async def get_preferences(profile_id: str):
    """Get job preferences for a profile."""
    client = get_supabase_client()
    result = client.table("job_preferences").select("*").eq("profile_id", profile_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return result.data[0]


@router.patch("/{profile_id}/preferences")
async def update_preferences(profile_id: str, prefs: JobPreferencesUpdate):
    """Update job preferences."""
    client = get_supabase_client()
    data = prefs.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = (
        client.table("job_preferences")
        .update(data)
        .eq("profile_id", profile_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return result.data[0]
