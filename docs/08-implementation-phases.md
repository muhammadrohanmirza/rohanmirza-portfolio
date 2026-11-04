# 08 - Implementation Phases & Acceptance Criteria
**Project:** Rohan.Dev Personal Portfolio & Admin CMS  
**Role / Persona:** Full Stack Developer & AI Engineer  
**Date:** October 2026  
**Status:** Planning (Phase 0)

---

## Overview

The implementation roadmap is structured into 7 sequential phases following approval of Phase 0. Each phase builds upon the previous, produces demonstrable functionality, and concludes with a test verification report.

---

## Phase Roadmap

### Phase 1: Environment Setup, Database & Seed Engine
* **Tasks**:
  1. Install required packages: `@prisma/client`, `prisma`, `next-auth` (or Auth.js), `bcryptjs`, `@types/bcryptjs`, `zod`, `lucide-react`, `framer-motion`, `cloudinary`, `clsx`, `tailwind-merge`.
  2. Configure `prisma/schema.prisma` with all models, enums, relations, and indexes.
  3. Generate and verify database connection via Neon PostgreSQL (or local fallback during offline dev).
  4. Create seed script `prisma/seed.ts` reading `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.
  5. Seed clean placeholder data adhering strictly to content rules (no invented metrics, only known projects & skills).
* **Acceptance Criteria**:
  - `npx prisma db push` or `npx prisma migrate dev` succeeds without schema errors.
  - `npm run db:seed` executes cleanly, hashes admin password with bcryptjs (cost 12), and halts if rerun.
  - Database contains valid records for Profile, HomepageContent, SiteSettings, ThemeSettings, SeoSettings, and known Projects/Skills.

---

### Phase 2: Authentication System & Route Protection
* **Tasks**:
  1. Configure Auth.js / NextAuth.js handler with Credentials Provider.
  2. Implement login page at `/login` with clean, accessible form, loading states, and error handling.
  3. Create edge middleware `middleware.ts` protecting `/admin/:path*` and admin API endpoints.
  4. Implement `assertAdminSession()` server guard for Server Actions.
  5. Implement rate limiting on login attempts.
* **Acceptance Criteria**:
  - Visiting `/admin` while unauthenticated immediately redirects to `/login`.
  - Submitting invalid credentials shows a generic error message and decrements remaining attempts.
  - Submitting valid credentials issues an encrypted HTTP-only session cookie and redirects to `/admin`.
  - Logout cleanly destroys session and redirects to `/login`.

---

### Phase 3: Core Design System & Public Portfolio UI
* **Tasks**:
  1. Configure fonts (`Outfit`, `Inter`, `JetBrains Mono`) and CSS variables in `app/globals.css`.
  2. Build shared primitives (`Button`, `Badge`, `Dialog`, `Input`, `Textarea`, `Skeleton`).
  3. Implement public layout with Sticky Navbar (frosted glass, active anchor tracking, mobile drawer).
  4. Build public sections reading live from Prisma:
     - Hero Section (tagline, CTAs, animated subtle gradient)
     - About Me (bio, avatar, conditional resume button)
     - Tech Stack & Skills (categorized cards)
     - Featured Projects (interactive cards, "View Details" modal, conditional URLs)
     - Services (cards with Lucide icons)
     - Education & Certifications Timeline
     - Contact Form (with Honeypot, validation, and feedback states)
     - Footer (social links, copyright)
  5. Respect `prefers-reduced-motion` across all Framer Motion animations.
* **Acceptance Criteria**:
  - Page renders dynamically from database with zero hardcoded content.
  - Buttons with empty URLs (e.g. GitHub or live demo) are gracefully omitted.
  - Sections toggled off in `HomepageContent` disappear immediately.
  - Contact form submits to database with instant success feedback.

---

### Phase 4: Admin CMS Shell & Overview Dashboard
* **Tasks**:
  1. Build `/admin` layout with responsive sidebar, top bar, breadcrumb, and "View Live Site" link.
  2. Implement Overview dashboard computing **real database statistics**:
     - Total projects (split by published vs. draft)
     - Unread contact messages count
     - Total skills and categories
     - Total services and certifications
     - Recent inquiries list with quick "mark as read" action.
* **Acceptance Criteria**:
  - All numbers are real aggregates from PostgreSQL; no hardcoded stats.
  - Responsive drawer functions smoothly on mobile and tablet.

---

### Phase 5: Admin Content Management (CRUD Operations)
* **Tasks**:
  1. **Projects Manager**: Data table, add/edit forms, multi-image upload, markdown description, tech stack tags, publish toggles, reordering.
  2. **Skills Manager**: Category accordion, drag-and-drop / ordering, add/edit skills with icons and visibility toggles.
  3. **Services Manager**: Add, edit, delete, reorder services with Lucide icon selector.
  4. **Education & Certifications Manager**: Add, edit, delete timeline records and credential links.
  5. **Homepage Content Manager**: Hero text and CTA editor, 7 section visibility switches.
  6. **Messages Center**: Filterable inbox, read/unread state, delete dialog, contact details view.
  7. **Cloudinary Signed Uploader**: Direct browser-to-Cloudinary upload via `POST /api/uploads/sign`.
* **Acceptance Criteria**:
  - Every form uses Zod validation with inline error feedback.
  - Destructive actions trigger `ConfirmDialog`.
  - Every update calls `revalidateTag` / `revalidatePath`.
  - Changes made in `/admin` reflect instantly on the public website.

---

### Phase 6: Theme, SEO & Site Settings
* **Tasks**:
  1. **Theme Settings**: Curated accent color selector (Cyan, Emerald, Indigo, Violet, Amber, Rose) and mode default (Dark, Light, System).
  2. **SEO Settings**: Page title, meta description, keywords, Open Graph preview, dynamic `robots.ts` and `sitemap.ts`.
  3. **Site Settings**: Contact email, social links manager, footer text, resume PDF upload.
* **Acceptance Criteria**:
  - Changing accent color in CMS updates public CSS variables immediately.
  - Dynamic `generateMetadata()` in `layout.tsx` serves meta tags from `SeoSettings`.

---

### Phase 7: Verification, Testing & Documentation
* **Tasks**:
  1. Comprehensive testing across:
     - Authentication & route protection.
     - Direct unauthorized Server Action invocation.
     - Database persistence after server restart.
     - Contact form rate limiting & honeypot trapping.
     - Responsive layouts on mobile, tablet, and desktop.
  2. Production build verification (`npm run build`).
  3. Create comprehensive `README.md` with Windows PowerShell commands, Neon setup, Cloudinary guide, and environment variable documentation.
* **Acceptance Criteria**:
  - Zero TypeScript errors (`npm run build` succeeds).
  - All test scenarios documented and passing.
  - Complete, clear documentation delivered to the user.
