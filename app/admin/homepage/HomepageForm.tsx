"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateHomepageContent } from "@/lib/actions/settings.actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Eye, EyeOff, Loader2, CheckCircle, Sliders } from "lucide-react";

interface HomepageContentData {
  id?: string;
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
  heroImageUrl?: string | null;
  navbarCtaText?: string;
  navbarCtaLink?: string;
  aboutEyebrow?: string;
  aboutTitle?: string;
  skillsEyebrow?: string;
  skillsTitle?: string;
  projectsEyebrow?: string;
  projectsTitle?: string;
  projectsViewAllText?: string;
  servicesEyebrow?: string;
  servicesTitle?: string;
  servicesIntro?: string | null;
  educationEyebrow?: string;
  educationTitle?: string;
  educationIntro?: string | null;
  educationQuickContactTitle?: string;
  educationQuickContactText?: string;
  timelineEyebrow?: string;
  timelineTitle?: string;
  timelineEducationHeading?: string;
  timelineCertificationsHeading?: string;
  contactEyebrow?: string;
  contactTitle?: string;
  contactPitchHeadline?: string;
  contactPitchText?: string;
  letWorkTogetherTitle?: string;
  letWorkTogetherText?: string;
  letWorkTogetherCtaText?: string;
  contactPopupTitle?: string;
  contactPopupSubtitle?: string;
  contactPopupSuccessMessage?: string;
  heroVisible?: boolean;
  heroShow3D?: boolean;
  aboutVisible?: boolean;
  skillsVisible?: boolean;
  projectsVisible?: boolean;
  servicesVisible?: boolean;
  timelineVisible?: boolean;
  contactVisible?: boolean;
}

