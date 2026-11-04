"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Wrench,
  Layers,
  GraduationCap,
  Home,
  Mail,
  Search,
  Palette,
  Settings,
  ArrowUpRight,
  LogOut,
  BarChart3,
  MessageSquareQuote,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth.actions";

interface AdminSidebarProps {
  unreadCount?: number;
  adminName?: string;
  adminEmail?: string;
  adminAvatar?: string | null;
  onNavigate?: () => void;
}

export function AdminSidebar({
  unreadCount = 0,
  adminName = "Rohan Admin",
  adminEmail = "admin@rohan.dev",
  adminAvatar,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isLoggingOut, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const navigation = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Profile", href: "/admin/profile", icon: User },
    { name: "Projects", href: "/admin/projects", icon: FolderKanban },
    { name: "Skills", href: "/admin/skills", icon: Wrench },
    { name: "Services", href: "/admin/services", icon: Layers },
    { name: "Key Stats", href: "/admin/stats", icon: BarChart3 },
    { name: "Education", href: "/admin/education", icon: GraduationCap },
    { name: "Homepage", href: "/admin/homepage", icon: Home },
    {
      name: "Messages",
      href: "/admin/messages",
      icon: Mail,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { name: "SEO", href: "/admin/seo", icon: Search },
    { name: "Theme", href: "/admin/theme", icon: Palette },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // Monogram calculation from name
  const initials = adminName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "R";

  return (
    <aside className="w-64 bg-[#242f3e] text-slate-200 flex flex-col justify-between h-full select-none rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden border border-[#1e2836]">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Profile Card at Top */}
        <div className="pt-7 pb-5 px-5 flex flex-col items-center text-center border-b border-white/10">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-md bg-[#1c2430] flex items-center justify-center">
            {adminAvatar ? (
              <Image
                src={adminAvatar}
                alt={adminName}
                fill
                priority
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#3498db] to-[#242f3e] flex items-center justify-center text-white font-bold text-2xl tracking-wider font-mono">
                {initials}
              </div>
            )}
          </div>

          <h2 className="text-base font-bold text-white tracking-tight mt-3 truncate max-w-full">
            {adminName}
          </h2>
          <span className="text-xs text-slate-400 font-mono tracking-wider mt-0.5">
            Administrator
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group cursor-pointer",
                  isActive
                    ? "bg-[#3498db] text-white font-semibold shadow-md shadow-[#3498db]/30"
                    : "text-slate-300 hover:text-white hover:bg-white/8"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#f97316] text-white shrink-0 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Links (View Live Site & Logout) */}
      <div className="p-3.5 border-t border-white/10 bg-[#1e2734]/80 space-y-2 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span>View Live Site</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#3498db] shrink-0" />
        </Link>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-between px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-mono text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
        >
          <span>Sign Out</span>
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          ) : (
            <LogOut className="w-3.5 h-3.5 shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
