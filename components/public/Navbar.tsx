"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, Send } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useContactModal } from "./ContactModalContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  targetId: string;
  href: string;
  visible: boolean;
}

interface NavbarProps {
  siteSettings?: {
    brandName?: string | null;
    brandMonogram?: string | null;
  } | null;
  homepageContent?: {
    aboutVisible?: boolean;
    skillsVisible?: boolean;
    projectsVisible?: boolean;
    servicesVisible?: boolean;
    timelineVisible?: boolean;
  } | null;
  hasProjects?: boolean;
  hasServices?: boolean;
  hasTimeline?: boolean;
}

/**
 * Memoized Desktop Nav Links with smooth, cheap indicator
 */
const DesktopNav = React.memo(function DesktopNav({
  navItems,
  activeSection,
  onNavClick,
  shouldReduceMotion,
}: {
  navItems: NavItem[];
  activeSection: string;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <nav className="hidden lg:flex items-center gap-7" aria-label="Main Navigation">
      {navItems.map((item) => {
        const isActive = activeSection === item.targetId;
        return (
          <a
            key={item.targetId}
            href={item.href}
            onClick={(e) => onNavClick(e, item.targetId)}
            className={cn(
              "relative py-1.5 text-sm font-medium tracking-normal transition-colors duration-150 min-h-[44px] flex items-center cursor-pointer",
              isActive
                ? "text-[var(--accent)] font-semibold"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            )}
          >
            <span>{item.label}</span>
            {isActive && (
              <motion.span
                layoutId="activeNavIndicator"
                className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[var(--accent)] rounded-full"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 35 }
                }
              />
            )}
          </a>
        );
      })}
    </nav>
  );
});

