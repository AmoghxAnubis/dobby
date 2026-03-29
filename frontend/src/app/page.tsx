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
  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
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

      <style jsx>{`
        .dashboard {
          max-width: 1100px;
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-sm);
        }

        .dashboard-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .dashboard-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 6px 0 0;
        }

        .dashboard-status {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 13px;
          color: var(--accent-green);
          background: rgba(50, 215, 75, 0.08);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(50, 215, 75, 0.15);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-green);
          animation: pulse-dot 2s infinite;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-md);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .activity-feed {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 10px var(--space-sm);
          border-radius: var(--radius-sm);
          transition: background 0.15s ease;
        }

        .activity-item:hover {
          background: var(--bg-card-hover);
        }

        .activity-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .activity-icon.success {
          background: rgba(50, 215, 75, 0.1);
          color: var(--accent-green);
        }

        .activity-icon.info {
          background: rgba(10, 132, 255, 0.1);
          color: var(--accent-blue);
        }

        .activity-content {
          display: flex;
          justify-content: space-between;
          flex: 1;
          align-items: center;
        }

        .activity-text {
          font-size: 13px;
          color: var(--text-primary);
        }

        .activity-time {
          font-size: 12px;
          color: var(--text-tertiary);
          white-space: nowrap;
          margin-left: var(--space-md);
        }

        .empty-prompt {
          margin-top: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius-sm);
          background: var(--bg-card-hover);
          border: 1px dashed var(--border-accent);
        }

        .empty-prompt p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .pipeline-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pipeline-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          position: relative;
          flex: 1;
        }

        .pipeline-count {
          font-family: var(--font-heading);
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .pipeline-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
        }

        .pipeline-arrow {
          position: absolute;
          right: -8px;
          top: 8px;
          color: var(--text-muted);
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-header {
            flex-direction: column;
            gap: var(--space-md);
          }

          .pipeline-preview {
            flex-wrap: wrap;
            gap: var(--space-md);
          }

          .pipeline-arrow {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
