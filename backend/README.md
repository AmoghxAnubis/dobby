# Dobby Backend

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

## API Docs

Open http://localhost:8000/docs for Swagger UI.

## Database Setup

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the SQL from `python database/schema.py`
3. Paste and run in the SQL editor
