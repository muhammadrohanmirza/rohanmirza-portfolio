"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import Image from "next/image";

interface ProjectImage {
  id: string;
  url: string;
  altText: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  categoryLabel?: string | null;
  iconImageUrl?: string | null;
  summary: string;
  description: string;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  images: ProjectImage[];
  featured?: boolean;
  featuredOrder?: number | null;
  order?: number;
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!project) return null;

  const hasImages = project.images && project.images.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.title}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Images Carousel */}
        {hasImages ? (
          <div className="relative w-full h-64 sm:h-80 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] overflow-hidden group">
            <Image
              src={project.images[activeImageIndex].url}
              alt={project.images[activeImageIndex].altText || project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />

            {project.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === 0 ? project.images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-md"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === project.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-md"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md">
                  {project.images.map((_, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === activeImageIndex
                          ? "bg-[var(--accent)] w-4"
                          : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-44 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex flex-col items-center justify-center text-[var(--foreground-muted)]">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-mono">
              Screenshots coming soon
            </span>
          </div>
        )}

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="accent">
              {tech}
            </Badge>
          ))}
        </div>

        {/* Description Body */}
        <div className="text-black text-sm sm:text-base leading-relaxed whitespace-pre-line border-t border-black pt-4 break-words">
          {project.description}
        </div>

        {/* Links Row: ONLY render buttons if URLs exist! */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-black">
          {project.liveUrl && project.liveUrl.trim().length > 0 && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-xs bg-[var(--accent)] text-slate-950 hover:bg-[var(--accent-hover)] transition-all shadow-md w-full sm:w-auto"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Visit Live Application</span>
            </a>
          )}

          {project.githubUrl && project.githubUrl.trim().length > 0 && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-xs bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] transition-all shadow-sm w-full sm:w-auto"
            >
              <GithubIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
              <span>Source Repository</span>
            </a>
          )}

          {!project.liveUrl && !project.githubUrl && (
            <span className="text-xs font-mono text-[var(--foreground-muted)] italic">
              Project links will be available soon.
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
