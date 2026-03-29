"use client";

import {
  Search,
  Briefcase,
  MessageSquare,
  CalendarCheck,
  Activity,
  CheckCircle2,
  FileText,
  Send,
} from "lucide-react";

import { useProfile } from "@/context/profile-context";

// ─── Mock data for dashboard (will be replaced with API calls) ─────

const metrics = [
  { label: "Jobs Found", value: "0", change: "+0 today", icon: Search, positive: true },
  { label: "Applications Sent", value: "0", change: "+0 today", icon: Briefcase, positive: true },
  { label: "Recruiter Responses", value: "0", change: "+0 today", icon: MessageSquare, positive: true },
  { label: "Interviews Scheduled", value: "0", change: "0 upcoming", icon: CalendarCheck, positive: true },
];

const activityFeed = [
  { icon: Activity, text: "Dobby is ready to start hunting", time: "Just now", type: "info" as const },
  { icon: CheckCircle2, text: "System initialized successfully", time: "Just now", type: "success" as const },
];

export default function DashboardPage() {
  const { profile, loading } = useProfile();

  if (loading) return null;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Good morning, {profile?.name ? profile.name.split(' ')[0] : 'Initiate'}
          </h1>
          <p className="dashboard-subtitle">
            Your autonomous job hunt at a glance
          </p>
        </div>
        <div className="dashboard-status">
          <div className="status-dot" />
          <span>System Online</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        {metrics.map((metric, i) => (
          <div key={i} className="metric-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="metric-header">
              <span className="metric-label">{metric.label}</span>
              <metric.icon size={16} style={{ color: "var(--text-tertiary)" }} />
            </div>
            <span className="metric-value">{metric.value}</span>
            <span className={`metric-change ${metric.positive ? "positive" : "negative"}`}>
              {metric.change}
            </span>
          </div>
        ))}
      </div>

      {/* AI Activity Feed */}
      <div className="card animate-fade-in" style={{ animationDelay: "320ms" }}>
        <div className="section-header">
          <Activity size={16} style={{ color: "var(--text-secondary)" }} />
          <h2 className="section-title">AI Activity Feed</h2>
        </div>
        <div className="activity-feed">
          {activityFeed.map((item, i) => (
            <div key={i} className="activity-item">
              <div className={`activity-icon ${item.type}`}>
                <item.icon size={14} />
              </div>
              <div className="activity-content">
                <span className="activity-text">{item.text}</span>
                <span className="activity-time">{item.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state prompt */}
        <div className="empty-prompt">
          <p>Complete your profile in Settings to get started.</p>
          <p style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "4px" }}>
            Dobby will begin searching for jobs once your preferences are set.
          </p>
        </div>
      </div>

      {/* Pipeline Preview */}
      <div className="card animate-fade-in" style={{ animationDelay: "400ms" }}>
        <div className="section-header">
          <Briefcase size={16} style={{ color: "var(--text-secondary)" }} />
          <h2 className="section-title">Job Pipeline</h2>
        </div>
        <div className="pipeline-preview">
          {["Saved", "Applied", "Response", "Interview", "Offer"].map((stage, i) => (
            <div key={stage} className="pipeline-stage">
              <div className="pipeline-count">0</div>
              <div className="pipeline-label">{stage}</div>
              {i < 4 && <div className="pipeline-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
