import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProjectBySlug, getPublicSiteSettings } from "@/lib/queries/public.queries";
import { getSession } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, ArrowLeft, Layers, EyeOff } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import Link from "next/link";
import Image from "next/image";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await getSession().catch(() => null);
  const isAdmin = session?.role === "ADMIN";

  const [project, siteSettings] = await Promise.all([
    getPublicProjectBySlug(slug, isAdmin),
    getPublicSiteSettings().catch(() => null),
  ]);

  const brandName = siteSettings?.brandName || "Rohan.Dev";

  if (!project) {
    return {
      title: `Project Not Found | ${brandName}`,
      description: "The requested project could not be found.",
    };
  }

  const title = `${project.title} | ${brandName}`;
  const description = project.summary;
  const primaryImage = project.images?.[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: primaryImage ? [{ url: primaryImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const session = await getSession().catch(() => null);
  const isAdmin = session?.role === "ADMIN";

  const project = await getPublicProjectBySlug(slug, isAdmin);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-16 px-4 sm:px-6 selection:bg-[var(--accent)] selection:text-slate-950 font-sans transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Draft Mode Admin Preview Banner */}
        {!project.published && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <EyeOff className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-amber-200">Draft Mode Preview</div>
                <div className="text-xs text-amber-300/80">
                  This project is currently unpublished. It is only accessible because you are signed in as Admin.
                </div>
              </div>
            </div>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors shrink-0"
            >
              <span>Manage in Admin</span>
            </Link>
          </div>
        )}

        {/* Back Link */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[var(--accent)] uppercase bg-[var(--accent-subtle)] border border-[var(--accent)]/30 px-4 py-2.5 min-h-[44px] rounded-full mb-8 hover:bg-[var(--accent)]/20 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Featured Projects</span>
        </Link>

        {/* Title & Summary */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-4 fluid-section-title break-words">
          {project.title}
        </h1>
        <p className="text-base sm:text-lg text-[var(--foreground-muted)] leading-relaxed mb-6 break-words">
          {project.summary}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-10">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="accent">
              {tech}
            </Badge>
          ))}
        </div>

        {/* Screenshots */}
        {project.images && project.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {project.images.map((img) => (
              <div
                key={img.id}
                className="relative w-full h-60 sm:h-72 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] overflow-hidden shadow-xl"
              >
                <Image
                  src={img.url}
                  alt={img.altText || project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-48 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex flex-col items-center justify-center text-[var(--foreground-muted)] mb-12">
            <Layers className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-mono">
              [Screenshots can be added directly via the /admin CMS]
            </span>
          </div>
        )}

        {/* Full Architectural Description */}
        <div className="p-5 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl space-y-6 mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight pb-4 border-b border-[var(--border)]">
            Architectural Details & Implementation
          </h2>
          <div className="text-[var(--foreground-muted)] leading-relaxed whitespace-pre-line text-sm sm:text-base break-words">
            {project.description}
          </div>
        </div>

        {/* Outbound Links: ONLY rendered if URLs exist! */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-6 border-t border-[var(--border)]">
          {project.liveUrl && project.liveUrl.trim().length > 0 && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl font-semibold text-sm bg-[var(--accent)] text-slate-950 hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--accent-glow)] w-full sm:w-auto"
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl font-semibold text-sm bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] transition-all shadow-sm w-full sm:w-auto"
            >
              <GithubIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
              <span>Source Repository</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
