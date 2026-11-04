"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Award, ExternalLink, Mail, ArrowRight } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { formatDate } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  description?: string | null;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate?: Date | string | null;
  credentialUrl?: string | null;
  certificateUrl?: string | null;
}

interface SocialLinkItem {
  id: string;
  platform: string;
  url: string;
}

interface TimelineSectionProps {
  education?: EducationItem[];
  certifications?: CertificationItem[];
  eyebrow?: string | null;
  title?: string | null;
  intro?: string | null;
  quickContactTitle?: string | null;
  quickContactText?: string | null;
  socialLinks?: SocialLinkItem[];
  contactEmail?: string | null;
}

function getYearRange(start: Date | string, end?: Date | string | null) {
  try {
    const sYear = new Date(start).getFullYear();
    if (!end) return `${sYear} - Present`;
    const eYear = new Date(end).getFullYear();
    return sYear === eYear ? `${sYear}` : `${sYear} - ${eYear}`;
  } catch {
    return "";
  }
}

export function TimelineSection({
  education = [],
  certifications = [],
  eyebrow,
  title,
  intro,
  quickContactTitle,
  quickContactText,
  socialLinks = [],
  contactEmail,
}: TimelineSectionProps) {
  const hasEducation = education && education.length > 0;
  const hasCertifications = certifications && certifications.length > 0;

  if (!hasEducation && !hasCertifications) return null;

  const defaultIntro =
    intro || "My academic journey and the skills I've built along the way.";

  return (
    <section
      id="education"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative scroll-mt-20 sm:scroll-mt-24 border-t border-white/[0.04]"
    >
      {/* Anchor support for existing #timeline links */}
      <span id="timeline" className="absolute -top-24" aria-hidden="true" />

      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Eyebrow, Heading, Short Intro Paragraph (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <SectionHeading
              eyebrow={eyebrow || "EDUCATION"}
              title={title || "My *Education*"}
              defaultTitle="My Education"
              defaultHighlight="Education"
              description={defaultIntro}
            />
          </div>

          {/* Right Column: Grid of clean education cards, certifications, and quick-contact card (col-span-8) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Education Cards */}
              {education.map((item) => {
                const yearRange = getYearRange(item.startDate, item.endDate);
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] hover:border-blue-500/30 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        {yearRange && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {yearRange}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white tracking-tight mb-1 group-hover:text-blue-300 transition-colors">
                        {item.degree}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-1">
                        {item.institution}
                      </p>
                      {item.fieldOfStudy && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {item.fieldOfStudy}
                        </p>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-white/[0.05] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Certifications Cards */}
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] hover:border-violet-500/30 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      {cert.issueDate && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatDate(cert.issueDate)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight mb-1 group-hover:text-violet-300 transition-colors">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-1">
                      {cert.issuer}
                    </p>
                  </div>

                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-violet-400 hover:text-violet-300 mt-3 pt-2.5 border-t border-white/[0.05]"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}

              {/* "Feel free to contact me" Quick-Contact Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c1222] to-[#0a0f1d] border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500/20 to-violet-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mb-3">
                    <Mail className="w-4 h-4" />
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight mb-1">
                    {quickContactTitle || "Feel free to contact me"}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {quickContactText ||
                      "I'm always open to discussing new projects, ideas or opportunities."}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  {/* Social links row */}
                  <div className="flex items-center gap-2">
                    {socialLinks.slice(0, 3).map((link) => {
                      const platform = link.platform.toLowerCase();
                      const Icon = platform.includes("github")
                        ? FaGithub
                        : platform.includes("linkedin")
                        ? FaLinkedin
                        : platform.includes("instagram")
                        ? FaInstagram
                        : platform.includes("twitter") || platform.includes("x")
                        ? FaXTwitter
                        : Mail;
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={link.platform}
                          className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 hover:border-blue-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-xs"
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </a>
                      );
                    })}
                  </div>

                  {/* Scroll to Contact link */}
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1 text-xs font-mono text-blue-400 hover:text-blue-300 font-medium ml-auto"
                  >
                    <span>Contact</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
