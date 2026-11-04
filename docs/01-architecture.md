# 01 - Architecture & System Design
**Project:** Rohan.Dev Personal Portfolio & Admin CMS  
**Role / Persona:** Full Stack Developer & AI Engineer  
**Date:** October 2026  
**Status:** Planning (Phase 0)

---

## 1. System Overview

Rohan.Dev is a production-grade personal portfolio and content management system built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL (hosted on Neon), and Prisma ORM.

The system decouples content authoring from source code:
1. **Public Portfolio (`/`)**: A high-performance, dynamic-yet-cached client-facing experience showcasing Rohan's work, AI engineering capabilities, tech stack, education/certifications, services, and contact channel.
2. **Admin CMS (`/admin`)**: A secured, enterprise-grade back-office application with full CRUD capabilities, visibility toggles, drag-and-drop reordering, media asset uploads, theme customization, SEO controls, and lead management.
3. **Data & Storage Layer**: PostgreSQL on Neon with connection pooling for serverless execution; Cloudinary for signed media and PDF storage; Prisma ORM for type-safe schema definitions and migrations.

```
+---------------------------------------------------------------------------------------+
|                                    Client Browser                                     |
+---------------------------------------------------------------------------------------+
            |                                                     |
            | (Public Read: /)                                    | (Admin Session: /admin)
            v                                                     v
+-------------------------------+                     +---------------------------------+
|     Public Portfolio UI       |                     |         Admin CMS UI            |
| - Hero, About, Skills         |                     | - Stats, CRUD Tables            |
| - Projects, Services, Timeline|                     | - Image & PDF Uploads           |
| - Contact Form & SEO          |                     | - Settings, Visibility & Theme  |
+-------------------------------+                     +---------------------------------+
            |                                                     |
            | Server Render / Read                                | Server Actions / Mutations
            v                                                     v
+---------------------------------------------------------------------------------------+
|                               Next.js 16 App Server Layer                              |
| - Server Components (SSR / Cache Tags)                                                |
| - NextAuth.js / Auth.js Middleware & Session Verification                              |
| - Zod Server Validation & Sanitization                                                |
| - On-Demand Cache Invalidation (`revalidateTag`, `revalidatePath`)                    |
+---------------------------------------------------------------------------------------+
            |                                                     |
            | Query Engine                                        | Signed Uploads
            v                                                     v
+-------------------------------+                     +---------------------------------+
|   PostgreSQL on Neon (Prisma) |                     |           Cloudinary            |
| - Admin Users & Profile       |                     | - Project Screenshots           |
| - Projects & Skill Categories |                     | - Profile Avatars & OG Images   |
| - Theme, SEO, Settings        |                     | - PDF Resumes & Certificates    |
| - Messages & Contact Leads    |                     +---------------------------------+
+-------------------------------+
```

---

## 2. Directory & Folder Structure

