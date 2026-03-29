"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--current-sidebar-width",
      collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)"
    );
  }, [collapsed]);

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

    </aside>
  );
}
