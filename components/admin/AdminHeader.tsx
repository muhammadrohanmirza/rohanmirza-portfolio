"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, Mail } from "lucide-react";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
  mobileMenuOpen?: boolean;
  adminName?: string;
  adminEmail?: string;
  unreadCount?: number;
}

export function AdminHeader({
  onToggleMobileMenu,
  mobileMenuOpen = false,
  adminName = "Rohan Admin",
  adminEmail = "admin@rohan.dev",
  unreadCount = 0,
}: AdminHeaderProps) {
  const pathname = usePathname();

  // Determine current page title based on active route
  const getPageTitle = (path: string): string => {
    if (path === "/admin") return "Overview";
    if (path.startsWith("/admin/profile")) return "Profile";
    if (path.startsWith("/admin/projects/new")) return "New Project";
    if (path.startsWith("/admin/projects")) return "Projects";
    if (path.startsWith("/admin/skills")) return "Skills & Tech";
    if (path.startsWith("/admin/services")) return "Services";
    if (path.startsWith("/admin/stats")) return "Key Statistics";
    if (path.startsWith("/admin/testimonials")) return "Testimonials";
    if (path.startsWith("/admin/education")) return "Education & Credentials";
    if (path.startsWith("/admin/homepage")) return "Homepage & Hero";
    if (path.startsWith("/admin/messages")) return "Messages & Inquiries";
    if (path.startsWith("/admin/seo")) return "SEO Settings";
    if (path.startsWith("/admin/theme")) return "Theme Customizer";
    if (path.startsWith("/admin/settings")) return "Site Settings";
    return "Admin Dashboard";
  };

  const title = getPageTitle(pathname);

  return (
    <header className="bg-transparent py-2 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Page Title & Mobile Drawer Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="admin-navigation-drawer"
          aria-label={mobileMenuOpen ? "Close navigation drawer" : "Open navigation drawer"}
          className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-700 bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 truncate">
          {title}
        </h1>
      </div>

      {/* Center Search Field & Right Notification Badges */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Rounded Light Gray Search Field */}
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search here..."
            className="w-48 md:w-72 bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm pl-4 pr-10 py-2.5 min-h-[42px] rounded-full border border-slate-200/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3498db]/30 focus:border-[#3498db] transition-all"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Bell Icon with Real Orange Notification Badge */}
        <Link
          href="/admin/messages"
          className="relative w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          title={unreadCount > 0 ? `${unreadCount} unread messages` : "No new notifications"}
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f97316] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Mail Icon with Real Orange Notification Badge */}
        <Link
          href="/admin/messages"
          className="relative w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          title={unreadCount > 0 ? `${unreadCount} unread inquiries` : "View contact inquiries"}
        >
          <Mail className="w-4 h-4 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f97316] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
