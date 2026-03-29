"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/",           label: "Dashboard",     icon: LayoutDashboard },
  { href: "/jobs",       label: "Job Discovery", icon: Search },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/outreach",   label: "Outreach",      icon: MessageSquare },
  { href: "/resumes",    label: "Resume Manager", icon: FileText },
  { href: "/analytics",  label: "Analytics",      icon: BarChart3 },
  { href: "/settings",   label: "Settings",       icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="sidebar"
      style={{
        width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
        minWidth: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
      }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={20} strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span className="sidebar-logo-text">Dobby</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="sidebar-toggle"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!collapsed && <span>Collapse</span>}
      </button>

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-secondary);
          display: flex;
          flex-direction: column;
          padding: var(--space-md);
          transition: width 0.2s ease, min-width 0.2s ease;
          z-index: 50;
          overflow: hidden;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-xs);
          margin-bottom: var(--space-xl);
        }

        .sidebar-logo-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--text-primary);
          color: var(--bg-primary);
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .sidebar-logo-text {
          font-family: var(--font-heading);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          white-space: nowrap;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .sidebar-toggle {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-sm);
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 13px;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .sidebar-toggle:hover {
          color: var(--text-secondary);
          background: var(--bg-card);
        }
      `}</style>

      <style jsx global>{`
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 10px var(--space-sm);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .sidebar-nav-item:hover {
          color: var(--text-primary);
          background: var(--bg-card);
        }

        .sidebar-nav-item.active {
          color: var(--text-primary);
          background: var(--bg-card);
          font-weight: 500;
        }

        .sidebar-nav-item.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: var(--text-primary);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        }
      `}</style>
    </aside>
  );
}
