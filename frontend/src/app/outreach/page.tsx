"use client";

import { MessageSquare, Users } from "lucide-react";

export default function OutreachPage() {
  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)" }}>
          Outreach
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
          Manage recruiter communication drafted by Dobby
        </p>
      </div>

      {/* Split View Placeholder */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "var(--space-md)", minHeight: 500 }}>
        {/* Recruiter List */}
        <div className="card" style={{ padding: "var(--space-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
            <Users size={16} style={{ color: "var(--text-secondary)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Recruiters</span>
          </div>
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-2xl) 0",
          }}>
            <Users size={32} style={{ color: "var(--text-muted)", marginBottom: "var(--space-sm)" }} />
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center" }}>
              No recruiters found yet
            </p>
          </div>
        </div>

        {/* Conversation View */}
        <div className="card" style={{ padding: "var(--space-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
            <MessageSquare size={16} style={{ color: "var(--text-secondary)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Conversation</span>
          </div>
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-2xl) 0",
          }}>
            <MessageSquare size={32} style={{ color: "var(--text-muted)", marginBottom: "var(--space-sm)" }} />
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center" }}>
              Select a recruiter to view the conversation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
