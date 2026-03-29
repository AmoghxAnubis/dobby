"use client";

import { Settings, User, Briefcase, Shield, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useProfile } from "@/context/profile-context";

export default function SettingsPage() {
  const { profile, preferences, loading, saveProfile, savePreferences } = useProfile();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  // Profile Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");

  // Preferences Form State
  const [roles, setRoles] = useState("");
  const [prefLocations, setPrefLocations] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [remotePref, setRemotePref] = useState("any");

  // Strategy Form State
  const [maxApps, setMaxApps] = useState("20");
  const [outreachEnabled, setOutreachEnabled] = useState(true);
  const [recruiterMessaging, setRecruiterMessaging] = useState(true);

  // Initialize state when profile/preferences load
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setSkills((profile.skills || []).join(", "));
    }
  }, [profile]);

  useEffect(() => {
    if (preferences) {
      setRoles((preferences.target_roles || []).join(", "));
      setPrefLocations((preferences.locations || []).join(", "));
      setMinSalary(preferences.salary_min?.toString() || "");
      setMaxSalary(preferences.salary_max?.toString() || "");
      setRemotePref(preferences.remote_preference || "any");
      setMaxApps(preferences.max_apps_per_day?.toString() || "20");
      setOutreachEnabled(preferences.outreach_enabled ?? true);
      setRecruiterMessaging(preferences.recruiter_messaging ?? true);
    }
  }, [preferences]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await saveProfile({
        name,
        email,
        phone,
        location,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      // Could add a toast notification here
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await savePreferences({
        target_roles: roles.split(",").map(r => r.trim()).filter(Boolean),
        locations: prefLocations.split(",").map(l => l.trim()).filter(Boolean),
        salary_min: minSalary ? parseInt(minSalary) : null,
        salary_max: maxSalary ? parseInt(maxSalary) : null,
        remote_preference: remotePref as any,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStrategy = async () => {
    setSaving(true);
    try {
      await savePreferences({
        max_apps_per_day: parseInt(maxApps),
        outreach_enabled: outreachEnabled,
        recruiter_messaging: recruiterMessaging,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save strategy");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Job Preferences", icon: Briefcase },
    { id: "strategy", label: "Application Strategy", icon: Shield },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "var(--space-2xl)", color: "var(--text-tertiary)" }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header */}
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
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Skills</label>
              <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="python, react, machine-learning (comma-separated)" style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
            </div>
            <button onClick={handleSaveProfile} disabled={saving} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "var(--space-xs)", padding: "10px 24px", background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", marginTop: "var(--space-sm)", opacity: saving ? 0.7 : 1, fontFamily: "var(--font-body)" }}>
              <Save size={14} />
              {saving ? "Saving..." : "Save Profile"}
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
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Target Roles</label>
              <input type="text" value={roles} onChange={(e) => setRoles(e.target.value)} placeholder="Software Engineer, Backend Developer, ML Engineer" style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Preferred Locations</label>
              <input type="text" value={prefLocations} onChange={(e) => setPrefLocations(e.target.value)} placeholder="San Francisco, Remote, New York" style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Min Salary</label>
                <input type="number" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} placeholder="50000" style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Max Salary</label>
                <input type="number" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} placeholder="150000" style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Remote Preference</label>
              <select value={remotePref} onChange={(e) => setRemotePref(e.target.value)} style={{ width: "100%", padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }}>
                <option value="any">Any</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <button onClick={handleSavePreferences} disabled={saving} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "var(--space-xs)", padding: "10px 24px", background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", marginTop: "var(--space-sm)", opacity: saving ? 0.7 : 1, fontFamily: "var(--font-body)" }}>
               <Save size={14} />
               {saving ? "Saving..." : "Save Preferences"}
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
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Max Applications Per Day</label>
              <input type="number" value={maxApps} onChange={(e) => setMaxApps(e.target.value)} style={{ width: 120, padding: "10px var(--space-md)", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>Enable Outreach</p>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "2px 0 0" }}>Allow Dobby to draft recruiter messages</p>
              </div>
              <input type="checkbox" checked={outreachEnabled} onChange={(e) => setOutreachEnabled(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--text-primary)", cursor: "pointer" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>Recruiter Messaging</p>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "2px 0 0" }}>Send messages to recruiters for matched jobs</p>
              </div>
              <input type="checkbox" checked={recruiterMessaging} onChange={(e) => setRecruiterMessaging(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--text-primary)", cursor: "pointer" }} />
            </div>
            <button onClick={handleSaveStrategy} disabled={saving} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "var(--space-xs)", padding: "10px 24px", background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "var(--font-body)" }}>
              <Save size={14} />
              {saving ? "Saving..." : "Save Strategy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
