"use client";

import React from "react";
import {
  Code,
  Layout,
  Bot,
  Palette,
  Users,
  GraduationCap,
  Award,
  ExternalLink,
  Send,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { useContactModal } from "./ContactModalContext";

const serviceIconMap: Record<string, LucideIcon> = {
  Layout,
  Bot,
  Palette,
  Users,
  Code,
  Briefcase,
  Sparkles,
};

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  order?: number;
}

interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate?: Date | string | null;
  credentialUrl?: string | null;
  order?: number;
}

interface ServicesEducationSectionProps {
  services?: ServiceItem[];
  education?: EducationItem[];
  certifications?: CertificationItem[];
  homepageContent?: {
    servicesEyebrow?: string | null;
    servicesTitle?: string | null;
    servicesIntro?: string | null;
    educationEyebrow?: string | null;
    educationTitle?: string | null;
    educationIntro?: string | null;
    letWorkTogetherTitle?: string | null;
    letWorkTogetherText?: string | null;
    letWorkTogetherCtaText?: string | null;
  } | null;
  siteSettings?: {
    contactEmail?: string | null;
    contactPhone?: string | null;
  } | null;
  profile?: {
    location?: string | null;
  } | null;
}

interface MergedTimelineEntry {
  id: string;
  year: string;
  sortTimestamp: number;
  order: number;
  title: string;
  statusLabel: string;
  institutionOrIssuer: string;
  credentialUrl?: string | null;
  isCert: boolean;
}

