"use client";

import { ProfileProvider, useProfile } from "@/context/profile-context";
import { useState } from "react";
import { User, Briefcase, ArrowRight } from "lucide-react";

function OnboardingModal() {
  const { isNewUser, loading, saveProfile, savePreferences } = useProfile();
  
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState("");
  
  // Preferences state
  const [roles, setRoles] = useState("");
  const [locations, setLocations] = useState("");

  if (loading || !isNewUser) return null;

  const handleNext = () => {
    if (step === 1 && name && email) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (!roles || !locations) return;
    setSaving(true);
    try {
      await saveProfile({
        name,
        email,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean)
      });
      await savePreferences({
        target_roles: roles.split(",").map(r => r.trim()).filter(Boolean),
        locations: locations.split(",").map(l => l.trim()).filter(Boolean),
        remote_preference: "any",
        max_apps_per_day: 20,
        outreach_enabled: true,
        recruiter_messaging: true,
      });
      // ProfileProvider will automatically detect the new user state and hide the modal
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      alert("Failed to save profile. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "var(--space-md)"
    }}>
      <div className="card" style={{ maxWidth: 500, width: "100%", padding: "var(--space-2xl)" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            Welcome to Dobby
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            Let's get your autonomous agent configured.
          </p>
        </div>

        {/* Step 1: Profile */}
        <div style={{ display: step === 1 ? "block" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: "var(--text-primary)", color: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={14} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600 }}>1. Basic Profile</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" style={{ width: "100%", padding: "10px 16px", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: 6, color: "white" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="jane@example.com" style={{ width: "100%", padding: "10px 16px", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: 6, color: "white" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Core Skills (comma separated)</label>
              <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Python, React, TypeScript" style={{ width: "100%", padding: "10px 16px", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: 6, color: "white" }} />
            </div>
            <button onClick={handleNext} disabled={!name || !email} style={{ width: "100%", padding: 12, background: "white", color: "black", border: "none", borderRadius: 6, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: name && email ? "pointer" : "not-allowed", opacity: name && email ? 1 : 0.5, marginTop: 8 }}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Step 2: Preferences */}
        <div style={{ display: step === 2 ? "block" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: "var(--text-primary)", color: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Briefcase size={14} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600 }}>2. Job Targeting</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Target Roles (comma separated)</label>
              <input value={roles} onChange={e => setRoles(e.target.value)} placeholder="Software Engineer, Full Stack" style={{ width: "100%", padding: "10px 16px", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: 6, color: "white" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Preferred Locations</label>
              <input value={locations} onChange={e => setLocations(e.target.value)} placeholder="Remote, New York, London" style={{ width: "100%", padding: "10px 16px", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: 6, color: "white" }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: 12, background: "var(--bg-elevated)", color: "white", border: "1px solid var(--border-primary)", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
                Back
              </button>
              <button onClick={handleComplete} disabled={!roles || !locations || saving} style={{ flex: 2, padding: 12, background: "white", color: "black", border: "none", borderRadius: 6, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: roles && locations && !saving ? "pointer" : "not-allowed", opacity: roles && locations && !saving ? 1 : 0.5 }}>
                {saving ? "Saving..." : "Initialize Agent"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      {children}
      <OnboardingModal />
    </ProfileProvider>
  );
}
