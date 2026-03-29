"use client";

import { FileText, Plus } from "lucide-react";

export default function ResumesPage() {
  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-lg)" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)" }}>
            Resume Manager
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
            AI-customized resumes for each application
          </p>
        </div>
        <button style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-xs)",
          background: "var(--text-primary)",
          color: "var(--bg-primary)",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "10px var(--space-md)",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "var(--font-body)",
        }}>
          <Plus size={14} />
          Upload Resume
        </button>
      </div>

      {/* Empty State */}
      <div className="card" style={{ textAlign: "center", padding: "var(--space-2xl)" }}>
        <FileText size={40} style={{ color: "var(--text-muted)", marginBottom: "var(--space-md)" }} />
        <h3 style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: "0 0 var(--space-sm)",
          fontFamily: "var(--font-heading)",
        }}>
          No resumes yet
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0, maxWidth: 400, margin: "0 auto" }}>
          Upload your master resume and Dobby will create tailored versions for each job application.
        </p>
      </div>
    </div>
  );
}
