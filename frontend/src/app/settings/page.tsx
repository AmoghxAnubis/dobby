"use client";

import { Settings, User, Briefcase, Shield } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Job Preferences", icon: Briefcase },
    { id: "strategy", label: "Application Strategy", icon: Shield },
  ];

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)" }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
          Configure your profile, preferences, and application strategy
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: 2,
        marginBottom: "var(--space-lg)",
        background: "var(--bg-card)",
        borderRadius: "var(--radius-sm)",
        padding: 3,
        border: "1px solid var(--border-primary)",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-xs)",
              padding: "10px var(--space-md)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              background: activeTab === tab.id ? "var(--bg-elevated)" : "transparent",
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-tertiary)",
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 500 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "var(--font-body)",
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 var(--space-lg)", fontFamily: "var(--font-heading)" }}>
            Your Profile
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {[
              { label: "Full Name", placeholder: "Enter your name", type: "text" },
              { label: "Email", placeholder: "your@email.com", type: "email" },
              { label: "Phone", placeholder: "+1 (555) 000-0000", type: "tel" },
              { label: "Location", placeholder: "City, Country", type: "text" },
            ].map((field) => (
              <div key={field.label}>
                <label style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: "var(--space-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%",
                    padding: "10px var(--space-md)",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    outline: "none",
                    fontFamily: "var(--font-body)",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--border-accent)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
                />
              </div>
            ))}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: "var(--space-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                Skills
              </label>
              <input
                type="text"
                placeholder="python, react, machine-learning (comma-separated)"
                style={{
                  width: "100%",
                  padding: "10px var(--space-md)",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>
            <button style={{
              alignSelf: "flex-start",
              padding: "10px 24px",
              background: "var(--text-primary)",
              color: "var(--bg-primary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              marginTop: "var(--space-sm)",
              fontFamily: "var(--font-body)",
            }}>
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 var(--space-lg)", fontFamily: "var(--font-heading)" }}>
            Job Preferences
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Target Roles
              </label>
              <input
                type="text"
                placeholder="Software Engineer, Backend Developer, ML Engineer..."
                style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Preferred Locations
              </label>
              <input
                type="text"
                placeholder="San Francisco, Remote, New York..."
                style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Min Salary
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Max Salary
                </label>
                <input
                  type="number"
                  placeholder="150000"
                  style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Remote Preference
              </label>
              <select style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }}>
                <option value="any">Any</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <button style={{ alignSelf: "flex-start", padding: "10px 24px", background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: "var(--space-sm)", fontFamily: "var(--font-body)" }}>
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Strategy Tab */}
      {activeTab === "strategy" && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 var(--space-lg)", fontFamily: "var(--font-heading)" }}>
            Application Strategy
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Max Applications Per Day
              </label>
              <input
                type="number"
                defaultValue={20}
                style={{ width: 120, padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }}
              />
            </div>
            {[
              { label: "Enable Outreach", desc: "Allow Dobby to draft recruiter messages", defaultChecked: true },
              { label: "Recruiter Messaging", desc: "Send messages to recruiters for matched jobs", defaultChecked: true },
            ].map((toggle) => (
              <div key={toggle.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{toggle.label}</p>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "2px 0 0" }}>{toggle.desc}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={toggle.defaultChecked}
                  style={{ width: 18, height: 18, accentColor: "var(--text-primary)", cursor: "pointer" }}
                />
              </div>
            ))}
            <button style={{ alignSelf: "flex-start", padding: "10px 24px", background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}>
              Save Strategy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
