"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  createKeyStat,
  updateKeyStat,
  deleteKeyStat,
  toggleKeyStatVisibility,
  reorderKeyStats,
} from "@/lib/actions/stat.actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export interface KeyStatItem {
  id: string;
  label: string;
  value: string;
  order: number;
  visible: boolean;
}

export function StatsManager({ initialStats }: { initialStats: KeyStatItem[] }) {
  const [stats, setStats] = useState<KeyStatItem[]>(initialStats);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<KeyStatItem | null>(null);

  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KeyStatItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const openCreateModal = () => {
    setEditingStat(null);
    setLabel("");
    setValue("");
    setVisible(true);
    setIsModalOpen(true);
  };

  const openEditModal = (stat: KeyStatItem) => {
    setEditingStat(stat);
    setLabel(stat.label);
    setValue(stat.value);
    setVisible(stat.visible);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !value.trim()) return;

    setIsLoading(true);
    try {
      if (editingStat) {
        await updateKeyStat(editingStat.id, {
          label: label.trim(),
          value: value.trim(),
          visible,
          order: editingStat.order,
        });
        setStats((prev) =>
          prev.map((s) =>
            s.id === editingStat.id
              ? { ...s, label: label.trim(), value: value.trim(), visible }
              : s
          )
        );
        showNotification("Stat updated successfully.");
      } else {
        const res = await createKeyStat({
          label: label.trim(),
          value: value.trim(),
          visible,
          order: stats.length,
        });
        if (res.stat) {
          setStats((prev) => [...prev, res.stat]);
        }
        showNotification("Stat created successfully.");
      }
      setIsModalOpen(false);
    } catch {
      showNotification("Failed to save stat.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteKeyStat(deleteTarget.id);
      setStats((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      showNotification("Stat deleted.");
      setDeleteTarget(null);
    } catch {
      showNotification("Failed to delete stat.");
    }
  };

  const handleToggleVisibility = async (stat: KeyStatItem) => {
    const newVis = !stat.visible;
    try {
      await toggleKeyStatVisibility(stat.id, newVis);
      setStats((prev) =>
        prev.map((s) => (s.id === stat.id ? { ...s, visible: newVis } : s))
      );
      showNotification(newVis ? "Stat is now visible" : "Stat is hidden");
    } catch {
      showNotification("Failed to update visibility.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stats.length) return;

    const reordered = [...stats];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setStats(reordered);

    try {
      await reorderKeyStats(reordered.map((s) => s.id));
      showNotification("Order updated.");
    } catch {
      showNotification("Failed to persist order.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>Key Performance Stats</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Display quantitative achievements in the About section. If no stats exist, the block is hidden from the public site.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stat</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* List */}
      {stats.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#12131a] border border-dashed border-white/10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Key Stats Configured</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Zero fake numbers are displayed. The Key Stats container is completely hidden on the public site until you add authentic metrics here.
          </p>
          <button
            onClick={openCreateModal}
            className="min-h-[44px] px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs cursor-pointer inline-flex items-center justify-center"
          >
            Create Your First Metric
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <div
              key={stat.id}
              className={`p-4 sm:p-6 rounded-2xl bg-[#12131a] border transition-all flex flex-col justify-between ${
                stat.visible
                  ? "border-white/10 hover:border-cyan-500/40"
                  : "border-white/5 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-slate-500">
                    Order #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer hover:bg-white/5"
                      title="Move Earlier"
                      aria-label="Move stat up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === stats.length - 1}
                      className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer hover:bg-white/5"
                      title="Move Later"
                      aria-label="Move stat down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-3xl font-bold text-white font-mono tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  {stat.label}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(stat)}
                  className={`inline-flex items-center gap-1.5 min-h-[36px] font-mono text-[11px] cursor-pointer ${
                    stat.visible ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {stat.visible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(stat)}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 cursor-pointer"
                    title="Edit Stat"
                    aria-label="Edit stat"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(stat)}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 cursor-pointer"
                    title="Delete Stat"
                    aria-label="Delete stat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#12131a] border border-white/10 rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div>
              <h2 className="text-xl font-bold text-white">
                {editingStat ? "Edit Key Stat" : "Create Key Stat"}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Enter metric value and descriptive label.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Metric Value * (e.g. 12+, 99.9%, 400K)
                </label>
                <input
                  type="text"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. 12+"
                  className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Metric Label * (e.g. LLM Systems Deployed)
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Production AI Deployments"
                  className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2 min-h-[44px]">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 bg-[#090a0f]"
                />
                <span className="text-xs font-mono text-slate-300">
                  Visible on public About section
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingStat ? "Save Changes" : "Create Stat"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Key Stat"
        message={`Are you sure you want to permanently delete the stat "${deleteTarget?.label}"?`}
        confirmText="Delete Stat"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
