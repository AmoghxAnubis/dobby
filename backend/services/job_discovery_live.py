"""
Dobby — Live Job Discovery
Fetches live jobs from Remotive API and inserts them into the jobs database.
"""

import httpx
import logging
from typing import List, Dict, Any
from database.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

async def fetch_live_jobs(limit: int = 15) -> List[Dict[str, Any]]:
    """
    Fetches real remote developer jobs from Remotive API.
    """
    url = "https://remotive.com/api/remote-jobs?category=software-dev"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=15.0)
            response.raise_for_status()
            data = response.json()
            jobs = data.get("jobs", [])[:limit]
            
            client_db = get_supabase_client()
            inserted_jobs = []
            
            for job in jobs:
                # Map Remotive schema to Dobby schema
                job_data = {
                    "title": job.get("title", ""),
                    "company": job.get("company_name", ""),
                    "location": job.get("candidate_required_location", "Remote"),
                    "description": job.get("description", ""), # HTML
                    "url": job.get("url", ""),
                    "salary_info": job.get("salary", "Competitive"),
                    "source": "remotive",
                    "requirements": [], # We can leave empty, analyzer will use description
                }
                
                # Check if exists by URL
                existing = client_db.table("jobs").select("id").eq("url", job_data["url"]).execute()
                if existing.data:
                    continue
                
                result = client_db.table("jobs").insert(job_data).execute()
                if result.data:
                    inserted_jobs.append(result.data[0])
                    
            logger.info(f"Successfully synced {len(inserted_jobs)} new live jobs from Remotive.")
            return inserted_jobs
            
        except Exception as e:
            logger.error(f"Error fetching live jobs: {e}")
            raise Exception("Failed to sync live jobs from external API.")
