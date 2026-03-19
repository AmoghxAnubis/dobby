"""
Dobby — FastAPI Application Entry Point
The main application with CORS, router registration, and health check.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import get_settings
from api.routes import profile, jobs, applications, recruiters

settings = get_settings()

app = FastAPI(
    title="Dobby API",
    description="Autonomous AI Job-Hunting Agent — Backend API",
    version="0.1.0",
)

# CORS — allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(profile.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(recruiters.router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "env": settings.app_env,
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Dobby — Your Autonomous AI Job-Hunting Agent",
        "docs": "/docs",
        "health": "/health",
    }
