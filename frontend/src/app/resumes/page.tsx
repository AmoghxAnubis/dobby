"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Download, User, Calendar, Plus, ChevronRight, Loader2, Target } from "lucide-react";
import { useProfile } from "@/context/profile-context";
import { documentsApi } from "@/lib/api";
import Link from "next/link";

interface TailoredResumeData {
  name: string;
  contact_info: string;
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    graduation_year: string;
  }[];
  projects: {
    title: string;
    company: string;
    duration: string;
    bullets: string[];
  }[];
}

interface Resume {
  id: string;
  profile_id: string;
  label: string;
  content: string; // JSON string
  is_master: boolean;
  file_url: string | null;
  created_at: string;
}

export default function ResumesPage() {
  const { profile } = useProfile();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResumes = useCallback(async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    try {
      const data = await documentsApi.listResumes(profile.id);
      setResumes(data as Resume[]);
      if (data && (data as Resume[]).length > 0) {
        setActiveResume((data as Resume[])[0]);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const rawContent = activeResume?.content;
  let parsedContent: TailoredResumeData | null = null;
  if (rawContent) {
    try {
      parsedContent = JSON.parse(rawContent) as TailoredResumeData;
    } catch (e) {
      console.error("Failed to parse resume JSON:", e);
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-3xl) 0" }}>
        <Loader2 size={40} style={{ color: "var(--text-tertiary)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, display: "flex", flexDirection: "column", gap: "var(--space-xl)", height: "calc(100vh - 80px)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)" }}>
            Resume Manager
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6, margin: "6px 0 0 0" }}>
            View and download AI-tailored resumes generated for specific jobs.
          </p>
        </div>
        <Link href="/jobs" style={{ textDecoration: "none" }}>
          <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
            <Target size={14} />
            Find Jobs to Tailor
          </button>
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-3xl)", margin: "auto 0" }}>
          <FileText size={40} style={{ color: "var(--text-muted)", marginBottom: "var(--space-md)", display: "inline-block" }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 var(--space-sm)", fontFamily: "var(--font-heading)" }}>
            No tailored resumes yet
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: "0 auto", maxWidth: 440, lineHeight: 1.5 }}>
            Go to the Job Discovery page, analyze a job to see your fit score, and then click "Generate Docs" to create your first tailored resume!
          </p>
          <Link href="/jobs" style={{ display: "inline-block", marginTop: "var(--space-lg)", textDecoration: "none" }}>
            <span style={{
              background: "rgba(255,255,255,0.06)", padding: "8px 16px", borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)", fontSize: 14, fontWeight: 500, border: "1px solid var(--border-primary)"
            }}>
              Go to Job Discovery
            </span>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "var(--space-lg)", flex: 1, minHeight: 0 }}>
          {/* Left Sidebar - List */}
          <div style={{ 
            width: 300, 
            display: "flex", 
            flexDirection: "column", 
            gap: "var(--space-sm)", 
            overflowY: "auto",
            paddingRight: "var(--space-sm)"
          }}>
            {resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => setActiveResume(resume)}
                style={{
                  padding: "var(--space-md)",
                  borderRadius: "var(--radius-sm)",
                  background: activeResume?.id === resume.id ? "var(--bg-elevated)" : "var(--bg-card)",
                  border: `1px solid ${activeResume?.id === resume.id ? "var(--accent-purple)" : "var(--border-primary)"}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {resume.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                    {new Date(resume.created_at).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: activeResume?.id === resume.id ? "var(--text-primary)" : "var(--text-muted)" }} />
              </div>
            ))}
          </div>

          {/* Right Area - Preview & Action */}
          <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {activeResume && parsedContent ? (
              <>
                {/* Preview Header */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  paddingBottom: "var(--space-md)",
                  borderBottom: "1px solid var(--border-primary)",
                  marginBottom: "var(--space-lg)"
                }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{activeResume.label}</h2>
                    <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4 }}>
                      Generated on {new Date(activeResume.created_at).toLocaleString()}
                    </div>
                  </div>
                  <a href={documentsApi.getDownloadUrl(activeResume.id)} download>
                    <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px" }}>
                      <Download size={14} />
                      Download .DOCX
                    </button>
                  </a>
                </div>

                {/* Preview Sheet */}
                <div style={{ 
                  flex: 1, 
                  overflowY: "auto", 
                  background: "var(--bg-primary)", 
                  padding: "var(--space-2xl)", 
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-primary)",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.6
                }}>
                  <div style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px 0" }}>{parsedContent.name}</h1>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{parsedContent.contact_info}</div>
                  </div>

                  {parsedContent.summary && (
                    <div style={{ marginBottom: "var(--space-xl)" }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-primary)", paddingBottom: 4, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Professional Summary</h3>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{parsedContent.summary}</p>
                    </div>
                  )}

                  {parsedContent.skills && parsedContent.skills.length > 0 && (
                    <div style={{ marginBottom: "var(--space-xl)" }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-primary)", paddingBottom: 4, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Skills & Expertise</h3>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{parsedContent.skills.join(" • ")}</p>
                    </div>
                  )}

                  {parsedContent.experience && parsedContent.experience.length > 0 && (
                    <div style={{ marginBottom: "var(--space-xl)" }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-primary)", paddingBottom: 4, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Professional Experience</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                        {parsedContent.experience.map((exp, i) => (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                              <div style={{ fontSize: 14, fontWeight: 600 }}>{exp.title} <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>| {exp.company}</span></div>
                              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic" }}>{exp.duration}</div>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "var(--text-secondary)" }}>
                              {exp.bullets.map((bullet, j) => (
                                <li key={j} style={{ marginBottom: 4 }}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedContent.projects && parsedContent.projects.length > 0 && (
                    <div style={{ marginBottom: "var(--space-xl)" }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-primary)", paddingBottom: 4, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Relevant Projects</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                        {parsedContent.projects.map((proj, i) => (
                          <div key={i}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{proj.title}</div>
                            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "var(--text-secondary)" }}>
                              {proj.bullets.map((bullet, j) => (
                                <li key={j} style={{ marginBottom: 4 }}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedContent.education && parsedContent.education.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-primary)", paddingBottom: 4, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Education</h3>
                      {parsedContent.education.map((edu, i) => (
                        <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{edu.degree}</span> — {edu.institution} ({edu.graduation_year})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 14 }}>
                Select a resume to preview
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
