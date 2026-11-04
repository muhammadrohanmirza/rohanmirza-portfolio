import { PrismaClient, UserRole, ThemeMode, AccentColor } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=================================================");
  console.log("🚀 Starting Rohan.Dev Database Seeding Engine...");
  console.log("=================================================");

  // 1. Initial Admin Provisioning
  const adminEmail = process.env.ADMIN_EMAIL || "admin@rohan.dev";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.warn("⚠️  WARNING: ADMIN_PASSWORD is not set in environment variables!");
    console.warn("   Please set ADMIN_PASSWORD in your .env file.");
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  });

  if (existingAdmin) {
    console.log(`🔒 [SETUP LOCKED]: Admin user (${existingAdmin.email}) already exists. Skipping admin creation.`);
  } else if (adminPassword) {
    console.log(`👤 Creating initial Admin user: ${adminEmail}`);
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail.toLowerCase().trim(),
        passwordHash,
        name: "Rohan",
        role: UserRole.ADMIN,
      },
    });
    console.log("✅ Admin user successfully created with bcrypt cost factor 12.");
  } else {
    console.log("⏭️  Skipping admin creation (no ADMIN_PASSWORD provided).");
  }

  // 2. Profile
  const existingProfile = await prisma.profile.findFirst();
  if (!existingProfile) {
    console.log("📝 Initializing Profile defaults...");
    await prisma.profile.create({
      data: {
        name: "Rohan",
        title: "Full Stack Developer & AI Engineer",
        bio: "Full Stack Developer & AI Engineer passionate about building high-performance web applications, resilient backend architectures, and production-ready AI systems. Specializing in modern Next.js environments, Python/FastAPI microservices, and LLM integrations.",
        location: "[Your Location - Update in Admin CMS]",
        availableFor: "Available for AI & Full Stack Opportunities",
        yearsOfExp: 3,
        avatarUrl: null, // Gracefully renders stylish SVG monogram/fallback until uploaded
        resumeUrl: null, // Gracefully hides resume button until uploaded
      },
    });
    console.log("✅ Profile initialized.");
  }

  // 3. Site Settings
  const existingSiteSettings = await prisma.siteSettings.findFirst();
  if (!existingSiteSettings) {
    console.log("⚙️  Initializing Site Settings...");
    await prisma.siteSettings.create({
      data: {
        contactEmail: "contact@rohan.dev",
        footerText: "Crafted with Next.js 16, TypeScript, Tailwind CSS & Neon PostgreSQL.",
        copyrightNotice: `© ${new Date().getFullYear()} Rohan.Dev. All rights reserved.`,
      },
    });
    console.log("✅ Site Settings initialized.");
  }

  // 4. Homepage Content & Section Visibility
  const existingHomepage = await prisma.homepageContent.findFirst();
  if (!existingHomepage) {
    console.log("🏠 Initializing Homepage Content & Section Toggles...");
    await prisma.homepageContent.create({
      data: {
        heroHeading: "Hi, I'm Rohan",
        heroSubheading: "Full Stack Developer & AI Engineer crafting intelligent web platforms and scalable backends.",
        heroTagline: "Turning complex AI capabilities into elegant, performant digital realities.",
        primaryCtaText: "Explore Projects",
        primaryCtaLink: "#projects",
        secondaryCtaText: "Get in Touch",
        secondaryCtaLink: "#contact",
        heroTechBadges: [
          "Next.js 16",
          "React 19",
          "TypeScript",
          "Python",
          "FastAPI",
          "OpenAI / LLMs",
          "MCP",
          "PostgreSQL",
        ],
        heroUseFeaturedSkills: false,
        heroEnableTypewriter: true,
        heroTypewriterPhrases: ["Full Stack Developer & AI Engineer"],
        heroTypewriterSpeed: "normal",
        heroTypewriterLoop: true,
        heroVisible: true,
        aboutVisible: true,
        skillsVisible: true,
        projectsVisible: true,
        servicesVisible: true,
        timelineVisible: true,
        contactVisible: true,
      },
    });
    console.log("✅ Homepage content initialized.");
  }

  // 5. Theme Settings
  const existingTheme = await prisma.themeSettings.findFirst();
  if (!existingTheme) {
    console.log("🎨 Initializing Theme Settings (Dark + Cyan default)...");
    await prisma.themeSettings.create({
      data: {
        defaultMode: ThemeMode.DARK,
        accentColor: AccentColor.CYAN,
        enableGradients: true,
      },
    });
    console.log("✅ Theme Settings initialized.");
  }

  // 6. SEO Settings
  const existingSeo = await prisma.seoSettings.findFirst();
  if (!existingSeo) {
    console.log("🔍 Initializing SEO & Metadata Settings...");
    await prisma.seoSettings.create({
      data: {
        siteTitle: "Rohan.Dev | Full Stack Developer & AI Engineer",
        metaDescription: "Portfolio of Rohan - Full Stack Developer & AI Engineer specializing in Next.js, Python, LLMs, and high-performance web systems.",
        keywords: "Full Stack Developer, AI Engineer, Next.js, TypeScript, Python, FastAPI, OpenAI, LangChain, MCP, Neon, React",
        twitterHandle: "@rohandev",
        ogImageUrl: null,
        faviconUrl: null,
      },
    });
    console.log("✅ SEO Settings initialized.");
  }

  // 7. Known Skills & Categories (Strict adherence: only known skills)
  const categoryCount = await prisma.skillCategory.count();
  if (categoryCount === 0) {
    console.log("⚡ Seeding Known Skills & Categories...");

    // Category 1: AI & Intelligent Systems
    const aiCategory = await prisma.skillCategory.create({
      data: {
        name: "AI & Intelligent Systems",
        order: 1,
        visible: true,
        skills: {
          create: [
            { name: "Python", order: 1, iconName: "Terminal", proficiency: 90 },
            { name: "FastAPI", order: 2, iconName: "Zap", proficiency: 88 },
            { name: "OpenAI", order: 3, iconName: "Sparkles", proficiency: 92 },
            { name: "AI Application Development", order: 4, iconName: "Cpu", proficiency: 90 },
            { name: "MCP", order: 5, iconName: "Network", proficiency: 85 },
          ],
        },
      },
    });

    // Category 2: Frontend & Modern Web
    const frontendCategory = await prisma.skillCategory.create({
      data: {
        name: "Frontend & Modern Web",
        order: 2,
        visible: true,
        skills: {
          create: [
            { name: "Next.js", order: 1, iconName: "Globe", proficiency: 95 },
            { name: "React", order: 2, iconName: "Layers", proficiency: 95 },
            { name: "TypeScript", order: 3, iconName: "Code2", proficiency: 92 },
            { name: "Tailwind CSS", order: 4, iconName: "Palette", proficiency: 94 },
          ],
        },
      },
    });

    // Category 3: Backend & Databases
    const backendCategory = await prisma.skillCategory.create({
      data: {
        name: "Backend & Databases",
        order: 3,
        visible: true,
        skills: {
          create: [
            { name: "Database Technologies", order: 1, iconName: "Database", proficiency: 88 },
          ],
        },
      },
    });

    console.log(`✅ Seeded 3 categories with known skills.`);
  }

  // 8. Known Projects (Strict adherence: LearnSphere AI, CampusCoin, Adventure Quest)
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    console.log("🚀 Seeding Known Projects with clean placeholders...");

    await prisma.project.create({
      data: {
        title: "LearnSphere AI",
        slug: "learnsphere-ai",
        summary: "An intelligent adaptive learning platform utilizing AI models to personalize student curricula and deliver context-aware feedback.",
        description: `### Overview
LearnSphere AI is an educational technology system developed to personalize learning pathways through real-time feedback and intelligent comprehension evaluation.

### Key Capabilities
- Adaptive learning progression driven by AI assessment.
- Context-aware explanations and interactive quiz generation.
- Responsive, accessible dashboard designed for educators and learners.

*(This is an initial project entry. You can update screenshots, extended documentation, and repository links directly from the /admin CMS.)*`,
        techStack: ["Next.js", "TypeScript", "Python", "OpenAI", "PostgreSQL"],
        category: "AI Systems",
        featured: true,
        featuredOrder: 1,
        published: true,
        order: 1,
        githubUrl: null, // Gracefully omitted in UI until URL is provided
        liveUrl: null,   // Gracefully omitted in UI until URL is provided
      },
    });

    await prisma.project.create({
      data: {
        title: "CampusCoin",
        slug: "campuscoin",
        summary: "A modern campus transaction and reward platform facilitating seamless student transactions and digital credit management.",
        description: `### Overview
CampusCoin is a streamlined digital transaction and student rewards ecosystem engineered to provide fast, reliable campus purchases and event incentives.

### Key Capabilities
- Instant ledger transactions and student balance tracking.
- Interactive merchant and student portals.
- Robust data integrity and high-concurrency database queries.

*(This is an initial project entry. You can update screenshots, extended documentation, and repository links directly from the /admin CMS.)*`,
        techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Database Technologies"],
        category: "Full Stack",
        featured: true,
        featuredOrder: 2,
        published: true,
        order: 2,
        githubUrl: null,
        liveUrl: null,
      },
    });

    await prisma.project.create({
      data: {
        title: "Adventure Quest",
        slug: "adventure-quest",
        summary: "An interactive, dynamic web-based exploration game featuring stateful progression and responsive visual design.",
        description: `### Overview
Adventure Quest is an engaging web exploration experience combining modern browser capabilities, stateful interactivity, and responsive character progression.

### Key Capabilities
- Dynamic browser-based quest management and inventory tracking.
- Fluid UI transitions and interactive visual effects.
- Lightweight client architecture optimized for high frame rates.

*(This is an initial project entry. You can update screenshots, extended documentation, and repository links directly from the /admin CMS.)*`,
        techStack: ["React", "TypeScript", "Tailwind CSS"],
        category: "Web Applications",
        featured: true,
        featuredOrder: 3,
        published: true,
        order: 3,
        githubUrl: null,
        liveUrl: null,
      },
    });

    console.log("✅ Seeded 3 known projects with valid initial defaults.");
  }

  // 9. Services
  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    console.log("🛠️  Seeding Services...");
    await prisma.service.createMany({
      data: [
        {
          title: "Full-Stack Web Development",
          description: "End-to-end web applications built with Next.js, React, TypeScript, and modern styling. Focused on clean architecture, lightning-fast rendering, and accessible interfaces.",
          iconName: "Layout",
          order: 1,
          visible: true,
        },
        {
          title: "AI Integration & Agent Systems",
          description: "Production integration of Large Language Models, OpenAI APIs, Model Context Protocol (MCP), and customized retrieval architectures to automate complex workflows.",
          iconName: "Bot",
          order: 2,
          visible: true,
        },
        {
          title: "API & Database Architecture",
          description: "High-throughput RESTful APIs with Python/FastAPI, resilient PostgreSQL databases via Neon & Prisma, secure authentication, and optimized connection pooling.",
          iconName: "Server",
          order: 3,
          visible: true,
        },
      ],
    });
    console.log("✅ Seeded 3 core services.");
  }

  // 10. Education & Certifications
  const educationCount = await prisma.education.count();
  if (educationCount === 0) {
    console.log("🎓 Seeding Education records...");
    await prisma.education.create({
      data: {
        institution: "[Your University / Institution]",
        degree: "Bachelor of Science / Computer Science",
        fieldOfStudy: "Computer Science & Engineering",
        startDate: new Date("2021-09-01"),
        endDate: new Date("2025-06-01"),
        description: "Specialized in distributed systems, algorithms, and artificial intelligence. [Update details via Admin CMS]",
        visible: true,
        order: 1,
      },
    });
    console.log("✅ Education records seeded.");
  }

  // 11. Social Links
  const socialCount = await prisma.socialLink.count();
  if (socialCount === 0) {
    console.log("🔗 Seeding Social Media links...");
    await prisma.socialLink.createMany({
      data: [
        { platform: "GitHub", url: "https://github.com", iconName: "Github", order: 1, visible: true },
        { platform: "LinkedIn", url: "https://linkedin.com", iconName: "Linkedin", order: 2, visible: true },
        { platform: "Twitter / X", url: "https://x.com", iconName: "Twitter", order: 3, visible: true },
      ],
    });
    console.log("✅ Social links seeded.");
  }

  console.log("=================================================");
  console.log("✨ Rohan.Dev Database Seeding Completed Successfully!");
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("❌ Error running database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
