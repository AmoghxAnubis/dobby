"use client";

import { useState, useEffect, useCallback } from "react";
import { Briefcase, Loader2, FileJson, X } from "lucide-react";
import { useProfile } from "@/context/profile-context";
import { applicationsApi } from "@/lib/api";

const STAGES = [
  { id: "saved", label: "Saved", color: "var(--text-secondary)" },
  { id: "applied", label: "Applied", color: "var(--accent-blue)" },
  { id: "recruiter_response", label: "Response", color: "var(--accent-orange)" },
  { id: "interview", label: "Interview", color: "var(--accent-purple)" },
  { id: "offer", label: "Offer", color: "var(--accent-green)" },
];

interface Application {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
  jobs?: {
    role: string;
    company: string;
  };
}

export default function ApplicationsPage() {
  const { profile } = useProfile();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    try {
      // The API uses query param profile_id if we want, but list() fetches all. 
      // applicationsApi.list doesn't explicitly take profileId yet, wait we can add it to the url or just fetch all for now
      // The backend actually filters if we pass it, but let's just fetch all locally or update the API param
      const data = await applicationsApi.list();
      // Filter by profile locally if list() returned all
      const filtered = (data as any[]).filter(a => a.profile_id === profile.id);
      setApplications(filtered);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div style={{ maxWidth: 1200, height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)" }}>
          Applications
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
          Track your job application pipeline and dry-run logs.
        </p>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={40} style={{ color: "var(--text-tertiary)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`,
          gap: "var(--space-md)",
          flex: 1,
          minHeight: 0,
        }}>
          {STAGES.map((stage) => {
            const appsInStage = applications.filter(a => a.status === stage.id);
            return (
              <div key={stage.id} style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-md)",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto"
              }}>
                {/* Column Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-md)",
                  paddingBottom: "var(--space-sm)",
                  borderBottom: `2px solid ${stage.color}`,
                }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-secondary)",
                  }}>
                    {stage.label}
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: stage.color,
                    background: "rgba(255,255,255,0.05)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                  }}>
                    {appsInStage.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                  {appsInStage.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: "var(--space-lg)" }}>
                      No applications
                    </p>
                  ) : (
                    appsInStage.map(app => (
                      <div key={app.id} style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-primary)",
                        padding: "var(--space-sm)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 13
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{app.jobs?.role || "Unknown Role"}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 8 }}>{app.jobs?.company || "Unknown Company"}</div>
                        
                        {app.notes && (
                          <button 
                            onClick={() => setSelectedLog(app.notes)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid var(--border-primary)",
                              color: "var(--text-primary)",
                              padding: "3px 8px",
                              borderRadius: "var(--radius-full)",
                              cursor: "pointer"
                            }}
                          >
                            <FileJson size={12} /> View Log
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Modal */}
      {selectedLog && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "var(--space-xl)"
        }}>
          <div style={{
            background: "var(--bg-primary)",
            width: "100%", maxWidth: 700, maxHeight: "90vh",
            borderRadius: "var(--radius-md)", border: "1px solid var(--border-primary)",
            display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            <div style={{ padding: "var(--space-md)", borderBottom: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Dry-Run Application Log</h3>
              <button 
                onClick={() => setSelectedLog(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "var(--space-md)", overflowY: "auto", flex: 1, background: "#111" }}>
              <pre style={{ margin: 0, fontSize: 12, color: "var(--accent-green)", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                {selectedLog}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
