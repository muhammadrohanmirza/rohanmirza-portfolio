"use client";

import React, { useState, useRef } from "react";
import {
  Sparkles,
  Layers,
  Database,
  Cpu,
  Terminal,
  Globe,
  Code2,
  Zap,
  Network,
  Palette,
  Server,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Icon mapping helper
const iconMap: Record<string, LucideIcon> = {
  Terminal,
  Zap,
  Sparkles,
  Cpu,
  Network,
  Globe,
  Layers,
  Code2,
  Palette,
  Database,
  Server,
};

export interface Skill {
  id: string;
  name: string;
  iconName: string | null;
  proficiency: number | null;
  proficiencyLevel?: string | null;
  yearsOfExp?: number | null;
  description?: string | null;
  featured?: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

interface SkillsSectionProps {
  categories?: SkillCategory[];
  eyebrow?: string | null;
  title?: string | null;
}

export function SkillsSection({
  categories = [],
  eyebrow,
  title,
}: SkillsSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Only render categories that have skills
  const visibleCategories = categories.filter(
    (c) => c.skills && c.skills.length > 0
  );

  if (visibleCategories.length === 0) return null;

  // Track active category card on mobile horizontal scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const cards = target.querySelectorAll<HTMLElement>('[data-category-card="true"]');
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
      setActiveCategoryIndex(closestIdx);
    }
  };

  // Scroll to a specific category index when dot or arrow is tapped
  const scrollToCategory = (index: number) => {
    if (!sliderRef.current) return;
    const cards = sliderRef.current.querySelectorAll<HTMLElement>('[data-category-card="true"]');
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
      setActiveCategoryIndex(index);
    }
  };

  // Keyboard navigation when slider row is focused
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollToCategory(Math.min(visibleCategories.length - 1, activeCategoryIndex + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToCategory(Math.max(0, activeCategoryIndex - 1));
    }
  };

  return (
    <section id="skills" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 relative bg-[var(--surface-muted)]/50 scroll-mt-20 sm:scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <span className="text-xs font-mono tracking-widest text-[var(--accent)] uppercase mb-2">
            {eyebrow || "// Engineering Expertise"}
          </span>
          <h2 className="fluid-section-title font-bold font-heading text-[var(--foreground)] tracking-tight">
            {title || "Tech Stack & Skills"}
          </h2>
          <div className="w-12 h-1 bg-[var(--accent)] rounded-full mt-3" />
        </div>

        {/* Categories Slider on Mobile (< md) / Grid on Desktop (>= md) */}
        <div className="relative">
          <div
            ref={sliderRef}
            tabIndex={0}
            role="region"
            aria-label="Skill categories slider"
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className={cn(
              "flex flex-row items-start overflow-x-auto snap-x snap-mandatory touch-scroll-x gap-4 sm:gap-6 pb-4 pt-1",
              "-mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0",
              "md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 md:items-stretch",
              "slider-scrollbar focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-3xl",
              shouldReduceMotion ? "scroll-auto" : "scroll-smooth"
            )}
          >
            {visibleCategories.map((category, catIndex) => {
              const isExpanded = Boolean(expandedCategories[category.id]);
              // On mobile, show first 8 skills unless expanded
              const mobileSkills = isExpanded
                ? category.skills
                : category.skills.slice(0, 8);

              return (
                <motion.div
                  layout
                  key={category.id}
                  data-category-card="true"
                  aria-label={category.name}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.4,
                          delay: catIndex * 0.08,
                          layout: { duration: 0.3, ease: "easeInOut" },
                        }
                  }
                  className={cn(
                    "w-[85vw] max-w-[340px] shrink-0 snap-start flex flex-col justify-between",
                    "md:w-auto md:max-w-none md:shrink",
                    "p-5 sm:p-7 md:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-colors duration-300 shadow-sm hover:shadow-md"
                  )}
                >
                  <div>
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-5 sm:mb-6 pb-4 border-b border-[var(--border)]">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                        {category.name}
                      </h3>
                    </div>

                    {/* Mobile Compact 2-Column Layout (< md) */}
                    <motion.div layout className="grid grid-cols-2 gap-2 md:hidden">
                      <AnimatePresence initial={false}>
                        {mobileSkills.map((skill) => {
                          const isImageUrl =
                            skill.iconName &&
                            (skill.iconName.startsWith("http") || skill.iconName.startsWith("/"));
                          const IconComponent =
                            (!isImageUrl && skill.iconName && iconMap[skill.iconName]) || Code2;

                          return (
                            <motion.div
                              layout
                              key={skill.id}
                              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
                              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                              className="p-2.5 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--accent)]/40 flex flex-col justify-between gap-1.5 transition-colors min-h-[72px]"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                {isImageUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={skill.iconName!}
                                    alt={skill.name}
                                    className="w-4 h-4 object-contain rounded shrink-0"
                                  />
                                ) : (
                                  <IconComponent className="w-4 h-4 text-[var(--accent)] shrink-0" />
                                )}
                                <span className="text-xs font-semibold text-[var(--foreground)] truncate" title={skill.name}>
                                  {skill.name}
                                </span>
                                {skill.featured && (
                                  <span className="text-[10px] text-amber-500 font-mono shrink-0" title="Featured Skill">
                                    ★
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-[var(--foreground-muted)] gap-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  {skill.proficiencyLevel && (
                                    <span className="text-[var(--accent)] bg-[var(--accent-subtle)] px-1.5 py-0.5 rounded truncate">
                                      {skill.proficiencyLevel}
                                    </span>
                                  )}
                                  {skill.yearsOfExp && skill.yearsOfExp > 0 && (
                                    <span className="bg-[var(--surface)] px-1 py-0.5 rounded border border-[var(--border)]">
                                      {skill.yearsOfExp}y
                                    </span>
                                  )}
                                </div>
                                {skill.proficiency && (
                                  <span className="shrink-0">{skill.proficiency}%</span>
                                )}
                              </div>

                              {skill.proficiency && (
                                <div className="w-full h-1 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
                                  <div
                                    className="h-full bg-gradient-to-r from-[var(--accent)] to-indigo-500 rounded-full"
                                    style={{ width: `${skill.proficiency}%` }}
                                  />
                                </div>
                              )}

                              {skill.description && (
                                <p className="text-[10px] text-[var(--foreground-muted)] line-clamp-2 leading-tight">
                                  {skill.description}
                                </p>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>

                    {/* Desktop Full Vertical List (>= md) - Unchanged layout */}
                    <div className="hidden md:block space-y-3.5 sm:space-y-4">
                      {category.skills.map((skill) => {
                        const isImageUrl =
                          skill.iconName &&
                          (skill.iconName.startsWith("http") || skill.iconName.startsWith("/"));
                        const IconComponent =
                          (!isImageUrl && skill.iconName && iconMap[skill.iconName]) || Code2;

                        return (
                          <div
                            key={skill.id}
                            className="space-y-1.5 p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                          >
                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between text-sm gap-2">
                              <span className="font-medium text-[var(--foreground)] flex items-center gap-2">
                                {isImageUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={skill.iconName!}
                                    alt={skill.name}
                                    className="w-4 h-4 object-contain rounded shrink-0"
                                  />
                                ) : (
                                  <IconComponent className="w-4 h-4 text-[var(--accent)] shrink-0" />
                                )}
                                <span className="break-words">{skill.name}</span>
                                {skill.featured && (
                                  <span
                                    className="text-xs text-amber-500 font-mono"
                                    title="Featured Skill"
                                  >
                                    ★
                                  </span>
                                )}
                              </span>

                              <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                                {skill.yearsOfExp && skill.yearsOfExp > 0 && (
                                  <span className="text-xs font-mono text-[var(--foreground-muted)] bg-[var(--surface-muted)] px-2 py-0.5 rounded border border-[var(--border)]">
                                    {skill.yearsOfExp}y
                                  </span>
                                )}
                                {skill.proficiencyLevel && (
                                  <span className="text-xs font-mono text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded">
                                    {skill.proficiencyLevel}
                                  </span>
                                )}
                                {skill.proficiency && (
                                  <span className="text-xs font-mono text-[var(--foreground-muted)]">
                                    {skill.proficiency}%
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            {skill.description && (
                              <p className="text-xs text-[var(--foreground-muted)] leading-relaxed pl-6 break-words">
                                {skill.description}
                              </p>
                            )}

                            {/* Proficiency Bar */}
                            {skill.proficiency && (
                              <div className="w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden mt-1 border border-[var(--border)]">
                                <div
                                  className="h-full bg-gradient-to-r from-[var(--accent)] to-indigo-500 rounded-full transition-all duration-500"
                                  style={{ width: `${skill.proficiency}%` }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Show More / Show Less in-place toggle if category has > 8 skills */}
                    {category.skills.length > 8 && (
                      <button
                        type="button"
                        onClick={() => toggleCategoryExpand(category.id)}
                        className="mt-3 w-full py-2 px-3 rounded-xl text-xs font-mono font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] hover:bg-[var(--accent-subtle)]/80 border border-[var(--accent)]/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] md:hidden"
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded
                            ? `Show less skills in ${category.name}`
                            : `Show ${category.skills.length - 8} more skills in ${category.name}`
                        }
                      >
                        {isExpanded ? (
                          <>
                            <span>Show less</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Show more (+{category.skills.length - 8})</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Bottom pill counter */}
                  <div className="mt-6 sm:mt-8 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--foreground-muted)] font-mono">
                    <span>Total skills</span>
                    <Badge variant="outline">{category.skills.length}</Badge>
                  </div>
                </motion.div>
              );
            })}

            {/* Trailing spacer so the last card has padding and is not clipped on mobile */}
            <div className="w-4 shrink-0 sm:w-6 md:hidden pointer-events-none" aria-hidden="true" />
          </div>

          {/* Mobile Category Indicator (dots) & Arrow Controls */}
          {visibleCategories.length > 1 && (
            <div className="flex md:hidden items-center justify-center gap-2 mt-4" aria-label="Category navigation">
              <button
                type="button"
                disabled={activeCategoryIndex === 0}
                onClick={() => scrollToCategory(activeCategoryIndex - 1)}
                className="p-1 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--accent)] disabled:opacity-20 disabled:pointer-events-none transition-colors [@media(pointer:coarse)]:hidden"
                aria-label="Previous category"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5" role="tablist" aria-label="Category indicator dots">
                {visibleCategories.map((category, idx) => {
                  const isActive = activeCategoryIndex === idx;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Scroll to ${category.name}`}
                      onClick={() => scrollToCategory(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-200 cursor-pointer",
                        isActive
                          ? "w-6 bg-[var(--accent)]"
                          : "w-2 bg-[var(--surface-muted)] border border-[var(--border)] hover:bg-[var(--accent)]/50"
                      )}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                disabled={activeCategoryIndex === visibleCategories.length - 1}
                onClick={() => scrollToCategory(activeCategoryIndex + 1)}
                className="p-1 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--accent)] disabled:opacity-20 disabled:pointer-events-none transition-colors [@media(pointer:coarse)]:hidden"
                aria-label="Next category"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
