"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type ThemeMode = "DARK" | "LIGHT" | "SYSTEM";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "segmented";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const [currentMode, setCurrentMode] = useState<ThemeMode>("DARK");
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;
    const currentVersion = html.getAttribute("data-theme-version") || "0";
    const defaultMode = (html.getAttribute("data-default-mode") as ThemeMode) || "DARK";

    let effectiveMode: ThemeMode = defaultMode;
    try {
      const storedTheme = localStorage.getItem("rohan_theme") as ThemeMode | null;
      const storedVersion = localStorage.getItem("rohan_theme_version");

      if (storedTheme && storedVersion && storedVersion === currentVersion) {
        effectiveMode = storedTheme;
      } else {
        if (storedTheme) {
          localStorage.removeItem("rohan_theme");
          localStorage.removeItem("rohan_theme_version");
        }
        effectiveMode = defaultMode;
      }
    } catch {}

    setCurrentMode(effectiveMode);
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    setCurrentMode(mode);
    const currentVersion = document.documentElement.getAttribute("data-theme-version") || "0";
    try {
      localStorage.setItem("rohan_theme", mode);
      localStorage.setItem("rohan_theme_version", currentVersion);
    } catch {}

    let isLight = false;
    if (mode === "LIGHT") {
      isLight = true;
    } else if (mode === "SYSTEM") {
      isLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    }

    if (isLight) {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  useEffect(() => {
    if (currentMode !== "SYSTEM") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [currentMode]);

  // Sync state if another tab updates theme
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "rohan_theme" && e.newValue) {
        const newMode = e.newValue as ThemeMode;
        setCurrentMode(newMode);
        let isLight = false;
        if (newMode === "LIGHT") isLight = true;
        else if (newMode === "SYSTEM") isLight = window.matchMedia("(prefers-color-scheme: light)").matches;

        if (isLight) {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // If not mounted yet, render static placeholder to prevent hydration flicker
  if (!mounted) {
    return (
      <div
        className={cn(
          "w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400",
          className
        )}
      >
        <Moon className="w-4 h-4" />
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]",
          className
        )}
      >
        <button
          type="button"
          onClick={() => applyTheme("DARK")}
          className={cn(
            "px-2.5 py-2 min-h-[40px] rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer",
            currentMode === "DARK"
              ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-sm"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
          title="Dark Mode"
        >
          <Moon className="w-3.5 h-3.5" />
          {/* <span className="text-xs"></span> */}
        </button>
        <button
          type="button"
          onClick={() => applyTheme("LIGHT")}
          className={cn(
            "px-2.5 py-2 min-h-[40px] rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer",
            currentMode === "LIGHT"
              ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-sm"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
          title="Light Mode"
        >
          <Sun className="w-3.5 h-3.5" />
          {/* <span className="text-xs"></span> */}
        </button>
        <button
          type="button"
          onClick={() => applyTheme("SYSTEM")}
          className={cn(
            "px-2.5 py-2 min-h-[40px] rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer",
            currentMode === "SYSTEM"
              ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-sm"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
          title="System Sync"
        >
          <Laptop className="w-3.5 h-3.5" />
          {/* <span className="text-xs"></span> */}
        </button>
      </div>
    );
  }

  // Icon toggle mode (cycles through Dark -> Light -> System)
  const cycleTheme = () => {
    if (currentMode === "DARK") applyTheme("LIGHT");
    else if (currentMode === "LIGHT") applyTheme("SYSTEM");
    else applyTheme("DARK");
  };

  const getIcon = () => {
    if (currentMode === "LIGHT") return Sun;
    if (currentMode === "SYSTEM") return Laptop;
    return Moon;
  };

  const Icon = getIcon();

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={cn(
        "min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-sm relative overflow-hidden flex items-center justify-center",
        className
      )}
      title={`Current: ${currentMode} mode (Click to cycle)`}
      aria-label={`Switch theme (current: ${currentMode})`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentMode}
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { rotate: -40, opacity: 0, scale: 0.75 }
          }
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { rotate: 40, opacity: 0, scale: 0.75 }
          }
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          <Icon className="w-4 h-4" />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
