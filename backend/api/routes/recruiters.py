"""
Dobby — Recruiters API Routes
Endpoints for recruiter management and outreach messages.
"""

from fastapi import APIRouter, HTTPException, Query
from database.supabase_client import get_supabase_client
from database.models import (
    RecruiterCreate,
    OutreachMessageCreate,
    OutreachMessageUpdate,
)
from typing import Optional

router = APIRouter(prefix="/recruiters", tags=["recruiters"])


# ─── Recruiter CRUD ───────────────────────────────────────

@router.post("/")
async def create_recruiter(recruiter: RecruiterCreate):
    """Add a new recruiter."""
    client = get_supabase_client()
    data = recruiter.model_dump()
    result = client.table("recruiters").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create recruiter")
    return result.data[0]


@router.get("/")
async def list_recruiters(
    company: Optional[str] = None,
    limit: int = Query(default=50, le=100),
):
    """List all recruiters."""
    client = get_supabase_client()
    query = client.table("recruiters").select("*")
    if company:
        query = query.ilike("company", f"%{company}%")
    result = query.order("created_at", desc=True).limit(limit).execute()
    return result.data


@router.get("/{recruiter_id}")
async def get_recruiter(recruiter_id: str):
    """Get a specific recruiter."""
    client = get_supabase_client()
    result = client.table("recruiters").select("*").eq("id", recruiter_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return result.data[0]


# ─── Outreach Messages ────────────────────────────────────

@router.post("/{recruiter_id}/messages")
async def create_outreach_message(recruiter_id: str, message: OutreachMessageCreate):
    """Create a draft outreach message."""
    client = get_supabase_client()
    data = message.model_dump()
    data["recruiter_id"] = recruiter_id
    result = client.table("outreach_messages").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create message")
    return result.data[0]


@router.get("/{recruiter_id}/messages")
async def list_outreach_messages(recruiter_id: str):
    """List all outreach messages for a recruiter."""
    client = get_supabase_client()
    result = (
        client.table("outreach_messages")
        .select("*")
        .eq("recruiter_id", recruiter_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.patch("/messages/{message_id}")
async def update_outreach_message(message_id: str, update: OutreachMessageUpdate):
    """Update an outreach message (edit draft or change status)."""
    client = get_supabase_client()
    data = update.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = (
        client.table("outreach_messages")
        .update(data)
        .eq("id", message_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Message not found")
    return result.data[0]
