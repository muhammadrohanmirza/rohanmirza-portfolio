import React from "react";
import { getAdminSeo } from "@/lib/queries/admin.queries";
import { SeoForm } from "./SeoForm";
import { Search } from "lucide-react";

export const instant = false;

export default async function AdminSeoPage() {
  const seo = await getAdminSeo();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                SEO & Metadata Configuration
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Optimize search engine visibility, Open Graph cards, and social sharing snippets.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SeoForm initialSeo={seo} />
    </div>
  );
}
