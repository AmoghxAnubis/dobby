1. High-Level Architecture Diagram
                           ┌──────────────────────────┐
                           │        USER DASHBOARD     │
                           │  Profile • Jobs • Stats   │
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────┐
                          │        API GATEWAY        │
                          │        FastAPI Layer      │
                          └─────────────┬─────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                ▼                       ▼                       ▼

        ┌───────────────┐      ┌────────────────┐      ┌────────────────┐
        │ Agent Engine  │      │  Job Discovery │      │ Recruiter Data │
        │ (LangGraph)   │      │     Engine     │      │     Engine     │
        └──────┬────────┘      └──────┬─────────┘      └──────┬─────────┘
               │                      │                       │
               ▼                      ▼                       ▼

      ┌─────────────────────────────────────────────────────────┐
      │                 TOOL INTERFACE LAYER                     │
      │                  (MCP Tool Servers)                      │
      └─────────────────────────────────────────────────────────┘
               │             │             │             │
               ▼             ▼             ▼             ▼

     ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
     │ Job Scraper │ │ Resume Gen  │ │ Apply Bot   │ │ Outreach AI │
     │ Service     │ │ Service     │ │ (Playwright)│ │ Service     │
     └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
            │               │               │               │
            ▼               ▼               ▼               ▼

      ┌───────────────────────────────────────────────────────┐
      │                    INTELLIGENCE LAYER                  │
      │                                                        │
      │   LLM Providers                                        │
      │   - OpenAI                                             │
      │   - Gemini                                             │
      │   - Ollama                                             │
      │                                                        │
      │   Tasks                                                │
      │   - Job analysis                                       │
      │   - Resume tailoring                                   │
      │   - Cover letters                                      │
      │   - Question answering                                 │
      └───────────────────────────────────────────────────────┘
                              │
                              ▼

                 ┌────────────────────────────┐
                 │        DATA STORAGE         │
                 │                            │
                 │ PostgreSQL                 │
                 │ Job Listings               │
                 │ Applications               │
                 │ Recruiter Messages         │
                 │ Resume Versions            │
                 │                            │
                 │ Vector Database            │
                 │ Job embeddings             │
                 │ Resume embeddings          │
                 └────────────────────────────┘
2. Agent Workflow Diagram

This is the LangGraph decision flow.

START
  │
  ▼
SCRAPE JOBS
  │
  ▼
CLEAN + DEDUPLICATE JOBS
  │
  ▼
JOB INTELLIGENCE ENGINE
  │
  ├── Score < Threshold → Discard
  │
  └── Score ≥ Threshold
          │
          ▼
RESUME OPTIMIZATION
          │
          ▼
COVER LETTER GENERATION
          │
          ▼
APPLICATION BOT
          │
          ▼
LOG APPLICATION
          │
          ▼
RECRUITER OUTREACH
          │
          ▼
TRACK RESPONSES
          │
          ▼
LEARNING ENGINE
          │
          ▼
END / LOOP

This runs daily or continuously.

3. Core Microservices

Dobby should be divided into these services.

1️⃣ Job Discovery Service

Responsibilities:

scrape job sites

normalize job data

detect duplicates

Technologies:

Playwright

BeautifulSoup

2️⃣ Job Intelligence Service

Responsibilities:

job description parsing

ATS keyword extraction

job relevance scoring

Uses:

LLM analysis

embedding similarity

3️⃣ Resume Generation Service

Responsibilities:

customize resume per job

inject relevant keywords

export PDF

Libraries:

python-docx

LaTeX templates

4️⃣ Application Automation Service

Responsibilities:

open job pages

fill forms

upload documents

submit applications

Tool:

Playwright

5️⃣ Outreach Service

Responsibilities:

find recruiters

generate personalized messages

send connection requests

Channels:

LinkedIn

Email

6️⃣ Learning Engine

Responsibilities:

track responses

analyze success rates

optimize application strategy

4. Repository Folder Structure

Production-grade structure:

dobby/

