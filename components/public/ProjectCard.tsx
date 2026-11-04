"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Code2, Globe, Cpu, Gamepad2, Sparkles, Layers } from "lucide-react";
import { Project } from "./ProjectModal";

interface ProjectCardProps {
  project: Project;
  onOpenDetails?: (project: Project) => void;
  index?: number;
}

// Fallback icon generator for project card icon tile
function FallbackAppIcon({ title, category, index = 0 }: { title: string; category?: string | null; index?: number }) {
  const normCat = (category || "").toLowerCase();
  const normTitle = (title || "").toLowerCase();

  // Color palettes for project app icon tile
  const colors = [
    "bg-blue-600 text-white",
    "bg-emerald-600 text-white",
    "bg-amber-600 text-white",
    "bg-purple-600 text-white",
    "bg-indigo-600 text-white",
  ];
  const colorClass = colors[index % colors.length];

  let Icon = Globe;
  if (normCat.includes("game") || normTitle.includes("quest") || normTitle.includes("game")) {
    Icon = Gamepad2;
  } else if (normCat.includes("ai") || normTitle.includes("ai") || normTitle.includes("learn")) {
    Icon = Cpu;
  } else if (normCat.includes("finance") || normTitle.includes("coin") || normTitle.includes("pay")) {
    Icon = Sparkles;
  } else if (normCat.includes("system") || normCat.includes("platform")) {
    Icon = Layers;
  }

  return (
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${colorClass}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
}

export function ProjectCard({ project, onOpenDetails, index = 0 }: ProjectCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onOpenDetails) {
      e.preventDefault();
      onOpenDetails(project);
    }
  };

  const categorySubtitle = project.categoryLabel || project.category || "Web Application";

  return (
    <div className="group rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[var(--accent)] p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full">
      <div>
        {/* Top Header: App Icon + Title & Category */}
        <div className="flex items-center gap-3.5 mb-4">
          {project.iconImageUrl ? (
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[var(--border)] shadow-sm bg-[var(--surface)]">
              <Image
                src={project.iconImageUrl}
                alt={project.title}
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
          ) : (
            <FallbackAppIcon title={project.title} category={project.category} index={index} />
          )}

          <div className="min-w-0 flex-1">
            <Link
              href={`/projects/${project.slug}`}
              onClick={handleClick}
              className="block group/title"
            >
              <h3 className="text-base font-bold font-heading text-[var(--foreground)] group-hover/title:text-[var(--accent)] transition-colors line-clamp-1">
                {project.title}
              </h3>
            </Link>
            <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">
              {categorySubtitle}
            </p>
          </div>
        </div>

        {/* 2-line Description */}
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] line-clamp-2 leading-relaxed mb-6">
          {project.summary}
        </p>
      </div>

      {/* Bottom Row: Tech Tags Pills + Circular Accent Arrow Button */}
      <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3 mt-auto">
        {/* Tech tags pills */}
        <div className="flex flex-wrap gap-1.5 items-center min-w-0">
          {project.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] truncate"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="text-[11px] font-medium px-1 text-[var(--foreground-muted)]">
              +{project.techStack.length - 4}
            </span>
          )}
        </div>

        {/* Circular Accent Arrow Button */}
        <Link
          href={`/projects/${project.slug}`}
          onClick={handleClick}
          className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer shadow-xs hover:scale-105"
          aria-label={`View details of ${project.title}`}
        >
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
