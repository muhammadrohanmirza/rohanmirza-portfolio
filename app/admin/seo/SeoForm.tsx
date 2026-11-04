"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSeoSettings } from "@/lib/actions/settings.actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Loader2, CheckCircle, Search, Globe } from "lucide-react";

interface SeoData {
  id?: string;
  siteTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImageUrl?: string | null;
  faviconUrl?: string | null;
  twitterHandle?: string | null;
}

export function SeoForm({ initialSeo }: { initialSeo?: SeoData | null }) {
  const router = useRouter();
  const [siteTitle, setSiteTitle] = useState(
    initialSeo?.siteTitle || "Rohan.Dev | Full Stack Developer & AI Engineer"
  );
  const [metaDescription, setMetaDescription] = useState(
    initialSeo?.metaDescription ||
      "Portfolio of Rohan - Full Stack Developer & AI Engineer specializing in Next.js, Python, LLMs, and high-performance web systems."
  );
  const [keywords, setKeywords] = useState(
    initialSeo?.keywords ||
      "Full Stack Developer, AI Engineer, Next.js, TypeScript, Python, FastAPI, OpenAI, LangChain, MCP, Neon"
  );
  const [ogImageUrl, setOgImageUrl] = useState(initialSeo?.ogImageUrl || "");
  const [faviconUrl, setFaviconUrl] = useState(initialSeo?.faviconUrl || "");
  const [twitterHandle, setTwitterHandle] = useState(
    initialSeo?.twitterHandle || "@rohandev"
  );

  const [isPending, startTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);

    startTransition(async () => {
      await updateSeoSettings({
        siteTitle: siteTitle.trim(),
        metaDescription: metaDescription.trim(),
        keywords: keywords.trim(),
        ogImageUrl: ogImageUrl.trim() || null,
        faviconUrl: faviconUrl.trim() || null,
        twitterHandle: twitterHandle.trim() || null,
      });

      setSavedSuccess(true);
      router.refresh();
      setTimeout(() => setSavedSuccess(false), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>SEO settings updated and layout revalidated!</span>
        </div>
      )}

      {/* SERP Google Preview Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase">
          <Search className="w-4 h-4" />
          <span>Search Engine Result Preview (Google SERP)</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#090a0f] border border-white/5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>https://rohan.dev</span>
          </div>
          <h3 className="text-base font-medium text-cyan-400 hover:underline cursor-pointer truncate">
            {siteTitle || "Page Title"}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {metaDescription || "Search meta description will appear here..."}
          </p>
        </div>
      </div>

      {/* Titles and Descriptions */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Core Meta Information
        </h2>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-1 mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Page Title Tag *
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                {siteTitle.length}/60 chars recommended
              </span>
            </div>
            <input
              type="text"
              required
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between flex-wrap gap-1 mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Meta Description *
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                {metaDescription.length}/160 chars recommended
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl p-3 text-sm text-white outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Keywords (Comma separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Twitter / X Handle
            </label>
            <input
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="@rohandev"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Social OG Image Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Open Graph / Social Sharing Image
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Appears when links to Rohan.Dev are shared on X, LinkedIn, Discord, and Slack (1200x630 recommended).
        </p>

        <ImageUploader
          value={ogImageUrl}
          onImageChange={(url) => setOgImageUrl(url)}
          folder="portfolio/seo"
          label="Open Graph Image"
        />
      </div>

      {/* Browser Favicon / Icon Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Browser Favicon & Shortcut Icon
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Custom icon displayed in browser tabs and bookmarks. If removed, the site automatically falls back to default /favicon.ico.
        </p>

        <ImageUploader
          value={faviconUrl}
          onImageChange={(url) => setFaviconUrl(url)}
          folder="portfolio/seo"
          label="Favicon / Icon"
        />
      </div>

      {/* Bottom Save Action - Sticky on mobile */}
      <div className="sticky bottom-0 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-4 bg-[#090a0f]/90 backdrop-blur-md border-t border-white/10 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="min-h-[44px] px-8 py-3 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Save SEO Settings</span>
        </button>
      </div>
    </form>
  );
}
