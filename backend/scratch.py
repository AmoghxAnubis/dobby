import os, sys, asyncio
sys.path.insert(0, os.path.abspath('.'))
from database.supabase_client import get_supabase_client
from services.analyzer import JobAnalyzer

client = get_supabase_client()
job = client.table('jobs').select('*').limit(1).execute().data[0]
prof = client.table('profiles').select('*').limit(1).execute().data[0]
pref = client.table('job_preferences').select('*').eq('profile_id', prof['id']).execute().data[0]

async def run():
    a = JobAnalyzer()
    res = await a.analyze_job_match(job, prof, pref)
    print(res)

asyncio.run(run())
