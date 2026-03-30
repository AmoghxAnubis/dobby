/**
 * Dobby — API Client
 * Centralized HTTP client for communicating with the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Profile ─────────────────────────────────────────────────

export const profileApi = {
  list: () => request("/api/profile/"),
  get: (id: string) => request(`/api/profile/${id}`),
  create: (data: Record<string, unknown>) =>
    request("/api/profile/", { method: "POST", body: data }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`/api/profile/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) =>
    request(`/api/profile/${id}`, { method: "DELETE" }),
};

// ─── Job Preferences ────────────────────────────────────────

export const preferencesApi = {
  get: (profileId: string) =>
    request(`/api/profile/${profileId}/preferences`),
  create: (profileId: string, data: Record<string, unknown>) =>
    request(`/api/profile/${profileId}/preferences`, { method: "POST", body: data }),
  update: (profileId: string, data: Record<string, unknown>) =>
    request(`/api/profile/${profileId}/preferences`, { method: "PATCH", body: data }),
};

// ─── Jobs ────────────────────────────────────────────────────

export const jobsApi = {
  list: (params?: { platform?: string; company?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.platform) searchParams.set("platform", params.platform);
    if (params?.company) searchParams.set("company", params.company);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));
    const query = searchParams.toString();
    return request(`/api/jobs/${query ? `?${query}` : ""}`);
  },
  get: (id: string) => request(`/api/jobs/${id}`),
  scored: (profileId: string, minScore = 0) =>
    request(`/api/jobs/scored/?profile_id=${profileId}&min_score=${minScore}`),
  scrape: (profileId: string) => 
    request<{message: string, scraped: number, inserted: number}>(`/api/jobs/scrape?profile_id=${profileId}`, { method: "POST" }),
  analyze: (jobId: string, profileId: string) =>
    request<any>(`/api/jobs/${jobId}/analyze?profile_id=${profileId}`, { method: "POST" }),
  batchScores: (profileId: string) =>
    request<Record<string, any>>(`/api/jobs/scores/batch?profile_id=${profileId}`),
};

// ─── Applications ────────────────────────────────────────────

export const applicationsApi = {
  list: () => request("/api/applications/"),
  get: (id: string) => request(`/api/applications/${id}`),
  create: (data: Record<string, unknown>) =>
    request("/api/applications/", { method: "POST", body: data }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`/api/applications/${id}`, { method: "PATCH", body: data }),
};

// ─── Documents ───────────────────────────────────────────────

export const documentsApi = {
  generateResume: (profileId: string, jobId: string) =>
    request("/api/documents/resume/generate", { method: "POST", body: { profile_id: profileId, job_id: jobId } }),
  generateCoverLetter: (profileId: string, jobId: string) =>
    request("/api/documents/cover-letter/generate", { method: "POST", body: { profile_id: profileId, job_id: jobId } }),
  listResumes: (profileId: string) =>
    request(`/api/documents/resumes?profile_id=${profileId}`),
  // Note: download is usually handled via an anchor tag pointing directly to the URL, 
  // but we can expose the URL generator here.
  getDownloadUrl: (resumeId: string) => `${API_BASE}/api/documents/resume/${resumeId}/download`,
};

// ─── Health ──────────────────────────────────────────────────

export const healthApi = {
  check: () => request<{ status: string; app: string; env: string }>("/health"),
};
