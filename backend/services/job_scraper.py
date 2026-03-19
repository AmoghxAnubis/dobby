"""
Dobby — Job Scraper Service (Stub)
LinkedIn job scraper using Playwright.
Will be implemented in Phase 3.
"""


class JobScraper:
    """Scrapes job listings from LinkedIn."""

    def __init__(self):
        self.platform = "linkedin"

    async def scrape_jobs(self, search_query: str, location: str = "", limit: int = 50):
        """Scrape jobs from LinkedIn based on search query."""
        # TODO: Implement in Phase 3
        raise NotImplementedError("Job scraping will be implemented in Phase 3")

    async def normalize_job(self, raw_data: dict) -> dict:
        """Normalize raw scraped data into standard job format."""
        # TODO: Implement in Phase 3
        raise NotImplementedError
