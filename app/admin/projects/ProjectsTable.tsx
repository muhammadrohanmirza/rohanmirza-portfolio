"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  Search,
  ExternalLink,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  deleteProject,
  toggleProjectPublish,
  reorderProjects,
} from "@/lib/actions/project.actions";
import Image from "next/image";

interface ProjectImage {
  id: string;
  url: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  summary: string;
  published: boolean;
  featured: boolean;
  techStack: string[];
  images: ProjectImage[];
}

export function ProjectsTable({ projects }: { projects: ProjectItem[] }) {
  const router = useRouter();
  const [projectList, setProjectList] = useState<ProjectItem[]>(projects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "featured">("all");
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setProjectList(projects);
  }, [projects]);

  // Toast feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = projectList.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === "published") return p.published;
    if (filter === "draft") return !p.published;
    if (filter === "featured") return p.featured;
    return true;
  });

  const handleTogglePublish = (project: ProjectItem) => {
    const nextVal = !project.published;
    setProjectList((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, published: nextVal } : p))
    );

    startTransition(async () => {
      try {
        await toggleProjectPublish(project.id, nextVal);
        showToast("success", `Project "${project.title}" marked as ${nextVal ? "Published" : "Draft"}.`);
        router.refresh();
      } catch {
        setProjectList((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, published: !nextVal } : p))
        );
        showToast("error", "Failed to update project status.");
      }
    });
  };

  const handleMoveProject = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projectList.length) return;

    const updated = [...projectList];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    setProjectList(updated);

    startTransition(async () => {
      try {
        const payload = updated.map((p) => p.id);
        await reorderProjects(payload);
        showToast("success", "Project reordered.");
        router.refresh();
      } catch {
        setProjectList(projects);
        showToast("error", "Failed to save project order.");
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        await deleteProject(deleteTarget.id);
        setProjectList((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
        showToast("success", `Deleted project "${deleteTarget.title}".`);
        router.refresh();
      } catch {
        showToast("error", "Failed to delete project.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto max-w-sm z-50 p-4 rounded-2xl border flex items-center gap-3 text-sm shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "success"
              ? "bg-white border-slate-800 text-slate-800"
              : "bg-white border-rose-800 text-slate-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
          )}
          <span className="break-words min-w-0">{toast.message}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3498db] rounded-xl pl-10 pr-4 py-2.5 min-h-[44px] text-base sm:text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll-x no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
              filter === "all"
                ? "bg-[#3498db] text-white font-semibold shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({projectList.length})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
              filter === "published"
                ? "bg-[#3498db] text-white font-semibold shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
              filter === "draft"
                ? "bg-[#3498db] text-white font-semibold shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            Drafts
          </button>
          <button
            onClick={() => setFilter("featured")}
            className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
              filter === "featured"
                ? "bg-[#3498db] text-white font-semibold shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            Featured ★
          </button>
        </div>
      </div>

      {/* Table with smooth touch horizontal scroll */}
      <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto touch-scroll-x">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                <th className="py-3.5 px-4 w-20 text-center">Order</th>
                <th className="py-3.5 px-4 min-w-[220px]">Project</th>
                <th className="py-3.5 px-4 min-w-[200px]">Tech Stack</th>
                <th className="py-3.5 px-4 w-32 text-center">Status</th>
                <th className="py-3.5 px-4 w-24 text-center">Featured</th>
                <th className="py-3.5 px-4 w-36 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((project, idx) => {
                  const thumbnail = project.images?.[0]?.url;

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Reorder Buttons */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleMoveProject(idx, "up")}
                            disabled={idx === 0 || isPending}
                            className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:text-[#3498db] hover:bg-slate-200 disabled:opacity-30 cursor-pointer transition-colors"
                            title="Move Project Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveProject(idx, "down")}
                            disabled={idx === projectList.length - 1 || isPending}
                            className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:text-[#3498db] hover:bg-slate-200 disabled:opacity-30 cursor-pointer transition-colors"
                            title="Move Project Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Project Name & Thumbnail */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {thumbnail ? (
                              <Image
                                src={thumbnail}
                                alt={project.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-400">
                                None
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 block text-sm whitespace-nowrap">
                              {project.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                              <span className="font-mono text-[11px] text-[#3498db]">
                                /{project.slug}
                              </span>
                              {project.category && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                                  {project.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Stack */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs min-w-[180px]">
                          {project.techStack.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap shrink-0"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublish(project)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono cursor-pointer transition-colors whitespace-nowrap ${
                            project.published
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                          }`}
                          title="Click to toggle publish status"
                        >
                          {project.published ? (
                            <>
                              <Eye className="w-3.5 h-3.5 shrink-0" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 shrink-0" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="py-4 px-4 text-center font-mono whitespace-nowrap">
                        {project.featured ? (
                          <span className="text-[#f97316] text-xs font-bold">★ Yes</span>
                        ) : (
                          <span className="text-slate-400 text-xs">No</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/projects/${project.slug}`}
                            target="_blank"
                            className={`w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border transition-colors shrink-0 ${
                              project.published
                                ? "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200"
                                : "text-amber-600 hover:text-amber-700 bg-amber-50/50 hover:bg-amber-100 border-amber-200"
                            }`}
                            title={project.published ? "View on Public Site" : "Preview Draft (Admin Only)"}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/projects/${project.id}/edit`}
                            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#3498db] hover:bg-[#3498db]/10 border border-[#3498db]/30 transition-colors shrink-0"
                            title="Edit Project"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(project)}
                            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer shrink-0"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FolderKanban className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>No projects found matching current filter.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isPending}
        title="Delete Project?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action removes all project images and database records.`}
        confirmText="Delete Project"
      />
    </div>
  );
}
