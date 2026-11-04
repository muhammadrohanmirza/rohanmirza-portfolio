"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/settings.actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Loader2, CheckCircle, FileText, User } from "lucide-react";
import Image from "next/image";

interface ProfileData {
  id?: string;
  name?: string;
  title?: string;
  bio?: string;
  avatarUrl?: string | null;
  heroImageUrl?: string | null;
  aboutImageUrl?: string | null;
  aboutHeading?: string | null;
  resumeUrl?: string | null;
  yearsOfExp?: number | null;
  location?: string | null;
  availableShow?: boolean;
  availableFor?: string | null;
  availableStatusColor?: "green" | "amber" | "red" | string;
  coreFocusLabel?: string | null;
  coreFocusValue?: string | null;
}

export function ProfileForm({
  initialProfile,
}: {
  initialProfile?: ProfileData | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [name, setName] = useState(initialProfile?.name || "Rohan");
  const [title, setTitle] = useState(initialProfile?.title || "Full Stack Developer & AI Engineer");
  const [aboutHeading, setAboutHeading] = useState(
    initialProfile?.aboutHeading || "Turning Ideas Into Digital Reality"
  );
  const [bio, setBio] = useState(
    initialProfile?.bio ||
      "I'm a passionate Full Stack Developer & AI Engineer with a strong focus on building modern, scalable and user-friendly web applications. I love working with new technologies, solving real problems and creating products that make a difference."
  );
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl || "");
  const [heroImageUrl, setHeroImageUrl] = useState(initialProfile?.heroImageUrl || "");
  const [aboutImageUrl, setAboutImageUrl] = useState(initialProfile?.aboutImageUrl || "");
  const [resumeUrl, setResumeUrl] = useState(initialProfile?.resumeUrl || "");
  const [location, setLocation] = useState(initialProfile?.location || "Karachi, Pakistan");
  const [yearsOfExp, setYearsOfExp] = useState(initialProfile?.yearsOfExp ?? 3);
  
  // Availability Badge Controls
  const [availableShow, setAvailableShow] = useState(initialProfile?.availableShow ?? true);
  const [availableFor, setAvailableFor] = useState(
    initialProfile?.availableFor || "Available for opportunities"
  );
  const [availableStatusColor, setAvailableStatusColor] = useState<"green" | "amber" | "red">(
    (initialProfile?.availableStatusColor as "green" | "amber" | "red") || "green"
  );

  // About Core Focus Metric Card
  const [coreFocusLabel, setCoreFocusLabel] = useState(initialProfile?.coreFocusLabel || "Core Focus");
  const [coreFocusValue, setCoreFocusValue] = useState(initialProfile?.coreFocusValue || "Next.js & AI Systems");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);

    startTransition(async () => {
      await updateProfile({
        name: name.trim(),
        title: title.trim(),
        aboutHeading: aboutHeading.trim() || null,
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || null,
        heroImageUrl: heroImageUrl.trim() || null,
        aboutImageUrl: aboutImageUrl.trim() || null,
        resumeUrl: resumeUrl.trim() || null,
        location: location.trim() || null,
        yearsOfExp: Number(yearsOfExp),
        availableShow,
        availableFor,
        availableStatusColor,
        coreFocusLabel: coreFocusLabel.trim() || null,
        coreFocusValue: coreFocusValue.trim() || null,
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
          <span>Profile saved and public cache revalidated successfully!</span>
        </div>
      )}

      {/* Identity Information */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Professional Identity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Professional Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              About Section Heading
            </label>
            <input
              type="text"
              value={aboutHeading}
              onChange={(e) => setAboutHeading(e.target.value)}
              placeholder="Turning Ideas Into Digital Reality"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
            Narrative Biography (About Section) *
          </label>
          <textarea
            required
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl p-4 text-sm text-white outline-none resize-y"
          />
        </div>
      </div>

      {/* Status & Availability Badge Controls */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Hero Availability Status Badge
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Pulsing status pill displayed at the top of the Hero section.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 min-h-[38px]">
            <input
              type="checkbox"
              checked={availableShow}
              onChange={(e) => setAvailableShow(e.target.checked)}
              className="w-4 h-4 text-cyan-500 rounded accent-cyan-500"
            />
            <span className="text-xs font-mono text-slate-200">
              Display badge on public Hero
            </span>
          </label>
        </div>

        {availableShow && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Availability Text
              </label>
              <input
                type="text"
                value={availableFor}
                onChange={(e) => setAvailableFor(e.target.value)}
                placeholder="Available for AI & Full Stack Opportunities"
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Status Dot Color
              </label>
              <div className="flex gap-2 pt-1 flex-wrap">
                {[
                  { key: "green", label: "Green", colorClass: "bg-emerald-500" },
                  { key: "amber", label: "Amber", colorClass: "bg-amber-500" },
                  { key: "red", label: "Red", colorClass: "bg-rose-500" },
                ].map((col) => (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => setAvailableStatusColor(col.key as "green" | "amber" | "red")}
                    className={`flex items-center gap-2 px-3 py-2 min-h-[38px] rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                      availableStatusColor === col.key
                        ? "bg-white/10 border-cyan-500 text-white font-bold"
                        : "bg-[#090a0f] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${col.colorClass}`} />
                    <span>{col.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics & About Core Focus Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          About Section Metrics & Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Years of Experience (Leave empty or 0 to hide)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={yearsOfExp}
              onChange={(e) => setYearsOfExp(Number(e.target.value))}
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Core Focus Metric Label
            </label>
            <input
              type="text"
              value={coreFocusLabel}
              onChange={(e) => setCoreFocusLabel(e.target.value)}
              placeholder="Core Focus"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Core Focus Metric Value (Leave empty to hide card)
            </label>
            <input
              type="text"
              value={coreFocusValue}
              onChange={(e) => setCoreFocusValue(e.target.value)}
              placeholder="Next.js & AI Systems"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Hero Photo Card (Transparent Cutout) */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Hero Section Image (Cutout)
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Appears in the Hero section on the soft rounded gradient shape. A transparent cutout photo works best. If empty, falls back to the profile avatar or monogram.
        </p>

        <ImageUploader
          value={heroImageUrl}
          onImageChange={(url) => setHeroImageUrl(url)}
          folder="portfolio/hero"
          label="Hero Image (Transparent Cutout)"
        />
      </div>

      {/* About Section Photo Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          About Section Photo (Square Card)
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Appears in the About Me section with the pastel gradient frame. If empty, falls back to the general avatar.
        </p>

        <ImageUploader
          value={aboutImageUrl}
          onImageChange={(url) => setAboutImageUrl(url)}
          folder="portfolio/about"
          label="About Section Photo"
        />
      </div>

      {/* Profile Photo / Avatar Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          General Avatar / Fallback Headshot
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Used as fallback for any photo section if hero or about images are not provided.
        </p>

        <ImageUploader
          value={avatarUrl}
          onImageChange={(url) => setAvatarUrl(url)}
          folder="portfolio/avatars"
          label="Profile Headshot / Photo"
        />
      </div>

      {/* Resume Document Link & PDF Uploader */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Resume Document (PDF)
          </h2>
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Upload a PDF resume directly (validated, max 10MB) or provide an external link. If removed or empty, the &quot;Download Resume&quot; button is automatically hidden on the public site.
        </p>

        <ImageUploader
          value={resumeUrl}
          onImageChange={(url) => setResumeUrl(url)}
          folder="rohan_portfolio/resumes"
          label="Resume Document (PDF)"
          acceptPdf={true}
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
          <span>Save Profile</span>
        </button>
      </div>
    </form>
  );
}
