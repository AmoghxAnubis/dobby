"""
Dobby — Application Settings
Loads environment variables via Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Dobby"
    app_env: str = "development"
    log_level: str = "INFO"

    # Google Gemini
    gemini_api_key: str

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str

    # Ollama (local fallback)
    ollama_base_url: str = "http://localhost:11434"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
