-- ============================================================
-- Dobby — Initial Database Schema
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────
create table if not exists profiles (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    email text not null,
    phone text,
    location text,
    education text,
    skills text[] default '{}',
    experience text,
    projects text,
    portfolio_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ─── Job Preferences ────────────────────────────────────────
create table if not exists job_preferences (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    target_roles text[] default '{}',
    locations text[] default '{}',
    remote_preference text default 'any' check (remote_preference in ('remote', 'onsite', 'hybrid', 'any')),
    salary_min integer,
    salary_max integer,
    max_apps_per_day integer default 20,
    outreach_enabled boolean default true,
    recruiter_messaging boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (profile_id)
);

-- ─── Jobs ────────────────────────────────────────────────────
create table if not exists jobs (
    id uuid primary key default uuid_generate_v4(),
    platform text default 'linkedin',
    company text not null,
    role text not null,
    url text not null,
    description text,
    salary text,
    location text,
    remote boolean,
    raw_data jsonb,
    scraped_at timestamptz default now()
);

-- ─── Job Scores ──────────────────────────────────────────────
create table if not exists job_scores (
    id uuid primary key default uuid_generate_v4(),
    job_id uuid not null references jobs(id) on delete cascade,
    profile_id uuid not null references profiles(id) on delete cascade,
    relevance_score numeric(4,2) default 0 check (relevance_score >= 0 and relevance_score <= 10),
    skill_match numeric(5,2) default 0 check (skill_match >= 0 and skill_match <= 100),
    ats_score numeric(5,2) default 0 check (ats_score >= 0 and ats_score <= 100),
    should_apply boolean default false,
    analysis text,
    created_at timestamptz default now(),
    unique (job_id, profile_id)
);

-- ─── Applications ────────────────────────────────────────────
create type application_status as enum (
    'saved', 'applied', 'recruiter_response', 'interview', 'offer', 'rejected'
);

create table if not exists applications (
    id uuid primary key default uuid_generate_v4(),
    job_id uuid not null references jobs(id) on delete cascade,
    profile_id uuid not null references profiles(id) on delete cascade,
    status application_status default 'saved',
    resume_version_id uuid,
    cover_letter text,
    notes text,
    applied_at timestamptz,
    response text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ─── Resumes ─────────────────────────────────────────────────
create table if not exists resumes (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    label text not null,
    content text,
    file_url text,
    is_master boolean default false,
    created_at timestamptz default now()
);

-- Add FK from applications to resumes (after resumes table exists)
alter table applications
    add constraint fk_applications_resume
    foreign key (resume_version_id) references resumes(id) on delete set null;

-- ─── Recruiters ──────────────────────────────────────────────
create table if not exists recruiters (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    company text,
    platform text default 'linkedin',
    profile_url text,
    created_at timestamptz default now()
);

-- ─── Outreach Messages ──────────────────────────────────────
create type outreach_status as enum ('draft', 'sent', 'replied');

create table if not exists outreach_messages (
    id uuid primary key default uuid_generate_v4(),
    recruiter_id uuid not null references recruiters(id) on delete cascade,
    job_id uuid references jobs(id) on delete set null,
    message_text text not null,
    status outreach_status default 'draft',
    created_at timestamptz default now()
);

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists idx_jobs_platform on jobs(platform);
create index if not exists idx_jobs_company on jobs(company);
create index if not exists idx_jobs_scraped_at on jobs(scraped_at desc);
create index if not exists idx_job_scores_profile on job_scores(profile_id);
create index if not exists idx_job_scores_relevance on job_scores(relevance_score desc);
create index if not exists idx_applications_profile on applications(profile_id);
create index if not exists idx_applications_status on applications(status);
create index if not exists idx_resumes_profile on resumes(profile_id);
create index if not exists idx_outreach_recruiter on outreach_messages(recruiter_id);

-- ─── Updated-at triggers ─────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
    before update on profiles
    for each row execute function update_updated_at();

create trigger trg_job_preferences_updated_at
    before update on job_preferences
    for each row execute function update_updated_at();

create trigger trg_applications_updated_at
    before update on applications
    for each row execute function update_updated_at();

-- ─── Row Level Security (basic — disabled for service role) ──
alter table profiles enable row level security;
alter table job_preferences enable row level security;
alter table jobs enable row level security;
alter table job_scores enable row level security;
alter table applications enable row level security;
alter table resumes enable row level security;
alter table recruiters enable row level security;
alter table outreach_messages enable row level security;

-- Allow service role full access (our backend uses service_role key)
create policy "Service role full access" on profiles for all using (true) with check (true);
create policy "Service role full access" on job_preferences for all using (true) with check (true);
create policy "Service role full access" on jobs for all using (true) with check (true);
create policy "Service role full access" on job_scores for all using (true) with check (true);
create policy "Service role full access" on applications for all using (true) with check (true);
create policy "Service role full access" on resumes for all using (true) with check (true);
create policy "Service role full access" on recruiters for all using (true) with check (true);
create policy "Service role full access" on outreach_messages for all using (true) with check (true);
