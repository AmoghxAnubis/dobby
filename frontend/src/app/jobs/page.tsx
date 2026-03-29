"use client";

import { Search, Filter, MapPin, DollarSign } from "lucide-react";

export default function JobDiscoveryPage() {
  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)" }}>
          Job Discovery
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
          Jobs found by Dobby, scored and ready for review
        </p>
      </div>

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: "var(--space-sm)", marginBottom: "var(--space-lg)" }}>
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
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Empty State */}
      <div className="card" style={{ textAlign: "center", padding: "var(--space-2xl)" }}>
        <Search size={40} style={{ color: "var(--text-muted)", marginBottom: "var(--space-md)" }} />
        <h3 style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: "0 0 var(--space-sm)",
          fontFamily: "var(--font-heading)",
        }}>
          No jobs discovered yet
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0 }}>
          Dobby will begin searching for jobs once your profile and preferences are configured.
        </p>
      </div>
    </div>
  );
}
