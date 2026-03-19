"""
Dobby — Supabase Client
Initializes and provides the Supabase client instance.
"""

from supabase import create_client, Client
from functools import lru_cache
from config.settings import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """Get a cached Supabase client instance using the service role key."""
    settings = get_settings()
    client = create_client(
        settings.supabase_url,
        settings.supabase_service_key
    )
    return client


def get_supabase_anon_client() -> Client:
    """Get a Supabase client with anon key (for frontend-like access)."""
    settings = get_settings()
    return create_client(
        settings.supabase_url,
        settings.supabase_anon_key
    )