backend/
│
├── api/
│   ├── routes/
│   │   ├── jobs.py
│   │   ├── applications.py
│   │   ├── recruiters.py
│   │   └── profile.py
│
├── agents/
│   ├── job_agent.py
│   ├── outreach_agent.py
│   ├── resume_agent.py
│   └── interview_agent.py
│
├── workflows/
│   ├── job_pipeline.py
│   ├── outreach_pipeline.py
│
├── services/
│   ├── job_scraper.py
│   ├── resume_generator.py
│   ├── application_bot.py
│   ├── job_analyzer.py
│
├── mcp_servers/
│   ├── browser_tools.py
│   ├── resume_tools.py
│   ├── job_tools.py
│
├── database/
│   ├── models.py
│   ├── migrations/
│
├── prompts/
│   ├── job_analysis.txt
│   ├── resume_customization.txt
│   ├── cover_letter.txt
│   ├── recruiter_outreach.txt
│
├── config/
│   ├── settings.py
│
└── main.py
5. Prompt Pack for Antigravity

These prompts help Antigravity generate the system automatically.

Prompt 1 — System Generator

Use this to generate the base architecture.

You are a senior AI systems engineer.

Generate a production-grade backend architecture for an autonomous AI job application agent called "Dobby".

The system must include:

- FastAPI backend
- LangGraph agent orchestration
- MCP servers exposing tools
- Playwright browser automation
- PostgreSQL database
- Vector database for embeddings

The system must support:

- job scraping
- job relevance scoring
- resume customization
- automated job applications
- recruiter outreach
- application tracking

Generate:

1. directory structure
2. core services
3. agent workflows
4. database models
5. configuration files
Prompt 2 — Job Intelligence Engine
Create a Python service that analyzes job descriptions.

Inputs:
- job title
- job description
- candidate profile

Outputs:
- skill match score
- ATS keyword match
- job relevance score (0–10)
- boolean should_apply

Use LLM reasoning combined with keyword extraction.

Return structured JSON output.
Prompt 3 — Resume Customization Engine
Build a Python service that dynamically customizes resumes.

Inputs:
- master resume
- job description
- extracted keywords

Tasks:
- highlight relevant projects
- inject keywords for ATS optimization
- adjust skill ordering

Output:
- tailored resume PDF
Prompt 4 — Playwright Apply Bot
Generate a Playwright automation system that applies to jobs automatically.

Capabilities:
- detect application forms
- fill personal information
- upload resume
- paste cover letter
- answer application questions

The system must support multi-step application flows.
Prompt 5 — Recruiter Outreach Generator
Create an AI system that generates personalized recruiter outreach messages.

Inputs:
- job role
- company name
- candidate profile

Outputs:
- LinkedIn connection message
- LinkedIn follow-up message
- recruiter email template

Messages should be short, professional, and personalized.
Prompt 6 — LangGraph Agent
Build a LangGraph agent for an autonomous job search system.

Agent responsibilities:

1. discover jobs
2. analyze job relevance
3. customize resume
4. apply to job
5. message recruiters
6. log applications
7. learn from responses

The agent must maintain memory and track job application outcomes.
6. Deployment Architecture
                ┌──────────────┐
                │   Frontend   │
                │  Dashboard   │
                └──────┬───────┘
                       │
                       ▼

                ┌──────────────┐
                │   FastAPI    │
                │   Backend    │
                └──────┬───────┘
                       │
                       ▼

              ┌─────────────────┐
              │  LangGraph Agent │
              └──────┬──────────┘
                     │
                     ▼

           ┌──────────────────────┐
           │     MCP Tool Layer    │
           └──────┬───────┬───────┘
                  │       │
                  ▼       ▼

        Job Scraper   Apply Bot

                  ▼
          PostgreSQL + Vector DB
7. Future Power Features (Highly Recommended)

Later you can add:

Autonomous browsing agents

Using:

Browser Use

AutoGPT

This lets the AI apply even on unknown websites.

Final Insight

If you build Dobby properly, it becomes more than a tool.

It becomes:

A persistent AI job-hunting agent that runs 24/7.

This is actually a very strong portfolio project for AI engineering roles.