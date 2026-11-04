import React from "react";
import { getAdminOverviewStats } from "@/lib/queries/admin.queries";
import {
  FolderKanban,
  Mail,
  Wrench,
  Layers,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { ProjectsDonutChart } from "@/components/admin/charts/ProjectsDonutChart";
import { MessagesBarChart } from "@/components/admin/charts/MessagesBarChart";
import { RecentMessagesTable } from "@/components/admin/RecentMessagesTable";

export const instant = false;

export default async function AdminOverviewPage() {
  await connection();
  const stats = await getAdminOverviewStats();

  // Calculate project status metrics
  // Published (non-featured):
  const featuredCount = stats.featuredProjects || 0;
  const regularPublished = Math.max(stats.publishedProjects - featuredCount, 0);
  const draftCount = stats.draftProjects || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. OVERVIEW CARD WITH 4 STAT TILES IN A ROW (Matching Screenshot) */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            Overview
          </h2>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3498db] text-white hover:bg-[#2980b9] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Link>
          </div>
        </div>

        {/* 4 Stat Tiles separated by clean vertical dividers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-6 sm:gap-0">
          {/* Tile 1: Projects */}
          <Link
            href="/admin/projects"
            className="sm:px-6 first:pl-0 last:pr-0 group block cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-[#3498db]/10 group-hover:text-[#3498db] transition-colors">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-slate-500 block truncate">
                  Total Projects
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight block">
                  {stats.totalProjects}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block truncate">
                  {stats.publishedProjects} Published • {stats.draftProjects} Drafts
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 2: Inquiries / Unread Messages */}
          <Link
            href="/admin/messages"
            className="pt-6 sm:pt-0 sm:px-6 first:pl-0 last:pr-0 group block cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-[#f97316]/10 group-hover:text-[#f97316] transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-slate-500 block truncate">
                  Inquiries / Leads
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight block">
                  {stats.totalMessages}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block truncate">
                  <strong className="text-[#f97316]">{stats.unreadMessages} unread</strong> messages
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 3: Skills Inventory */}
          <Link
            href="/admin/skills"
            className="pt-6 sm:pt-0 sm:px-6 first:pl-0 last:pr-0 group block cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-[#3498db]/10 group-hover:text-[#3498db] transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-slate-500 block truncate">
                  Tech Skills
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight block">
                  {stats.totalSkills}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block truncate">
                  Across {stats.totalCategories} Categories
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 4: Services & Certs */}
          <Link
            href="/admin/services"
            className="pt-6 sm:pt-0 sm:px-6 first:pl-0 last:pr-0 group block cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-[#3498db]/10 group-hover:text-[#3498db] transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-slate-500 block truncate">
                  Services & Certs
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight block">
                  {stats.totalServices}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block truncate">
                  {stats.totalCertifications} Credentials registered
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 2. TWO CARDS SIDE BY SIDE: DONUT CHART & BAR CHART (Matching Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: Donut Chart "Projects by status" */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                Projects by Status
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of active, draft, and featured projects.
              </p>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs font-semibold text-[#3498db] hover:underline"
            >
              Manage →
            </Link>
          </div>

          <div className="my-auto pt-4">
            <ProjectsDonutChart
              published={regularPublished}
              draft={draftCount}
              featured={featuredCount}
            />
          </div>
        </div>

        {/* Card B: Bar Chart "Messages received" */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                Messages Received
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visitor inquiry volume over time from database telemetry.
              </p>
            </div>
            <Link
              href="/admin/messages"
              className="text-xs font-semibold text-[#3498db] hover:underline"
            >
              View Inquiries →
            </Link>
          </div>

          <div className="my-auto pt-4">
            <MessagesBarChart messages={stats.monthlyMessages || []} />
          </div>
        </div>
      </div>

      {/* 3. FULL-WIDTH "RECENT MESSAGES" CARD WITH TABS (Matching Screenshot) */}
      <RecentMessagesTable
        messages={stats.recentMessages}
        totalMessagesCount={stats.totalMessages}
      />

      {/* 4. QUICK MANAGEMENT SHORTCUTS */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Quick Management
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/profile"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors flex flex-col items-center text-center gap-2 group border border-slate-100"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm group-hover:text-[#3498db]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Profile & Bio</span>
          </Link>

          <Link
            href="/admin/skills"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors flex flex-col items-center text-center gap-2 group border border-slate-100"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm group-hover:text-[#3498db]">
              <Wrench className="w-4 h-4" />
            </div>
            <span>Tech Skills</span>
          </Link>

          <Link
            href="/admin/education"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors flex flex-col items-center text-center gap-2 group border border-slate-100"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm group-hover:text-[#3498db]">
              <Layers className="w-4 h-4" />
            </div>
            <span>Timeline</span>
          </Link>

          <Link
            href="/admin/homepage"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors flex flex-col items-center text-center gap-2 group border border-slate-100"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm group-hover:text-[#3498db]">
              <Plus className="w-4 h-4" />
            </div>
            <span>Hero & Content</span>
          </Link>

          <Link
            href="/admin/seo"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors flex flex-col items-center text-center gap-2 group border border-slate-100"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm group-hover:text-[#3498db]">
              <ArrowRight className="w-4 h-4" />
            </div>
            <span>SEO Settings</span>
          </Link>

          <Link
            href="/admin/theme"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors flex flex-col items-center text-center gap-2 group border border-slate-100"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm group-hover:text-[#3498db]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Theme Colors</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
