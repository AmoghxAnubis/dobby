"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Building, Globe, ExternalLink, Play, Loader2, Briefcase } from "lucide-react";
import { useProfile } from "@/context/profile-context";
import { jobsApi } from "@/lib/api";

interface Job {
  id: string;
  platform: string;
  company: string;
  role: string;
  url: string;
  location: string | null;
  remote: boolean | null;
  scraped_at: string;
}

export default function JobDiscoveryPage() {
  const { profile } = useProfile();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{ message: string; scraped: number; inserted: number } | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await jobsApi.list({ limit: 50 });
      setJobs(data as Job[]);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleScrape = async () => {
    if (!profile?.id) return;
    setIsScraping(true);
    setScrapeResult(null);
    try {
      const result = await jobsApi.scrape(profile.id);
      setScrapeResult(result);
      await fetchJobs(); // Refresh job list
    } catch (err) {
      console.error("Scraping failed:", err);
      setScrapeResult({ message: "Scraper failed. Please try again.", scraped: 0, inserted: 0 });
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, display: "flex", flexDirection: "column", gap: "var(--space-2xl)" }}>
      {/* Header & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-md)" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)" }}>
            Job Discovery
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6, margin: "6px 0 0 0" }}>
            Scrape, filter, and review newly discovered active jobs.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleScrape}
          disabled={isScraping || !profile?.id}
          style={{ width: "fit-content" }}
        >
          {isScraping ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Running Playwright Scraper...
            </>
          ) : (
            <>
              <Play size={16} />
              Run Job Scraper
            </>
          )}
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: "var(--space-sm)" }}>
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-sm)",
          padding: "10px var(--space-md)",
        }}>
          <Search size={16} style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search jobs by role, company, or keywords..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: 14,
              fontFamily: "var(--font-body)",
            }}
          />
        </div>
        <button style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-xs)",
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-sm)",
          padding: "10px var(--space-md)",
          color: "var(--text-secondary)",
          cursor: "pointer",
          fontSize: 13,
          fontFamily: "var(--font-body)",
        }}>
          Filters
        </button>
      </div>

      {scrapeResult && (
        <div style={{
          padding: "var(--space-md)",
          borderRadius: "var(--radius-md)",
          background: scrapeResult.inserted > 0 ? "rgba(50, 215, 75, 0.1)" : "rgba(10, 132, 255, 0.1)",
          border: `1px solid ${scrapeResult.inserted > 0 ? "rgba(50, 215, 75, 0.2)" : "rgba(10, 132, 255, 0.2)"}`,
          color: scrapeResult.inserted > 0 ? "var(--accent-green)" : "var(--accent-blue)",
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)"
        }}>
          {scrapeResult.message}: Found {scrapeResult.scraped} jobs, inserted {scrapeResult.inserted} new ones.
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div style={{ padding: "var(--space-3xl) 0", display: "flex", justifyContent: "center" }}>
          <Loader2 size={40} style={{ color: "var(--text-tertiary)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-3xl)" }}>
          <Briefcase size={40} style={{ color: "var(--text-muted)", marginBottom: "var(--space-md)", display: "inline-block" }} />
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: "0 0 var(--space-sm)",
            fontFamily: "var(--font-heading)",
          }}>
            No jobs discovered yet
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: "0 auto", maxWidth: 400 }}>
            Click &quot;Run Job Scraper&quot; to have Dobby search LinkedIn for roles matching your active preferences.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "var(--space-lg)"
        }}>
          {jobs.map((job) => (
            <div key={job.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {/* Card Header: Role & Company */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
                  {job.role}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14 }}>
                  <Building size={14} />
                  <span>{job.company}</span>
                </div>
              </div>

              {/* Tags: Location, Remote */}
              <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap", marginTop: "auto" }}>
                {job.location && (
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--bg-document)",
                    color: "var(--text-secondary)",
                  }}>
                    <MapPin size={12} />
                    {job.location}
                  </span>
                )}
                {job.remote && (
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(10, 132, 255, 0.1)",
                    color: "var(--accent-blue)",
                  }}>
                    <Globe size={12} />
                    Remote
                  </span>
                )}
              </div>

              {/* Footer Actions */}
              <div style={{ 
                borderTop: "1px solid var(--border-primary)", 
                paddingTop: "var(--space-sm)", 
                marginTop: "var(--space-xs)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  {new Date(job.scraped_at).toLocaleDateString()}
                </span>
                
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.15s ease",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                  onMouseOut={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                >
                  View Job <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
