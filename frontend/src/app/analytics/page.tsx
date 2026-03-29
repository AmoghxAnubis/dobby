"use client";

import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)" }}>
          Analytics
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
          Performance metrics and insights
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
        {[
          { label: "Total Applications", value: "0" },
          { label: "Interviews", value: "0" },
          { label: "Conversion Rate", value: "0%" },
        ].map((stat, i) => (
          <div key={i} className="metric-card">
            <span className="metric-label">{stat.label}</span>
            <span className="metric-value">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Chart Placeholders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <div className="card" style={{ minHeight: 280 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 var(--space-md)", fontFamily: "var(--font-heading)" }}>
            Applications Over Time
          </h3>
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
            borderRadius: "var(--radius-sm)",
            border: "1px dashed var(--border-accent)",
          }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Chart will appear here</span>
          </div>
        </div>
        <div className="card" style={{ minHeight: 280 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 var(--space-md)", fontFamily: "var(--font-heading)" }}>
            Match Score Distribution
          </h3>
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
            borderRadius: "var(--radius-sm)",
            border: "1px dashed var(--border-accent)",
          }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Chart will appear here</span>
          </div>
        </div>
      </div>
    </div>
  );
}