export function ServicesEducationSection({
  services = [],
  education = [],
  certifications = [],
  homepageContent,
  siteSettings,
  profile,
}: ServicesEducationSectionProps) {
  const { openContactModal } = useContactModal();
  const servicesListRef = React.useRef<HTMLDivElement | null>(null);
  const serviceRowRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const educationListRef = React.useRef<HTMLDivElement | null>(null);
  const educationEntryRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [serviceListHeight, setServiceListHeight] = React.useState<number | null>(null);
  const [educationListHeight, setEducationListHeight] = React.useState<number | null>(null);
  const [servicesAtEnd, setServicesAtEnd] = React.useState(true);
  const [educationAtEnd, setEducationAtEnd] = React.useState(true);

  const getReducedMotionPreference = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const handleScrollableListKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const container = event.currentTarget;
      const step = 72;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        container.scrollBy({
          top: step,
          behavior: getReducedMotionPreference() ? "auto" : "smooth",
        });
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        container.scrollBy({
          top: -step,
          behavior: getReducedMotionPreference() ? "auto" : "smooth",
        });
      }
    },
    [getReducedMotionPreference],
  );

  // 1. SERVICES DATA
  const displayedServices =
    services && services.length > 0
      ? services
      : [
          {
            id: "s1",
            title: "Web Development",
            description: "Modern & Scalable Web Apps",
            iconName: "Layout",
          },
          {
            id: "s2",
            title: "AI Integration",
            description: "Smart & Intelligent Solutions",
            iconName: "Bot",
          },
          {
            id: "s3",
            title: "UI/UX Design",
            description: "Clean & User Friendly Design",
            iconName: "Palette",
          },
          {
            id: "s4",
            title: "Consultation",
            description: "Guidance & Support",
            iconName: "Users",
          },
        ];

  React.useEffect(() => {
    const rows = serviceRowRefs.current.filter(Boolean) as HTMLDivElement[];

    if (!rows.length) {
      setServiceListHeight(null);
      return;
    }

    const measureServiceListHeight = () => {
      const visibleRows = rows.slice(0, 3);
      if (!visibleRows.length) {
        setServiceListHeight(null);
        return;
      }

      const gapSize = 10;
      const nextHeight =
        visibleRows.reduce((total, row) => total + row.offsetHeight, 0) +
        Math.max(0, visibleRows.length - 1) * gapSize;

      setServiceListHeight(displayedServices.length > 3 ? nextHeight : null);
    };

    measureServiceListHeight();

    const observer = new ResizeObserver(measureServiceListHeight);
    rows.forEach((row) => observer.observe(row));

    const handleFontChange = () => measureServiceListHeight();
    document.fonts?.ready?.then(handleFontChange);
    window.addEventListener("resize", handleFontChange);
    window.addEventListener("load", handleFontChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleFontChange);
      window.removeEventListener("load", handleFontChange);
    };
  }, [displayedServices.length]);

  // 2. MERGED EDUCATION & CERTIFICATIONS TIMELINE
  const mergedTimeline: MergedTimelineEntry[] = [];

  // Add Education entries
  education.forEach((edu) => {
    const sDate = new Date(edu.startDate);
    const eDate = edu.endDate ? new Date(edu.endDate) : null;
    const now = new Date();

    const isCompleted = eDate ? eDate <= now : false;
    const statusLabel = isCompleted ? "Completed" : "In Progress";
    const year = eDate
      ? eDate.getFullYear().toString()
      : sDate.getFullYear().toString();

    mergedTimeline.push({
      id: `edu-${edu.id}`,
      year,
      sortTimestamp: eDate ? eDate.getTime() : sDate.getTime(),
      order: edu.order ?? 0,
      title: edu.degree,
      statusLabel,
      institutionOrIssuer: edu.fieldOfStudy
        ? `${edu.institution} (${edu.fieldOfStudy})`
        : edu.institution,
      isCert: false,
    });
  });

  // Add Certification entries
  certifications.forEach((cert) => {
    const iDate = cert.issueDate ? new Date(cert.issueDate) : null;
    const year = iDate ? iDate.getFullYear().toString() : "Cert";

    mergedTimeline.push({
      id: `cert-${cert.id}`,
      year,
      sortTimestamp: iDate ? iDate.getTime() : 0,
      order: cert.order ?? 0,
      title: cert.title,
      statusLabel: "Certificate",
      institutionOrIssuer: cert.issuer,
      credentialUrl: cert.credentialUrl,
      isCert: true,
    });
  });

  // Sort: newest timestamp first, then by order
  mergedTimeline.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return b.sortTimestamp - a.sortTimestamp;
  });

  // Fallback timeline items if database has none
  const finalTimeline: MergedTimelineEntry[] =
    mergedTimeline.length > 0
      ? mergedTimeline
      : [
          {
            id: "fb-1",
            year: "2025",
            sortTimestamp: 2025,
            order: 0,
            title: "Intermediate",
            statusLabel: "Completed",
            institutionOrIssuer: "Jinnah College, Karachi",
            isCert: false,
          },
          {
            id: "fb-2",
            year: "2025",
            sortTimestamp: 2025,
            order: 1,
            title: "Matric",
            statusLabel: "Completed",
            institutionOrIssuer: "Karachi Board",
            isCert: false,
          },
          {
            id: "fb-3",
            year: "2026",
            sortTimestamp: 2026,
            order: 2,
            title: "Aptech",
            statusLabel: "In Progress",
            institutionOrIssuer: "Software Engineering",
            isCert: false,
          },
          {
            id: "fb-4",
            year: "2026",
            sortTimestamp: 2026,
            order: 3,
            title: "Bano Qabil",
            statusLabel: "In Progress",
            institutionOrIssuer: "Mobile App Development (Flutter)",
            isCert: false,
          },
        ];

  React.useEffect(() => {
    const rows = educationEntryRefs.current.filter(Boolean) as HTMLDivElement[];

    if (!rows.length) {
      setEducationListHeight(null);
      return;
    }

    const measureEducationListHeight = () => {
      const visibleRows = rows.slice(0, 3);
      if (!visibleRows.length) {
        setEducationListHeight(null);
        return;
      }

      const gapSize = 16;
      const nextHeight =
        visibleRows.reduce((total, row) => total + row.offsetHeight, 0) +
        Math.max(0, visibleRows.length - 1) * gapSize;

      setEducationListHeight(finalTimeline.length > 3 ? nextHeight : null);
    };

    measureEducationListHeight();

    const observer = new ResizeObserver(measureEducationListHeight);
    rows.forEach((row) => observer.observe(row));

    const handleFontChange = () => measureEducationListHeight();
    document.fonts?.ready?.then(handleFontChange);
    window.addEventListener("resize", handleFontChange);
    window.addEventListener("load", handleFontChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleFontChange);
      window.removeEventListener("load", handleFontChange);
    };
  }, [finalTimeline.length]);

  // 3. LET'S WORK TOGETHER CARD
  const cardTitle =
    homepageContent?.letWorkTogetherTitle || "Let's Work Together";
  const cardText =
    homepageContent?.letWorkTogetherText ||
    "Have a project in mind or just want to say hello? I'd love to hear from you.";
  const cardCta = homepageContent?.letWorkTogetherCtaText || "Get In Touch";
  const email = siteSettings?.contactEmail;
  const location = profile?.location;
  const phone = siteSettings?.contactPhone;
  const servicesOverflow = displayedServices.length > 3;
  const educationOverflow = finalTimeline.length > 3;
  const sharedVisibleHeight = Math.max(serviceListHeight ?? 0, educationListHeight ?? 0);
  const servicesListHeightValue = servicesOverflow ? sharedVisibleHeight || serviceListHeight || undefined : undefined;
  const educationListHeightValue = educationOverflow ? sharedVisibleHeight || educationListHeight || undefined : undefined;

  return (
    <>
      <style jsx>{`
        .services-scroll-list::-webkit-scrollbar,
        .timeline-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .services-scroll-list::-webkit-scrollbar-track,
        .timeline-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .services-scroll-list::-webkit-scrollbar-thumb,
        .timeline-scroll::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 9999px;
        }
      `}</style>

      <section
        id="services-and-contact"
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative scroll-mt-20 sm:scroll-mt-24"
      >
      <div className="max-w-[1200px] mx-auto">
        {/* Single Row with Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
          {/* Column 1: My Services (col-span-4) */}
          <div
            id="services"
            className="lg:col-span-4 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-2xs scroll-mt-24 min-h-0"
          >
            <div>
              {/* Header: Icon badge + Title & Subtitle */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-base font-bold font-heading text-[var(--foreground)]">
                  {homepageContent?.servicesTitle || "My Services"}
                </h3>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mb-6">
                {homepageContent?.servicesEyebrow || "What I can do for you"}
              </p>

              {/* Vertical service list */}
              <div className="relative min-h-0">
                <div
                  ref={servicesListRef}
                  tabIndex={0}
                  onKeyDown={handleScrollableListKeyDown}
                  onScroll={(event) => {
                    const element = event.currentTarget;
                    const atEnd = element.scrollTop + element.clientHeight >= element.scrollHeight - 2;
                    setServicesAtEnd(atEnd);
                  }}
                  aria-label="Services list"
                  className="services-scroll-list relative overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                  style={{
                    height: servicesListHeightValue ? `${servicesListHeightValue}px` : "auto",
                    maxHeight: servicesListHeightValue ? `${servicesListHeightValue}px` : undefined,
                    overflowY: servicesOverflow ? "auto" : "visible",
                    scrollbarWidth: "thin",
                    scrollbarColor: "var(--accent) rgba(148, 163, 184, 0.25)",
                    overscrollBehavior: "contain",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <div className="space-y-2.5">
                    {displayedServices.map((svc, idx) => {
                      const Icon = serviceIconMap[svc.iconName] || Code;
                      const iconTints = [
                        "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                        "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                        "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                      ];
                      const tint = iconTints[idx % iconTints.length];

                      return (
                        <div
                          key={svc.id}
                          ref={(node) => {
                            serviceRowRefs.current[idx] = node;
                          }}
                          data-service-row
                          className="group flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-sm transition-all duration-200 hover:border-[var(--accent)]"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl ${tint} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-[var(--foreground)] leading-tight break-words whitespace-normal">
                              {svc.title}
                            </h4>
                            <p className="text-[11px] text-[var(--foreground-muted)] leading-snug break-words whitespace-normal mt-0.5">
                              {svc.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {servicesOverflow && !servicesAtEnd && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--surface-card)] via-[var(--surface-card)]/90 to-transparent transition-opacity duration-200" />
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Education & Merged Certifications Timeline (col-span-4) */}
          <div
            id="education"
            className="lg:col-span-4 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-2xs scroll-mt-24 min-h-0"
          >
            <div>
              {/* Header: Icon badge + Title & Subtitle */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-base font-bold font-heading text-[var(--foreground)]">
                  {homepageContent?.educationTitle || "Education"}
                </h3>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mb-6">
                {homepageContent?.educationEyebrow || "My Academic Journey"}
              </p>

              {/* Vertical Timeline with Dots on a Line */}
              <div className="relative min-h-0">
                <div
                  ref={educationListRef}
                  tabIndex={0}
                  onKeyDown={handleScrollableListKeyDown}
                  onScroll={(event) => {
                    const element = event.currentTarget;
                    const atEnd = element.scrollTop + element.clientHeight >= element.scrollHeight - 2;
                    setEducationAtEnd(atEnd);
                  }}
                  aria-label="Education and certification timeline"
                  className="timeline-scroll relative overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                  style={{
                    height: educationListHeightValue ? `${educationListHeightValue}px` : "auto",
                    maxHeight: educationListHeightValue ? `${educationListHeightValue}px` : undefined,
                    overflowY: educationOverflow ? "auto" : "visible",
                    scrollbarWidth: "thin",
                    scrollbarColor: "var(--accent) rgba(148, 163, 184, 0.25)",
                    overscrollBehavior: "contain",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <div className="relative pl-2 space-y-4 pb-1">
                    {finalTimeline.map((item, idx) => (
                      <div
                        key={item.id}
                        ref={(node) => {
                          educationEntryRefs.current[idx] = node;
                        }}
                        className="relative flex items-start gap-3"
                      >
                        {/* Year on the Left */}
                        <div className="w-10 text-[11px] font-mono text-[var(--foreground-muted)] pt-0.5 shrink-0 text-right">
                          {item.year}
                        </div>

                        {/* Timeline Line & Dot */}
                        <div className="relative flex flex-col items-center self-stretch shrink-0 pt-1.5">
                          <div className="w-2 h-2 rounded-full bg-[var(--accent)] ring-4 ring-[var(--accent-subtle)] z-10" />
                          {idx !== finalTimeline.length - 1 && (
                            <div className="w-[1.5px] bg-[var(--border)] flex-1 my-1" />
                          )}
                        </div>

                        {/* Degree/Title + Status + Institution */}
                        <div className="flex-1 min-w-0 pb-3">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[var(--foreground)] leading-tight">
                              {item.title}
                            </span>
                            <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
                              ({item.statusLabel})
                            </span>
                            {item.credentialUrl && (
                              <a
                                href={item.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[var(--accent)] hover:underline ml-1"
                              >
                                <span>View</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                            {item.institutionOrIssuer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {educationOverflow && !educationAtEnd && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--surface-card)] via-[var(--surface-card)]/90 to-transparent transition-opacity duration-200" />
                )}
              </div>
            </div>
          </div>

          {/* Column 3: "Let's Work Together" Card (col-span-4) */}
          <div
            id="contact"
            className="lg:col-span-4 md:col-span-2 rounded-2xl p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-blue-50/70 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/50 border border-indigo-100/80 dark:border-indigo-900/30 shadow-xs scroll-mt-24"
          >
            <div>
              {/* Top: Paper plane icon tile */}
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center mb-4 shadow-sm">
                <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
              </div>

              {/* Title & Short Text */}
              <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--foreground)] mb-2">
                {cardTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed mb-6">
                {cardText}
              </p>

              {/* Primary Action Button: "Get In Touch ->" opens contact modal */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={(e) => openContactModal(e.currentTarget)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[var(--accent)] hover:brightness-110 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>{cardCta}</span>
                  <span className="text-base leading-none">→</span>
                </button>
              </div>
            </div>

            {/* Contact Info Rows (Email, Location, Phone) */}
            <div className="space-y-2.5 pt-4 border-t border-indigo-100 dark:border-indigo-900/40 text-xs font-medium text-[var(--foreground)]">
              {email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-[var(--accent)] hover:underline truncate"
                  >
                    {email}
                  </a>
                </div>
              )}

              {location && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}

              {phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <a
                    href={`tel:${phone}`}
                    className="hover:text-[var(--accent)] hover:underline truncate"
                  >
                    {phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