```
my-portfolio/
├── docs/                                  # Phase 0 Architecture & Specs
│   ├── 01-architecture.md
│   ├── 02-database-schema.md
│   ├── 03-authentication.md
│   ├── 04-routes.md
│   ├── 05-ui-design.md
│   ├── 06-components.md
│   ├── 07-security.md
│   └── 08-implementation-phases.md
├── prisma/
│   ├── schema.prisma                      # Normalized schema definitions
│   ├── seed.ts                            # Initial admin & clean seed defaults
│   └── migrations/                        # Versioned SQL migrations
├── public/                                # Static fallback assets & favicons
├── src/ (or app/ & lib/)
│   ├── app/
│   │   ├── (public)/                      # Route group for public portfolio
│   │   │   ├── layout.tsx                 # Public layout (Header, Footer, ThemeProvider)
│   │   │   ├── page.tsx                   # Main one-page portfolio layout
│   │   │   ├── projects/[slug]/page.tsx   # Detailed project view / fallback
│   │   │   └── not-found.tsx              # Bespoke 404 page
│   │   ├── (auth)/                        # Route group for authentication
│   │   │   ├── login/
│   │   │   │   └── page.tsx               # Minimal, hardened Admin Login
│   │   │   └── layout.tsx
│   │   ├── admin/                         # Protected Admin CMS route tree
│   │   │   ├── layout.tsx                 # Admin layout (Sidebar, Header, Shell)
│   │   │   ├── page.tsx                   # Admin Overview & Real Analytics
│   │   │   ├── profile/page.tsx           # Profile & Bio Management
│   │   │   ├── projects/                  # Project CRUD & Reordering
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── skills/page.tsx            # Skills & Category Management
│   │   │   ├── services/page.tsx          # Services Management
│   │   │   ├── education/page.tsx         # Education & Certifications Timeline
│   │   │   ├── homepage/page.tsx          # Hero CTA, Section Toggles
│   │   │   ├── messages/page.tsx          # Contact Inquiries & Reader
│   │   │   ├── seo/page.tsx               # Meta, Social Cards, Favicon
│   │   │   ├── theme/page.tsx             # Accent color & Mode defaults
│   │   │   └── settings/page.tsx          # General Site Settings, Links, Resume
│   │   ├── api/                           # API Route Handlers
│   │   │   ├── auth/[...nextauth]/route.ts # NextAuth Route
│   │   │   ├── contact/route.ts           # Public Contact Form Handler
│   │   │   └── uploads/sign/route.ts      # Cloudinary Signed Signature Generator
│   │   ├── globals.css                    # Tailwind CSS v4 entry
│   │   ├── layout.tsx                     # Root HTML & Font setup
│   │   └── robots.ts / sitemap.ts         # Dynamic SEO indexers
│   ├── components/
│   │   ├── public/                        # Public UI sections
│   │   │   ├── Navbar.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── SkillsSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── ProjectModal.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── TimelineSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   └── Footer.tsx
│   │   ├── admin/                         # Admin CMS components
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   └── StatCard.tsx
│   │   └── ui/                            # Shared primitive components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Textarea.tsx
│   │       ├── Switch.tsx
│   │       ├── Badge.tsx
│   │       ├── Dialog.tsx
│   │       ├── Toast.tsx
│   │       └── Skeleton.tsx
│   ├── lib/
│   │   ├── prisma.ts                      # Singleton Prisma Client (connection pooled)
│   │   ├── auth.ts                        # Auth configuration & helper utilities
│   │   ├── validations/                   # Zod schemas for forms and mutations
│   │   │   ├── auth.schema.ts
│   │   │   ├── project.schema.ts
│   │   │   ├── skill.schema.ts
│   │   │   ├── message.schema.ts
│   │   │   └── settings.schema.ts
│   │   ├── actions/                       # Next.js Server Actions (mutations)
│   │   │   ├── project.actions.ts
│   │   │   ├── skill.actions.ts
│   │   │   ├── service.actions.ts
│   │   │   ├── timeline.actions.ts
│   │   │   ├── settings.actions.ts
│   │   │   └── message.actions.ts
│   │   ├── queries/                       # Data fetching layer (public & admin)
│   │   │   ├── public.queries.ts
│   │   │   └── admin.queries.ts
│   │   ├── cloudinary.ts                  # Cloudinary signature & upload helper
│   │   ├── rate-limiter.ts                # In-memory / edge rate limiter
│   │   └── utils.ts                       # Utility helpers (cn, formatting)
│   ├── middleware.ts                      # NextAuth route protection & security headers
│   └── types/                             # Type definitions
```

---

## 3. Rendering Strategy & Data Lifecycle

Next.js 16 App Router handles rendering with precise caching controls. The application uses a hybrid rendering model tailored to public performance and admin dynamism.

### 3.1 Public Routes (`/`, `/projects/[slug]`)
* **Strategy**: Server-Side Rendered with On-Demand Revalidation (`revalidateTag`).
* **Caching**:
  - The public page queries data tagged with granular cache tags:
    - `portfolio:profile`
    - `portfolio:homepage`
    - `portfolio:skills`
    - `portfolio:projects`
    - `portfolio:services`
    - `portfolio:education`
    - `portfolio:settings`
    - `portfolio:theme`
  - While cache components are active, the public portfolio serves cached HTML instantly.
  - When an admin updates any content in the dashboard, the corresponding Server Action calls `revalidateTag('portfolio:<section>')` and `revalidatePath('/')`.
  - Next.js purges the server cache, so the very next visitor (and the admin viewing the public tab) immediately receives the fresh database content.
* **Edge / Client Performance**:
  - Critical CSS is inlined; static font weights are optimized with `next/font`.
  - Heavy client interactive widgets (e.g., project modal, contact form, animated canvas) hydrate lazily without blocking the primary HTML stream.

### 3.2 Admin Routes (`/admin/*`)
* **Strategy**: Dynamic Server Rendering (SSR).
* **Caching**: Opted out of caching (`export const dynamic = 'force-dynamic'` / dynamic requests with `instant = false`).
* **Rationale**: Admin dashboards must reflect immediate database state without intermediate cache stale periods. All metrics, table rows, and status indicators compute live from Neon PostgreSQL.

