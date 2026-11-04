"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Download,
  CheckCheck,
  Reply,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { markMessageRead, deleteMessage, markAllMessagesRead } from "@/lib/actions/message.actions";
import { formatDate } from "@/lib/utils";

function getEmailReplyData(msg: { name: string; email: string; subject: string | null; message: string; createdAt: Date | string }) {
  const subject = `Re: ${msg.subject?.trim() || "Your inquiry on Rohan.Dev"}`;
  const body = `\n\n--- Original Message ---\nFrom: ${msg.name} <${msg.email}>\nSent: ${formatDate(msg.createdAt)}\nSubject: ${msg.subject || "No subject"}\n\n${msg.message}`;

  const mailtoUrl = `mailto:${msg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(msg.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailtoUrl, gmailUrl };
}

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  userAgent: string | null;
  createdAt: Date | string;
}

export function MessagesManager({
  initialMessages,
}: {
  initialMessages: MessageItem[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MessageItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleCopyEmail = async (email: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = email;
        textarea.style.position = "fixed";
        textarea.style.left = "-999999px";
        textarea.style.top = "-999999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopiedEmail(email);
      setToast(`Email copied: ${email}`);
      setTimeout(() => {
        setCopiedEmail(null);
      }, 2000);
    } catch {
      setToast("Failed to copy email");
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.subject && m.subject.toLowerCase().includes(search.toLowerCase())) ||
      m.message.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "unread") return !m.isRead;
    if (filter === "read") return m.isRead;
    return true;
  });

  const handleToggleRead = (msg: MessageItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    startTransition(async () => {
      await markMessageRead(msg.id, !msg.isRead);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === msg.id ? { ...item, isRead: !item.isRead } : item
        )
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, isRead: !selectedMessage.isRead });
      }
      router.refresh();
    });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    startTransition(async () => {
      await markAllMessagesRead();
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      if (selectedMessage) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
      router.refresh();
    });
  };

  const handleExportCsv = () => {
    if (messages.length === 0) return;

    const headers = ["ID", "Name", "Email", "Subject", "Message", "Is Read", "Received Date"];
    const rows = messages.map((m) => [
      m.id,
      m.name,
      m.email,
      m.subject || "",
      m.message.replace(/\r?\n/g, " "),
      m.isRead ? "Yes" : "No",
      new Date(m.createdAt).toISOString(),
    ]);

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rohan_portfolio_messages_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      await deleteMessage(deleteTarget.id);
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null);
      }
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const handleOpenDetail = (msg: MessageItem) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      handleToggleRead(msg);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sender, email, message..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3498db] rounded-xl pl-10 pr-4 py-2.5 min-h-[44px] text-base sm:text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {/* Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto touch-scroll-x no-scrollbar w-full sm:w-auto">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 sm:flex-initial px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                filter === "all"
                  ? "bg-[#3498db] text-white font-semibold shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`flex-1 sm:flex-initial px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                filter === "unread"
                  ? "bg-[#3498db] text-white font-semibold shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`flex-1 sm:flex-initial px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                filter === "read"
                  ? "bg-[#3498db] text-white font-semibold shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Read
            </button>
          </div>

          {/* Actions Group */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Mark All as Read Action */}
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isPending}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="Mark all unread messages as read"
            >
              <CheckCheck className="w-4 h-4 text-[#3498db] shrink-0" />
              <span>Mark all read</span>
            </button>

            {/* Export to CSV Action */}
            <button
              onClick={handleExportCsv}
              disabled={messages.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold bg-[#3498db]/10 hover:bg-[#3498db]/20 text-[#3498db] border border-[#3498db]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="Export all messages to CSV"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleOpenDetail(msg)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden ${
                msg.isRead
                  ? "bg-white border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm"
                  : "bg-orange-50/20 border-orange-200/80 text-slate-800 hover:border-orange-300 shadow-sm"
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1 w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                  <span className="font-bold text-sm text-slate-800 break-words">
                    {msg.name}
                  </span>
                  <span className="text-xs font-mono text-slate-500 truncate max-w-full sm:max-w-xs md:max-w-sm lg:max-w-none">
                    {msg.email}
                  </span>
                  {!msg.isRead && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f97316] text-white shrink-0 shadow-sm">
                      Unread
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-700 truncate">
                  {msg.subject || "No subject specified"}
                </p>
                <p className="text-xs text-slate-500 line-clamp-1 break-words">
                  {msg.message}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {formatDate(msg.createdAt)}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={getEmailReplyData(msg).mailtoUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#3498db] hover:bg-[#3498db]/10 border border-[#3498db]/30 transition-colors"
                    title="Reply via Email"
                  >
                    <Reply className="w-4 h-4" />
                  </a>

                  <button
                    onClick={(e) => handleToggleRead(msg, e)}
                    disabled={isPending}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    title={msg.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {msg.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#3498db]" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(msg);
                    }}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400">
            <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs sm:text-sm font-medium text-slate-600">No messages found matching search criteria.</p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <Modal
        isOpen={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.subject || "Contact Submission"}
        maxWidth="lg"
      >
        {selectedMessage && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                <span className="text-slate-500 font-medium shrink-0">From:</span>
                <span className="text-slate-800 font-semibold break-words sm:text-right min-w-0">
                  {selectedMessage.name}{" "}
                  <span className="text-[#3498db] font-mono font-normal">
                    ({selectedMessage.email})
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium shrink-0">Sent:</span>
                <span className="text-slate-600 font-mono text-right shrink-0">
                  {formatDate(selectedMessage.createdAt)}
                </span>
              </div>
              {selectedMessage.userAgent && (
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                  <span className="text-slate-500 font-medium shrink-0">Device:</span>
                  <span
                    className="text-slate-400 font-mono truncate max-w-full sm:max-w-md sm:text-right"
                    title={selectedMessage.userAgent}
                  >
                    {selectedMessage.userAgent}
                  </span>
                </div>
              )}
            </div>

            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              {selectedMessage.message}
            </div>

            {(() => {
              const { mailtoUrl, gmailUrl } = getEmailReplyData(selectedMessage);

              return (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {/* Reply & Copy Actions */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5">
                    <a
                      href={mailtoUrl}
                      className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl font-semibold text-xs bg-[#3498db] text-white hover:bg-[#2980b9] transition-colors shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <Reply className="w-4 h-4 shrink-0" />
                      <span>Reply via Email</span>
                    </a>

                    <a
                      href={gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <ExternalLink className="w-4 h-4 text-[#3498db] shrink-0" />
                      <span>Reply in Gmail</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopyEmail(selectedMessage.email)}
                      className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl font-mono text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      title="Copy sender email to clipboard"
                    >
                      {copiedEmail === selectedMessage.email ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#3498db] shrink-0" />
                          <span>Copy email</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Status & Delete Controls */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(selectedMessage)}
                      className="flex-1 sm:flex-initial px-4 py-2 min-h-[44px] rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200 cursor-pointer flex items-center justify-center"
                    >
                      {selectedMessage.isRead ? "Mark as Unread" : "Mark as Read"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(selectedMessage)}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-rose-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-rose-200 cursor-pointer shrink-0"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isPending}
        title="Delete Contact Message?"
        message={`Are you sure you want to delete message from ${deleteTarget?.name}?`}
        confirmText="Confirm Delete"
      />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 left-5 sm:left-auto sm:right-6 sm:bottom-6 max-w-sm z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl text-xs font-mono animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <Check className="w-4 h-4 text-[#3498db] shrink-0" />
          <span className="truncate">{toast}</span>
        </div>
      )}
    </div>
  );
}
