import asyncio
from services.job_scraper import LinkedInScraper

async def test():
    print("Initializing scraper...")
    s = LinkedInScraper()
    print("Scraping...")
    try:
        jobs = await s.scrape_jobs("Software Engineer", "San Francisco", limit=5)
        print(f"Found {len(jobs)} jobs:")
        for j in jobs:
            print(f"- {j['role']} at {j['company']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
