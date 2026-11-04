"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Award,
  ExternalLink,
  Calendar,
  ChevronUp,
  ChevronDown,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  createEducation,
  updateEducation,
  deleteEducation,
  toggleEducationVisibility,
  reorderEducation,
  createCertification,
  updateCertification,
  deleteCertification,
  toggleCertificationVisibility,
  reorderCertifications,
} from "@/lib/actions/timeline.actions";

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: Date | string;
  endDate: Date | string | null;
  description: string | null;
  visible: boolean;
  order: number;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: Date | string | null;
  expiryDate?: Date | string | null;
  credentialId?: string | null;
  credentialUrl: string | null;
  certificateUrl?: string | null;
  visible: boolean;
  order: number;
}

export function TimelineManager({
  initialEducation,
  initialCertifications,
}: {
  initialEducation: EducationItem[];
  initialCertifications: CertificationItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"education" | "certifications">("education");
  const [eduList, setEduList] = useState<EducationItem[]>(initialEducation);
  const [certList, setCertList] = useState<CertificationItem[]>(initialCertifications);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setEduList(initialEducation);
  }, [initialEducation]);

  useEffect(() => {
    setCertList(initialCertifications);
  }, [initialCertifications]);

  // Toast feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Education Modal State
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<EducationItem | null>(null);
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startDate, setStartDate] = useState("2021-09-01");
  const [endDate, setEndDate] = useState("");
  const [eduDescription, setEduDescription] = useState("");
  const [eduVisible, setEduVisible] = useState(true);
  const [eduOrder, setEduOrder] = useState(0);

  // Certification Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("");
  const [certExpiryDate, setCertExpiryDate] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [certVisible, setCertVisible] = useState(true);
  const [certOrder, setCertOrder] = useState(0);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "education" | "certification";
    id: string;
    name: string;
  } | null>(null);

  // Filtered Education
  const filteredEdu = eduList.filter((item) => {
    const matchesSearch =
      item.institution.toLowerCase().includes(search.toLowerCase()) ||
      item.degree.toLowerCase().includes(search.toLowerCase()) ||
      (item.fieldOfStudy && item.fieldOfStudy.toLowerCase().includes(search.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === "visible") return item.visible;
    if (filter === "hidden") return !item.visible;
    return true;
  });

  // Filtered Certifications
  const filteredCerts = certList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.issuer.toLowerCase().includes(search.toLowerCase()) ||
      (item.credentialId && item.credentialId.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === "visible") return item.visible;
    if (filter === "hidden") return !item.visible;
    return true;
  });

  // --- Education Handlers ---
  const handleOpenEduModal = (edu?: EducationItem) => {
    if (edu) {
      setEditingEdu(edu);
      setInstitution(edu.institution);
      setDegree(edu.degree);
      setFieldOfStudy(edu.fieldOfStudy || "");
      setStartDate(new Date(edu.startDate).toISOString().slice(0, 10));
      setEndDate(edu.endDate ? new Date(edu.endDate).toISOString().slice(0, 10) : "");
      setEduDescription(edu.description || "");
      setEduVisible(edu.visible);
      setEduOrder(edu.order);
    } else {
      setEditingEdu(null);
      setInstitution("");
      setDegree("");
      setFieldOfStudy("");
      setStartDate("2021-09-01");
      setEndDate("");
      setEduDescription("");
      setEduVisible(true);
      setEduOrder(eduList.length + 1);
    }
    setEduModalOpen(true);
  };

  const handleSaveEdu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution.trim() || !degree.trim()) return;

    startTransition(async () => {
      try {
        const payload = {
          institution: institution.trim(),
          degree: degree.trim(),
          fieldOfStudy: fieldOfStudy.trim() || null,
          startDate,
          endDate: endDate || null,
          description: eduDescription.trim() || null,
          order: eduOrder,
          visible: eduVisible,
        };

        if (editingEdu) {
          await updateEducation(editingEdu.id, payload);
          setEduList((prev) =>
            prev.map((item) =>
              item.id === editingEdu.id ? ({ ...item, ...payload } as EducationItem) : item
            )
          );
          showToast("success", `Education record "${institution}" updated.`);
        } else {
          const res = await createEducation(payload);
          if (res.education) {
            setEduList((prev) => [...prev, res.education as unknown as EducationItem]);
          }
          showToast("success", `Education record "${institution}" added.`);
        }
        setEduModalOpen(false);
        router.refresh();
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : "Failed to save education record.");
      }
    });
  };

  const handleToggleEduVisibility = (edu: EducationItem) => {
    const nextVal = !edu.visible;
    setEduList((prev) =>
      prev.map((e) => (e.id === edu.id ? { ...e, visible: nextVal } : e))
    );

    startTransition(async () => {
      try {
        await toggleEducationVisibility(edu.id, nextVal);
        showToast("success", `Record is now ${nextVal ? "visible" : "hidden"}.`);
        router.refresh();
      } catch {
        setEduList((prev) =>
          prev.map((e) => (e.id === edu.id ? { ...e, visible: !nextVal } : e))
        );
        showToast("error", "Failed to update visibility.");
      }
    });
  };

  const handleMoveEdu = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= eduList.length) return;

    const newEdu = [...eduList];
    const [moved] = newEdu.splice(index, 1);
    newEdu.splice(newIndex, 0, moved);

    setEduList(newEdu);

    startTransition(async () => {
      try {
        await reorderEducation(newEdu.map((e) => e.id));
        showToast("success", "Education order updated.");
        router.refresh();
      } catch {
        showToast("error", "Failed to update order.");
      }
    });
  };

  // --- Certification Handlers ---
  const handleOpenCertModal = (cert?: CertificationItem) => {
    if (cert) {
      setEditingCert(cert);
      setCertTitle(cert.title);
      setCertIssuer(cert.issuer);
      setCertIssueDate(cert.issueDate ? new Date(cert.issueDate).toISOString().slice(0, 10) : "");
      setCertExpiryDate(cert.expiryDate ? new Date(cert.expiryDate).toISOString().slice(0, 10) : "");
      setCredentialId(cert.credentialId || "");
      setCredentialUrl(cert.credentialUrl || "");
      setCertificateUrl(cert.certificateUrl || "");
      setCertVisible(cert.visible);
      setCertOrder(cert.order);
    } else {
      setEditingCert(null);
      setCertTitle("");
      setCertIssuer("");
      setCertIssueDate("");
      setCertExpiryDate("");
      setCredentialId("");
      setCredentialUrl("");
      setCertificateUrl("");
      setCertVisible(true);
      setCertOrder(certList.length + 1);
    }
    setCertModalOpen(true);
  };

  const handleSaveCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim() || !certIssuer.trim()) return;

    startTransition(async () => {
      try {
        const payload = {
          title: certTitle.trim(),
          issuer: certIssuer.trim(),
          issueDate: certIssueDate || null,
          expiryDate: certExpiryDate || null,
          credentialId: credentialId.trim() || null,
          credentialUrl: credentialUrl.trim() || null,
          certificateUrl: certificateUrl.trim() || null,
          order: certOrder,
          visible: certVisible,
        };

        if (editingCert) {
          await updateCertification(editingCert.id, payload);
          setCertList((prev) =>
            prev.map((item) =>
              item.id === editingCert.id ? ({ ...item, ...payload } as CertificationItem) : item
            )
          );
          showToast("success", `Certification "${certTitle}" updated.`);
        } else {
          const res = await createCertification(payload);
          if (res.certification) {
            setCertList((prev) => [...prev, res.certification as unknown as CertificationItem]);
          }
          showToast("success", `Certification "${certTitle}" added.`);
        }
        setCertModalOpen(false);
        router.refresh();
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : "Failed to save certification.");
      }
    });
  };

  const handleToggleCertVisibility = (cert: CertificationItem) => {
    const nextVal = !cert.visible;
    setCertList((prev) =>
      prev.map((c) => (c.id === cert.id ? { ...c, visible: nextVal } : c))
    );

    startTransition(async () => {
      try {
        await toggleCertificationVisibility(cert.id, nextVal);
        showToast("success", `Certification is now ${nextVal ? "visible" : "hidden"}.`);
        router.refresh();
      } catch {
        setCertList((prev) =>
          prev.map((c) => (c.id === cert.id ? { ...c, visible: !nextVal } : c))
        );
        showToast("error", "Failed to update visibility.");
      }
    });
  };

  const handleMoveCert = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= certList.length) return;

    const newCerts = [...certList];
    const [moved] = newCerts.splice(index, 1);
    newCerts.splice(newIndex, 0, moved);

    setCertList(newCerts);

    startTransition(async () => {
      try {
        await reorderCertifications(newCerts.map((c) => c.id));
        showToast("success", "Certification order updated.");
        router.refresh();
      } catch {
        showToast("error", "Failed to update order.");
      }
    });
  };

  // --- Delete Confirmation ---
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    if (target.type === "education") {
      setEduList((prev) => prev.filter((e) => e.id !== target.id));
    } else {
      setCertList((prev) => prev.filter((c) => c.id !== target.id));
    }

    startTransition(async () => {
      try {
        if (target.type === "education") {
          await deleteEducation(target.id);
          showToast("success", `Education record "${target.name}" deleted.`);
        } else {
          await deleteCertification(target.id);
          showToast("success", `Certification "${target.name}" deleted.`);
        }
        setDeleteTarget(null);
        router.refresh();
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : "Failed to delete item.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
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
          <span className="break-words min-w-0 flex-1">{toast.message}</span>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#12131a] border border-white/10 shadow-lg min-w-0">
        <div className="flex items-center gap-2 touch-scroll-x overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto min-w-0 max-w-full no-scrollbar">
          <button
            onClick={() => setActiveTab("education")}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-mono transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "education"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Education Records ({eduList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("certifications")}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-mono transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "certifications"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Certifications ({certList.length})</span>
          </button>
        </div>

        <button
          onClick={() =>
            activeTab === "education" ? handleOpenEduModal() : handleOpenCertModal()
          }
          className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer w-full sm:w-auto justify-center shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">{activeTab === "education" ? "Add Education" : "Add Certification"}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#12131a] border border-white/10 min-w-0">
        <div className="relative w-full sm:w-80 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === "education" ? "education" : "certifications"}...`}
            className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs min-h-[42px] text-white placeholder-slate-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
          <button
            onClick={() => setFilter("all")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors flex-1 sm:flex-initial whitespace-nowrap shrink-0 text-center ${
              filter === "all"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("visible")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors flex-1 sm:flex-initial whitespace-nowrap shrink-0 text-center ${
              filter === "visible"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Visible
          </button>
          <button
            onClick={() => setFilter("hidden")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors flex-1 sm:flex-initial whitespace-nowrap shrink-0 text-center ${
              filter === "hidden"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Hidden
          </button>
        </div>
      </div>

      {/* Tab 1: Education Content */}
      {activeTab === "education" && (
        <div className="space-y-4">
          {filteredEdu.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEdu.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="p-5 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl flex flex-col justify-between min-w-0 overflow-hidden"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 gap-2">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        <button
                          onClick={() => handleMoveEdu(idx, "up")}
                          disabled={idx === 0 || isPending}
                          className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-500 hover:text-cyan-400 disabled:opacity-20 hover:bg-white/5 shrink-0"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveEdu(idx, "down")}
                          disabled={idx === eduList.length - 1 || isPending}
                          className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-500 hover:text-cyan-400 disabled:opacity-20 hover:bg-white/5 shrink-0"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono text-cyan-400 ml-1 truncate">
                          {edu.degree}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleEduVisibility(edu)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 min-h-[32px] px-2.5 py-1 rounded-full text-[10px] font-mono cursor-pointer shrink-0 whitespace-nowrap ${
                          edu.visible
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {edu.visible ? <Eye className="w-3 h-3 shrink-0" /> : <EyeOff className="w-3 h-3 shrink-0" />}
                        <span>{edu.visible ? "Visible" : "Hidden"}</span>
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-white tracking-tight break-words">
                      {edu.institution}
                    </h4>

                    {edu.fieldOfStudy && (
                      <p className="text-xs font-mono text-slate-400 mt-1 break-words">
                        Field: {edu.fieldOfStudy}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 mt-2">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">
                        {formatDate(edu.startDate)} –{" "}
                        {edu.endDate ? formatDate(edu.endDate) : "Present"}
                      </span>
                    </div>

                    {edu.description && (
                      <p className="text-xs text-slate-400 mt-3 leading-relaxed border-t border-white/5 pt-2 whitespace-pre-line break-words">
                        {edu.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEduModal(edu)}
                      className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors shrink-0"
                      title="Edit Record"
                      aria-label="Edit education record"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: "education",
                          id: edu.id,
                          name: `${edu.degree} (${edu.institution})`,
                        })
                      }
                      className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                      title="Delete Record"
                      aria-label="Delete education record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#12131a] border border-white/10 text-center space-y-3">
              <GraduationCap className="w-8 h-8 mx-auto text-slate-500 opacity-40 shrink-0" />
              <h4 className="text-base font-bold text-white">No Education Records Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {search
                  ? `No education records matched "${search}".`
                  : "No education records added yet. Click 'Add Education' to add a degree or university."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Certifications Content */}
      {activeTab === "certifications" && (
        <div className="space-y-4">
          {filteredCerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCerts.map((cert, idx) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl flex flex-col justify-between min-w-0 overflow-hidden"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 gap-2">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        <button
                          onClick={() => handleMoveCert(idx, "up")}
                          disabled={idx === 0 || isPending}
                          className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-500 hover:text-cyan-400 disabled:opacity-20 hover:bg-white/5 shrink-0"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveCert(idx, "down")}
                          disabled={idx === certList.length - 1 || isPending}
                          className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-500 hover:text-cyan-400 disabled:opacity-20 hover:bg-white/5 shrink-0"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono text-cyan-400 ml-1 truncate">
                          {cert.issuer}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleCertVisibility(cert)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 min-h-[32px] px-2.5 py-1 rounded-full text-[10px] font-mono cursor-pointer shrink-0 whitespace-nowrap ${
                          cert.visible
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {cert.visible ? <Eye className="w-3 h-3 shrink-0" /> : <EyeOff className="w-3 h-3 shrink-0" />}
                        <span>{cert.visible ? "Visible" : "Hidden"}</span>
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-white tracking-tight break-words">
                      {cert.title}
                    </h4>

                    {cert.issueDate && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 mt-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">Issued: {formatDate(cert.issueDate)}</span>
                      </div>
                    )}

                    {cert.credentialId && (
                      <span className="text-[11px] font-mono text-slate-400 block mt-1 break-all">
                        ID: {cert.credentialId}
                      </span>
                    )}

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-mono mt-3 max-w-full"
                      >
                        <span className="truncate">Verify Credential</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenCertModal(cert)}
                      className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors shrink-0"
                      title="Edit Certification"
                      aria-label="Edit certification"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: "certification",
                          id: cert.id,
                          name: cert.title,
                        })
                      }
                      className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                      title="Delete Certification"
                      aria-label="Delete certification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#12131a] border border-white/10 text-center space-y-3">
              <Award className="w-8 h-8 mx-auto text-slate-500 opacity-40 shrink-0" />
              <h4 className="text-base font-bold text-white">No Certifications Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {search
                  ? `No certifications matched "${search}".`
                  : "No certifications added yet. Click 'Add Certification' to showcase your badges."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- EDUCATION MODAL --- */}
      <Modal
        isOpen={eduModalOpen}
        onClose={() => setEduModalOpen(false)}
        title={editingEdu ? "Edit Education Record" : "Add Education Record"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdu} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Institution / University *
              </label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-base sm:text-xs min-h-[42px] text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Degree *
              </label>
              <input
                type="text"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. Bachelor of Science"
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-base sm:text-xs min-h-[42px] text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Field of Study (Optional)
            </label>
            <input
              type="text"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              placeholder="e.g. Computer Science & Engineering"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-base sm:text-xs min-h-[42px] text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2 text-base sm:text-xs min-h-[42px] text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                End Date (Leave blank if Present)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2 text-base sm:text-xs min-h-[42px] text-white outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Description / Achievements (Optional)
            </label>
            <textarea
              rows={3}
              value={eduDescription}
              onChange={(e) => setEduDescription(e.target.value)}
              placeholder="Key coursework, honors, GPA, thesis topic..."
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl p-3 text-base sm:text-xs min-h-[96px] text-white outline-none resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={eduVisible}
                onChange={(e) => setEduVisible(e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white block">Visible on Website</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Display in public timeline
                </span>
              </div>
            </label>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={eduOrder}
                onChange={(e) => setEduOrder(Number(e.target.value))}
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2 text-base sm:text-xs min-h-[42px] text-white outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setEduModalOpen(false)}
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
              <span>{isPending ? "Saving..." : "Save Record"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* --- CERTIFICATION MODAL --- */}
      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title={editingCert ? "Edit Certification" : "Add Certification"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCert} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Certification Title *
              </label>
              <input
                type="text"
                required
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                placeholder="e.g. AWS Certified Solutions Architect"
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-base sm:text-xs min-h-[42px] text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Issuing Organization *
              </label>
              <input
                type="text"
                required
                value={certIssuer}
                onChange={(e) => setCertIssuer(e.target.value)}
                placeholder="e.g. Amazon Web Services, DeepLearning.AI"
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-base sm:text-xs min-h-[42px] text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Issue Date (Optional)
              </label>
              <input
                type="date"
                value={certIssueDate}
                onChange={(e) => setCertIssueDate(e.target.value)}
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2 text-base sm:text-xs min-h-[42px] text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={certExpiryDate}
                onChange={(e) => setCertExpiryDate(e.target.value)}
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2 text-base sm:text-xs min-h-[42px] text-white outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Credential ID (Optional)
              </label>
              <input
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="e.g. AWS-1039824"
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-base sm:text-xs min-h-[42px] text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Credential URL (Optional)
              </label>
              <input
                type="url"
                value={credentialUrl}
                onChange={(e) => setCredentialUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-base sm:text-xs min-h-[42px] text-white outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <ImageUploader
              value={certificateUrl}
              onImageChange={(url) => setCertificateUrl(url)}
              folder="portfolio/certificates"
              label="Certificate Image or PDF (Optional)"
              acceptPdf={true}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={certVisible}
                onChange={(e) => setCertVisible(e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white block">Visible on Website</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Display in public certifications
                </span>
              </div>
            </label>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={certOrder}
                onChange={(e) => setCertOrder(Number(e.target.value))}
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2 text-base sm:text-xs min-h-[42px] text-white outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCertModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl  text-xs text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isPending ? "Saving..." : "Save Certification"}</span>
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
        title={`Delete ${deleteTarget?.type === "education" ? "Education Record" : "Certification"}?`}
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`}
        confirmText="Confirm Delete"
      />
    </div>
  );
}
