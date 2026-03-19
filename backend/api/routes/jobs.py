"""
Dobby — Jobs API Routes
Endpoints for job discovery and job scores.
"""

from fastapi import APIRouter, HTTPException, Query
from database.supabase_client import get_supabase_client
from typing import Optional

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/")
async def list_jobs(
    platform: Optional[str] = None,
    company: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    offset: int = 0,
):
    """List discovered jobs with optional filters."""
    client = get_supabase_client()
    query = client.table("jobs").select("*")

    if platform:
        query = query.eq("platform", platform)
    if company:
        query = query.ilike("company", f"%{company}%")

    result = query.order("scraped_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data


@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get a specific job by ID."""
    client = get_supabase_client()
    result = client.table("jobs").select("*").eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return result.data[0]


@router.get("/{job_id}/score")
async def get_job_score(job_id: str, profile_id: str):
    """Get the relevance score for a job against a profile."""
    client = get_supabase_client()
    result = (
        client.table("job_scores")
        .select("*")
        .eq("job_id", job_id)
        .eq("profile_id", profile_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Score not found")
    return result.data[0]


@router.get("/scored/")
async def list_scored_jobs(
    profile_id: str,
    min_score: float = 0,
    limit: int = Query(default=50, le=100),
):
    """List jobs with scores above a threshold for a profile."""
    client = get_supabase_client()
    result = (
        client.table("job_scores")
        .select("*, jobs(*)")
        .eq("profile_id", profile_id)
        .gte("relevance_score", min_score)
        .order("relevance_score", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data
