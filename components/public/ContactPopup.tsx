"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useContactModal } from "./ContactModalContext";

interface ContactPopupProps {
  title?: string | null;
  subtitle?: string | null;
  successMessage?: string | null;
}

export function ContactPopup({
  title = "Get In Touch",
  subtitle = "Feel free to reach out anytime. I'm always open to interesting projects and collaborations.",
  successMessage = "Thanks! Your message was sent successfully.",
}: ContactPopupProps) {
  const { isOpen, closeContactModal, triggerElement } = useContactModal();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setMessage("");
      setWebsite("");
      setSuccess(false);
      setErrorMsg(null);
      setFieldErrors({});

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Focus first input after animation
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
      };
    } else {
      // Return focus to trigger element
      if (triggerElement && typeof triggerElement.focus === "function") {
        triggerElement.focus();
      }
    }
  }, [isOpen, triggerElement]);

  // Trap focus and handle Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeContactModal();
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeContactModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    // Client-side quick checks
    if (!name.trim()) {
      setFieldErrors((prev) => ({ ...prev, name: ["Name is required"] }));
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFieldErrors((prev) => ({ ...prev, email: ["A valid email address is required"] }));
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setFieldErrors((prev) => ({ ...prev, message: ["Message must be at least 5 characters"] }));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          website: website.trim(), // Honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setErrorMsg(data.error || "Failed to send message. Please try again.");
      } else {
        setSuccess(true);
        // Auto-close after 3.5 seconds
        setTimeout(() => {
          closeContactModal();
        }, 3500);
      }
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-popup-title"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeContactModal}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Dialog Container: Bottom Sheet on Mobile, Centered Modal on Tablet/Desktop */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full sm:max-w-lg bg-[var(--surface-card)] text-[var(--foreground)] border border-[var(--border)] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                  <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
                </div>
                <div>
                  <h3
                    id="contact-popup-title"
                    className="text-lg font-bold font-heading text-[var(--foreground)]"
                  >
                    {title || "Get In Touch"}
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">
                    {subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeContactModal}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto">
              {success ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold font-heading text-[var(--foreground)] mb-2">
                    Message Sent!
                  </h4>
                  <p className="text-sm text-[var(--foreground-muted)] max-w-xs mb-6">
                    {successMessage}
                  </p>
                  <button
                    type="button"
                    onClick={closeContactModal}
                    className="px-6 py-2.5 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer shadow-md"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Honeypot field (hidden from screen, fills will trigger bot trap) */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Name field */}
                  <div>
                    <label
                      htmlFor="popup-name"
                      className="block text-xs font-medium text-[var(--foreground)] mb-1.5"
                    >
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={firstInputRef}
                      id="popup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Smith"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-sm transition-all"
                    />
                    {fieldErrors.name && (
                      <p className="text-red-500 text-[11px] mt-1">{fieldErrors.name[0]}</p>
                    )}
                  </div>

                  {/* Email field */}
                  <div>
                    <label
                      htmlFor="popup-email"
                      className="block text-xs font-medium text-[var(--foreground)] mb-1.5"
                    >
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="popup-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-sm transition-all"
                    />
                    {fieldErrors.email && (
                      <p className="text-red-500 text-[11px] mt-1">{fieldErrors.email[0]}</p>
                    )}
                  </div>

                  {/* Message field */}
                  <div>
                    <label
                      htmlFor="popup-message"
                      className="block text-xs font-medium text-[var(--foreground)] mb-1.5"
                    >
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="popup-message"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell me about your project or inquiry..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-sm transition-all resize-none"
                    />
                    {fieldErrors.message && (
                      <p className="text-red-500 text-[11px] mt-1">{fieldErrors.message[0]}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-5 rounded-xl bg-[var(--accent)] text-white font-medium text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="w-4 h-4 -rotate-12 translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