export function Navbar({
  siteSettings,
  homepageContent,
  hasProjects = true,
  hasServices = true,
  hasTimeline = true,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const { openContactModal } = useContactModal();

  const brandName = siteSettings?.brandName || "Rohan.Dev";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stable Navigation Items list
  const navItems = useMemo<NavItem[]>(() => {
    return [
      {
        label: "Home",
        targetId: "hero",
        href: isHomepage ? "#hero" : "/#hero",
        visible: true,
      },
      {
        label: "About",
        targetId: "about",
        href: isHomepage ? "#about" : "/#about",
        visible: homepageContent?.aboutVisible ?? true,
      },
      {
        label: "Projects",
        targetId: "projects",
        href: isHomepage ? "#projects" : "/#projects",
        visible: (homepageContent?.projectsVisible ?? true) && hasProjects,
      },
      {
        label: "Services",
        targetId: "services",
        href: isHomepage ? "#services" : "/#services",
        visible: (homepageContent?.servicesVisible ?? true) && hasServices,
      },
      {
        label: "Education",
        targetId: "education",
        href: isHomepage ? "#education" : "/#education",
        visible: (homepageContent?.timelineVisible ?? true) && hasTimeline,
      },
      {
        label: "Contact",
        targetId: "contact",
        href: isHomepage ? "#contact" : "/#contact",
        visible: true,
      },
    ].filter((item) => item.visible);
  }, [isHomepage, homepageContent, hasProjects, hasServices, hasTimeline]);

  const unlockBodyScroll = useCallback(() => {
    document.body.style.overflow = "";
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    unlockBodyScroll();
  }, [unlockBodyScroll]);

  // Mobile menu scroll lock & keyboard dismissal
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeMobileMenu();
      };
      const handleResize = () => {
        if (window.innerWidth >= 1024) closeMobileMenu();
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", handleResize);

      return () => {
        unlockBodyScroll();
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("resize", handleResize);
      };
    } else {
      unlockBodyScroll();
    }
  }, [mobileMenuOpen, closeMobileMenu, unlockBodyScroll]);

  useEffect(() => {
    closeMobileMenu();
    return () => unlockBodyScroll();
  }, [pathname, closeMobileMenu, unlockBodyScroll]);

  // Lock scroll-spy while click-initiated scroll is actively animating
  const spyLockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSpyLockedRef = useRef(false);

  // Fast, instant click response: optimistic highlight + immediate scroll
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
      if (isHomepage) {
        e.preventDefault();

        // 1. Optimistic instant active update: underline moves immediately on click
        setActiveSection(targetId);

        // 2. Lock scroll spy so intermediate sections do not flicker or jump highlight
        isSpyLockedRef.current = true;
        if (spyLockTimerRef.current) clearTimeout(spyLockTimerRef.current);
        spyLockTimerRef.current = setTimeout(() => {
          isSpyLockedRef.current = false;
        }, 850);

        // 3. Immediately close mobile menu if open without delaying scroll
        closeMobileMenu();

        // 4. Start scrolling right away (Single scroll method: native scrollIntoView)
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          if (shouldReduceMotion) {
            targetElement.scrollIntoView({ behavior: "auto", block: "start" });
          } else {
            targetElement.scrollIntoView({ block: "start" });
          }
          window.history.pushState(null, "", `#${targetId}`);
        }
      } else {
        closeMobileMenu();
      }
    },
    [isHomepage, shouldReduceMotion, closeMobileMenu]
  );

  // IntersectionObserver based scroll-spy (replaces scroll event listener)
  useEffect(() => {
    if (!isHomepage) return;

    const sectionIds = ["hero", ...navItems.map((item) => item.targetId)];
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sectionElements.length === 0) return;

    const intersectingMap = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        if (isSpyLockedRef.current) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersectingMap.set(entry.target.id, entry);
          } else {
            intersectingMap.delete(entry.target.id);
          }
        }

        if (intersectingMap.size > 0) {
          const sorted = Array.from(intersectingMap.values()).sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top - 80) -
              Math.abs(b.boundingClientRect.top - 80)
          );
          const topTarget = sorted[0].target.id;
          setActiveSection((prev) => (prev !== topTarget ? topTarget : prev));
        }
      },
      {
        rootMargin: "-75px 0px -40% 0px",
        threshold: [0, 0.15, 0.5],
      }
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (spyLockTimerRef.current) {
        clearTimeout(spyLockTimerRef.current);
        spyLockTimerRef.current = null;
      }
    };
  }, [isHomepage, navItems]);

  // Efficient isScrolled toggle: fires setState ONLY on boolean state change
  useEffect(() => {
    let currentScrolled = window.scrollY > 15;
    setIsScrolled(currentScrolled);

    const onScroll = () => {
      const nextScrolled = window.scrollY > 15;
      if (nextScrolled !== currentScrolled) {
        currentScrolled = nextScrolled;
        setIsScrolled(nextScrolled);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        id="site-header"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
          isScrolled
            ? "bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border)] py-3 shadow-xs"
            : "bg-transparent py-4 sm:py-5"
        )}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo with Monogram mark */}
          <Link
            href={isHomepage ? "#hero" : "/"}
            onClick={(e) => {
              if (isHomepage) {
                e.preventDefault();
                handleNavClick(e, "hero");
              } else {
                closeMobileMenu();
              }
            }}
            className="group min-h-[44px] flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] focus:outline-none cursor-pointer"
            aria-label={`${brandName} Home`}
          >
            {/* Stylized Logo Mark */}
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-heading font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M4 4h7a4 4 0 0 1 4 4 4 4 0 0 1-4 4H4z" />
                <path d="M4 12h5l5 8" />
              </svg>
            </div>

            <span className="font-heading font-bold tracking-tight text-[var(--foreground)]">
              {brandName.includes(".") ? (
                <>
                  {brandName.substring(0, brandName.lastIndexOf("."))}
                  <span className="text-[var(--accent)]">
                    {brandName.substring(brandName.lastIndexOf("."))}
                  </span>
                </>
              ) : (
                brandName
              )}
            </span>
          </Link>

          {/* Center Nav Links with Animated Active Indicator */}
          <DesktopNav
            navItems={navItems}
            activeSection={activeSection}
            onNavClick={handleNavClick}
            shouldReduceMotion={shouldReduceMotion}
          />

          {/* Right Controls: Theme Toggle + "Contact Me" Pill Button */}
          <div className="hidden lg:flex items-center gap-3.5">
            <ThemeToggle />

            <button
              type="button"
              onClick={(e) => openContactModal(e.currentTarget)}
              className="px-4 py-2 rounded-full bg-[var(--accent)] hover:brightness-110 active:scale-95 text-white text-xs font-semibold tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <Send className="w-3.5 h-3.5 -rotate-12 translate-x-0.5" />
              <span>Contact Me</span>
            </button>
          </div>

          {/* Mobile Hamburger & Theme Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[var(--foreground)]" />
              ) : (
                <Menu className="w-5 h-5 text-[var(--foreground)]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu rendered in Portal outside of blurred header */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <div
                id="public-mobile-nav-portal"
                className="fixed inset-0 z-[9999] lg:hidden pointer-events-auto"
              >
                {/* Backdrop Overlay */}
                <motion.div
                  key="public-mobile-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={closeMobileMenu}
                  className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[9999] cursor-pointer"
                  aria-hidden="true"
                />

                {/* Drawer Panel */}
                <motion.div
                  key="public-mobile-drawer-panel"
                  id="public-mobile-drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navigation Menu"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  className="fixed inset-y-0 right-0 z-[10000] w-full sm:w-80 max-w-[85vw] h-dvh bg-[var(--surface)] text-[var(--foreground)] border-l border-[var(--border)] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
                >
                  {/* Top Bar with Brand and Close Button */}
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-heading font-black text-base shadow-sm">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M4 4h7a4 4 0 0 1 4 4 4 4 0 0 1-4 4H4z" />
                            <path d="M4 12h5l5 8" />
                          </svg>
                        </div>
                        <span className="font-heading font-bold text-base text-[var(--foreground)] tracking-tight">
                          {brandName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={closeMobileMenu}
                        className="p-2 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] border border-[var(--border)] focus:outline-none cursor-pointer"
                        aria-label="Close navigation menu"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Navigation Items */}
                    <nav
                      className="flex flex-col gap-1.5 py-4"
                      aria-label="Mobile Navigation"
                    >
                      {navItems.map((item) => {
                        const isActive = activeSection === item.targetId;
                        return (
                          <a
                            key={item.targetId}
                            href={item.href}
                            onClick={(e) => handleNavClick(e, item.targetId)}
                            className={cn(
                              "px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center justify-between min-h-[44px] cursor-pointer",
                              isActive
                                ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
                                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                            )}
                          >
                            <span>{item.label}</span>
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                            )}
                          </a>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Bottom Controls: Theme Toggle & Contact Me Button */}
                  <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-sm font-medium text-[var(--foreground-muted)]">
                        Appearance
                      </span>
                      <ThemeToggle />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        closeMobileMenu();
                        openContactModal(e.currentTarget);
                      }}
                      className="w-full py-3 rounded-full bg-[var(--accent)] hover:brightness-110 active:scale-95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer min-h-[44px]"
                    >
                      <Send className="w-4 h-4 -rotate-12 translate-x-0.5" />
                      <span>Contact Me</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
