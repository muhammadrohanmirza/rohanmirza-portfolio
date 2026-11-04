"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/lib/actions/project.actions";
import { slugify } from "@/lib/utils";
import { ImageUploader } from "./ImageUploader";
import { deleteMediaAsset } from "@/lib/actions/media.actions";
import { Badge } from "@/components/ui/Badge";
import { X, Loader2, ArrowLeft, Trash2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProjectImageInput {
  url: string;
  altText: string;
  order: number;
}

interface ProjectFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    category?: string | null;
    categoryLabel?: string | null;
    iconImageUrl?: string | null;
    summary: string;
    description: string;
    featured: boolean;
    featuredOrder: number;
    published: boolean;
    order: number;
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    images: { id?: string; url: string; altText: string; order: number }[];
  } | null;
}

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [category, setCategory] = useState(initialData?.category || "AI Systems");
  const [categoryLabel, setCategoryLabel] = useState(initialData?.categoryLabel || "");
  const [iconImageUrl, setIconImageUrl] = useState(initialData?.iconImageUrl || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [featured, setFeatured] = useState(initialData?.featured ?? true);
  const [published, setPublished] = useState(initialData?.published ?? true);
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || "");
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl || "");
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>(
    initialData?.techStack || ["Next.js", "TypeScript", "Tailwind CSS"]
  );
  const [images, setImages] = useState<ProjectImageInput[]>(
    initialData?.images?.map((img, idx) => ({
      url: img.url,
      altText: img.altText || "Preview",
      order: img.order ?? idx,
    })) || []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [descriptionTab, setDescriptionTab] = useState<"write" | "preview">("write");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !slug) {
      setSlug(slugify(val));
    }
  };

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (item: string) => {
    setTechStack(techStack.filter((t) => t !== item));
  };

  const handleAddImage = (url: string, alt = "Project preview") => {
    setImages([...images, { url, altText: alt, order: images.length }]);
  };

  const handleRemoveImage = (index: number) => {
    const removedImg = images[index];
    if (removedImg?.url && removedImg.url.includes("res.cloudinary.com")) {
      deleteMediaAsset(removedImg.url).catch((err) => {
        console.error("Non-blocking Cloudinary deletion error on project image remove:", err);
      });
    }
    setImages(
      images
        .filter((_, i) => i !== index)
        .map((img, idx) => ({ ...img, order: idx }))
    );
  };

  const handleMoveImage = (fromIndex: number, direction: "left" | "right") => {
    const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;

    const reordered = [...images];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    setImages(reordered.map((img, idx) => ({ ...img, order: idx })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      category: category.trim() || "AI Systems",
      categoryLabel: categoryLabel.trim() || null,
      iconImageUrl: iconImageUrl.trim() || null,
      summary: summary.trim(),
      description: description.trim(),
      featured,
      featuredOrder: 0,
      published,
      order: 0,
      techStack,
      githubUrl: githubUrl.trim() || null,
      liveUrl: liveUrl.trim() || null,
      images,
    };

    try {
      if (isEditing && initialData) {
        await updateProject(initialData.id, payload);
      } else {
        await createProject(payload);
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save project.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects"
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-sm transition-colors shrink-0"
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 truncate">
              {isEditing ? `Edit: ${initialData?.title}` : "Create New Project"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Changes persist immediately to PostgreSQL and trigger public cache invalidation.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="min-h-[44px] w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs bg-[#3498db] hover:bg-[#2980b9] text-white transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isEditing ? "Save Changes" : "Publish Project"}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. LearnSphere AI"
            className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
            URL Slug *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="e.g. learnsphere-ai"
              className="flex-1 min-w-0 bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => setSlug(slugify(title))}
              className="min-h-[42px] px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-mono shrink-0"
            >
              Auto
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
            Category *
          </label>
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. AI Systems, Full Stack Web, Cloud Architecture"
            list="category-suggestions"
            className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
          />
          <datalist id="category-suggestions">
            <option value="AI Systems" />
            <option value="Full Stack Web" />
            <option value="Cloud Architecture" />
            <option value="Developer Tools" />
            <option value="Mobile" />
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
            Card Category Subtitle (Short Label)
          </label>
          <input
            type="text"
            value={categoryLabel}
            onChange={(e) => setCategoryLabel(e.target.value)}
            placeholder="e.g. AI Learning Platform, Personal Finance Platform"
            className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
          />
        </div>
      </div>

      {/* Project App Icon / Logo Image */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#12131a] border border-white/10 space-y-3">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
          Project App Icon / Card Logo
        </label>
        <p className="text-xs text-slate-400 font-mono">
          Small rounded tile icon shown on the homepage project card (e.g. 44x44px). If empty, the card generates a colored category icon automatically.
        </p>
        <ImageUploader
          value={iconImageUrl}
          onImageChange={(url) => setIconImageUrl(url)}
          folder="portfolio/project-icons"
          label="App Icon Tile / Logo"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
          Summary (Short Description for Cards) *
        </label>
        <textarea
          required
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief 1-2 sentence overview of the architecture and purpose..."
          className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl p-4 text-sm text-white placeholder-slate-600 outline-none resize-y"
        />
      </div>

      {/* Full Description with Markdown Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
            Detailed Description (Markdown / Formatted Text) *
          </label>
          <div className="flex items-center gap-1 bg-[#090a0f] p-1 rounded-lg border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setDescriptionTab("write")}
              className={`px-3 py-1 rounded-md transition-colors ${
                descriptionTab === "write"
                  ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setDescriptionTab("preview")}
              className={`px-3 py-1 rounded-md transition-colors ${
                descriptionTab === "preview"
                  ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Markdown Preview
            </button>
          </div>
        </div>

        {descriptionTab === "write" ? (
          <textarea
            required
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Full breakdown of capabilities, architecture, engineering achievements, and implementation..."
            className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl p-4 text-sm text-white placeholder-slate-600 outline-none resize-y font-mono text-xs"
          />
        ) : (
          <div className="w-full min-h-[170px] p-4 rounded-xl bg-[#090a0f] border border-white/10 text-slate-200 text-sm overflow-auto">
            {description.trim() ? (
              <div className="space-y-3 font-sans leading-relaxed whitespace-pre-wrap text-sm text-slate-300">
                {description}
              </div>
            ) : (
              <span className="text-slate-600 italic text-xs font-mono">
                No description text to preview yet. Switch back to Write to add content.
              </span>
            )}
          </div>
        )}
      </div>

      {/* External Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-6 rounded-2xl bg-[#12131a] border border-white/10">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
            GitHub Repository URL (Optional)
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
          />
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Note: If left empty, the GitHub button is automatically hidden from public visitors.
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
            Live Application Demo URL (Optional)
          </label>
          <input
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
          />
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Note: If left empty, the Live Demo button is automatically hidden from public visitors.
          </p>
        </div>
      </div>

      {/* Tech Stack Tags Input */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#12131a] border border-white/10 space-y-4">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
          Tech Stack Technologies *
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTech();
              }
            }}
            placeholder="Type technology (e.g. OpenAI, FastAPI, Neon) and press Add"
            className="flex-1 min-w-0 bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none"
          />
          <button
            type="button"
            onClick={handleAddTech}
            className="min-h-[42px] px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs shrink-0 cursor-pointer"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => handleRemoveTech(tech)}
                className="hover:text-rose-400 p-1 min-h-[28px] min-w-[28px] inline-flex items-center justify-center cursor-pointer"
                aria-label={`Remove ${tech}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Project Screenshots & Multi-Image Uploader */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#12131a] border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">
            Project Screenshots ({images.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Use arrows to reorder · First image is cover
          </span>
        </div>

        <ImageUploader onImageAdded={handleAddImage} folder="portfolio/projects" />

        {/* Existing Images Gallery with Reorder Controls */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative rounded-xl bg-[#090a0f] border border-white/10 overflow-hidden flex flex-col group"
              >
                <div className="relative h-36 w-full bg-black/50">
                  <Image
                    src={img.url}
                    alt={img.altText || "Preview"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-wider shadow">
                      Cover
                    </span>
                  )}
                </div>

                <div className="p-2.5 bg-[#12131a] border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400 truncate flex-1 min-w-0">
                    #{idx + 1} {img.altText || "Screenshot"}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveImage(idx, "left")}
                      className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Move left / earlier"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMoveImage(idx, "right")}
                      className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Move right / later"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visibility & Featured Switches */}
      <div className="flex flex-wrap items-center gap-6 p-4 sm:p-6 rounded-2xl bg-[#12131a] border border-white/10">
        <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 bg-[#090a0f]"
          />
          <span className="text-xs font-mono text-slate-200">
            Published (Visible on public portfolio)
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 bg-[#090a0f]"
          />
          <span className="text-xs font-mono text-slate-200">
            Featured on Homepage
          </span>
        </label>
      </div>

      {/* Bottom Save Action - Sticky on mobile for effortless saving */}
      <div className="sticky bottom-0 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-end gap-3 sm:gap-4">
        <Link
          href="/admin/projects"
          className="min-h-[44px] px-5 sm:px-6 py-2.5 rounded-xl font-medium text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="min-h-[44px] px-6 sm:px-8 py-2.5 rounded-xl font-semibold text-xs bg-[#3498db] hover:bg-[#2980b9] text-white transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isEditing ? "Save Project" : "Publish Project"}</span>
        </button>
      </div>
    </form>
  );
}
