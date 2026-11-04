"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard } from "@/components/public/ProjectCard";
import { ProjectModal, Project } from "@/components/public/ProjectModal";
import { SectionHeading } from "@/components/public/SectionHeading";

interface ProjectsClientProps {
  initialProjects: Project[];
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialProjects.forEach((p) => {
      const cat = p.category?.trim();
      if (cat) cats.add(cat);
    });
    return ["All", ...Array.from(cats)];
  }, [initialProjects]);

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return initialProjects;
    return initialProjects.filter(
      (p) => (p.category?.trim() || "") === activeCategory
    );
  }, [initialProjects, activeCategory]);

  return (
    <div className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
        <SectionHeading
          eyebrow="PORTFOLIO ARCHIVE"
          title="All *Projects*"
          defaultTitle="All Projects"
          defaultHighlight="Projects"
          description="Explore all published web applications, AI platforms, and technical architectures."
          align="center"
        />
      </div>

      {/* Category Tabs */}
      {categories.length > 2 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-2xl mx-auto">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-slate-400 hover:text-white bg-white/[0.03] border border-white/[0.08]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md shadow-blue-500/20"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpenDetails={(p) => setSelectedProject(p)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#0a0f1d] border border-white/[0.08] max-w-md mx-auto">
          <p className="text-sm text-slate-400">No projects found in this category.</p>
        </div>
      )}

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          isOpen={Boolean(selectedProject)}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
