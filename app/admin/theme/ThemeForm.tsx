"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateThemeSettings } from "@/lib/actions/settings.actions";
import { Loader2, CheckCircle, Sparkles, Moon, Sun, Laptop } from "lucide-react";

const curatedAccents = [
  { key: "BLUE", label: "Blue", hex: "#3b82f6", desc: "Blue to violet gradient (new design default)" },
  { key: "CYAN", label: "Cyan", hex: "#06b6d4", desc: "Futuristic & AI systems" },
  { key: "EMERALD", label: "Emerald", hex: "#10b981", desc: "Algorithmic, terminal vitality" },
  { key: "INDIGO", label: "Indigo", hex: "#6366f1", desc: "Deep logic & modern SaaS" },
  { key: "VIOLET", label: "Violet", hex: "#8b5cf6", desc: "Neural networks & creative vision" },
  { key: "AMBER", label: "Amber", hex: "#f59e0b", desc: "Warm energetic brass" },
  { key: "ROSE", label: "Rose", hex: "#f43f5e", desc: "Bold editorial flair" },
];

interface ThemeFormProps {
  initialTheme?: {
    defaultMode: string;
    accentColor: string;
    enableGradients: boolean;
  } | null;
}

export function ThemeForm({ initialTheme }: ThemeFormProps) {
  const router = useRouter();
  const [accent, setAccent] = useState(initialTheme?.accentColor || "BLUE");
  const [mode, setMode] = useState(initialTheme?.defaultMode || "DARK");
  const [gradients, setGradients] = useState(initialTheme?.enableGradients ?? true);

  const [isPending, startTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);

    startTransition(async () => {
      await updateThemeSettings({
        accentColor: accent as "BLUE" | "CYAN" | "EMERALD" | "INDIGO" | "VIOLET" | "AMBER" | "ROSE",
        defaultMode: mode as "LIGHT" | "DARK" | "SYSTEM",
        enableGradients: gradients,
      });

      // Update immediate data-accent on body/html
      document.body.parentElement?.setAttribute("data-accent", accent);

      // Clear any legacy/saved local theme choice so the new default applies immediately in this browser too
      try {
        localStorage.removeItem("rohan_theme");
        localStorage.removeItem("rohan_theme_version");
      } catch {}

      setSavedSuccess(true);
      router.refresh();
      setTimeout(() => setSavedSuccess(false), 3000);
    });
  };

  const selectedHex = curatedAccents.find((a) => a.key === accent)?.hex || "#06b6d4";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Theme settings saved and public styles updated immediately!</span>
        </div>
      )}

      {/* Curated Accent Palette Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Curated Engineering Accent Palette
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {curatedAccents.map((acc) => {
            const isSelected = accent === acc.key;

            return (
              <button
                type="button"
                key={acc.key}
                onClick={() => setAccent(acc.key)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all text-left w-full ${
                  isSelected
                    ? "bg-[#181a26] border-white/30 ring-2 ring-cyan-500/50 shadow-lg"
                    : "bg-[#090a0f] border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="w-5 h-5 rounded-full shadow-md shrink-0"
                    style={{ backgroundColor: acc.hex }}
                  />
                  <span className="font-bold text-sm text-white">{acc.label}</span>
                  {isSelected && (
                    <span className="ml-auto text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{acc.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Live Swatch Preview */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#090a0f] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase">
              Selected Theme Preview
            </span>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full animate-ping shrink-0"
                style={{ backgroundColor: selectedHex }}
              />
              <span className="text-sm font-bold text-white">
                {accent} ({selectedHex})
              </span>
            </div>
          </div>

          <div
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 shadow-lg text-center"
            style={{
              backgroundColor: selectedHex,
              boxShadow: `0 10px 25px ${selectedHex}40`,
            }}
          >
            Sample Interactive Button
          </div>
        </div>
      </div>

      {/* Mode Settings */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Default Display Mode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { key: "DARK", label: "Dark Cosmic", icon: Moon },
            { key: "LIGHT", label: "Clean Light", icon: Sun },
            { key: "SYSTEM", label: "System Sync", icon: Laptop },
          ].map((item) => {
            const isSelected = mode === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                className={`p-4 min-h-[52px] rounded-xl border flex sm:flex-col items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold"
                    : "bg-[#090a0f] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-mono">{item.label}</span>
              </button>
            );
          })}
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
          <span>Apply & Save Theme</span>
        </button>
      </div>
    </form>
  );
}
