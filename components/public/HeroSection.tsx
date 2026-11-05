"use client";

import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowRight, Mail, Briefcase } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { HeroHeadingTypewriter } from "./HeroTypewriter";
import { useContactModal } from "./ContactModalContext";
import { SocialIcon } from "./SocialIcon";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
  loading: () => null,
});

interface HeroSectionProps {
  content?: {
    heroGreeting?: string;
    heroName?: string;
    heroNamePrefix?: string | null;
    heroNameHighlight?: string;
    heroHeading?: string;
    heroSubheading?: string;
    heroTagline?: string;
    heroParagraph?: string | null;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    heroTechBadges?: string[];
    heroUseFeaturedSkills?: boolean;
    heroEnableTypewriter?: boolean;
    heroTypewriterPhrases?: string[];
    heroTypewriterSpeed?: "slow" | "normal" | "fast" | string;
    heroTypewriterLoop?: boolean;
    heroTypewriterName?: boolean;
    heroShowTaglineWords?: boolean;
    heroTaglineWords?: string[];
    heroShow3D?: boolean;
    heroImageUrl?: string | null;
  } | null;
  profile?: {
    name: string;
    title: string;
    avatarUrl?: string | null;
    heroImageUrl?: string | null;
    availableFor?: string | null;
    availableShow?: boolean;
    availableStatusColor?: string;
  } | null;
  socialLinks?: any[];
  featuredSkillNames?: string[];
}

