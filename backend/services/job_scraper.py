"""
Dobby — Job Scraper Service
LinkedIn job scraper using Playwright async API.
"""
import urllib.parse
from typing import List, Dict
from playwright.async_api import async_playwright
import logging

logger = logging.getLogger(__name__)

class LinkedInScraper:
    """Scrapes job listings from public LinkedIn search."""

    def __init__(self):
        self.platform = "linkedin"

    async def scrape_jobs(self, search_query: str, location: str = "", remote: bool = False, limit: int = 20) -> List[Dict]:
        """Scrape jobs from LinkedIn based on search queries."""
        base_url = "https://www.linkedin.com/jobs/search"
        
        params = {
            "keywords": search_query,
            "location": location,
            "position": 1,
            "pageNum": 0,
            "f_TPR": "r604800" # past week
        }

        if remote:
            params["f_WT"] = "2" # 2 means remote in LinkedIn

        query_string = urllib.parse.urlencode(params)
        url = f"{base_url}?{query_string}"
        
        jobs = []

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            # Create a context with a realistic user agent
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080}
            )
            page = await context.new_page()

            logger.info(f"Navigating to {url}")
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                
                # Wait for the job list to load (public search uses this class)
                await page.wait_for_selector("ul.jobs-search__results-list", timeout=15000)

                # Wait slightly for items to render
                await page.wait_for_timeout(2000)

                # Scroll down slowly to load lazy items
                for _ in range(3):
                    await page.evaluate("window.scrollBy(0, 1000)")
                    await page.wait_for_timeout(1000)

                # Extract job cards
                card_handles = await page.query_selector_all("ul.jobs-search__results-list > li")
                
                for card in card_handles[:limit]:
                    title_elem = await card.query_selector("h3.base-search-card__title")
                    company_elem = await card.query_selector("h4.base-search-card__subtitle")
                    location_elem = await card.query_selector("span.job-search-card__location")
                    url_elem = await card.query_selector("a.base-card__full-link")
                    
                    if not title_elem or not company_elem or not url_elem:
                        continue

                    title = await title_elem.inner_text()
                    company = await company_elem.inner_text()
                    loc = await location_elem.inner_text() if location_elem else ""
                    job_url = await url_elem.get_attribute("href")
                    
                    if job_url:
                        # Clean tracking parameters from URL
                        job_url = job_url.split("?")[0]

                    jobs.append({
                        "platform": self.platform,
                        "role": title.strip(),
                        "company": company.strip(),
                        "location": loc.strip(),
                        "url": job_url,
                        "remote": remote,
                        "raw_data": {}
                    })
                    
            except Exception as e:
                logger.error(f"Error scraping LinkedIn: {e}")
            finally:
                await browser.close()

        return jobs
