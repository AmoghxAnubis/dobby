"""
Dobby — Applications API Routes
Endpoints for application tracking (Kanban pipeline).
"""

from fastapi import APIRouter, HTTPException, Query
from database.supabase_client import get_supabase_client
from database.models import ApplicationCreate, ApplicationUpdate
from typing import Optional

router = APIRouter(prefix="/applications", tags=["applications"])


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
