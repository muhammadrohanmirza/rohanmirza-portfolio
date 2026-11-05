import { z } from "zod";

const urlOrPath = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//i.test(val),
    "Must be a valid URL or path"
  );

export const ProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(60),
  title: z.string().trim().min(2, "Title is required").max(100),
  bio: z.string().trim().min(10, "Bio must be at least 10 characters"),
  avatarUrl: urlOrPath.optional().nullable().or(z.literal("")),
  aboutImageUrl: urlOrPath.optional().nullable().or(z.literal("")),
  resumeUrl: urlOrPath.optional().nullable().or(z.literal("")),
  yearsOfExp: z.number().int().min(0).max(50).optional().nullable(),
  location: z.string().trim().max(100).optional().nullable(),
  availableShow: z.boolean().default(true),
  availableFor: z.string().trim().max(120).optional().nullable(),
  availableStatusColor: z.enum(["green", "amber", "red"]).default("green"),
  coreFocusLabel: z.string().trim().max(50).optional().nullable(),
  coreFocusValue: z.string().trim().max(100).optional().nullable(),
  aboutHeading: z.string().trim().max(120).optional().nullable().default("Turning Ideas Into Digital Reality"),
});

export const SiteSettingsSchema = z.object({
  brandName: z.string().trim().min(1).max(50).default("Rohan.Dev"),
  brandMonogram: z.string().trim().min(1).max(5).default("R"),
  contactEmail: z.string().trim().email("Valid email required").max(150),
  contactPhone: z.string().trim().max(50).optional().nullable().or(z.literal("")),
  footerText: z.string().trim().min(5).max(300),
  copyrightNotice: z.string().trim().min(5).max(150),
});

