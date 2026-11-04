"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings, saveSocialLinks } from "@/lib/actions/settings.actions";
import {
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  Share2,
  Mail,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export interface SocialLinkItem {
  id?: string;
  platform: string;
  url: string;
  iconName: string;
  order: number;
  visible: boolean;
}

interface SiteSettingsData {
  id?: string;
  brandName?: string;
  brandMonogram?: string;
  contactEmail?: string;
  contactPhone?: string | null;
  footerText?: string;
  copyrightNotice?: string;
}

export function SiteSettingsForm({
  initialSettings,
  initialSocialLinks,
}: {
  initialSettings?: SiteSettingsData | null;
  initialSocialLinks: SocialLinkItem[];
}) {
  const router = useRouter();
  const [brandName, setBrandName] = useState(
    initialSettings?.brandName || "Rohan.Dev"
  );
  const [brandMonogram, setBrandMonogram] = useState(
    initialSettings?.brandMonogram || "R"
  );
  const [contactEmail, setContactEmail] = useState(
    initialSettings?.contactEmail || "contact@rohan.dev"
  );
  const [contactPhone, setContactPhone] = useState(
    initialSettings?.contactPhone || ""
  );
  const [footerText, setFooterText] = useState(
    initialSettings?.footerText ||
      "Built with Next.js 16, TypeScript, Tailwind CSS & Neon PostgreSQL."
  );
  const [copyrightNotice, setCopyrightNotice] = useState(
    initialSettings?.copyrightNotice ||
      `© ${new Date().getFullYear()} Rohan.Dev. All rights reserved.`
  );

  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(
    initialSocialLinks.length > 0
      ? initialSocialLinks
      : [
          { platform: "GitHub", url: "https://github.com", iconName: "Github", order: 1, visible: true },
          { platform: "LinkedIn", url: "https://linkedin.com", iconName: "Linkedin", order: 2, visible: true },
          { platform: "Twitter / X", url: "https://x.com", iconName: "Twitter", order: 3, visible: true },
        ]
  );

  const [isPending, startTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleAddSocial = () => {
    setSocialLinks([
      ...socialLinks,
      {
        platform: "GitHub",
        url: "https://",
        iconName: "ExternalLink",
        order: socialLinks.length + 1,
        visible: true,
      },
    ]);
  };

  const handleMoveSocial = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= socialLinks.length) return;
    const newLinks = [...socialLinks];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(newIndex, 0, moved);
    setSocialLinks(newLinks);
  };

  const handleToggleSocial = (index: number) => {
    setSocialLinks(
      socialLinks.map((item, i) =>
        i === index ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const handleConfirmDelete = () => {
    if (deleteIndex === null) return;
    setSocialLinks(socialLinks.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  };

  const handleUpdateSocial = (
    index: number,
    field: keyof SocialLinkItem,
    value: string | boolean
  ) => {
    setSocialLinks(
      socialLinks.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);

    startTransition(async () => {
      await Promise.all([
        updateSiteSettings({
          brandName: brandName.trim(),
          brandMonogram: brandMonogram.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim() || null,
          footerText: footerText.trim(),
          copyrightNotice: copyrightNotice.trim(),
        }),
        saveSocialLinks(socialLinks),
      ]);

      setSavedSuccess(true);
      router.refresh();
      setTimeout(() => setSavedSuccess(false), 3500);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Site settings and social links saved and revalidated successfully!</span>
        </div>
      )}

      {/* Brand & Identity Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Brand Name & Monogram Logo
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Configures the brand title and logo monogram displayed in the public Navbar, Footer, and 404 page.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Site Brand Name *
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Rohan.Dev"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Brand Monogram Letter (1-2 Characters) *
            </label>
            <input
              type="text"
              required
              maxLength={4}
              value={brandMonogram}
              onChange={(e) => setBrandMonogram(e.target.value)}
              placeholder="R"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Primary General Site Settings Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
          <Mail className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            General Site Settings
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Primary Contact / Inquiries Email *
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Primary Contact Phone (Displayed on &quot;Let&apos;s Work Together&quot; Card)
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+92 3XX XXX XXXX"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Copyright Notice Text *
            </label>
            <input
              type="text"
              required
              value={copyrightNotice}
              onChange={(e) => setCopyrightNotice(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Footer Attribution & Framework Credits *
            </label>
            <input
              type="text"
              required
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Social Media Links ({socialLinks.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAddSocial}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {socialLinks.length > 0 ? (
            socialLinks.map((link, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-4 rounded-xl bg-[#090a0f] border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                {/* Reorder Buttons */}
                <div className="flex sm:flex-col items-center justify-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveSocial(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center rounded-lg text-slate-500 hover:text-cyan-400 disabled:opacity-20 cursor-pointer hover:bg-white/5"
                    title="Move Up"
                    aria-label="Move link up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSocial(idx, "down")}
                    disabled={idx === socialLinks.length - 1}
                    className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center rounded-lg text-slate-500 hover:text-cyan-400 disabled:opacity-20 cursor-pointer hover:bg-white/5"
                    title="Move Down"
                    aria-label="Move link down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) =>
                    handleUpdateSocial(idx, "platform", e.target.value)
                  }
                  placeholder="Platform (GitHub, LinkedIn, Twitter...)"
                  className="w-full sm:w-44 bg-[#12131a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-semibold"
                />

                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleUpdateSocial(idx, "url", e.target.value)}
                  placeholder="https://..."
                  className="flex-1 min-w-0 w-full bg-[#12131a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                />

                <input
                  type="text"
                  value={link.iconName}
                  onChange={(e) =>
                    handleUpdateSocial(idx, "iconName", e.target.value)
                  }
                  placeholder="Icon: Github, Linkedin, Twitter..."
                  className="w-full sm:w-36 bg-[#12131a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                />

                {/* Actions container on mobile */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleSocial(idx)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-[10px] font-mono cursor-pointer flex items-center gap-1 shrink-0 ${
                      link.visible
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}
                    title="Toggle link visibility"
                  >
                    {link.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{link.visible ? "Visible" : "Hidden"}</span>
                  </button>

                  {/* Remove with Confirmation */}
                  <button
                    type="button"
                    onClick={() => setDeleteIndex(idx)}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-rose-400 hover:text-rose-300 rounded-xl hover:bg-rose-500/10 shrink-0 cursor-pointer"
                    title="Remove Link"
                    aria-label="Remove link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              No social links configured. Click &quot;Add Link&quot; above to create one.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Save Action - Sticky on mobile */}
      <div className="sticky bottom-0 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-4 bg-[#090a0f]/90 backdrop-blur-md border-t border-white/10 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="min-h-[44px] px-8 py-3 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Save Site Settings</span>
        </button>
      </div>

      {/* Confirmation Dialog for Link Deletion */}
      <ConfirmDialog
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Social Link?"
        message={`Are you sure you want to remove this ${
          deleteIndex !== null ? socialLinks[deleteIndex]?.platform : ""
        } link?`}
        confirmText="Remove Link"
      />
    </form>
  );
}
