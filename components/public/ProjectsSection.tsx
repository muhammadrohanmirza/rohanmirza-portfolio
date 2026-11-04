"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, FolderGit2 } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal, Project } from "./ProjectModal";

interface ProjectsSectionProps {
  projects?: Project[];
  eyebrow?: string | null;
  title?: string | null;
  viewAllText?: string | null;
}

export function ProjectsSection({
  projects = [],
  eyebrow,
  title,
  viewAllText,
}: ProjectsSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!projects || projects.length === 0) return null;

  // Show featured projects (up to 3) or first 3
  const featuredProjects = projects.filter((p) => p.featured);
  const displayProjects =
    featuredProjects.length >= 3
      ? featuredProjects.slice(0, 3)
      : projects.slice(0, 3);

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const cards = target.querySelectorAll<HTMLElement>('[data-project-card="true"]');
    if (cards.length > 0) {
      const targetRect = target.getBoundingClientRect();
      const paddingLeft = parseFloat(getComputedStyle(target).paddingLeft || "0");
      let closestIdx = 0;
      let minDiff = Infinity;
      cards.forEach((card, idx) => {
        const cardRect = card.getBoundingClientRect();
        const diff = Math.abs(cardRect.left - targetRect.left - paddingLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setActiveProjectIndex(closestIdx);
    }
  };

  const scrollToProject = (index: number) => {
    if (!sliderRef.current) return;
    const cards = sliderRef.current.querySelectorAll<HTMLElement>('[data-project-card="true"]');
    if (cards[index]) {
      const card = cards[index];
      const slider = sliderRef.current;
      const cardRect = card.getBoundingClientRect();
      const sliderRect = slider.getBoundingClientRect();
      const paddingLeft = parseFloat(getComputedStyle(slider).paddingLeft || "0");
      const targetScroll =
        slider.scrollLeft + (cardRect.left - sliderRect.left) - paddingLeft;

      slider.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
      setActiveProjectIndex(index);
    }
  };

  return (
    <section
      id="projects"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative scroll-mt-20 sm:scroll-mt-24"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header: Icon badge + Title and Subtitle on Left, "View All Projects ->" on Right */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                <FolderGit2 className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--foreground)] tracking-tight">
                {title || "Featured Projects"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
              {eyebrow || "Some of my recent work"}
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--accent)] hover:underline group transition-colors pb-1 shrink-0"
          >
            <span>{viewAllText || "View All Projects"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Desktop & Tablet: Responsive Grid (3 cols on desktop, 2 cols on tablet) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
              onOpenDetails={(p) => setSelectedProject(p)}
            />
          ))}
        </div>

        {/* Mobile (<640px): Horizontal scroll-snap slider with next card peeking */}
        <div className="block sm:hidden">
          <div
            ref={sliderRef}
            onScroll={handleMobileScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 no-scrollbar -mx-4 px-4"
          >
            {displayProjects.map((project, idx) => (
              <div
                key={project.id}
                data-project-card="true"
                className="w-[85vw] max-w-[340px] shrink-0 snap-start"
              >
                <ProjectCard
                  project={project}
                  index={idx}
                  onOpenDetails={(p) => setSelectedProject(p)}
                />
              </div>
            ))}
          </div>

          {/* Dots progress indicator */}
          {displayProjects.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-3">
              {displayProjects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToProject(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeProjectIndex === idx
                      ? "w-6 bg-[var(--accent)]"
                      : "w-1.5 bg-[var(--foreground-subtle)]/40 hover:bg-[var(--foreground-subtle)]"
                  }`}
                  aria-label={`Go to project ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectModal
          isOpen={Boolean(selectedProject)}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
