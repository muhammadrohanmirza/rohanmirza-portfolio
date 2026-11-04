import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublicSiteSettings } from "@/lib/queries/public.queries";

export const instant = false;

export default async function NotFound() {
  const siteSettings = await getPublicSiteSettings().catch(() => null);
  const brandName = siteSettings?.brandName || "Rohan.Dev";
  const brandMonogram = siteSettings?.brandMonogram || "R";

  return (
    <div className="min-h-[100dvh] py-8 sm:py-12 bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-4 relative overflow-y-auto font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-glow)] rounded-full blur-[140px] pointer-events-none opacity-50" />

      <div className="max-w-md w-full text-center relative z-10 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl my-auto">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] mb-6 shadow-inner font-mono font-bold text-xl">
          {brandMonogram}
        </div>

        <span className="text-xs font-mono tracking-widest text-[var(--accent)] uppercase">
          Error 404
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] mt-2 mb-3">
          Route Not Found
        </h1>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-8 break-words">
          The requested system node or documentation pathway does not exist in the {brandName} architecture.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] w-full sm:w-auto rounded-xl font-semibold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-slate-950 shadow-lg shadow-[var(--accent-glow)] transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
