"""
Dobby — Database Setup Utility
Run this script to verify the Supabase connection and check if tables exist.
Usage: python -m database.setup
"""

import sys
import os

# Add backend dir to path so imports work when running as a module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import get_settings
from database.supabase_client import get_supabase_client


EXPECTED_TABLES = [
    "profiles",
    "job_preferences",
    "jobs",
    "job_scores",
    "applications",
    "resumes",
    "recruiters",
    "outreach_messages",
]


def check_connection():
    """Verify we can connect to Supabase."""
    settings = get_settings()
    print(f"🔌 Connecting to Supabase: {settings.supabase_url}")

    try:
        client = get_supabase_client()
        print("✅ Supabase client created successfully!")
        return client
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        sys.exit(1)


def check_tables(client):
    """Check which tables exist by attempting a select on each."""
    print("\n📋 Checking tables...")
    missing = []

    for table in EXPECTED_TABLES:
        try:
            result = client.table(table).select("*").limit(0).execute()
            print(f"  ✅ {table}")
        except Exception as e:
            error_msg = str(e)
            if "does not exist" in error_msg or "404" in error_msg or "relation" in error_msg:
                print(f"  ❌ {table} — NOT FOUND")
                missing.append(table)
            else:
                print(f"  ⚠️  {table} — {error_msg}")
                missing.append(table)

    return missing


def main():
    print("=" * 50)
    print("  Dobby — Database Setup Check")
    print("=" * 50)

    client = check_connection()
    missing = check_tables(client)

    print("\n" + "=" * 50)
    if not missing:
        print("🎉 All tables exist! Database is ready.")
    else:
        print(f"⚠️  Missing {len(missing)} table(s): {', '.join(missing)}")
        print("\n📝 To create the tables, run the SQL migration:")
        print("   1. Go to your Supabase Dashboard → SQL Editor")
        print("   2. Paste the contents of database/migrations/001_initial_schema.sql")
        print("   3. Click 'Run'")
        print("   4. Re-run this script to verify")
    print("=" * 50)


if __name__ == "__main__":
    main()
