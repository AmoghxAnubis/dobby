"""
Dobby — Data Models
Pydantic models for all application entities.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# ─── Enums ───────────────────────────────────────────────

class ApplicationStatus(str, Enum):
    SAVED = "saved"
    APPLIED = "applied"
    RECRUITER_RESPONSE = "recruiter_response"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"


class OutreachStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    REPLIED = "replied"


class RemotePreference(str, Enum):
    REMOTE = "remote"
    ONSITE = "onsite"
    HYBRID = "hybrid"
    ANY = "any"


# ─── Profile ─────────────────────────────────────────────

class ProfileBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    education: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    experience: Optional[str] = None
    projects: Optional[str] = None
    portfolio_url: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[list[str]] = None
    experience: Optional[str] = None
    projects: Optional[str] = None
    portfolio_url: Optional[str] = None


class Profile(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime


# ─── Job Preferences ─────────────────────────────────────

class JobPreferencesBase(BaseModel):
    target_roles: list[str] = Field(default_factory=list)
    locations: list[str] = Field(default_factory=list)
    remote_preference: RemotePreference = RemotePreference.ANY
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    max_apps_per_day: int = 20
    outreach_enabled: bool = True
    recruiter_messaging: bool = True


class JobPreferencesCreate(JobPreferencesBase):
    profile_id: str


class JobPreferencesUpdate(BaseModel):
    target_roles: Optional[list[str]] = None
    locations: Optional[list[str]] = None
    remote_preference: Optional[RemotePreference] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    max_apps_per_day: Optional[int] = None
    outreach_enabled: Optional[bool] = None
    recruiter_messaging: Optional[bool] = None


class JobPreferences(JobPreferencesBase):
    id: str
    profile_id: str
    created_at: datetime
    updated_at: datetime


# ─── Job ──────────────────────────────────────────────────

class JobBase(BaseModel):
    platform: str = "linkedin"
    company: str
    role: str
    url: str
    description: Optional[str] = None
    salary: Optional[str] = None
    location: Optional[str] = None
    remote: Optional[bool] = None


class JobCreate(JobBase):
    raw_data: Optional[dict] = None


class Job(JobBase):
    id: str
    raw_data: Optional[dict] = None
    scraped_at: datetime


# ─── Job Score ────────────────────────────────────────────

class JobScore(BaseModel):
    id: str
    job_id: str
    profile_id: str
    relevance_score: float = Field(ge=0, le=10)
    skill_match: float = Field(ge=0, le=100)
    ats_score: float = Field(ge=0, le=100)
    should_apply: bool
    analysis: Optional[str] = None
    created_at: datetime


# ─── Application ─────────────────────────────────────────

class ApplicationBase(BaseModel):
    job_id: str
    profile_id: str
    status: ApplicationStatus = ApplicationStatus.SAVED
    resume_version_id: Optional[str] = None
    cover_letter: Optional[str] = None
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    resume_version_id: Optional[str] = None
    cover_letter: Optional[str] = None
    notes: Optional[str] = None


class Application(ApplicationBase):
    id: str
    applied_at: Optional[datetime] = None
    response: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ─── Resume ───────────────────────────────────────────────

class ResumeBase(BaseModel):
    profile_id: str
    label: str
    content: Optional[str] = None
    file_url: Optional[str] = None
    is_master: bool = False


class ResumeCreate(ResumeBase):
    pass


class Resume(ResumeBase):
    id: str
    created_at: datetime


# ─── Recruiter ────────────────────────────────────────────

class RecruiterBase(BaseModel):
    name: str
    company: Optional[str] = None
    platform: str = "linkedin"
    profile_url: Optional[str] = None


class RecruiterCreate(RecruiterBase):
    pass


class Recruiter(RecruiterBase):
    id: str
    created_at: datetime


# ─── Outreach Message ────────────────────────────────────

class OutreachMessageBase(BaseModel):
    recruiter_id: str
    job_id: Optional[str] = None
    message_text: str
    status: OutreachStatus = OutreachStatus.DRAFT


class OutreachMessageCreate(OutreachMessageBase):
    pass


class OutreachMessageUpdate(BaseModel):
    message_text: Optional[str] = None
    status: Optional[OutreachStatus] = None


class OutreachMessage(OutreachMessageBase):
    id: str
    created_at: datetime
