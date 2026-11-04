"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  createService,
  updateService,
  deleteService,
  toggleServiceVisibility,
  reorderServices,
} from "@/lib/actions/service.actions";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  deliverableTag?: string | null;
  order: number;
  visible: boolean;
}

export function ServicesManager({
  initialServices,
}: {
  initialServices: ServiceItem[];
}) {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  // Toast feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("Code");
  const [deliverableTag, setDeliverableTag] = useState("Custom Architecture & Execution");
  const [visible, setVisible] = useState(true);
  const [order, setOrder] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.iconName.toLowerCase().includes(search.toLowerCase()) ||
      (s.deliverableTag && s.deliverableTag.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === "visible") return s.visible;
    if (filter === "hidden") return !s.visible;
    return true;
  });

  const handleOpenModal = (service?: ServiceItem) => {
    if (service) {
      setEditingService(service);
      setTitle(service.title);
      setDescription(service.description);
      setIconName(service.iconName || "Code");
      setDeliverableTag(service.deliverableTag ?? "Custom Architecture & Execution");
      setVisible(service.visible);
      setOrder(service.order);
    } else {
      setEditingService(null);
      setTitle("");
      setDescription("");
      setIconName("Code");
      setDeliverableTag("Custom Architecture & Execution");
      setVisible(true);
      setOrder(services.length + 1);
    }
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    startTransition(async () => {
      try {
        if (editingService) {
          await updateService(editingService.id, {
            title: title.trim(),
            description: description.trim(),
            iconName: iconName.trim(),
            deliverableTag: deliverableTag.trim() || null,
            order,
            visible,
          });
          setServices((prev) =>
            prev.map((s) =>
              s.id === editingService.id
                ? {
                    ...s,
                    title: title.trim(),
                    description: description.trim(),
                    iconName: iconName.trim(),
                    deliverableTag: deliverableTag.trim() || null,
                    visible,
                    order,
                  }
                : s
            )
          );
          showToast("success", `Service "${title}" updated.`);
        } else {
          const res = await createService({
            title: title.trim(),
            description: description.trim(),
            iconName: iconName.trim(),
            deliverableTag: deliverableTag.trim() || null,
            order,
            visible,
          });
          if (res.service) {
            setServices((prev) => [...prev, res.service as ServiceItem]);
          }
          showToast("success", `Service "${title}" created.`);
        }
        setModalOpen(false);
        router.refresh();
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : "Failed to save service.");
      }
    });
  };

  const handleToggle = (service: ServiceItem) => {
    const nextVal = !service.visible;
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, visible: nextVal } : s))
    );

    startTransition(async () => {
      try {
        await toggleServiceVisibility(service.id, nextVal);
        showToast("success", `Service "${service.title}" is now ${nextVal ? "visible" : "hidden"}.`);
        router.refresh();
      } catch {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, visible: !nextVal } : s))
        );
        showToast("error", "Failed to update service visibility.");
      }
    });
  };

  const handleMoveService = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= services.length) return;

    const newServices = [...services];
    const [moved] = newServices.splice(index, 1);
    newServices.splice(newIndex, 0, moved);

    setServices(newServices);

    startTransition(async () => {
      try {
        await reorderServices(newServices.map((s) => s.id));
        showToast("success", "Services reordered.");
        router.refresh();
      } catch {
        showToast("error", "Failed to reorder services.");
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setServices((prev) => prev.filter((s) => s.id !== target.id));

    startTransition(async () => {
      try {
        await deleteService(target.id);
        showToast("success", `Service "${target.title}" deleted.`);
        setDeleteTarget(null);
        router.refresh();
      } catch {
        showToast("error", "Failed to delete service.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border flex items-center gap-3 text-sm shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 ${
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
          <span>{toast.message}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#12131a] border border-white/10 shadow-lg">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 min-h-[44px] text-base sm:text-xs text-white placeholder-slate-600 outline-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll-x no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                filter === "all"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              All ({services.length})
            </button>
            <button
              onClick={() => setFilter("visible")}
              className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                filter === "visible"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              Visible
            </button>
            <button
              onClick={() => setFilter("hidden")}
              className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                filter === "hidden"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              Hidden
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service, idx) => (
            <div
              key={service.id}
              className="p-5 sm:p-6 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Up/Down buttons */}
                    <button
                      onClick={() => handleMoveService(idx, "up")}
                      disabled={idx === 0 || isPending}
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center text-slate-400 hover:text-cyan-400 disabled:opacity-20 bg-white/5 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveService(idx, "down")}
                      disabled={idx === services.length - 1 || isPending}
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center text-slate-400 hover:text-cyan-400 disabled:opacity-20 bg-white/5 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-cyan-400 truncate ml-1">
                      {service.iconName}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggle(service)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono cursor-pointer shrink-0 ${
                      service.visible
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}
                  >
                    {service.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{service.visible ? "Visible" : "Hidden"}</span>
                  </button>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-2 break-words">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed whitespace-pre-line break-words">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(service)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20 transition-colors cursor-pointer"
                  title="Edit Service"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(service)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 sm:p-12 rounded-2xl bg-[#12131a] border border-white/10 text-center space-y-3">
          <Layers className="w-8 h-8 mx-auto text-slate-500 opacity-40" />
          <h4 className="text-base font-bold text-white">No Services Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search
              ? `No service offerings matched "${search}".`
              : "No services configured yet. Click 'Add Service' to create your first offering."}
          </p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? `Edit Service: ${editingService.title}` : "Add New Service Offering"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Service Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Agent & LLM Architecture"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-3 min-h-[44px] text-base sm:text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Icon Name (Lucide Icon Name)
            </label>
            <input
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="Bot, Server, Layout, Code, Terminal, Zap, Cpu..."
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-3 min-h-[44px] text-base sm:text-xs text-white outline-none font-mono"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] font-mono text-slate-500 self-center mr-1">Presets:</span>
              {["Bot", "Server", "Layout", "Code", "Terminal", "Zap", "Cpu"].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setIconName(preset)}
                  className="px-2.5 py-1 min-h-[32px] flex items-center justify-center rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what this service offering entails..."
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl p-3 text-base sm:text-xs text-white outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Deliverable Tag / Badge (Optional)
            </label>
            <input
              type="text"
              value={deliverableTag}
              onChange={(e) => setDeliverableTag(e.target.value)}
              placeholder="e.g. Custom Architecture & Execution (leave empty to hide)"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-3 min-h-[44px] text-base sm:text-xs text-white outline-none"
            />
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              Note: If left empty, the bottom tag on this card will be hidden from public visitors.
            </p>
          </div>

          <label className="flex items-center gap-3 p-3.5 min-h-[44px] rounded-xl bg-white/5 border border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="accent-cyan-400 w-5 h-5 rounded cursor-pointer shrink-0"
            />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-white block">Visible on Website</span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Display this service in the public services section
              </span>
            </div>
          </label>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 min-h-[48px] rounded-xl text-xs sm:text-sm font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isPending ? "Saving..." : "Save Service"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isPending}
        title="Delete Service?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        confirmText="Confirm Delete"
      />
    </div>
  );
}
