"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { profileApi, preferencesApi } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  education: string | null;
  skills: string[];
  experience: string | null;
  projects: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobPreferences {
  id: string;
  profile_id: string;
  target_roles: string[];
  locations: string[];
  remote_preference: "remote" | "onsite" | "hybrid" | "any";
  salary_min: number | null;
  salary_max: number | null;
  max_apps_per_day: number;
  outreach_enabled: boolean;
  recruiter_messaging: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  profile: Profile | null;
  preferences: JobPreferences | null;
  loading: boolean;
  error: string | null;
  isNewUser: boolean;
  refreshProfile: () => Promise<void>;
  saveProfile: (data: Partial<Profile>) => Promise<Profile>;
  savePreferences: (data: Partial<JobPreferences>) => Promise<JobPreferences>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<JobPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profiles = await profileApi.list() as Profile[];
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        setIsNewUser(false);
        // Try to load preferences
        try {
          const prefs = await preferencesApi.get(p.id) as JobPreferences;
          setPreferences(prefs);
        } catch {
          // No preferences yet — that's fine
          setPreferences(null);
        }
      } else {
        setIsNewUser(true);
        setProfile(null);
        setPreferences(null);
      }
    } catch (err) {
      // API might not be running — that's ok during dev
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setIsNewUser(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const saveProfile = useCallback(async (data: Partial<Profile>): Promise<Profile> => {
    if (profile) {
      // Update existing
      const updated = await profileApi.update(profile.id, data) as Profile;
      setProfile(updated);
      return updated;
    } else {
      // Create new — requires name + email
      const created = await profileApi.create(data as Record<string, unknown>) as Profile;
      setProfile(created);
      setIsNewUser(false);
      return created;
    }
  }, [profile]);

  const savePreferences = useCallback(async (data: Partial<JobPreferences>): Promise<JobPreferences> => {
    if (!profile) throw new Error("Profile must be created first");

    if (preferences) {
      const updated = await preferencesApi.update(profile.id, data) as JobPreferences;
      setPreferences(updated);
      return updated;
    } else {
      const created = await preferencesApi.create(profile.id, data as Record<string, unknown>) as JobPreferences;
      setPreferences(created);
      return created;
    }
  }, [profile, preferences]);

  return (
    <ProfileContext.Provider value={{
      profile, preferences, loading, error, isNewUser,
      refreshProfile, saveProfile, savePreferences,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