export function HeroSection({
  content,
  profile,
  socialLinks = [],
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const { openContactModal } = useContactModal();

  // Content defaults
  const greeting = content?.heroGreeting !== undefined ? content.heroGreeting : "Hello, I'm";

  // Name: separate first part and highlighted last word(s)
  const namePrefix =
    content?.heroNamePrefix !== undefined
      ? content.heroNamePrefix
      : content?.heroName
      ? content.heroName.replace(content?.heroNameHighlight || "", "").trim()
      : "Rohan";
  const nameHighlight =
    content?.heroNameHighlight !== undefined ? content.heroNameHighlight : "Mirza";
  const fullName =
    [namePrefix, nameHighlight].filter(Boolean).join(" ").trim() ||
    content?.heroName ||
    profile?.name ||
    "Rohan Mirza";

  const defaultTitle = profile?.title || "Full Stack Developer & AI Engineer";
  const phrases =
    content?.heroTypewriterPhrases && content.heroTypewriterPhrases.length > 0
      ? content.heroTypewriterPhrases.filter(Boolean)
      : [defaultTitle];

  const description =
    content?.heroTagline !== undefined
      ? content.heroTagline
      : content?.heroSubheading ||
        "Turning complex AI capabilities into elegant, performant digital realities.";
  const heroParagraph = content?.heroParagraph || null;

  const primaryCtaText = content?.primaryCtaText !== undefined ? content.primaryCtaText : "Explore Projects";
  const primaryCtaLink = content?.primaryCtaLink || "#projects";
  const secondaryCtaText = content?.secondaryCtaText !== undefined ? content.secondaryCtaText : "Get in Touch";
  const secondaryCtaLink = content?.secondaryCtaLink || "#contact";

  const show3D = content?.heroShow3D ?? false;
  const enableTypewriter = content?.heroEnableTypewriter ?? true;
  const typeName = content?.heroTypewriterName ?? true;
  const typewriterSpeed = (content?.heroTypewriterSpeed || "normal").toLowerCase().trim();
  const typewriterLoop = content?.heroTypewriterLoop ?? true;

  const showTaglineWords = content?.heroShowTaglineWords ?? true;
  const rawTaglineWords = content?.heroTaglineWords ?? ["Code", "Build", "Innovate"];
  const taglineWords = showTaglineWords ? rawTaglineWords.filter(Boolean) : [];

  const heroImage = content?.heroImageUrl?.trim() || null;
  const hasHeroVisual = Boolean(show3D || heroImage);

  // Default social links if none in database
  const displayedSocials =
    socialLinks && socialLinks.length > 0
      ? socialLinks
      : [
          { platform: "GitHub", url: "https://github.com" },
          { platform: "LinkedIn", url: "https://linkedin.com" },
          { platform: "X", url: "https://x.com" },
        ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <section
      id="hero"
      className="relative min-h-[88dvh] flex items-center justify-center pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden scroll-mt-20"
    >
      {/* Soft Background ambient gradient blobs */}
      <div className="absolute top-12 left-1/4 w-[450px] h-[450px] bg-indigo-400/[0.08] dark:bg-indigo-600/[0.12] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-28 right-1/4 w-[400px] h-[400px] bg-purple-400/[0.07] dark:bg-purple-600/[0.10] rounded-full blur-3xl pointer-events-none" />

      {/* Main container: 1200px max width centered */}
      <div className="relative w-full max-w-[1200px] mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-center">
          {/* Left Column: Greeting, Name, Subtitle, Description, CTA Buttons, Socials */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`flex flex-col items-start text-left min-w-0 w-full ${
              hasHeroVisual ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl"
            }`}
          >
            {/* 1. Greeting pill with wave icon */}
            {greeting && (
              <motion.div variants={itemVariants} className="mb-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-card)] border border-[var(--border)] shadow-xs">
                  <span className="text-sm">👋</span>
                  <span className="text-xs font-medium text-[var(--foreground-muted)] tracking-wide">
                    {greeting}
                  </span>
                </div>
              </motion.div>
            )}

            {/* 2 & 3. Large Two-Tone Name & Title Line (Clean Isolated Typewriter) */}
            <motion.div variants={itemVariants} className="w-full">
              <HeroHeadingTypewriter
                fullName={fullName}
                nameHighlight={nameHighlight}
                typeName={typeName}
                phrases={phrases}
                enabled={enableTypewriter}
                speed={typewriterSpeed}
                loop={typewriterLoop}
                fallbackTitle={defaultTitle}
                ignoreReducedMotion={(content as any)?.heroTypewriterIgnoreReducedMotion}
              />
            </motion.div>

            {/* 4. Description Paragraph */}
            {description && (
              <motion.p
                variants={itemVariants}
                className="text-sm sm:text-base text-[var(--foreground-muted)] font-normal leading-relaxed max-w-xl mb-4"
              >
                {description}
              </motion.p>
            )}

            {heroParagraph && (
              <motion.p
                variants={itemVariants}
                className="text-xs sm:text-sm text-[var(--foreground-muted)] font-normal leading-relaxed max-w-xl mb-6 opacity-85"
              >
                {heroParagraph}
              </motion.p>
            )}

            {/* 5. Buttons Row: Primary (filled) + Secondary (outlined, opens modal or custom link) */}
            {(primaryCtaText || secondaryCtaText) && (
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8"
              >
                {primaryCtaText && (
                  <a
                    href={primaryCtaLink}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-xs sm:text-sm text-white bg-[var(--accent)] hover:brightness-110 active:scale-[0.98] shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>{primaryCtaText}</span>
                    <ArrowRight className="w-4 h-4 shrink-0 ml-0.5" />
                  </a>
                )}

                {secondaryCtaText && (
                  <button
                    type="button"
                    onClick={(e) => {
                      if (secondaryCtaLink && secondaryCtaLink !== "#contact" && !secondaryCtaLink.startsWith("#")) {
                        window.location.href = secondaryCtaLink;
                      } else if (secondaryCtaLink && secondaryCtaLink.startsWith("#") && secondaryCtaLink !== "#contact") {
                        const target = document.querySelector(secondaryCtaLink);
                        target?.scrollIntoView({ behavior: "smooth" });
                      } else {
                        openContactModal(e.currentTarget);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-xs sm:text-sm text-[var(--foreground)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--border)] active:scale-[0.98] shadow-xs hover:shadow transition-all cursor-pointer"
                  >
                    <span>{secondaryCtaText}</span>
                    <Mail className="w-4 h-4 text-[var(--foreground-muted)] shrink-0" />
                  </button>
                )}
              </motion.div>
            )}

            {/* 6. Social Icons Row */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              {displayedSocials.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[var(--surface-card)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:scale-105 transition-all shadow-xs"
                  aria-label={s.platform}
                >
                  <SocialIcon platform={s.platform} className="w-4 h-4" />
                </a>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column: Hero Photo & Handwritten Tagline (Col 5, visible only on lg+ >= 1024px) */}
          {hasHeroVisual && (
            <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center w-full min-h-[440px]">
              {/* If 3D canvas is enabled in settings, show it */}
              {show3D ? (
                <div className="w-full h-[440px]">
                  <HeroCanvas />
                </div>
              ) : (
                <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                  {/* Soft Rounded Pastel Backdrop Shape */}
                  <div className="absolute inset-4 sm:inset-6 rounded-[36px] bg-gradient-to-tr from-indigo-200/50 via-blue-100/60 to-purple-200/40 dark:from-indigo-950/40 dark:via-slate-900/50 dark:to-purple-950/30 border border-white/60 dark:border-white/5 shadow-xl" />

                  {/* Floating Translucent Squares */}
                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? {}
                        : {
                            y: [0, -8, 0],
                            rotate: [0, 4, 0],
                          }
                    }
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-2 left-6 w-9 h-9 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-sm"
                  />

                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? {}
                        : {
                            y: [0, 9, 0],
                            rotate: [0, -5, 0],
                          }
                    }
                    transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-8 -left-3 w-8 h-8 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-sm"
                  />

                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? {}
                        : {
                            y: [0, -7, 0],
                            rotate: [0, 6, 0],
                          }
                    }
                    transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-2 right-8 w-10 h-10 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-sm"
                  />

                  {/* Hero Photo / Avatar or Monogram fallback */}
                  <div className="relative z-10 w-[82%] h-[82%] flex items-end justify-center overflow-hidden">
                    {heroImage ? (
                      <div className="relative w-full h-full flex items-end justify-center">
                        <Image
                          src={heroImage}
                          alt={fullName}
                          fill
                          priority
                          className="object-contain object-bottom drop-shadow-xl"
                          sizes="(min-width: 1024px) 420px, 0px"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-32 h-32 rounded-3xl bg-[var(--accent)] text-white font-heading font-black text-5xl flex items-center justify-center shadow-lg">
                          {fullName.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Handwritten Tagline Block at Top Right */}
                  {taglineWords.length > 0 && (
                    <div className="absolute -top-4 -right-2 sm:-right-4 z-20 flex flex-col items-center rotate-[8deg] select-none pointer-events-none">
                      <div className="font-handwriting text-2xl sm:text-3xl text-[var(--foreground-muted)] tracking-wide leading-tight text-center font-bold">
                        {taglineWords.map((word, idx) => (
                          <div key={idx}>{word}</div>
                        ))}
                      </div>
                      {/* Handwritten Underline Curve SVG */}
                      <svg
                        viewBox="0 0 100 20"
                        className="w-20 sm:w-24 text-[var(--accent)] stroke-current fill-none stroke-[2.5] stroke-linecap-round mt-0.5"
                      >
                        <path d="M 5 12 Q 50 18 95 8" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
