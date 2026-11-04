import React from "react";
import { getAdminEducation, getAdminCertifications } from "@/lib/queries/admin.queries";
import { TimelineManager } from "./TimelineManager";
import { GraduationCap } from "lucide-react";

export const instant = false;

export default async function AdminTimelinePage() {
  const [education, certifications] = await Promise.all([
    getAdminEducation(),
    getAdminCertifications(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                Education & Certifications
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage academic background and verified engineering credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TimelineManager
        initialEducation={education}
        initialCertifications={certifications}
      />
    </div>
  );
}
