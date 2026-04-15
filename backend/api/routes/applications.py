"""
Dobby — Applications API Routes
Endpoints for application tracking (Kanban pipeline).
"""

from fastapi import APIRouter, HTTPException, Query
from database.supabase_client import get_supabase_client
from database.models import ApplicationCreate, ApplicationUpdate
from typing import Optional
import json
from pydantic import BaseModel
from services.application_bot import ApplicationBot

router = APIRouter(prefix="/applications", tags=["applications"])

class ApplyRequest(BaseModel):
    profile_id: str
    job_id: str

@router.post("/apply")
async def execute_dry_run_application(req: ApplyRequest):
    """Run an automated application (dry-run mode)."""
    client = get_supabase_client()
    
    # Get profile data
    profile_res = client.table("profiles").select("*").eq("id", req.profile_id).execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = profile_res.data[0]
    
    # Get Job URL
    job_res = client.table("jobs").select("*").eq("id", req.job_id).execute()
    if not job_res.data:
        raise HTTPException(status_code=404, detail="Job not found")
    job_url = job_res.data[0]["url"]
    
    # Initialize Bot
    bot = ApplicationBot()
    log = await bot.apply_to_job(job_url, profile, dry_run=True)
    
    # Map back to application in DB
    app_data = {
        "job_id": req.job_id,
        "profile_id": req.profile_id,
        "status": "applied",
        "notes": json.dumps(log, indent=2)
    }
    result = client.table("applications").insert(app_data).execute()
    
    return {"log": log, "application_id": result.data[0]["id"] if result.data else None}

@router.post("/")
async def create_application(application: ApplicationCreate):
    """Create a new application entry."""
    client = get_supabase_client()
    data = application.model_dump()
    result = client.table("applications").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create application")
    return result.data[0]


@router.get("/")
async def list_applications(
    profile_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    offset: int = 0,
):
    """List applications with optional filters."""
    client = get_supabase_client()
    query = client.table("applications").select("*, jobs(*)")

    if profile_id:
        query = query.eq("profile_id", profile_id)
    if status:
        query = query.eq("status", status)

    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data


@router.get("/{application_id}")
async def get_application(application_id: str):
    """Get a specific application."""
    client = get_supabase_client()
    result = (
        client.table("applications")
        .select("*, jobs(*)")
        .eq("id", application_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Application not found")
    return result.data[0]


@router.patch("/{application_id}")
async def update_application(application_id: str, update: ApplicationUpdate):
    """Update an application (e.g., status change in Kanban)."""
    client = get_supabase_client()
    data = update.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = (
        client.table("applications")
        .update(data)
        .eq("id", application_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Application not found")
    return result.data[0]


@router.delete("/{application_id}")
async def delete_application(application_id: str):
    """Delete an application."""
    client = get_supabase_client()
    client.table("applications").delete().eq("id", application_id).execute()
    return {"message": "Application deleted", "id": application_id}


@router.get("/pipeline/summary")
async def pipeline_summary(profile_id: str):
    """Get application counts grouped by status (for Kanban overview)."""
    client = get_supabase_client()
    result = (
        client.table("applications")
        .select("status")
        .eq("profile_id", profile_id)
        .execute()
    )
    # Count by status
    counts = {}
    for app in result.data:
        status = app["status"]
        counts[status] = counts.get(status, 0) + 1
    return counts
