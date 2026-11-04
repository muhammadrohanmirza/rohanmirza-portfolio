"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  Wrench,
  FolderPlus,
  Loader2,
  Search,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  AlertCircle,
  Code2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  toggleCategoryVisibility,
  createSkill,
  updateSkill,
  deleteSkill,
  reorderSkills,
  toggleSkillVisibility,
} from "@/lib/actions/skill.actions";

export interface SkillItem {
  id: string;
  name: string;
  categoryId: string;
  iconName: string | null;
  proficiency: number | null;
  proficiencyLevel: string | null;
  yearsOfExp: number | null;
  description: string | null;
  featured: boolean;
  order: number;
  visible: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  order: number;
  visible: boolean;
  skills: SkillItem[];
}

export function SkillsManager({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [isPending, startTransition] = useTransition();

  // Keep state in sync with server props
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Toast feedback state
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "visible" | "hidden" | "featured">("all");

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryVisible, setCategoryVisible] = useState(true);

  // Skill Modal State
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [skillName, setSkillName] = useState("");
  const [skillIcon, setSkillIcon] = useState("");
  const [skillProficiency, setSkillProficiency] = useState<number | "">(90);
  const [skillLevel, setSkillLevel] = useState<string>("Advanced");
  const [skillYearsExp, setSkillYearsExp] = useState<number | "">(3);
  const [skillDescription, setSkillDescription] = useState("");
  const [skillVisible, setSkillVisible] = useState(true);
  const [skillFeatured, setSkillFeatured] = useState(false);
  const [skillOrder, setSkillOrder] = useState<number>(0);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "skill";
    id: string;
    categoryId?: string;
    name: string;
  } | null>(null);

  // --- Category Handlers ---
  const handleOpenCategoryModal = (cat?: CategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
      setCategoryVisible(cat.visible);
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryVisible(true);
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    startTransition(async () => {
      try {
        if (editingCategory) {
          await updateCategory(editingCategory.id, {
            name: categoryName.trim(),
            order: editingCategory.order,
            visible: categoryVisible,
          });
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id
                ? { ...c, name: categoryName.trim(), visible: categoryVisible }
                : c
            )
          );
          showToast("success", `Category "${categoryName}" updated.`);
        } else {
          const res = await createCategory({
            name: categoryName.trim(),
            order: categories.length + 1,
            visible: categoryVisible,
          });
          if (res.category) {
            setCategories((prev) => [
              ...prev,
              { ...res.category, skills: [] } as CategoryItem,
            ]);
          }
          showToast("success", `Category "${categoryName}" created.`);
        }
        setCategoryModalOpen(false);
        router.refresh();
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : "Failed to save category.");
      }
    });
  };

  const handleToggleCategoryVisibility = (cat: CategoryItem) => {
    const nextVal = !cat.visible;
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, visible: nextVal } : c))
    );
    startTransition(async () => {
      try {
        await toggleCategoryVisibility(cat.id, nextVal);
        showToast("success", `Category "${cat.name}" is now ${nextVal ? "visible" : "hidden"}.`);
        router.refresh();
      } catch {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, visible: !nextVal } : c))
        );
        showToast("error", "Failed to update category visibility.");
      }
    });
  };

  const handleMoveCategory = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const newCats = [...categories];
    const [moved] = newCats.splice(index, 1);
    newCats.splice(newIndex, 0, moved);

    setCategories(newCats);

    startTransition(async () => {
      try {
        await reorderCategories(newCats.map((c) => c.id));
        showToast("success", "Category order updated.");
        router.refresh();
      } catch {
        showToast("error", "Failed to update category order.");
      }
    });
  };

  // --- Skill Handlers ---
  const handleOpenSkillModal = (categoryId?: string, skill?: SkillItem) => {
    if (skill) {
      setEditingSkill(skill);
      setTargetCategoryId(skill.categoryId || categoryId || (categories[0]?.id ?? ""));
      setIsNewCategoryMode(false);
      setNewCategoryName("");
      setSkillName(skill.name);
      setSkillIcon(skill.iconName || "Code2");
      setSkillProficiency(skill.proficiency ?? "");
      setSkillLevel(skill.proficiencyLevel || "Advanced");
      setSkillYearsExp(skill.yearsOfExp ?? "");
      setSkillDescription(skill.description || "");
      setSkillVisible(skill.visible);
      setSkillFeatured(skill.featured ?? false);
      setSkillOrder(skill.order);
    } else {
      setEditingSkill(null);
      setTargetCategoryId(categoryId || categories[0]?.id || "");
      setIsNewCategoryMode(false);
      setNewCategoryName("");
      setSkillName("");
      setSkillIcon("Code2");
      setSkillProficiency(90);
      setSkillLevel("Advanced");
      setSkillYearsExp(3);
      setSkillDescription("");
      setSkillVisible(true);
      setSkillFeatured(false);
      const cat = categories.find((c) => c.id === categoryId);
      setSkillOrder((cat?.skills.length ?? 0) + 1);
    }
    setSkillModalOpen(true);
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    startTransition(async () => {
      try {
        let finalCategoryId = targetCategoryId;

        // If user is creating a new category on-the-fly
        if (isNewCategoryMode) {
          if (!newCategoryName.trim()) {
            showToast("error", "Please provide a name for the new category.");
            return;
          }
          const catRes = await createCategory({
            name: newCategoryName.trim(),
            order: categories.length + 1,
            visible: true,
          });
          if (!catRes.category) throw new Error("Failed to create new category.");
          finalCategoryId = catRes.category.id;
          setCategories((prev) => [
            ...prev,
            { ...catRes.category, skills: [] } as CategoryItem,
          ]);
        }

        if (!finalCategoryId) {
          showToast("error", "Please select a category for this skill.");
          return;
        }

        const payload = {
          name: skillName.trim(),
          categoryId: finalCategoryId,
          iconName: skillIcon.trim() || null,
          proficiency: skillProficiency === "" ? null : Number(skillProficiency),
          proficiencyLevel: skillLevel.trim() || null,
          yearsOfExp: skillYearsExp === "" ? null : Number(skillYearsExp),
          description: skillDescription.trim() || null,
          featured: skillFeatured,
          order: Number(skillOrder) || 0,
          visible: skillVisible,
        };

        if (editingSkill) {
          const res = await updateSkill(editingSkill.id, payload);
          setCategories((prev) =>
            prev.map((cat) => {
              // If moved across categories
              if (cat.id === editingSkill.categoryId && cat.id !== finalCategoryId) {
                return {
                  ...cat,
                  skills: cat.skills.filter((s) => s.id !== editingSkill.id),
                };
              }
              if (cat.id === finalCategoryId) {
                const exists = cat.skills.some((s) => s.id === editingSkill.id);
                if (exists) {
                  return {
                    ...cat,
                    skills: cat.skills.map((s) =>
                      s.id === editingSkill.id ? ({ ...s, ...payload, id: editingSkill.id } as SkillItem) : s
                    ),
                  };
                } else {
                  return {
                    ...cat,
                    skills: [...cat.skills, { ...res.skill } as SkillItem],
                  };
                }
              }
              return cat;
            })
          );
          showToast("success", `Skill "${skillName}" updated successfully.`);
        } else {
          const res = await createSkill(payload);
          if (res.skill) {
            setCategories((prev) =>
              prev.map((cat) =>
                cat.id === finalCategoryId
                  ? { ...cat, skills: [...cat.skills, res.skill as SkillItem] }
                  : cat
              )
            );
          }
          showToast("success", `Skill "${skillName}" created successfully.`);
        }

        setSkillModalOpen(false);
        router.refresh();
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : "Failed to save skill.");
      }
    });
  };

  const handleToggleSkillVisibility = (skill: SkillItem) => {
    const nextVal = !skill.visible;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === skill.categoryId
          ? {
              ...cat,
              skills: cat.skills.map((s) =>
                s.id === skill.id ? { ...s, visible: nextVal } : s
              ),
            }
          : cat
      )
    );

    startTransition(async () => {
      try {
        await toggleSkillVisibility(skill.id, nextVal);
        showToast("success", `Skill "${skill.name}" is now ${nextVal ? "visible" : "hidden"}.`);
        router.refresh();
      } catch {
        // Revert
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === skill.categoryId
              ? {
                  ...cat,
                  skills: cat.skills.map((s) =>
                    s.id === skill.id ? { ...s, visible: !nextVal } : s
                  ),
                }
              : cat
          )
        );
        showToast("error", "Failed to update skill visibility.");
      }
    });
  };

  const handleMoveSkill = (categoryId: string, index: number, direction: "up" | "down") => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= category.skills.length) return;

    const newSkills = [...category.skills];
    const [moved] = newSkills.splice(index, 1);
    newSkills.splice(newIndex, 0, moved);

    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, skills: newSkills } : c))
    );

    startTransition(async () => {
      try {
        await reorderSkills(
          categoryId,
          newSkills.map((s) => s.id)
        );
        showToast("success", "Skills reordered.");
        router.refresh();
      } catch {
        showToast("error", "Failed to reorder skills.");
      }
    });
  };

  // --- Delete Handler ---
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        if (deleteTarget.type === "category") {
          await deleteCategory(deleteTarget.id);
          setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
          showToast("success", `Category "${deleteTarget.name}" deleted.`);
        } else {
          await deleteSkill(deleteTarget.id);
          setCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              skills: cat.skills.filter((s) => s.id !== deleteTarget.id),
            }))
          );
          showToast("success", `Skill "${deleteTarget.name}" deleted.`);
        }
        setDeleteTarget(null);
        router.refresh();
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : "Failed to delete item.");
      }
    });
  };

  // Filter and search logic
  const filteredCategories = categories
    .map((cat) => {
      const catMatches = cat.name.toLowerCase().includes(search.toLowerCase());
      const filteredSkills = cat.skills.filter((skill) => {
        const matchesSearch =
          catMatches ||
          skill.name.toLowerCase().includes(search.toLowerCase()) ||
          (skill.description && skill.description.toLowerCase().includes(search.toLowerCase())) ||
          (skill.proficiencyLevel && skill.proficiencyLevel.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;
        if (filter === "visible") return skill.visible;
        if (filter === "hidden") return !skill.visible;
        if (filter === "featured") return skill.featured;
        return true;
      });

      return {
        ...cat,
        skills: filteredSkills,
      };
    })
    .filter((cat) => cat.skills.length > 0 || cat.name.toLowerCase().includes(search.toLowerCase()));

  const totalSkillCount = categories.reduce((sum, c) => sum + c.skills.length, 0);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto max-w-sm z-50 p-4 rounded-2xl border flex items-center gap-3 text-sm shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/90 border-rose-500/30 text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="break-words min-w-0">{toast.message}</span>
        </div>
      )}

      {/* Toolbar: Search, Filters & Action Buttons */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 p-4 rounded-2xl bg-[#12131a] border border-white/10 shadow-lg">
        {/* Search */}
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills, categories, levels..."
            className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 min-h-[42px] text-base sm:text-xs text-white placeholder-slate-600 outline-none"
          />
        </div>

        {/* Filter Pills - Horizontally scrollable on mobile */}
        <div className="flex items-center gap-2 w-full xl:w-auto touch-scroll-x overflow-x-auto pb-1 xl:pb-0 no-scrollbar">
          <button
            onClick={() => setFilter("all")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
              filter === "all"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            All ({totalSkillCount})
          </button>
          <button
            onClick={() => setFilter("visible")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
              filter === "visible"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Visible
          </button>
          <button
            onClick={() => setFilter("hidden")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
              filter === "hidden"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Hidden
          </button>
          <button
            onClick={() => setFilter("featured")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
              filter === "featured"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Featured ★
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full xl:w-auto justify-start sm:justify-end">
          <button
            onClick={() => handleOpenCategoryModal()}
            className="min-h-[40px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
          >
            <FolderPlus className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>New Category</span>
          </button>
          <button
            onClick={() => handleOpenSkillModal()}
            className="min-h-[40px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer flex-1 sm:flex-initial font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* Main Categories & Skills List */}
      {filteredCategories.length > 0 ? (
        <div className="space-y-6">
          {filteredCategories.map((category, catIdx) => (
            <div
              key={category.id}
              className="rounded-2xl bg-[#12131a] border border-white/10 overflow-hidden shadow-xl"
            >
              {/* Category Header Bar */}
              <div className="p-4 sm:p-5 bg-[#0e1017]/80 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Category Reorder Buttons */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => handleMoveCategory(catIdx, "up")}
                      disabled={catIdx === 0 || isPending}
                      className="p-1 text-slate-500 hover:text-cyan-400 disabled:opacity-20 disabled:hover:text-slate-500"
                      title="Move Category Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveCategory(catIdx, "down")}
                      disabled={catIdx === categories.length - 1 || isPending}
                      className="p-1 text-slate-500 hover:text-cyan-400 disabled:opacity-20 disabled:hover:text-slate-500"
                      title="Move Category Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {category.name}
                      </h3>
                      <button
                        onClick={() => handleToggleCategoryVisibility(category)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono cursor-pointer whitespace-nowrap shrink-0 ${
                          category.visible
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                        title="Click to toggle category visibility on public site"
                      >
                        {category.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        <span>{category.visible ? "Visible" : "Hidden"}</span>
                      </button>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {category.skills.length} skills in this category
                    </span>
                  </div>
                </div>

                {/* Category Action Controls */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => handleOpenSkillModal(category.id)}
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                  <button
                    onClick={() => handleOpenCategoryModal(category)}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="Edit Category Name"
                    aria-label="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        type: "category",
                        id: category.id,
                        name: category.name,
                      })
                    }
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Category"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Skills Table for this Category */}
              {category.skills.length > 0 ? (
                <div className="overflow-x-auto touch-scroll-x">
                  <table className="w-full min-w-[860px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-[#0b0c13]/40 text-[10px] font-mono uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        <th className="py-2.5 px-4 w-16 text-center">Order</th>
                        <th className="py-2.5 px-4 min-w-[200px]">Skill & Icon</th>
                        <th className="py-2.5 px-4 w-32 min-w-[120px]">Proficiency</th>
                        <th className="py-2.5 px-4 w-28 min-w-[100px]">Experience</th>
                        <th className="py-2.5 px-4 min-w-[180px] max-w-xs">Description</th>
                        <th className="py-2.5 px-4 w-28 text-center">Status</th>
                        <th className="py-2.5 px-4 w-24 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                      {category.skills.map((skill, skillIdx) => {
                        const isImageUrl =
                          skill.iconName &&
                          (skill.iconName.startsWith("http") || skill.iconName.startsWith("/"));

                        return (
                          <tr
                            key={skill.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            {/* Reorder Up/Down */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleMoveSkill(category.id, skillIdx, "up")}
                                  disabled={skillIdx === 0 || isPending}
                                  className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-500 hover:text-cyan-400 disabled:opacity-20 disabled:hover:text-slate-500 hover:bg-white/5 transition-colors cursor-pointer"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveSkill(category.id, skillIdx, "down")}
                                  disabled={skillIdx === category.skills.length - 1 || isPending}
                                  className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-500 hover:text-cyan-400 disabled:opacity-20 disabled:hover:text-slate-500 hover:bg-white/5 transition-colors cursor-pointer"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                            {/* Skill Icon & Name */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5 min-w-[190px]">
                                <div className="w-7 h-7 rounded-lg bg-[#090a0f] border border-white/10 flex items-center justify-center text-cyan-400 shrink-0 overflow-hidden">
                                  {isImageUrl ? (
                                    <img
                                      src={skill.iconName!}
                                      alt={skill.name}
                                      className="w-4 h-4 object-contain"
                                    />
                                  ) : (
                                    <Code2 className="w-3.5 h-3.5" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className="font-semibold text-white whitespace-nowrap">
                                      {skill.name}
                                    </span>
                                    {skill.featured && (
                                      <span
                                        className="text-amber-400 text-xs shrink-0"
                                        title="Featured on Portfolio"
                                      >
                                        ★
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap block">
                                    icon: {skill.iconName || "none"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Proficiency Level / % */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                {skill.proficiencyLevel && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 whitespace-nowrap shrink-0">
                                    {skill.proficiencyLevel}
                                  </span>
                                )}
                                {skill.proficiency && (
                                  <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                                    {skill.proficiency}%
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Years of Exp */}
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                              {skill.yearsOfExp ? `${skill.yearsOfExp} years` : "—"}
                            </td>

                            {/* Short Description */}
                            <td className="py-3 px-4 min-w-[180px] max-w-xs text-[11px] text-slate-400">
                              <span className="truncate block max-w-xs">{skill.description || "—"}</span>
                            </td>

                            {/* Status Visibility */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleToggleSkillVisibility(skill)}
                                disabled={isPending}
                                className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 py-1 rounded-full text-[10px] font-mono cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                                  skill.visible
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20"
                                }`}
                                title="Click to toggle visibility"
                              >
                                {skill.visible ? (
                                  <>
                                    <Eye className="w-3 h-3 shrink-0" />
                                    <span>Visible</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3 shrink-0" />
                                    <span>Hidden</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                <button
                                  onClick={() => handleOpenSkillModal(category.id, skill)}
                                  className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors cursor-pointer shrink-0"
                                  title="Edit Skill"
                                  aria-label="Edit skill"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "skill",
                                      id: skill.id,
                                      categoryId: category.id,
                                      name: skill.name,
                                    })
                                  }
                                  className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Delete Skill"
                                  aria-label="Delete skill"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <span>No skills in this category yet. Click &quot;Add Skill&quot; above to create one.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-[#12131a] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">No Skills Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? `No skills or categories matched your search query "${search}".`
                : "Your skills directory is currently empty. Start by creating a category or adding a skill."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleOpenCategoryModal()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15"
            >
              Add First Category
            </button>
            <button
              onClick={() => handleOpenSkillModal()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-medium"
            >
              Add First Skill
            </button>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT SKILL MODAL --- */}
      <Modal
        isOpen={skillModalOpen}
        onClose={() => setSkillModalOpen(false)}
        title={editingSkill ? `Edit Skill: ${editingSkill.name}` : "Add New Skill"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSkill} className="space-y-4">
          {/* Category selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Category *
            </label>
            {!isNewCategoryMode ? (
              <div className="flex gap-2">
                <select
                  required
                  value={targetCategoryId}
                  onChange={(e) => {
                    if (e.target.value === "__NEW__") {
                      setIsNewCategoryMode(true);
                      setNewCategoryName("");
                    } else {
                      setTargetCategoryId(e.target.value);
                    }
                  }}
                  className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                >
                  <option value="" disabled>
                    -- Select a Category --
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="__NEW__">+ Create New Category...</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter new category name (e.g. Cloud & DevOps)"
                    className="flex-1 bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewCategoryMode(false);
                      setTargetCategoryId(categories[0]?.id || "");
                    }}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 block">
                  This new category will be created automatically when you save this skill.
                </span>
              </div>
            )}
          </div>

          {/* Skill Name */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Skill Name *
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. Next.js, Python, PostgreSQL, LangChain"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
            />
          </div>

          {/* Icon (Lucide name or Image URL) */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Icon (Lucide Icon Name or Image URL)
            </label>
            <input
              type="text"
              value={skillIcon}
              onChange={(e) => setSkillIcon(e.target.value)}
              placeholder="Terminal, Zap, Sparkles, Cpu, Code2, Globe, Database, or https://..."
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] font-mono text-slate-500 self-center mr-1">Presets:</span>
              {["Terminal", "Zap", "Sparkles", "Cpu", "Globe", "Code2", "Palette", "Database", "Server", "Layers"].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setSkillIcon(preset)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Proficiency Level & Percentage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Proficiency Level (Optional)
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              >
                <option value="">None / Custom</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Proficiency Percentage (1 - 100)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={typeof skillProficiency === "number" ? skillProficiency : 90}
                  onChange={(e) => setSkillProficiency(Number(e.target.value))}
                  className="flex-1 accent-cyan-400"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={skillProficiency}
                  onChange={(e) =>
                    setSkillProficiency(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-16 bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-2 py-1 text-xs text-center text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Years of Experience & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Years of Experience (Optional)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={skillYearsExp}
                onChange={(e) =>
                  setSkillYearsExp(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="e.g. 3"
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={skillOrder}
                onChange={(e) => setSkillOrder(Number(e.target.value))}
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Short Description (Optional)
            </label>
            <textarea
              rows={2}
              value={skillDescription}
              onChange={(e) => setSkillDescription(e.target.value)}
              placeholder="e.g. Server components, partial prerendering, and Turbopack optimization..."
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl p-3 text-xs text-white outline-none resize-y"
            />
          </div>

          {/* Toggles: Visible & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={skillVisible}
                onChange={(e) => setSkillVisible(e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-white block">Visible on Website</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Display in public skills section
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={skillFeatured}
                onChange={(e) => setSkillFeatured(e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-white block">Featured Skill ★</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Highlight with special badge
                </span>
              </div>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setSkillModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isPending ? "Saving..." : editingSkill ? "Save Changes" : "Create Skill"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* --- ADD / EDIT CATEGORY MODAL --- */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. AI & Intelligent Systems"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
            />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={categoryVisible}
              onChange={(e) => setCategoryVisible(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
            />
            <div>
              <span className="text-xs font-semibold text-white block">Visible on Website</span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Show or hide this entire category
              </span>
            </div>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isPending ? "Saving..." : "Save Category"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isPending}
        title={deleteTarget?.type === "category" ? "Delete Category?" : "Delete Skill?"}
        message={
          deleteTarget?.type === "category"
            ? `Are you sure you want to delete category "${deleteTarget?.name}"? All skills inside this category will also be deleted.`
            : `Are you sure you want to permanently delete the skill "${deleteTarget?.name}"?`
        }
        confirmText={deleteTarget?.type === "category" ? "Delete Category" : "Delete Skill"}
      />
    </div>
  );
}
