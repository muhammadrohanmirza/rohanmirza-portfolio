import React from "react";
import { getAdminSkillsWithCategories } from "@/lib/queries/admin.queries";
import { SkillsManager } from "./SkillsManager";
import { Wrench } from "lucide-react";

export const instant = false;

export default async function AdminSkillsPage() {
  const categories = await getAdminSkillsWithCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                Skills & Categories Manager
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure technical competencies, groupings, proficiency levels, and ordering.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SkillsManager initialCategories={categories} />
    </div>
  );
}
