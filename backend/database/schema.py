"""
Dobby — Supabase Schema Setup Script
Run this once to create all tables in Supabase.
"""

from database.supabase_client import get_supabase_client


# SQL statements to create all tables
SCHEMA_SQL = """
-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    education TEXT,
    skills TEXT[] DEFAULT '{}',
    experience TEXT,
    projects TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Preferences
CREATE TABLE IF NOT EXISTS job_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_roles TEXT[] DEFAULT '{}',
    locations TEXT[] DEFAULT '{}',
    remote_preference TEXT DEFAULT 'any' CHECK (remote_preference IN ('remote', 'onsite', 'hybrid', 'any')),
    salary_min INTEGER,
    salary_max INTEGER,
    max_apps_per_day INTEGER DEFAULT 20,
    outreach_enabled BOOLEAN DEFAULT TRUE,
    recruiter_messaging BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT DEFAULT 'linkedin',
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    description TEXT,
    salary TEXT,
    location TEXT,
    remote BOOLEAN,
    raw_data JSONB,
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Scores
CREATE TABLE IF NOT EXISTS job_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    relevance_score NUMERIC(3,1) CHECK (relevance_score >= 0 AND relevance_score <= 10),
    skill_match NUMERIC(5,2) CHECK (skill_match >= 0 AND skill_match <= 100),
    ats_score NUMERIC(5,2) CHECK (ats_score >= 0 AND ats_score <= 100),
    should_apply BOOLEAN DEFAULT FALSE,
    analysis TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'recruiter_response', 'interview', 'offer', 'rejected')),
    resume_version_id UUID,
    cover_letter TEXT,
    notes TEXT,
    applied_at TIMESTAMPTZ,
    response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    content TEXT,
    file_url TEXT,
    is_master BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recruiters
CREATE TABLE IF NOT EXISTS recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    platform TEXT DEFAULT 'linkedin',
    profile_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outreach Messages
CREATE TABLE IF NOT EXISTS outreach_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES recruiters(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    message_text TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'replied')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_job_preferences_updated_at') THEN
        CREATE TRIGGER update_job_preferences_updated_at BEFORE UPDATE ON job_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_applications_updated_at') THEN
        CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_platform ON jobs(platform);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_job_scores_job_id ON job_scores(job_id);
CREATE INDEX IF NOT EXISTS idx_job_scores_profile_id ON job_scores(profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_profile_id ON applications(profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_resumes_profile_id ON resumes(profile_id);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_recruiter_id ON outreach_messages(recruiter_id);
"""


def setup_schema():
    """Create all tables in Supabase."""
    client = get_supabase_client()
    # Execute raw SQL via Supabase's rpc
    # We'll use the SQL editor approach - this script outputs the SQL
    print("=" * 60)
    print("DOBBY DATABASE SCHEMA")
    print("=" * 60)
    print()
    print("Run the following SQL in your Supabase SQL Editor:")
    print("(Dashboard → SQL Editor → New Query → Paste → Run)")
    print()
    print(SCHEMA_SQL)
    print()
    print("=" * 60)
    return SCHEMA_SQL


if __name__ == "__main__":
    setup_schema()
