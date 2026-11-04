"use client";

import React from "react";
import {
  Code2,
  Terminal,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Network,
  Palette,
  Server,
  LucideIcon,
} from "lucide-react";
import {
  TbBrandNextjs,
  TbBrandReact,
  TbBrandTypescript,
  TbBrandTailwind,
  TbBrandPython,
  TbBrandOpenai,
  TbBrandDocker,
  TbBrandGit,
  TbBrandNodejs,
  TbBrandGraphql,
  TbBrandVercel,
  TbBrandGolang,
  TbBrandFlutter,
  TbBrandHtml5,
  TbBrandCss3,
} from "react-icons/tb";
import {
  SiFastapi,
  SiPostgresql,
  SiMongodb,
  SiMysql,
  SiSanity,
  SiRedis,
  SiSupabase,
  SiPrisma,
  SiFigma,
  SiFirebase,
  SiFrappe,
  SiHtml5,
} from "react-icons/si";

interface TechIconProps {
  name: string;
  iconName?: string | null;
  className?: string;
}

export function TechIcon({ name, iconName, className = "w-4 h-4" }: TechIconProps) {
  // 1. Direct custom image URL
  if (
    iconName &&
    (iconName.startsWith("http://") ||
      iconName.startsWith("https://") ||
      iconName.startsWith("/"))
  ) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={iconName}
        alt={name}
        className={`${className} object-contain rounded shrink-0`}
      />
    );
  }

  const norm = (name || "").toLowerCase().trim();
  const normIcon = (iconName || "").toLowerCase().trim();

  // Next.js
  if (norm.includes("next") || normIcon.includes("next")) {
    return (
      <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center shrink-0">
        <TbBrandNextjs className="w-3.5 h-3.5" />
      </div>
    );
  }

  // React
  if (norm.includes("react") || normIcon.includes("react")) {
    return (
      <div className="w-5 h-5 rounded-md bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
        <TbBrandReact className="w-3.5 h-3.5" />
      </div>
    );
  }

  // TypeScript
  if (norm.includes("typescript") || norm.includes("ts") || normIcon.includes("typescript")) {
    return (
      <div className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
        TS
      </div>
    );
  }

  // Tailwind CSS
  if (norm.includes("tailwind") || normIcon.includes("tailwind")) {
    return (
      <div className="w-5 h-5 rounded-md bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
        <TbBrandTailwind className="w-3.5 h-3.5" />
      </div>
    );
  }

  // Python
  if (norm.includes("python") || normIcon.includes("python")) {
    return (
      <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
        <TbBrandPython className="w-3.5 h-3.5 text-blue-500" />
      </div>
    );
  }

  // OpenAI / AI / LLMs
  if (norm.includes("openai") || norm.includes("ai") || norm.includes("llm") || normIcon.includes("openai")) {
    return (
      <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
        <TbBrandOpenai className="w-3.5 h-3.5" />
      </div>
    );
  }

  // FastAPI
  if (norm.includes("fastapi") || normIcon.includes("fastapi")) {
    return (
      <div className="w-5 h-5 rounded-md bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
        <SiFastapi className="w-3.5 h-3.5" />
      </div>
    );
  }

  // MongoDB
  if (norm.includes("mongo") || normIcon.includes("mongo")) {
    return (
      <div className="w-5 h-5 rounded-md bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
        <SiMongodb className="w-3.5 h-3.5" />
      </div>
    );
  }

  // Sanity
  if (norm.includes("sanity") || normIcon.includes("sanity")) {
    return (
      <div className="w-5 h-5 rounded-md bg-red-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
        S
      </div>
    );
  }

  // Frappe / ERPNext
  if (norm.includes("frappe") || norm.includes("erpnext") || normIcon.includes("frappe")) {
    return (
      <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
        <SiFrappe className="w-3.5 h-3.5" />
      </div>
    );
  }

  // HTML
  if (norm === "html" || norm.includes("html5") || normIcon.includes("html")) {
    return (
      <div className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
        <SiHtml5 className="w-3.5 h-3.5" />
      </div>
    );
  }

  // CSS
  if (norm === "css" || norm.includes("css3") || normIcon.includes("css")) {
    return (
      <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
        <TbBrandCss3 className="w-3.5 h-3.5" />
      </div>
    );
  }

  // Graphic Design / UI / Design
  if (norm.includes("design") || norm.includes("graphic") || norm.includes("ui") || norm.includes("ux")) {
    return (
      <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
        <Palette className="w-3.5 h-3.5" />
      </div>
    );
  }

  // PostgreSQL
  if (norm.includes("postgres") || normIcon.includes("postgres")) {
    return (
      <div className="w-5 h-5 rounded-md bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
        <SiPostgresql className="w-3.5 h-3.5" />
      </div>
    );
  }

  // MySQL
  if (norm.includes("mysql") || normIcon.includes("mysql")) {
    return (
      <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
        <SiMysql className="w-3.5 h-3.5" />
      </div>
    );
  }

  // Docker
  if (norm.includes("docker") || normIcon.includes("docker")) {
    return (
      <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
        <TbBrandDocker className="w-3.5 h-3.5" />
      </div>
    );
  }

  // Git / GitHub
  if (norm.includes("git") || normIcon.includes("git")) {
    return (
      <div className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
        <TbBrandGit className="w-3.5 h-3.5" />
      </div>
    );
  }

  // Default fallback
  return (
    <div className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
      <Code2 className="w-3.5 h-3.5" />
    </div>
  );
}
