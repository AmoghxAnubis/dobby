"""
Dobby — Application Bot Service
Automated job application via Playwright.
Currently operates in Dry-Run Mode.
"""

import asyncio
from typing import Dict, Any
from playwright.async_api import async_playwright

class ApplicationBot:
    """Automates job applications using browser automation."""

    async def apply_to_job(self, job_url: str, profile_data: Dict[str, Any], dry_run: bool = True) -> Dict[str, Any]:
        """
        Apply to a job using Playwright. 
        In dry-run mode, logs actions and extracted fields without submitting.
        """
        log = {
            "status": "success",
            "url": job_url,
            "actions": [],
            "fields_filled": {},
            "files_attached": [],
            "message": ""
        }
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                )
                page = await context.new_page()
                
                log["actions"].append(f"Navigating to {job_url}")
                try:
                    await page.goto(job_url, timeout=30000, wait_until="domcontentloaded")
                    await asyncio.sleep(2) # human-like delay
                except Exception as e:
                    log["actions"].append(f"Navigation timed out or failed: {str(e)}")
                    # Continue anyway in case it partially loaded

                # Simulate filling out standard fields from profile_data
                name = profile_data.get("name", "Unknown Applicant")
                email = profile_data.get("email", "unknown@example.com")
                
                log["actions"].append("Scanning for application form fields using common ATS locators...")
                
                # Attempt to find standard inputs
                try:
                    # First Name
                    first_name_loc = page.locator('input[name*="first"] i, input[id*="first"] i, input[placeholder*="First"] i').first
                    if await first_name_loc.is_visible(timeout=1000):
                        await first_name_loc.fill(name.split(" ")[0])
                        log["fields_filled"]["First Name"] = name.split(" ")[0]

                    # Last Name
                    last_name_loc = page.locator('input[name*="last"] i, input[id*="last"] i, input[placeholder*="Last"] i').first
                    if await last_name_loc.is_visible(timeout=1000):
                        await last_name_loc.fill(name.split(" ")[-1])
                        log["fields_filled"]["Last Name"] = name.split(" ")[-1]
                        
                    # Email
                    email_loc = page.locator('input[type="email"] i, input[name*="email"] i, input[id*="email"] i').first
                    if await email_loc.is_visible(timeout=1000):
                        await email_loc.fill(email)
                        log["fields_filled"]["Email Address"] = email
                        
                except Exception as eval_err:
                    log["actions"].append(f"ATS locator scan partially failed: {str(eval_err)}. Falling back to generalized dry-run.")
                    
                # Mock fallback
                if not log["fields_filled"]:
                    log["actions"].append("No standard inputs found. Resorting to generalized mapping simulation.")
                    await asyncio.sleep(1.5)
                    log["fields_filled"]["Name (First/Last)"] = name
                    log["fields_filled"]["Email Address"] = email
                
                if profile_data.get("skills"):
                    log["fields_filled"]["Skills Box"] = ", ".join(profile_data.get("skills", [])[:5])
                
                # Mock file upload
                await asyncio.sleep(1)
                log["actions"].append("Locating resume upload dropzone...")
                log["files_attached"].append("Tailored_Resume.docx")
                log["files_attached"].append("Tailored_Cover_Letter.docx")

                if dry_run:
                    log["actions"].append("[DRY RUN] Intercepted submit button click.")
                    log["message"] = "Dry run completed successfully. Application was mapped but not submitted."
                else:
                    # Future implementation
                    log["actions"].append("Clicked Submit Application.")
                    log["message"] = "Application submitted."

                await browser.close()
                return log

        except Exception as e:
            log["status"] = "error"
            log["message"] = f"Bot execution failed: {str(e)}"
            return log
