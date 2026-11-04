import React from "react";
import { getAdminProfile } from "@/lib/queries/admin.queries";
import { ProfileForm } from "./ProfileForm";
import { User } from "lucide-react";

export const instant = false;

export default async function AdminProfilePage() {
  const profile = await getAdminProfile();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                Profile & Bio Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Update personal bio narrative, headshot avatar, and downloadable resume PDF.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProfileForm initialProfile={profile} />
    </div>
  );
}
