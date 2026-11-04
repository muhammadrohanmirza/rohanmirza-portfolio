import React from "react";
import { getAdminStats } from "@/lib/queries/admin.queries";
import { StatsManager } from "./StatsManager";
import { BarChart3 } from "lucide-react";

export const instant = false;

export default async function AdminStatsPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                Key Stats
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage highlighted metrics displayed in the About section.
              </p>
            </div>
          </div>
        </div>
      </div>

      <StatsManager initialStats={stats} />
    </div>
  );
}