export const HomepageContentSchema = z.object({
  heroGreeting: z.string().trim().max(50).default("Hello, I'm"),
  heroName: z.string().trim().max(100).default("Rohan Mirza"),
  heroNamePrefix: z.string().trim().max(50).optional().nullable().default("Rohan"),
  heroNameHighlight: z.string().trim().max(100).default("Mirza"),
  heroHeading: z.string().trim().max(100).default("Hi, I'm Rohan"),
  heroSubheading: z.string().trim().max(250).default("Full Stack Developer & AI Engineer"),
  heroTagline: z.string().trim().max(500).default("Turning complex AI capabilities into elegant, performant digital realities."),
  heroParagraph: z.string().trim().max(1000).optional().nullable().or(z.literal("")),
  primaryCtaText: z.string().trim().max(50).default("View My Work"),
  primaryCtaLink: z.string().trim().max(200).default("#projects"),
  secondaryCtaText: z.string().trim().max(50).default("Contact Me"),
  secondaryCtaLink: z.string().trim().max(200).default("#contact"),

  // Hero Quick Tech Badges & Navbar CTA
  heroTechBadges: z.array(z.string().trim()).default([]),
  heroUseFeaturedSkills: z.boolean().default(false),

  // Hero Typewriter Effect
  heroEnableTypewriter: z.boolean().default(true),
  heroTypewriterPhrases: z.array(z.string().trim()).default(["Full Stack Developer & AI Engineer"]),
  heroTypewriterSpeed: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase().trim() : val),
    z.enum(["slow", "normal", "fast"]).default("normal")
  ),
  heroTypewriterLoop: z.boolean().default(true),
  heroTypewriterName: z.boolean().default(true),

  // Hero Right Tagline Block
  heroShowTaglineWords: z.boolean().default(true),
  heroTaglineWords: z.array(z.string().trim()).default(["Code", "Build", "Innovate"]),
  heroImageUrl: urlOrPath.optional().nullable().or(z.literal("")),

  navbarCtaText: z.string().trim().min(1).max(50).default("Let's Connect"),
  navbarCtaLink: z.string().trim().min(1).max(200).default("#contact"),

  // Section Headings & Intro Copy
  aboutEyebrow: z.string().trim().min(1).max(100).default("ABOUT ME"),
  aboutTitle: z.string().trim().min(1).max(100).default("Who *I Am*"),
  skillsEyebrow: z.string().trim().min(1).max(100).default("TECH STACK"),
  skillsTitle: z.string().trim().min(1).max(100).default("Technologies *I Work With*"),
  projectsEyebrow: z.string().trim().min(1).max(100).default("MY PROJECTS"),
  projectsTitle: z.string().trim().min(1).max(100).default("Featured *Projects*"),
  projectsViewAllText: z.string().trim().min(1).max(50).default("View All Projects"),
  servicesEyebrow: z.string().trim().min(1).max(100).default("SERVICES"),
  servicesTitle: z.string().trim().min(1).max(100).default("What *I Do*"),
  servicesIntro: z.string().trim().max(1000).optional().nullable(),
  educationEyebrow: z.string().trim().min(1).max(100).default("EDUCATION"),
  educationTitle: z.string().trim().min(1).max(100).default("My *Education*"),
  timelineEyebrow: z.string().trim().min(1).max(100).default("EDUCATION"),
  timelineTitle: z.string().trim().min(1).max(100).default("My *Education*"),
  educationIntro: z.string().trim().max(1000).optional().nullable(),
  educationQuickContactTitle: z.string().trim().min(1).max(100).default("Feel free to contact me"),
  educationQuickContactText: z.string().trim().min(1).max(500).default("I'm always open to discussing new projects, ideas or opportunities."),
  timelineEducationHeading: z.string().trim().min(1).max(100).default("Education"),
  timelineCertificationsHeading: z.string().trim().min(1).max(100).default("Certifications"),
  contactEyebrow: z.string().trim().min(1).max(100).default("CONTACT"),
  contactTitle: z.string().trim().min(1).max(100).default("Get in *Touch*"),
  contactPitchHeadline: z.string().trim().min(1).max(200).default("Let's build intelligent web applications together."),
  contactPitchText: z.string().trim().min(1).max(1000).default("Whether you are looking to architect a Next.js platform, integrate LLM/agent pipelines, or build robust backend systems, feel free to reach out."),

  // "Let's Work Together" card
  letWorkTogetherTitle: z.string().trim().default("Let's Work Together"),
  letWorkTogetherText: z.string().trim().default("Have a project in mind or just want to say hello? I'd love to hear from you."),
  letWorkTogetherCtaText: z.string().trim().default("Get In Touch"),

  // Contact Popup
  contactPopupTitle: z.string().trim().default("Get In Touch"),
  contactPopupSubtitle: z.string().trim().default("Send me a message and I'll get back to you as soon as possible."),
  contactPopupSuccessMessage: z.string().trim().default("Thanks! Your message was sent successfully."),

  // Section Visibility Toggles
  heroVisible: z.boolean().default(true),
  heroShow3D: z.boolean().default(false),
  aboutVisible: z.boolean().default(true),
  skillsVisible: z.boolean().default(true),
  projectsVisible: z.boolean().default(true),
  servicesVisible: z.boolean().default(true),
  timelineVisible: z.boolean().default(true),
  contactVisible: z.boolean().default(true),
});

export const ThemeSettingsSchema = z.object({
  defaultMode: z.enum(["LIGHT", "DARK", "SYSTEM"]).default("LIGHT"),
  accentColor: z.enum(["BLUE", "EMERALD", "CYAN", "INDIGO", "VIOLET", "AMBER", "ROSE"]).default("INDIGO"),
  enableGradients: z.boolean().default(true),
});

export const SeoSettingsSchema = z.object({
  siteTitle: z.string().trim().min(5).max(100),
  metaDescription: z.string().trim().min(10).max(300),
  keywords: z.string().trim().max(300),
  ogImageUrl: urlOrPath.optional().nullable().or(z.literal("")),
  faviconUrl: urlOrPath.optional().nullable().or(z.literal("")),
  twitterHandle: z.string().trim().max(50).optional().nullable(),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
export type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>;
export type HomepageContentInput = z.infer<typeof HomepageContentSchema>;
export type ThemeSettingsInput = z.infer<typeof ThemeSettingsSchema>;
export type SeoSettingsInput = z.infer<typeof SeoSettingsSchema>;
