"use client";

import { Briefcase } from "lucide-react";

const stages = [
  { label: "Saved", count: 0, color: "var(--text-secondary)" },
  { label: "Applied", count: 0, color: "var(--accent-blue)" },
  { label: "Response", count: 0, color: "var(--accent-orange)" },
  { label: "Interview", count: 0, color: "var(--accent-purple)" },
  { label: "Offer", count: 0, color: "var(--accent-green)" },
];

export default function ApplicationsPage() {
  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)" }}>
          Applications
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
          Track your job application pipeline
        </p>
      </div>

      {/* Kanban Pipeline */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "var(--space-md)",
        minHeight: 400,
      }}>
        {stages.map((stage) => (
          <div key={stage.label} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
            display: "flex",
            flexDirection: "column",
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
                {stage.count}
              </span>
            </div>

            {/* Empty Column */}
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                No applications
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
