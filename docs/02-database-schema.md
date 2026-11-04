# 02 - Database Schema & Data Models
**Project:** Rohan.Dev Personal Portfolio & Admin CMS  
**Role / Persona:** Full Stack Developer & AI Engineer  
**Date:** October 2026  
**Status:** Planning (Phase 0)

---

## 1. Schema Overview & Design Philosophy

The database schema is normalized, strongly typed, and structured around PostgreSQL hosted on Neon. Every dynamic entity has:
- Audit timestamps (`createdAt`, `updatedAt`)
- Visibility/Publication flags (`published` or `visible`)
- Sort ordering (`order` integer) for user-driven reordering
- Appropriate indices on query filters (`published`, `visible`, `slug`, `category`, `createdAt`)
- Cascade deletes on dependent relations (e.g. `ProjectImage` when `Project` is deleted)

---

## 2. Complete Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ---------------------------------------------------------
// AUTHENTICATION & ACCESS CONTROL
// ---------------------------------------------------------

enum UserRole {
  ADMIN
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         UserRole  @default(ADMIN)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([email])
}

// ---------------------------------------------------------
// PROFILE & GENERAL SETTINGS
// ---------------------------------------------------------

model Profile {
  id            String   @id @default(cuid())
  name          String   @default("Rohan")
  title         String   @default("Full Stack Developer & AI Engineer")
  bio           String   @db.Text
  avatarUrl     String?  // Cloudinary image URL
  resumeUrl     String?  // Cloudinary PDF URL
  yearsOfExp    Int?
  location      String?  @default("[Your Location]")
  availableFor  String?  @default("Available for AI & Full Stack Opportunities")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SiteSettings {
  id              String   @id @default(cuid())
  contactEmail    String   @default("contact@rohan.dev")
  footerText      String   @default("Built with Next.js, TypeScript & Neon PostgreSQL.")
  copyrightNotice String   @default("© [Year] Rohan.Dev. All rights reserved.")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model HomepageContent {
  id               String   @id @default(cuid())
  heroHeading      String   @default("Hi, I'm Rohan")
  heroSubheading   String   @default("Full Stack Developer & AI Engineer crafting intelligent web platforms and scalable backends.")
  heroTagline      String   @default("Turning complex AI capabilities into elegant, performant digital realities.")
  primaryCtaText   String   @default("Explore Projects")
  primaryCtaLink   String   @default("#projects")
  secondaryCtaText String   @default("Get in Touch")
  secondaryCtaLink String   @default("#contact")

  // Hero Tech Badges
  heroTechBadges        String[] @default(["Next.js 16", "React 19", "TypeScript", "Python", "FastAPI", "OpenAI / LLMs", "MCP", "PostgreSQL"])
  heroUseFeaturedSkills Boolean  @default(false)

  // Hero Typewriter Effect
  heroEnableTypewriter  Boolean  @default(true)
  heroTypewriterPhrases String[] @default(["Full Stack Developer & AI Engineer"])
  heroTypewriterSpeed   String   @default("normal") // "slow" | "normal" | "fast"
  heroTypewriterLoop    Boolean  @default(true)

  // Section Visibility Toggles
  heroVisible      Boolean  @default(true)
  aboutVisible     Boolean  @default(true)
  skillsVisible    Boolean  @default(true)
  projectsVisible  Boolean  @default(true)
  servicesVisible  Boolean  @default(true)
  timelineVisible  Boolean  @default(true)
  contactVisible   Boolean  @default(true)

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// ---------------------------------------------------------
// THEME & SEO SETTINGS
// ---------------------------------------------------------

enum ThemeMode {
  LIGHT
  DARK
  SYSTEM
}

enum AccentColor {
  EMERALD   // #10b981
  CYAN      // #06b6d4
  INDIGO    // #6366f1
  VIOLET    // #8b5cf6
  AMBER     // #f59e0b
  ROSE      // #f43f5e
}

model ThemeSettings {
  id              String      @id @default(cuid())
  defaultMode     ThemeMode   @default(DARK)
  accentColor     AccentColor @default(CYAN)
  enableGradients Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model SeoSettings {
  id             String   @id @default(cuid())
  siteTitle      String   @default("Rohan.Dev | Full Stack Developer & AI Engineer")
  metaDescription String  @default("Portfolio of Rohan - Full Stack Developer & AI Engineer specializing in Next.js, Python, LLMs, and high-performance web systems.")
  keywords       String   @default("Full Stack Developer, AI Engineer, Next.js, TypeScript, Python, FastAPI, OpenAI, LangChain, MCP, Neon")
  ogImageUrl     String?  // Cloudinary image
  faviconUrl     String?  // Cloudinary icon
  twitterHandle  String?  @default("@rohandev")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

// ---------------------------------------------------------
// PROJECTS
// ---------------------------------------------------------

model Project {
  id            String         @id @default(cuid())
  title         String
  slug          String         @unique
  summary       String         @db.VarChar(300)
  description   String         @db.Text
  featured      Boolean        @default(false)
  featuredOrder Int            @default(0)
  published     Boolean        @default(true)
  order         Int            @default(0)
  techStack     String[]       // e.g. ["Next.js", "FastAPI", "OpenAI", "PostgreSQL"]
  githubUrl     String?
  liveUrl       String?
  images        ProjectImage[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([published, order])
  @@index([featured, featuredOrder])
  @@index([slug])
}

model ProjectImage {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  url       String   // Cloudinary secure URL
  altText   String   @default("Project preview")
  order     Int      @default(0)
  createdAt DateTime @default(now())

  @@index([projectId, order])
}

// ---------------------------------------------------------
// SKILLS & CATEGORIES
// ---------------------------------------------------------

model SkillCategory {
  id        String   @id @default(cuid())
  name      String   @unique // e.g. "AI & Machine Learning", "Frontend Development", "Backend & Databases"
  order     Int      @default(0)
  visible   Boolean  @default(true)
  skills    Skill[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([order])
  @@index([visible])
}

model Skill {
  id         String        @id @default(cuid())
  name       String        // e.g. "Next.js", "Python", "OpenAI"
  categoryId String
  category   SkillCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  iconName   String?       // Lucide icon name or null
  proficiency Int?         // 1-100 or null if badges only
  order      Int           @default(0)
  visible    Boolean       @default(true)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@index([categoryId, order])
  @@index([visible])
}

// ---------------------------------------------------------
// SERVICES
// ---------------------------------------------------------

model Service {
  id          String   @id @default(cuid())
  title       String   // e.g. "Full-Stack Web Development", "AI Agent & LLM Integration"
  description String   @db.Text
  iconName    String   @default("Code") // Lucide React icon string
  order       Int      @default(0)
  visible     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([order])
  @@index([visible])
}

// ---------------------------------------------------------
// EDUCATION & CERTIFICATIONS
// ---------------------------------------------------------

model Education {
  id           String    @id @default(cuid())
  institution  String
  degree       String
  fieldOfStudy String?
  startDate    DateTime
  endDate      DateTime? // Null if currently pursuing
  description  String?   @db.Text
  visible      Boolean   @default(true)
  order        Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([visible, order])
}

model Certification {
  id             String    @id @default(cuid())
  title          String
  issuer         String
  issueDate      DateTime?
  expiryDate     DateTime?
  credentialId   String?
  credentialUrl  String?
  certificateUrl String?   // Cloudinary image/PDF
  visible        Boolean   @default(true)
  order          Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([visible, order])
}

// ---------------------------------------------------------
// SOCIAL LINKS
// ---------------------------------------------------------

model SocialLink {
  id        String   @id @default(cuid())
  platform  String   // e.g. "GitHub", "LinkedIn", "Twitter/X", "Email"
  url       String
  iconName  String   // Lucide icon key: "Github", "Linkedin", "Twitter", "Mail"
  order     Int      @default(0)
  visible   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([order])
  @@index([visible])
}

// ---------------------------------------------------------
// CONTACT MESSAGES (LEADS)
// ---------------------------------------------------------

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String?
  message   String   @db.Text
  isRead    Boolean  @default(false)
  ipHash    String?  // Hashed IP for rate limiting audits
  userAgent String?
  createdAt DateTime @default(now())

  @@index([isRead, createdAt])
  @@index([createdAt])
}
```

---

## 3. Seed Strategy & Clean Initial Defaults

Per user instructions, **no false achievements, testimonials, fake employer metrics, or fake links** may be seeded.

### Known Entity Defaults:
1. **Admin User**: Created exclusively via environment variables (`ADMIN_EMAIL` and `ADMIN_PASSWORD`), hashed with `bcryptjs` (salt rounds = 12). If credentials are not set, setup stops with an informative CLI message.
2. **Profile**:
   - `name`: "Rohan"
   - `title`: "Full Stack Developer & AI Engineer"
   - `bio`: "[Bio placeholder: Passionate full-stack developer and AI engineer building modern web applications with Next.js, Python, and intelligent agent systems.]"
   - `avatarUrl`: null (falls back to a sleek SVG avatar in UI)
   - `resumeUrl`: null (Resume button remains gracefully hidden until uploaded)
3. **Known Skills**:
   - Categorized strictly by actual expertise:
     - **AI & Intelligent Systems**: `Python`, `FastAPI`, `OpenAI`, `AI Application Development`, `MCP`
     - **Frontend & Modern Web**: `Next.js`, `React`, `TypeScript`, `Tailwind CSS`
     - **Backend & Data**: `Database Technologies` (PostgreSQL, Prisma)
4. **Known Projects**:
   - **LearnSphere AI**:
     - `summary`: "[LearnSphere AI placeholder summary: An AI-powered adaptive learning platform designed to personalize educational paths.]"
     - `techStack`: `["Next.js", "TypeScript", "Python", "OpenAI", "PostgreSQL"]`
     - `githubUrl`: null
     - `liveUrl`: null
     - `featured`: true
   - **CampusCoin**:
     - `summary`: "[CampusCoin placeholder summary: A digital campus transaction and reward management ecosystem.]"
     - `techStack`: `["Next.js", "React", "TypeScript", "Tailwind CSS", "Database Technologies"]`
     - `githubUrl`: null
     - `liveUrl`: null
     - `featured`: true
   - **Adventure Quest**:
     - `summary`: "[Adventure Quest placeholder summary: An interactive web application bringing gamified exploration to life.]"
     - `techStack`: `["React", "TypeScript", "Tailwind CSS"]`
     - `githubUrl`: null
     - `liveUrl`: null
     - `featured`: true
5. **Services**:
   - Placeholder services clearly designated: "Full-Stack Web Development", "AI & LLM Integration", "API & Database Architecture".
6. **Education & Certifications**:
   - Empty or marked placeholder entries with `visible: false` or clearly marked `[Education Record Placeholder]`.
7. **Social Links**:
   - Placeholder GitHub and LinkedIn entries pointing to safe `#` or empty fields until configured.

---

## 4. Database Migrations & Integrity Checks

- Migrations will be tracked under `prisma/migrations/`.
- Foreign key constraints with `ON DELETE CASCADE` guarantee no orphaned project images or skill items.
- Unique constraints prevent duplicate categories, slugs, and emails.
