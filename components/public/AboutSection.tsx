"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  MapPin,
  Download,
  User,
  Cpu,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TechIcon } from "./TechIcon";

export interface SkillItem {
  id: string;
  name: string;
  iconName: string | null;
  proficiency?: number | null;
  proficiencyLevel?: string | null;
  yearsOfExp?: number | null;
  description?: string | null;
  featured?: boolean;
}

export interface SkillCategoryItem {
  id: string;
  name: string;
  skills: SkillItem[];
}

interface AboutSectionProps {
  profile?: {
    name: string;
    title: string;
    bio: string;
    avatarUrl?: string | null;
    aboutImageUrl?: string | null;
    aboutHeading?: string | null;
    resumeUrl?: string | null;
    location?: string | null;
    availableShow?: boolean;
    availableFor?: string | null;
    availableStatusColor?: string;
  } | null;
  homepageContent?: {
    aboutEyebrow?: string | null;
    aboutTitle?: string | null;
    skillsEyebrow?: string | null;
    skillsTitle?: string | null;
  } | null;
  skillsCategories?: SkillCategoryItem[];
}

export function AboutSection({
  profile,
  homepageContent,
  skillsCategories = [],
}: AboutSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const aboutPhoto = profile?.aboutImageUrl ?? null;
  const name = profile?.name || "Rohan Mirza";
  const aboutHeading =
    profile?.aboutHeading || homepageContent?.aboutTitle || "Turning Ideas Into Digital Reality";
  const bio =
    profile?.bio ||
    "I'm a passionate Full Stack Developer & AI Engineer with a strong focus on building modern, scalable and user-friendly web applications. I love working with new technologies, solving real problems and creating products that make a difference.";
  const location = profile?.location;
  const showAvailability = profile?.availableShow ?? true;
  const availabilityText = profile?.availableFor || "Available for opportunities";
  const availabilityColor = profile?.availableStatusColor || "green";
  const resumeUrl = profile?.resumeUrl;

  // Flatten all visible skills, prioritizing featured skills
  const allSkills: SkillItem[] = [];
  skillsCategories.forEach((cat) => {
    if (cat.skills) {
      cat.skills.forEach((skill) => {
        if (!allSkills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase())) {
          allSkills.push(skill);
        }
      });
    }
  });

  // Sort featured first, then original order
  allSkills.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // Default fallback skills if database has no skills
  const displaySkills: { name: string; iconName?: string | null }[] =
    allSkills.length > 0
      ? allSkills
      : [
          { name: "Next.js" },
          { name: "React.js" },
          { name: "TypeScript" },
          { name: "Tailwind CSS" },
          { name: "Python" },
          { name: "OpenAI" },
          { name: "FastAPI" },
          { name: "MongoDB" },
          { name: "Sanity" },
          { name: "Frappe/ERPNext" },
          { name: "HTML" },
          { name: "CSS" },
          { name: "Graphic Design" },
        ];

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section
      id="about"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24 relative"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Single White Band Card Container with Thin Vertical Divider */}
        <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
          {/* Left Column: About Photo + Bio Details (col-span-7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            {/* About Photo with Soft Gradient Frame Backdrop */}
            <div className="relative shrink-0 w-36 sm:w-44 md:w-48 aspect-square mx-auto sm:mx-0">
              {/* Soft Gradient Frame Behind Photo */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-200/60 via-purple-100/70 to-blue-200/50 dark:from-indigo-950/50 dark:via-purple-900/40 dark:to-slate-900/60 rotate-2 scale-105 shadow-sm" />
              
              {/* Photo Box */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/80 dark:border-white/10 shadow-md bg-[var(--surface)]">
                {aboutPhoto ? (
                  <Image
                    src={aboutPhoto}
                    alt={name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 144px, 192px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--surface-hover)] text-[var(--accent)]">
                    <User className="w-12 h-12 opacity-60" />
                  </div>
                )}
              </div>
            </div>

            {/* About Text Content */}
            <div className="flex-1 min-w-0">
              {/* Eyebrow badge: purple rounded tile + label */}
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-[var(--accent)] font-heading tracking-wide uppercase">
                  {homepageContent?.aboutEyebrow || "About Me"}
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--foreground)] tracking-tight mb-3 leading-snug">
                {aboutHeading}
              </h2>

              {/* Bio Paragraph */}
              <p className="text-xs sm:text-sm text-[var(--foreground-muted)] font-normal leading-relaxed mb-6">
                {bio}
              </p>

              {/* Meta Row: Location, Availability, Download CV */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-[var(--foreground-muted)] font-medium pt-2 border-t border-[var(--border)]">
                {location && (
                  <div className="flex items-center gap-1.5 text-[var(--foreground)]">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    <span>{location}</span>
                  </div>
                )}

                {showAvailability && (
                  <div className="flex items-center gap-1.5 text-[var(--foreground)]">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        availabilityColor === "red"
                          ? "bg-red-500 shadow-sm shadow-red-500/50"
                          : availabilityColor === "amber"
                          ? "bg-amber-500 shadow-sm shadow-amber-500/50"
                          : "bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"
                      }`}
                    />
                    <span>{availabilityText}</span>
                  </div>
                )}

                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[var(--accent)] hover:underline font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>Download CV</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tech Stack (col-span-5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Eyebrow badge: purple rounded tile + Tech Stack label */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold font-heading text-[var(--foreground)]">
                    {homepageContent?.skillsEyebrow || "Tech Stack"}
                  </h3>
                </div>

                {/* Mobile scroll buttons */}
                <div className="flex sm:hidden items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollSlider("left")}
                    className="p-1 rounded-md text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSlider("right")}
                    className="p-1 rounded-md text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid of White Pill Chips (brand icon + name), ~4 per row on desktop */}
              {/* On mobile: scroll-snap horizontal slider or multi-column wrap */}
              <div
                ref={sliderRef}
                className="flex flex-wrap gap-2.5 sm:gap-3 max-sm:overflow-x-auto max-sm:flex-nowrap max-sm:pb-2 max-sm:snap-x max-sm:no-scrollbar"
              >
                {displaySkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] shadow-2xs hover:shadow-xs hover:border-[var(--accent)] transition-all cursor-default shrink-0 snap-start"
                  >
                    <TechIcon name={skill.name} iconName={skill.iconName} className="w-4 h-4" />
                    <span className="text-xs font-medium text-[var(--foreground)] whitespace-nowrap">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
