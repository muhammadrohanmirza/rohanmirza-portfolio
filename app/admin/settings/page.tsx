import React from "react";
import { getAdminSettings, getAdminSocialLinks } from "@/lib/queries/admin.queries";
import { SiteSettingsForm } from "./SiteSettingsForm";
import { Settings } from "lucide-react";

export const instant = false;

export default async function AdminSettingsPage() {
  const [settings, socialLinks] = await Promise.all([
    getAdminSettings(),
    getAdminSocialLinks(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                General Site Settings
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure contact email, global footer attribution, and outbound social channels.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SiteSettingsForm
        initialSettings={settings}
        initialSocialLinks={socialLinks}
      />
    </div>
  );
}
