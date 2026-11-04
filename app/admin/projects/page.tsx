import React from "react";
import { getAdminProjects } from "@/lib/queries/admin.queries";
import { ProjectsTable } from "./ProjectsTable";
import { Plus, FolderKanban } from "lucide-react";
import Link from "next/link";

export const instant = false;

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                Projects Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage public portfolio systems, status toggles, image galleries, and repository links.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] w-full sm:w-auto rounded-xl text-xs sm:text-sm font-semibold bg-[#3498db] hover:bg-[#2980b9] text-white transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Interactive Table with Search, Filter & Delete Dialog */}
      <ProjectsTable projects={projects} />
    </div>
  );
}
