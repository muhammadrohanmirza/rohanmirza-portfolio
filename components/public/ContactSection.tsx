"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, User } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

interface ContactSectionProps {
  siteSettings?: {
    contactEmail: string;
  } | null;
  eyebrow?: string | null;
  title?: string | null;
  pitchHeadline?: string | null;
  pitchText?: string | null;
}

export function ContactSection({
  siteSettings,
  eyebrow,
  title,
  pitchHeadline,
  pitchText,
}: ContactSectionProps) {
  const contactEmail = siteSettings?.contactEmail || "contact@rohan.dev";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // Honeypot
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Client-side instant validation
    if (formData.name.trim().length < 2) {
      setErrorMessage("Please enter your name (minimum 2 characters).");
      setIsLoading(false);
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    if (formData.message.trim().length < 5) {
      setErrorMessage("Message must be at least 5 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg =
          data.error ||
          (data.errors ? Object.values(data.errors).flat()[0] : null) ||
          "Failed to deliver message. Please check the form and try again.";
        setErrorMessage(errorMsg as string);
      } else {
        setSuccessMessage(data.message || "Thank you! Your message has been received.");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          website: "",
        });
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative scroll-mt-20 sm:scroll-mt-24 border-t border-white/[0.04]"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <SectionHeading
            eyebrow={eyebrow || "CONTACT"}
            title={title || "Get in *Touch*"}
            defaultTitle="Get in Touch"
            defaultHighlight="Touch"
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Info Side (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
              {pitchHeadline || "Let's build intelligent web applications together."}
            </h3>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base font-normal">
              {pitchText ||
                "Whether you are looking to architect a Next.js platform, integrate LLM/agent pipelines, or build robust backend systems, feel free to reach out."}
            </p>

            <div className="p-5 sm:p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Direct Email
                  </span>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm font-semibold text-white hover:text-blue-400 transition-colors break-all"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side (col-span-7) */}
          <div className="lg:col-span-7">
            <div className="p-5 sm:p-8 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] shadow-xl relative">
              {successMessage ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Message Delivered</h4>
                  <p className="text-sm text-slate-400 max-w-sm">
                    {successMessage}
                  </p>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="mt-4 px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 cursor-pointer transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Honeypot field (hidden from legitimate users) */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2"
                      >
                        Your Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                          id="name"
                          type="text"
                          required
                          minLength={2}
                          maxLength={100}
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="John Doe"
                          className="w-full bg-[#0c1222] border border-white/10 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 min-h-[44px] text-base sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2"
                      >
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                          id="email"
                          type="email"
                          required
                          maxLength={255}
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="john@example.com"
                          className="w-full bg-[#0c1222] border border-white/10 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 min-h-[44px] text-base sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2"
                    >
                      Subject (Optional)
                    </label>
                    <input
                      id="subject"
                      type="text"
                      maxLength={150}
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Project Collaboration / Consultation"
                      className="w-full bg-[#0c1222] border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 min-h-[44px] text-base sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      required
                      minLength={5}
                      maxLength={3000}
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell me about your project, timeline, or requirements..."
                      className="w-full bg-[#0c1222] border border-white/10 focus:border-blue-500 rounded-xl p-4 text-base sm:text-sm text-white placeholder-slate-500 outline-none transition-all resize-y"
                    />
                    <div className="flex justify-between items-center mt-1.5 px-1 text-[11px] font-mono text-slate-400">
                      <span>Minimum 5 characters</span>
                      <span>{formData.message.length}/3000</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold py-3.5 px-6 min-h-[48px] rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Transmission...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
