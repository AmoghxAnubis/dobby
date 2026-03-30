"""
Dobby — Jobs API Routes
Endpoints for job discovery and job scores.
"""

from fastapi import APIRouter, HTTPException, Query
from database.supabase_client import get_supabase_client
from database.models import JobCreate
from services.job_scraper import LinkedInScraper
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/scrape")
async def trigger_job_scrape(profile_id: str):
    """
    Trigger the job scraper mechanism for a specific profile.
    Reads the profile's JobPreferences and spins off the LinkedIn scraper.
    """
    client = get_supabase_client()
    
    # 1. Fetch Job Preferences
    pref_res = client.table("job_preferences").select("*").eq("profile_id", profile_id).execute()
    if not pref_res.data:
        raise HTTPException(status_code=404, detail="Job preferences not found for this profile")
    
    preferences = pref_res.data[0]
    roles = preferences.get("target_roles", [])
    locations = preferences.get("locations", [])
    remote_pref = preferences.get("remote_preference", "any")
    
    # Default fallback if empty
    if not roles:
        roles = ["Software Engineer"]
    if not locations:
        locations = ["United States"]
        
    is_remote = remote_pref in ["remote", "any"]

    limit_per_query = 10  # Keep it small to avoid blocking too long in this sync request

    scraper = LinkedInScraper()
    all_scraped_jobs = []

    # 2. Iterate through role/location combinations
    # For performance, we'll just do the first combination, or combine them
    for role in roles[:2]:
        for loc in locations[:1]:
            try:
                jobs = await scraper.scrape_jobs(
                    search_query=role, 
                    location=loc, 
                    remote=is_remote, 
                    limit=limit_per_query
                )
                all_scraped_jobs.extend(jobs)
            except Exception as e:
                logger.error(f"Scraper failed for {role} in {loc}: {e}")

    if not all_scraped_jobs:
        return {"message": "No jobs found or scraper failed", "count": 0}

    # 3. Soft Deduplication based on URL
    extracted_urls = [job["url"] for job in all_scraped_jobs if job.get("url")]
    
    existing_jobs = []
    if extracted_urls:
        # Supabase in filter accepts a list
        existing_res = client.table("jobs").select("url").in_("url", extracted_urls).execute()
        existing_jobs = [row["url"] for row in existing_res.data]

    new_jobs = [job for job in all_scraped_jobs if job["url"] and job["url"] not in existing_jobs]

    # 4. Insert into database
    inserted_count = 0
    if new_jobs:
        try:
            insert_res = client.table("jobs").insert(new_jobs).execute()
            inserted_count = len(insert_res.data)
        except Exception as e:
            logger.error(f"Failed to insert jobs into Supabase: {e}")
            raise HTTPException(status_code=500, detail="Failed to save jobs")

    return {
        "message": "Scrape completed successfully",
        "scraped": len(all_scraped_jobs),
        "inserted": inserted_count
    }


@router.post("/{job_id}/analyze")
async def analyze_job(job_id: str, profile_id: str):
    """
    On-demand endpoint to deeply scrape a job description (if missing)
    and analyze it against the user's profile using Gemini.
    """
    client = get_supabase_client()

    # 1. Fetch Job
    job_res = client.table("jobs").select("*").eq("id", job_id).execute()
    if not job_res.data:
        raise HTTPException(status_code=404, detail="Job not found")
    job = job_res.data[0]

    # 2. Scrape deep description if missing
    if not job.get("description"):
        scraper = LinkedInScraper()
        try:
            desc = await scraper.scrape_job_description(job["url"])
            if desc:
                # Update DB cache
                client.table("jobs").update({"description": desc}).eq("id", job_id).execute()
                job["description"] = desc
            else:
                raise Exception("Failed to extract description text")
        except Exception as e:
            logger.error(f"Failed to scrape job description: {e}")
            raise HTTPException(status_code=500, detail="Could not scrape job description from source.")

    # 3. Fetch Profile and Preferences
    prof_res = client.table("profiles").select("*").eq("id", profile_id).execute()
    pref_res = client.table("job_preferences").select("*").eq("profile_id", profile_id).execute()
    
    if not prof_res.data or not pref_res.data:
        raise HTTPException(status_code=404, detail="Profile or Preferences not found")
        
    profile = prof_res.data[0]
    preferences = pref_res.data[0]

    # 4. Analyze with Gemini
    from services.analyzer import JobAnalyzer
    analyzer = JobAnalyzer()
    
    analysis_result = await analyzer.analyze_job_match(job, profile, preferences)

    # 5. Save Score to Database (Upsert style by checking first or just inserting if unique)
    # The unique constraint is on (job_id, profile_id). We can do an upsert or check manually.
    existing_score = client.table("job_scores").select("id").eq("job_id", job_id).eq("profile_id", profile_id).execute()
    
    score_data = {
        "job_id": job_id,
        "profile_id": profile_id,
        "relevance_score": analysis_result.get("relevance_score", 0),
        "skill_match": analysis_result.get("skill_match", 0),
        "ats_score": analysis_result.get("ats_score", 0),
        "should_apply": analysis_result.get("should_apply", False),
        "analysis": analysis_result.get("analysis", "")
    }

    if existing_score.data:
        # Update existing
        score_id = existing_score.data[0]["id"]
        res = client.table("job_scores").update(score_data).eq("id", score_id).execute()
    else:
        # Insert new
        res = client.table("job_scores").insert(score_data).execute()

    return res.data[0] if res.data else score_data


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


@router.get("/scores/batch")
async def batch_scores(profile_id: str):
    """Get all existing scores for a profile, keyed by job_id."""
    client = get_supabase_client()
    result = (
        client.table("job_scores")
        .select("*")
        .eq("profile_id", profile_id)
        .execute()
    )
    # Return as a dict keyed by job_id for easy frontend lookup
    scores_map = {}
    for row in result.data:
        scores_map[row["job_id"]] = row
    return scores_map


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