export function HomepageForm({
  initialContent,
  initialProfileHeroImage,
}: {
  initialContent?: HomepageContentData | null;
  initialProfileHeroImage?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Hero Copywriting
  const [heroGreeting, setHeroGreeting] = useState(initialContent?.heroGreeting ?? "Hello, I'm");
  const [heroNamePrefix, setHeroNamePrefix] = useState(
    initialContent?.heroNamePrefix ??
      (initialContent?.heroName
        ? initialContent.heroName.replace(initialContent?.heroNameHighlight || "", "").trim()
        : "Rohan")
  );
  const [heroNameHighlight, setHeroNameHighlight] = useState(initialContent?.heroNameHighlight || "Mirza");
  const [heroHeading, setHeroHeading] = useState(initialContent?.heroHeading || "Hi, I'm Rohan");
  const [heroSubheading, setHeroSubheading] = useState(
    initialContent?.heroSubheading ||
      "Full Stack Developer & AI Engineer crafting intelligent web platforms and scalable backends."
  );
  const [heroTagline, setHeroTagline] = useState(
    initialContent?.heroTagline ||
      "Turning complex AI capabilities into elegant, performant digital realities."
  );
  const [heroParagraph, setHeroParagraph] = useState(initialContent?.heroParagraph || "");
  const [primaryCtaText, setPrimaryCtaText] = useState(initialContent?.primaryCtaText || "Explore Projects");
  const [primaryCtaLink, setPrimaryCtaLink] = useState(initialContent?.primaryCtaLink || "#projects");
  const [secondaryCtaText, setSecondaryCtaText] = useState(initialContent?.secondaryCtaText || "Get in Touch");
  const [secondaryCtaLink, setSecondaryCtaLink] = useState(initialContent?.secondaryCtaLink || "#contact");

  // Hero Image
  const [heroImageUrl, setHeroImageUrl] = useState<string>(
    initialContent?.heroImageUrl || initialProfileHeroImage || ""
  );

  // Hero Tech Badges
  const [heroTechBadges, setHeroTechBadges] = useState<string[]>(
    initialContent?.heroTechBadges || [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Python",
      "FastAPI",
      "OpenAI / LLMs",
      "MCP",
      "PostgreSQL",
    ]
  );
  const [newBadgeInput, setNewBadgeInput] = useState("");
  const [heroUseFeaturedSkills, setHeroUseFeaturedSkills] = useState(
    initialContent?.heroUseFeaturedSkills ?? false
  );

  // Hero Typewriter Effect
  const [heroEnableTypewriter, setHeroEnableTypewriter] = useState(
    initialContent?.heroEnableTypewriter ?? true
  );
  const [heroTypewriterPhrases, setHeroTypewriterPhrases] = useState<string[]>(
    initialContent?.heroTypewriterPhrases && initialContent.heroTypewriterPhrases.length > 0
      ? initialContent.heroTypewriterPhrases
      : ["Full Stack Developer & AI Engineer"]
  );
  const [newPhraseInput, setNewPhraseInput] = useState("");
  const [heroTypewriterSpeed, setHeroTypewriterSpeed] = useState<"slow" | "normal" | "fast">(
    (initialContent?.heroTypewriterSpeed as "slow" | "normal" | "fast") || "normal"
  );
  const [heroTypewriterLoop, setHeroTypewriterLoop] = useState(
    initialContent?.heroTypewriterLoop ?? true
  );
  const [heroTypewriterName, setHeroTypewriterName] = useState(
    initialContent?.heroTypewriterName ?? true
  );
  const [heroShowTaglineWords, setHeroShowTaglineWords] = useState(
    initialContent?.heroShowTaglineWords ?? true
  );
  const [heroTaglineWords, setHeroTaglineWords] = useState<string[]>(
    initialContent?.heroTaglineWords || ["Code", "Build", "Innovate"]
  );

  // Navbar CTA
  const [navbarCtaText, setNavbarCtaText] = useState(initialContent?.navbarCtaText || "Let's Connect");
  const [navbarCtaLink, setNavbarCtaLink] = useState(initialContent?.navbarCtaLink || "#contact");

  // Section Headings & Intro Copy
  const [aboutEyebrow, setAboutEyebrow] = useState(initialContent?.aboutEyebrow || "ABOUT ME");
  const [aboutTitle, setAboutTitle] = useState(initialContent?.aboutTitle || "Who *I Am*");
  const [skillsEyebrow, setSkillsEyebrow] = useState(initialContent?.skillsEyebrow || "TECH STACK");
  const [skillsTitle, setSkillsTitle] = useState(initialContent?.skillsTitle || "Technologies *I Work With*");
  const [projectsEyebrow, setProjectsEyebrow] = useState(initialContent?.projectsEyebrow || "MY PROJECTS");
  const [projectsTitle, setProjectsTitle] = useState(initialContent?.projectsTitle || "Featured *Projects*");
  const [projectsViewAllText, setProjectsViewAllText] = useState(initialContent?.projectsViewAllText || "View All Projects");
  const [servicesEyebrow, setServicesEyebrow] = useState(initialContent?.servicesEyebrow || "SERVICES");
  const [servicesTitle, setServicesTitle] = useState(initialContent?.servicesTitle || "What *I Do*");
  const [servicesIntro, setServicesIntro] = useState(
    initialContent?.servicesIntro ||
      "I offer modern web development and AI solutions tailored to your needs. From concept to deployment, I help turn your ideas into powerful digital products."
  );
  const [educationEyebrow, setEducationEyebrow] = useState(initialContent?.educationEyebrow || "EDUCATION");
  const [educationTitle, setEducationTitle] = useState(initialContent?.educationTitle || "My *Education*");
  const [timelineEyebrow, setTimelineEyebrow] = useState(
    initialContent?.timelineEyebrow || "EDUCATION"
  );
  const [timelineTitle, setTimelineTitle] = useState(
    initialContent?.timelineTitle || "My *Education*"
  );
  const [educationIntro, setEducationIntro] = useState(
    initialContent?.educationIntro || "My academic journey and the skills I've built along the way."
  );
  const [educationQuickContactTitle, setEducationQuickContactTitle] = useState(
    initialContent?.educationQuickContactTitle || "Feel free to contact me"
  );
  const [educationQuickContactText, setEducationQuickContactText] = useState(
    initialContent?.educationQuickContactText ||
      "I'm always open to discussing new projects, ideas or opportunities."
  );
  const [timelineEducationHeading, setTimelineEducationHeading] = useState(
    initialContent?.timelineEducationHeading || "Education"
  );
  const [timelineCertificationsHeading, setTimelineCertificationsHeading] = useState(
    initialContent?.timelineCertificationsHeading || "Certifications"
  );
  const [contactEyebrow, setContactEyebrow] = useState(initialContent?.contactEyebrow || "CONTACT");
  const [contactTitle, setContactTitle] = useState(initialContent?.contactTitle || "Get in *Touch*");
  const [contactPitchHeadline, setContactPitchHeadline] = useState(
    initialContent?.contactPitchHeadline || "Let's build intelligent web applications together."
  );
  const [contactPitchText, setContactPitchText] = useState(
    initialContent?.contactPitchText ||
      "Whether you are looking to architect a Next.js platform, integrate LLM/agent pipelines, or build robust backend systems, feel free to reach out."
  );

  // "Let's Work Together" card
  const [letWorkTogetherTitle, setLetWorkTogetherTitle] = useState(
    initialContent?.letWorkTogetherTitle || "Let's Work Together"
  );
  const [letWorkTogetherText, setLetWorkTogetherText] = useState(
    initialContent?.letWorkTogetherText ||
      "Have a project in mind or just want to say hello? I'd love to hear from you."
  );
  const [letWorkTogetherCtaText, setLetWorkTogetherCtaText] = useState(
    initialContent?.letWorkTogetherCtaText || "Get In Touch"
  );

  // Contact Popup
  const [contactPopupTitle, setContactPopupTitle] = useState(
    initialContent?.contactPopupTitle || "Get In Touch"
  );
  const [contactPopupSubtitle, setContactPopupSubtitle] = useState(
    initialContent?.contactPopupSubtitle ||
      "Send me a message and I'll get back to you as soon as possible."
  );
  const [contactPopupSuccessMessage, setContactPopupSuccessMessage] = useState(
    initialContent?.contactPopupSuccessMessage ||
      "Thanks! Your message was sent successfully."
  );

  // Section Toggles
  const [heroVisible, setHeroVisible] = useState(initialContent?.heroVisible ?? true);
  const [heroShow3D, setHeroShow3D] = useState(initialContent?.heroShow3D ?? false);
  const [aboutVisible, setAboutVisible] = useState(initialContent?.aboutVisible ?? true);
  const [skillsVisible, setSkillsVisible] = useState(initialContent?.skillsVisible ?? true);
  const [projectsVisible, setProjectsVisible] = useState(initialContent?.projectsVisible ?? true);
  const [servicesVisible, setServicesVisible] = useState(initialContent?.servicesVisible ?? true);
  const [timelineVisible, setTimelineVisible] = useState(initialContent?.timelineVisible ?? true);
  const [contactVisible, setContactVisible] = useState(initialContent?.contactVisible ?? true);

  const handleAddBadge = () => {
    const trimmed = newBadgeInput.trim();
    if (trimmed && !heroTechBadges.includes(trimmed)) {
      setHeroTechBadges([...heroTechBadges, trimmed]);
      setNewBadgeInput("");
    }
  };

  const handleRemoveBadge = (index: number) => {
    setHeroTechBadges(heroTechBadges.filter((_, i) => i !== index));
  };

  const handleMoveBadge = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroTechBadges.length) return;
    const updated = [...heroTechBadges];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setHeroTechBadges(updated);
  };

  const handleAddPhrase = () => {
    const trimmed = newPhraseInput.trim();
    if (trimmed && !heroTypewriterPhrases.includes(trimmed)) {
      setHeroTypewriterPhrases([...heroTypewriterPhrases, trimmed]);
      setNewPhraseInput("");
    }
  };

  const handleRemovePhrase = (index: number) => {
    setHeroTypewriterPhrases(heroTypewriterPhrases.filter((_, i) => i !== index));
  };

  const handleMovePhrase = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroTypewriterPhrases.length) return;
    const updated = [...heroTypewriterPhrases];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setHeroTypewriterPhrases(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);

    startTransition(async () => {
      await updateHomepageContent({
        heroGreeting,
        heroName: [heroNamePrefix, heroNameHighlight].filter(Boolean).join(" ").trim() || "Rohan Mirza",
        heroNamePrefix,
        heroNameHighlight,
        heroHeading,
        heroSubheading,
        heroTagline,
        heroParagraph: heroParagraph.trim() || null,
        primaryCtaText,
        primaryCtaLink,
        secondaryCtaText,
        secondaryCtaLink,
        heroTechBadges,
        heroUseFeaturedSkills,
        heroEnableTypewriter,
        heroTypewriterPhrases,
        heroTypewriterSpeed,
        heroTypewriterLoop,
        heroTypewriterName,
        heroShowTaglineWords,
        heroTaglineWords,
        heroImageUrl: heroImageUrl.trim() || null,
        navbarCtaText,
        navbarCtaLink,
        aboutEyebrow,
        aboutTitle,
        skillsEyebrow,
        skillsTitle,
        projectsEyebrow,
        projectsTitle,
        projectsViewAllText,
        servicesEyebrow,
        servicesTitle,
        servicesIntro,
        educationEyebrow,
        educationTitle,
        educationIntro,
        educationQuickContactTitle,
        educationQuickContactText,
        timelineEyebrow,
        timelineTitle,
        timelineEducationHeading,
        timelineCertificationsHeading,
        contactEyebrow,
        contactTitle,
        contactPitchHeadline,
        contactPitchText,
        letWorkTogetherTitle,
        letWorkTogetherText,
        letWorkTogetherCtaText,
        contactPopupTitle,
        contactPopupSubtitle,
        contactPopupSuccessMessage,
        heroVisible,
        heroShow3D,
        aboutVisible,
        skillsVisible,
        projectsVisible,
        servicesVisible,
        timelineVisible,
        contactVisible,
      });
      setSavedSuccess(true);
      router.refresh();
      setTimeout(() => setSavedSuccess(false), 3000);
    });
  };

  const sectionsList = [
    { key: "hero", label: "Hero & Introduction", state: heroVisible, set: setHeroVisible },
    { key: "heroShow3D", label: "Hero 3D Background", state: heroShow3D, set: setHeroShow3D },
    { key: "about", label: "About Me Section", state: aboutVisible, set: setAboutVisible },
    { key: "skills", label: "Tech Stack & Skills", state: skillsVisible, set: setSkillsVisible },
    { key: "projects", label: "Featured Projects Grid", state: projectsVisible, set: setProjectsVisible },
    { key: "services", label: "Services & Capabilities", state: servicesVisible, set: setServicesVisible },
    { key: "timeline", label: "Education & Certifications Timeline", state: timelineVisible, set: setTimelineVisible },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Homepage settings saved and public cache revalidated successfully!</span>
        </div>
      )}

      {/* 7 Section Visibility Toggles Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Section Visibility Toggles
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Toggling a section off hides it from the public portfolio immediately without redeploying.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {sectionsList.map((sec) => (
            <div
              key={sec.key}
              onClick={() => sec.set(!sec.state)}
              className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                sec.state
                  ? "bg-cyan-500/10 border-cyan-500/30 text-white"
                  : "bg-[#090a0f] border-white/10 text-slate-400"
              }`}
            >
              <span className="text-xs font-semibold truncate min-w-0">{sec.label}</span>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono shrink-0 ${
                  sec.state
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "bg-white/5 text-slate-500"
                }`}
              >
                {sec.state ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{sec.state ? "Visible" : "Hidden"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Typography Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Hero Copywriting & Tagline
        </h2>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Greeting Pill Text
              </label>
              <input
                type="text"
                value={heroGreeting}
                onChange={(e) => setHeroGreeting(e.target.value)}
                placeholder="Hello, I'm (leave empty to hide)"
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 min-h-[44px] text-base sm:text-sm text-white outline-none"
              />
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Leave empty to hide greeting pill.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Name: First Part *
              </label>
              <input
                type="text"
                required
                value={heroNamePrefix}
                onChange={(e) => setHeroNamePrefix(e.target.value)}
                placeholder="Rohan"
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 min-h-[44px] text-base sm:text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Name: Highlighted Word(s) *
              </label>
              <input
                type="text"
                required
                value={heroNameHighlight}
                onChange={(e) => setHeroNameHighlight(e.target.value)}
                placeholder="Mirza"
                className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 min-h-[44px] text-base sm:text-sm text-white outline-none"
              />
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Rendered with the indigo accent highlight.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Hero Tagline / Description *
            </label>
            <textarea
              rows={2}
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              placeholder="Turning complex AI capabilities into elegant, performant digital realities."
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl p-3 text-base sm:text-sm text-white outline-none resize-y"
            />
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Renders directly under the typewriter title line. Leave empty to hide.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Hero Secondary Paragraph (Optional)
            </label>
            <textarea
              rows={2}
              value={heroParagraph}
              onChange={(e) => setHeroParagraph(e.target.value)}
              placeholder="Optional secondary narrative paragraph (leave empty to hide)"
              className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl p-3 text-base sm:text-sm text-white outline-none resize-y"
            />
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Optional secondary paragraph below description. Leave empty to hide gracefully.
            </p>
          </div>

          {/* Handwritten Tagline Lines (Up to 3 editable lines + on/off toggle) */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                  Handwritten Tagline Block (Code / Build / Innovate)
                </label>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Decorated script tagline displayed at the top right of the hero photo.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 min-h-[38px]">
                <input
                  type="checkbox"
                  checked={heroShowTaglineWords}
                  onChange={(e) => setHeroShowTaglineWords(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 rounded accent-cyan-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-200">
                  Show handwritten tagline
                </span>
              </label>
            </div>

            {heroShowTaglineWords && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[0, 1, 2].map((idx) => (
                  <div key={idx}>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Line {idx + 1}
                    </label>
                    <input
                      type="text"
                      value={heroTaglineWords[idx] || ""}
                      onChange={(e) => {
                        const updated = [...heroTaglineWords];
                        updated[idx] = e.target.value;
                        setHeroTaglineWords(updated);
                      }}
                      placeholder={["Code", "Build", "Innovate"][idx]}
                      className="w-full bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono text-center"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Image Uploader Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Hero Cutout Photo
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Transparent cutout portrait photo shown inside the soft pastel backdrop frame on desktop screens (1024px+). If removed or empty, the right column stays hidden gracefully.
        </p>

        <ImageUploader
          value={heroImageUrl}
          onImageChange={(url) => setHeroImageUrl(url)}
          folder="portfolio/hero"
          label="Hero Portrait Photo (Cutout)"
        />
      </div>

      {/* Live Hero Typography Preview Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#0e1017] border border-cyan-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Live Hero Typography Preview
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Real-time reflection of changes
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-[#12131a] border border-white/10 space-y-3">
          {heroGreeting ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
              <span>👋</span>
              <span>{heroGreeting}</span>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-slate-600 italic">
              [Greeting pill hidden]
            </div>
          )}

          <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
            <span>{heroNamePrefix}</span>{" "}
            <span className="text-indigo-400">{heroNameHighlight}</span>
          </div>

          {heroEnableTypewriter && heroTypewriterPhrases.length > 0 ? (
            <div className="text-sm sm:text-base font-semibold text-slate-300 font-mono flex items-center">
              <span>{heroTypewriterPhrases[0]}</span>
              <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse" />
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500">
              [Static title from Profile]
            </div>
          )}

          {heroTagline && (
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {heroTagline}
            </p>
          )}

          {heroParagraph && (
            <p className="text-xs text-slate-400 max-w-xl">
              {heroParagraph}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {primaryCtaText && (
              <span className="px-4 py-2 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-sm">
                {primaryCtaText} →
              </span>
            )}
            {secondaryCtaText && (
              <span className="px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/10">
                {secondaryCtaText}
              </span>
            )}
            {heroShowTaglineWords && heroTaglineWords.filter(Boolean).length > 0 && (
              <span className="px-3 py-1 rounded-lg text-[11px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 ml-auto">
                Tagline: {heroTaglineWords.filter(Boolean).join(" / ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hero Heading Typewriter Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Hero Title Typewriter Effect
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Types out the second heading line character-by-character with a blinking accent cursor.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-2 min-h-[44px] rounded-xl border border-white/10">
            <input
              type="checkbox"
              checked={heroEnableTypewriter}
              onChange={(e) => setHeroEnableTypewriter(e.target.checked)}
              className="w-4 h-4 text-cyan-500 rounded accent-cyan-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-200">
              Enable typewriter
            </span>
          </label>
        </div>

        {heroEnableTypewriter ? (
          <div className="space-y-6">
            {/* Speed & Loop Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#090a0f] border border-white/5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Typing Speed
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {(["slow", "normal", "fast"] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setHeroTypewriterSpeed(spd)}
                      className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-mono capitalize transition-colors cursor-pointer ${
                        heroTypewriterSpeed === spd
                          ? "bg-cyan-500 text-slate-950 font-bold"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Looping Behavior
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer mt-1 min-h-[40px]">
                  <input
                    type="checkbox"
                    checked={heroTypewriterLoop}
                    onChange={(e) => setHeroTypewriterLoop(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-300">
                    Loop indefinitely (rotate through phrases)
                  </span>
                </label>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-white/5">
                <label className="flex items-center gap-2.5 cursor-pointer min-h-[40px]">
                  <input
                    type="checkbox"
                    checked={heroTypewriterName}
                    onChange={(e) => setHeroTypewriterName(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-300">
                    Type the name too (Types the name first with highlighted word, then transitions to title phrases)
                  </span>
                </label>
              </div>
            </div>

            {/* Editable List of Phrases */}
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                Typewriter Phrases ({heroTypewriterPhrases.length})
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newPhraseInput}
                  onChange={(e) => setNewPhraseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPhrase();
                    }
                  }}
                  placeholder="Add phrase (e.g. AI Systems Architect)"
                  className="flex-1 min-w-0 bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 min-h-[44px] text-base sm:text-xs text-white placeholder-slate-600 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPhrase}
                  className="px-4 py-2.5 min-h-[44px] bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400 cursor-pointer shrink-0"
                >
                  Add Phrase
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {heroTypewriterPhrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#090a0f] border border-white/10 text-xs text-white"
                  >
                    <span className="font-mono text-cyan-400 mr-2">#{idx + 1}</span>
                    <span className="flex-1 truncate mr-3">{phrase}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMovePhrase(idx, "up")}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={idx === heroTypewriterPhrases.length - 1}
                        onClick={() => handleMovePhrase(idx, "down")}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhrase(idx)}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Remove phrase"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-mono bg-white/5 p-3 rounded-xl border border-white/5">
            Typewriter is disabled. The hero heading renders the normal static title directly from Profile settings.
          </p>
        )}
      </div>

      {/* Hero Quick Tech Badges Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Hero Quick Tech Badges
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Badges displayed under the Hero CTA buttons (&quot;Stack: Next.js 16, React 19...&quot;).
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-2 min-h-[44px] rounded-xl border border-white/10">
            <input
              type="checkbox"
              checked={heroUseFeaturedSkills}
              onChange={(e) => setHeroUseFeaturedSkills(e.target.checked)}
              className="w-4 h-4 text-cyan-500 rounded accent-cyan-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-200">
              Auto-sync with featured skills
            </span>
          </label>
        </div>

        {!heroUseFeaturedSkills && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newBadgeInput}
                onChange={(e) => setNewBadgeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBadge();
                  }
                }}
                placeholder="Add badge (e.g. Next.js 16, PyTorch, LangChain)"
                className="flex-1 min-w-0 bg-[#090a0f] border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 min-h-[44px] text-base sm:text-xs text-white placeholder-slate-600 outline-none"
              />
              <button
                type="button"
                onClick={handleAddBadge}
                className="px-4 py-2.5 min-h-[44px] bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400 cursor-pointer shrink-0"
              >
                Add Badge
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {heroTechBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090a0f] border border-white/10 text-xs text-white font-mono"
                >
                  <span>{badge}</span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveBadge(idx, "up")}
                      className="hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                      title="Move left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={idx === heroTechBadges.length - 1}
                      onClick={() => handleMoveBadge(idx, "down")}
                      className="hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                      title="Move right"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBadge(idx)}
                      className="hover:text-rose-400 ml-1 cursor-pointer"
                      title="Remove badge"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {heroUseFeaturedSkills && (
          <p className="text-xs text-cyan-400 font-mono bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
            ✓ Quick tech badges are automatically pulled from featured skills configured in /admin/skills.
          </p>
        )}
      </div>

      {/* Call to Action Buttons Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Hero & Navbar Call to Action (CTA) Buttons
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Hero CTA */}
          <div className="space-y-4 p-4 rounded-xl bg-[#090a0f] border border-white/5">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
              Hero Primary CTA (Filled)
            </span>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Button Label
              </label>
              <input
                type="text"
                required
                value={primaryCtaText}
                onChange={(e) => setPrimaryCtaText(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Target Link / Anchor
              </label>
              <input
                type="text"
                required
                value={primaryCtaLink}
                onChange={(e) => setPrimaryCtaLink(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          {/* Secondary Hero CTA */}
          <div className="space-y-4 p-4 rounded-xl bg-[#090a0f] border border-white/5">
            <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">
              Hero Secondary CTA (Outline)
            </span>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Button Label
              </label>
              <input
                type="text"
                required
                value={secondaryCtaText}
                onChange={(e) => setSecondaryCtaText(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Target Link / Anchor
              </label>
              <input
                type="text"
                required
                value={secondaryCtaLink}
                onChange={(e) => setSecondaryCtaLink(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          {/* Navbar CTA */}
          <div className="space-y-4 p-4 rounded-xl bg-[#090a0f] border border-white/5">
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
              Navbar Header CTA Button
            </span>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Button Label
              </label>
              <input
                type="text"
                required
                value={navbarCtaText}
                onChange={(e) => setNavbarCtaText(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Target Link / Anchor
              </label>
              <input
                type="text"
                required
                value={navbarCtaLink}
                onChange={(e) => setNavbarCtaLink(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Headings & Eyebrows Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#12131a] border border-white/10 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight pb-4 border-b border-white/10">
          Section Headings & Eyebrow Badges
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Customize the eyebrow tag (e.g. &quot;// Selected Systems&quot;) and title for every section on the public site.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-white/5 space-y-3">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">About Section</span>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Eyebrow</label>
              <input
                type="text"
                required
                value={aboutEyebrow}
                onChange={(e) => setAboutEyebrow(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Title</label>
              <input
                type="text"
                required
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-white/5 space-y-3">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">Skills Section</span>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Eyebrow</label>
              <input
                type="text"
                required
                value={skillsEyebrow}
                onChange={(e) => setSkillsEyebrow(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Title</label>
              <input
                type="text"
                required
                value={skillsTitle}
                onChange={(e) => setSkillsTitle(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Projects */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-white/5 space-y-3">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">Projects Section</span>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Eyebrow</label>
              <input
                type="text"
                required
                value={projectsEyebrow}
                onChange={(e) => setProjectsEyebrow(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Title</label>
              <input
                type="text"
                required
                value={projectsTitle}
                onChange={(e) => setProjectsTitle(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">View All Projects Button Text</label>
              <input
                type="text"
                required
                value={projectsViewAllText}
                onChange={(e) => setProjectsViewAllText(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Services */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-white/5 space-y-3">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">Services Section</span>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Eyebrow</label>
              <input
                type="text"
                required
                value={servicesEyebrow}
                onChange={(e) => setServicesEyebrow(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Title</label>
              <input
                type="text"
                required
                value={servicesTitle}
                onChange={(e) => setServicesTitle(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Services Intro Description</label>
              <textarea
                rows={2}
                value={servicesIntro || ""}
                onChange={(e) => setServicesIntro(e.target.value)}
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none resize-y"
              />
            </div>
          </div>

          {/* Timeline Section & Column Headings */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-white/5 space-y-3 md:col-span-2">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
              Education & Certifications Timeline
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Section Eyebrow</label>
                <input
                  type="text"
                  required
                  value={timelineEyebrow}
                  onChange={(e) => {
                    setTimelineEyebrow(e.target.value);
                    setEducationEyebrow(e.target.value);
                  }}
                  className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Section Title</label>
                <input
                  type="text"
                  required
                  value={timelineTitle}
                  onChange={(e) => {
                    setTimelineTitle(e.target.value);
                    setEducationTitle(e.target.value);
                  }}
                  className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Education Intro Paragraph</label>
                <textarea
                  rows={2}
                  value={educationIntro || ""}
                  onChange={(e) => setEducationIntro(e.target.value)}
                  className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none resize-y"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Quick-Contact Card Title</label>
                <input
                  type="text"
                  required
                  value={educationQuickContactTitle}
                  onChange={(e) => setEducationQuickContactTitle(e.target.value)}
                  className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Quick-Contact Card Text</label>
                <input
                  type="text"
                  required
                  value={educationQuickContactText}
                  onChange={(e) => setEducationQuickContactText(e.target.value)}
                  className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* "Let's Work Together" Card Copy */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-white/5 space-y-3 md:col-span-2">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
              &quot;Let&apos;s Work Together&quot; Card Copy (Services / Education Row)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Card Title</label>
                <input
                  type="text"
                  required
                  value={letWorkTogetherTitle}
                  onChange={(e) => setLetWorkTogetherTitle(e.target.value)}
                  placeholder="Let's Work Together"
                  className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Button CTA Text</label>
                <input
                  type="text"
                  required
                  value={letWorkTogetherCtaText}
                  onChange={(e) => setLetWorkTogetherCtaText(e.target.value)}
                  placeholder="Get In Touch"
                  className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Card Description</label>
              <textarea
                required
                rows={2}
                value={letWorkTogetherText}
                onChange={(e) => setLetWorkTogetherText(e.target.value)}
                placeholder="Have a project in mind or just want to say hello? I'd love to hear from you."
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl p-3 text-xs text-white outline-none resize-y"
              />
            </div>
          </div>

          {/* Contact Popup Modal Copy */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-white/5 space-y-3 md:col-span-2">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
              Contact Form Popup Modal Copy
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Modal Dialog Title</label>
                <input
                  type="text"
                  required
                  value={contactPopupTitle}
                  onChange={(e) => setContactPopupTitle(e.target.value)}
                  placeholder="Get In Touch"
                  className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Success Message</label>
                <input
                  type="text"
                  required
                  value={contactPopupSuccessMessage}
                  onChange={(e) => setContactPopupSuccessMessage(e.target.value)}
                  placeholder="Thanks! Your message was sent successfully."
                  className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Modal Subtitle / Instructions</label>
              <textarea
                required
                rows={2}
                value={contactPopupSubtitle}
                onChange={(e) => setContactPopupSubtitle(e.target.value)}
                placeholder="Send me a message and I'll get back to you as soon as possible."
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl p-3 text-xs text-white outline-none resize-y"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Action Bar on Mobile */}
      <div className="sticky bottom-4 z-20 flex justify-end pt-2 bg-[#090a0f]/95 backdrop-blur-md p-3.5 -mx-2 sm:mx-0 rounded-2xl border border-white/10 shadow-2xl sm:static sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:border-none sm:shadow-none">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-xl font-semibold text-xs sm:text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Save Homepage Settings</span>
        </button>
      </div>
    </form>
  );
}