### 3.3 Dynamic SEO (`sitemap.xml`, `robots.txt`, OpenGraph)
* Generated dynamically from Prisma queries (`Project` slugs, `SeoSettings`).
* Revalidated automatically whenever SEO settings or project slugs change.

---

## 4. How Public Content Connects to Admin CMS & Database

The core promise of **Rohan.Dev** is that **no content is hardcoded**, and **no source code changes are required** to update the website.

### Data Flow Diagram

```
+----------------------------------------------------------------------------------------+
| 1. ADMIN ACTION: Admin updates a project description or toggles visibility in /admin   |
+----------------------------------------------------------------------------------------+
                                           |
                                           v
+----------------------------------------------------------------------------------------+
| 2. VALIDATION & AUTH: Next.js Server Action (`updateProject`) verifies:                |
|    - Valid Admin Session (Auth.js)                                                     |
|    - Server-side Zod Schema conformance                                                |
+----------------------------------------------------------------------------------------+
                                           |
                                           v
+----------------------------------------------------------------------------------------+
| 3. PERSISTENCE: Mutation executed against Neon PostgreSQL via Prisma Client            |
|    - Updates `Project` record in DB                                                    |
+----------------------------------------------------------------------------------------+
                                           |
                                           v
+----------------------------------------------------------------------------------------+
| 4. REVALIDATION: Server Action invokes:                                                |
|    `revalidateTag('portfolio:projects')`                                               |
|    `revalidatePath('/')`                                                               |
+----------------------------------------------------------------------------------------+
                                           |
                                           v
+----------------------------------------------------------------------------------------+
| 5. INSTANT REFLECTION: Next.js cache purges the stale public representation.           |
|    Subsequent request to `/` executes `getPublicProjects()` which filters:             |
|    `WHERE published = true`                                                            |
|    The updated data appears on the live public site without a build or redeploy.       |
+----------------------------------------------------------------------------------------+
```

### Section-by-Section Data Mapping

| Section | Database Model | Visibility Controller | Order Controller |
| :--- | :--- | :--- | :--- |
| **Hero / Landing** | `HomepageContent` | `HomepageContent.heroVisible` | Fixed top position |
| **About Me** | `Profile`, `SiteSettings` | `HomepageContent.aboutVisible` | Follows Hero |
| **Tech Stack & Skills** | `SkillCategory`, `Skill` | `HomepageContent.skillsVisible` + `Skill.visible` | `SkillCategory.order`, `Skill.order` |
| **Featured Projects** | `Project`, `ProjectImage` | `HomepageContent.projectsVisible` + `Project.published` | `Project.featuredOrder`, `Project.order` |
| **Services** | `Service` | `HomepageContent.servicesVisible` + `Service.visible` | `Service.order` |
| **Education & Certs** | `Education`, `Certification` | `HomepageContent.timelineVisible` + `.visible` | `Education.startDate DESC`, `Certification.order` |
| **Contact** | `SiteSettings`, `ContactMessage` | `HomepageContent.contactVisible` | Bottom section |
| **Social Links** | `SocialLink` | `SocialLink.visible` | `SocialLink.order` |
| **Footer** | `SiteSettings` | Always present | Bottom anchor |
| **Theme & Accent** | `ThemeSettings` | N/A (applied globally) | Applied to CSS variables |
| **SEO & Meta** | `SeoSettings` | N/A | Dynamic `generateMetadata()` in `layout.tsx` |

---

## 5. Technology Justifications

1. **Next.js 16 (App Router) + React 19**: Provides state-of-the-art Server Components, Server Actions for zero-boilerplate RPC mutations, streaming, and on-demand cache revalidation.
2. **Neon PostgreSQL**: Serverless branching database with automatic scale-to-zero during development and connection pooling via PgBouncer for high-traffic serverless deployment.
3. **Prisma ORM**: Strict TypeScript types generated directly from the schema, ensuring compile-time safety across both Server Actions and query layers.
4. **Tailwind CSS v4**: Zero-runtime, lightning-fast compiler utilizing modern `@theme` variables, allowing instant dynamic accent color theming via CSS custom properties.
5. **NextAuth.js (Auth.js) + bcryptjs**: Industry standard cookie-based JWT authentication with HMAC encryption, CSRF protection, and configurable expiry.
6. **Cloudinary**: Cloud-native media service with signed direct uploads, automated WebP/AVIF formatting, responsive image transformations, and secure raw asset storage for PDF resumes.
7. **Zod**: Single source of truth for input validation on both client forms (React Hook Form resolver) and server endpoints (Server Actions).
