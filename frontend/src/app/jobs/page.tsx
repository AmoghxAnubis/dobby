"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search, MapPin, Building, Globe, ExternalLink, Play, Loader2,
  Briefcase, Zap, SlidersHorizontal, Sparkles, TrendingUp, Filter, FileText, CheckCircle2
} from "lucide-react";
import { useProfile } from "@/context/profile-context";
import { jobsApi, documentsApi } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────

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

interface JobScore {
  id: string;
  job_id: string;
  profile_id: string;
  relevance_score: number;
  skill_match: number;
  ats_score: number;
  should_apply: boolean;
  analysis: string;
  _provider?: string;
}

type TabKey = "all" | "top" | "analyzed";

// ─── Page ──────────────────────────────────────────────────────

export default function JobDiscoveryPage() {
  const { profile } = useProfile();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scoresMap, setScoresMap] = useState<Record<string, JobScore>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{ message: string; scraped: number; inserted: number } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [minScore, setMinScore] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Data Fetching ─────────────────────────────────────────

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

  const fetchScores = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const map = await jobsApi.batchScores(profile.id);
      setScoresMap(map);
    } catch (err) {
      // No scores yet — that's fine
      console.error("Failed to fetch scores:", err);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  // ── Scrape Handler ────────────────────────────────────────

  const handleScrape = async () => {
    if (!profile?.id) return;
    setIsScraping(true);
    setScrapeResult(null);
    try {
      const result = await jobsApi.scrape(profile.id);
      setScrapeResult(result);
      await fetchJobs();
    } catch (err) {
      console.error("Scraping failed:", err);
      setScrapeResult({ message: "Scraper failed. Please try again.", scraped: 0, inserted: 0 });
    } finally {
      setIsScraping(false);
    }
  };

  // ── Callback to update a single score in the map ─────────

  const onScoreUpdate = useCallback((jobId: string, score: JobScore) => {
    setScoresMap((prev) => ({ ...prev, [jobId]: score }));
  }, []);

  // ── Filtered/Sorted Views ────────────────────────────────

  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(
      (j) =>
        j.role.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.location && j.location.toLowerCase().includes(q))
    );
  }, [jobs, searchQuery]);

  const analyzedJobs = useMemo(
    () => searchFiltered.filter((j) => scoresMap[j.id]),
    [searchFiltered, scoresMap]
  );

  const topMatches = useMemo(
    () =>
      analyzedJobs
        .filter((j) => scoresMap[j.id].relevance_score >= minScore)
        .sort((a, b) => scoresMap[b.id].relevance_score - scoresMap[a.id].relevance_score),
    [analyzedJobs, scoresMap, minScore]
  );

  const displayJobs =
    activeTab === "top" ? topMatches : activeTab === "analyzed" ? analyzedJobs : searchFiltered;

  // ── Stats ────────────────────────────────────────────────

  const totalAnalyzed = Object.keys(scoresMap).length;
  const avgScore =
    totalAnalyzed > 0
      ? (Object.values(scoresMap).reduce((s, v) => s + v.relevance_score, 0) / totalAnalyzed).toFixed(1)
      : "—";

  // ── Render ───────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 1200, display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
      {/* Header & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-md)" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)" }}>
            Job Discovery
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6, margin: "6px 0 0 0" }}>
            Scrape, analyze, and filter active jobs with AI-powered matching.
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
              Running Playwright Scraper…
            </>
          ) : (
            <>
              <Play size={16} />
              Run Job Scraper
            </>
          )}
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-md)" }}>
        <div className="metric-card">
          <span className="metric-label">Discovered</span>
          <span className="metric-value">{jobs.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Analyzed</span>
          <span className="metric-value">{totalAnalyzed}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avg Score</span>
          <span className="metric-value">{avgScore}</span>
        </div>
      </div>

      {/* Scrape result banner */}
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

      {/* Search & Tabs */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {/* Search Bar */}
        <div style={{
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
            placeholder="Search jobs by role, company, or location…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Tab Switcher + Threshold */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-sm)" }}>
          <div style={{ display: "flex", gap: 2, background: "var(--bg-card)", borderRadius: "var(--radius-sm)", padding: 3, border: "1px solid var(--border-primary)" }}>
            {([
              { key: "all" as TabKey, label: "All Jobs", icon: <Briefcase size={14} />, count: searchFiltered.length },
              { key: "analyzed" as TabKey, label: "Analyzed", icon: <Sparkles size={14} />, count: analyzedJobs.length },
              { key: "top" as TabKey, label: "Top Matches", icon: <TrendingUp size={14} />, count: topMatches.length },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: activeTab === tab.key ? "var(--bg-elevated)" : "transparent",
                  color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-tertiary)",
                }}
              >
                {tab.icon}
                {tab.label}
                <span style={{
                  fontSize: 11,
                  background: activeTab === tab.key ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 600,
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Threshold Slider — only on Top Matches tab */}
          {activeTab === "top" && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "var(--radius-sm)",
              padding: "6px 14px",
            }}>
              <Filter size={14} style={{ color: "var(--text-tertiary)" }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                Min Score:
              </span>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value))}
                style={{ width: 100, accentColor: "var(--accent-purple)" }}
              />
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: minScore >= 7 ? "var(--accent-green)" : minScore >= 4 ? "var(--accent-orange)" : "var(--accent-red)",
                fontFamily: "var(--font-heading)",
                minWidth: 28,
                textAlign: "center",
              }}>
                {minScore}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div style={{ padding: "var(--space-3xl) 0", display: "flex", justifyContent: "center" }}>
          <Loader2 size={40} style={{ color: "var(--text-tertiary)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : displayJobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-3xl)" }}>
          <Briefcase size={40} style={{ color: "var(--text-muted)", marginBottom: "var(--space-md)", display: "inline-block" }} />
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: "0 0 var(--space-sm)",
            fontFamily: "var(--font-heading)",
          }}>
            {activeTab === "all"
              ? "No jobs discovered yet"
              : activeTab === "analyzed"
              ? "No jobs analyzed yet"
              : "No jobs match this threshold"}
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: "0 auto", maxWidth: 440 }}>
            {activeTab === "all"
              ? "Click \"Run Job Scraper\" to have Dobby search LinkedIn for roles matching your active preferences."
              : activeTab === "analyzed"
              ? "Click \"Analyze Fit\" on any job card to run an AI-powered match analysis."
              : `Try lowering the minimum score below ${minScore} to see more results.`}
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "var(--space-lg)"
        }}>
          {displayJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              profileId={profile?.id}
              existingScore={scoresMap[job.id] || null}
              onScoreUpdate={onScoreUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Score Ring Component ───────────────────────────────────────

function ScoreRing({ value, max, size = 44, strokeWidth = 4, color }: {
  value: number; max: number; size?: number; strokeWidth?: number; color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

// ─── JobCard Component ─────────────────────────────────────────

function JobCard({ job, profileId, existingScore, onScoreUpdate }: {
  job: Job;
  profileId?: string;
  existingScore: JobScore | null;
  onScoreUpdate: (jobId: string, score: JobScore) => void;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
  const [docsGenerated, setDocsGenerated] = useState(false);
  const score = existingScore;

  const handleGenerateDocs = async () => {
    if (!profileId) return;
    setIsGeneratingDocs(true);
    try {
      await documentsApi.generateResume(profileId, job.id);
      await documentsApi.generateCoverLetter(profileId, job.id);
      setDocsGenerated(true);
    } catch (err) {
      console.error("Failed to generate docs:", err);
    } finally {
      setIsGeneratingDocs(false);
    }
  };

  const handleAnalyze = async () => {
    if (!profileId) return;
    setIsAnalyzing(true);
    try {
      const res = await jobsApi.analyze(job.id, profileId);
      onScoreUpdate(job.id, res);
    } catch (err) {
      console.error("Failed to analyze job:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreColor = (val: number, max: number) => {
    const pct = val / max;
    if (pct >= 0.7) return "var(--accent-green)";
    if (pct >= 0.4) return "var(--accent-orange)";
    return "var(--accent-red)";
  };

  return (
    <div className="card" style={{
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-md)",
      animation: "fadeIn 0.35s ease-out forwards",
    }}>
      {/* Card Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0", lineHeight: 1.3 }}>
            {job.role}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14 }}>
            <Building size={14} />
            <span>{job.company}</span>
          </div>
        </div>
        {score && (
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ScoreRing value={score.relevance_score} max={10} color={scoreColor(score.relevance_score, 10)} />
            <span style={{
              position: "absolute",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--font-heading)",
              color: scoreColor(score.relevance_score, 10),
            }}>
              {score.relevance_score}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
        {job.location && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12,
            padding: "4px 8px", borderRadius: "var(--radius-full)",
            background: "rgba(255, 255, 255, 0.05)", color: "var(--text-secondary)",
          }}>
            <MapPin size={12} />
            {job.location}
          </span>
        )}
        {job.remote && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12,
            padding: "4px 8px", borderRadius: "var(--radius-full)",
            background: "rgba(10, 132, 255, 0.1)", color: "var(--accent-blue)",
          }}>
            <Globe size={12} />
            Remote
          </span>
        )}
        {score?._provider && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11,
            padding: "3px 8px", borderRadius: "var(--radius-full)",
            background: score._provider === "gemini" ? "rgba(191, 90, 242, 0.1)" : "rgba(255, 159, 10, 0.1)",
            color: score._provider === "gemini" ? "var(--accent-purple)" : "var(--accent-orange)",
            fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em",
          }}>
            <Zap size={10} />
            {score._provider}
          </span>
        )}
      </div>

      {/* Score Panel (if analyzed) */}
      {score && (
        <div style={{
          background: "var(--bg-elevated)",
          padding: "var(--space-md)",
          borderRadius: "var(--radius-sm)",
          border: `1px solid ${score.should_apply ? 'rgba(50, 215, 75, 0.25)' : 'var(--border-primary)'}`,
        }}>
          {/* Score Dials Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "var(--space-sm)",
            marginBottom: "var(--space-md)",
            textAlign: "center"
          }}>
            <div>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <ScoreRing value={score.relevance_score} max={10} size={52} strokeWidth={5} color={scoreColor(score.relevance_score, 10)} />
                <span style={{ position: "absolute", fontSize: 12, fontWeight: 700, color: scoreColor(score.relevance_score, 10), fontFamily: "var(--font-heading)" }}>
                  {score.relevance_score}
                </span>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Relevance</div>
            </div>
            <div>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <ScoreRing value={score.skill_match} max={100} size={52} strokeWidth={5} color={scoreColor(score.skill_match, 100)} />
                <span style={{ position: "absolute", fontSize: 11, fontWeight: 700, color: scoreColor(score.skill_match, 100), fontFamily: "var(--font-heading)" }}>
                  {Math.round(score.skill_match)}
                </span>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Skills</div>
            </div>
            <div>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <ScoreRing value={score.ats_score} max={100} size={52} strokeWidth={5} color={scoreColor(score.ats_score, 100)} />
                <span style={{ position: "absolute", fontSize: 11, fontWeight: 700, color: scoreColor(score.ats_score, 100), fontFamily: "var(--font-heading)" }}>
                  {Math.round(score.ats_score)}
                </span>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>ATS</div>
            </div>
          </div>

          {/* Should Apply Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: "var(--space-sm)",
            background: score.should_apply ? "rgba(50, 215, 75, 0.12)" : "rgba(255, 59, 48, 0.12)",
            color: score.should_apply ? "var(--accent-green)" : "var(--accent-red)",
          }}>
            {score.should_apply ? "✓ Recommended" : "✗ Not Recommended"}
          </div>

          {/* Analysis Text */}
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {score.analysis}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Footer Actions */}
      <div style={{
        borderTop: "1px solid var(--border-primary)",
        paddingTop: "var(--space-sm)",
        marginTop: "var(--space-xs)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {!score ? (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !profileId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              background: "transparent",
              color: "var(--accent-purple)",
              border: "1px solid rgba(191, 90, 242, 0.3)",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              cursor: isAnalyzing ? "not-allowed" : "pointer",
              opacity: isAnalyzing ? 0.7 : 1,
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            {isAnalyzing ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={14} />}
            {isAnalyzing ? "Analyzing…" : "Analyze Fit"}
          </button>
        ) : (
          <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                background: "transparent",
                color: "var(--text-tertiary)",
                border: "1px solid var(--border-primary)",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                cursor: isAnalyzing ? "not-allowed" : "pointer",
                fontWeight: 500,
              }}
            >
              {isAnalyzing ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={12} />}
              {isAnalyzing ? "Re-analyzing…" : "Re-analyze"}
            </button>
            <button
              onClick={handleGenerateDocs}
              disabled={isGeneratingDocs || docsGenerated}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                background: docsGenerated ? "rgba(50, 215, 75, 0.1)" : "transparent",
                color: docsGenerated ? "var(--accent-green)" : "var(--accent-blue)",
                border: `1px solid ${docsGenerated ? "rgba(50, 215, 75, 0.3)" : "rgba(10, 132, 255, 0.3)"}`,
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                cursor: (isGeneratingDocs || docsGenerated) ? "not-allowed" : "pointer",
                fontWeight: 600,
                opacity: isGeneratingDocs ? 0.7 : 1,
                transition: "all 0.2s ease"
              }}
            >
              {isGeneratingDocs ? (
                <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
              ) : docsGenerated ? (
                <CheckCircle2 size={12} />
              ) : (
                <FileText size={12} />
              )}
              {isGeneratingDocs ? "Generating Docs…" : docsGenerated ? "Docs Generated" : "Generate Docs"}
            </button>
          </div>
        )}

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
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        >
          View Job <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
