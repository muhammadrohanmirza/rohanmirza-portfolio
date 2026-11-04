# 04 - Routes, Endpoints & Server Actions
**Project:** Rohan.Dev Personal Portfolio & Admin CMS  
**Role / Persona:** Full Stack Developer & AI Engineer  
**Date:** October 2026  
**Status:** Planning (Phase 0)

---

## 1. Route Topology & Access Control Matrix

The application separates routes into three functional tiers:
1. **Public Client Tier** (`/`, `/projects/:slug`, `/api/contact`)
2. **Authentication Tier** (`/login`, `/api/auth/*`)
3. **Admin Management Tier** (`/admin/*`, `/api/uploads/*`, all Administrative Server Actions)

| Route / Action | Type | Allowed Caller | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | Page (SSR / Cached) | Anonymous (Public) | Single-page portfolio with all published sections |
| `/projects/[slug]` | Page (SSR / Cached) | Anonymous (Public) | Standalone detailed view of a published project |
| `/login` | Page (SSR) | Anonymous (Public) | Admin authentication credentials form |
| `/admin` | Page (SSR / Dynamic) | Authenticated Admin | CMS Overview, live database metrics, activity stream |
| `/admin/profile` | Page (SSR / Dynamic) | Authenticated Admin | Bio, avatar upload, resume PDF, credentials update |
| `/admin/projects` | Page (SSR / Dynamic) | Authenticated Admin | Project list table, publish toggles, reordering |
| `/admin/projects/new` | Page (SSR / Dynamic) | Authenticated Admin | Create new project with multi-image upload |
| `/admin/projects/[id]/edit` | Page (SSR / Dynamic) | Authenticated Admin | Edit project details, images, URLs, tech stack |
| `/admin/skills` | Page (SSR / Dynamic) | Authenticated Admin | Category and skill manager, ordering, toggles |
| `/admin/services` | Page (SSR / Dynamic) | Authenticated Admin | Service offerings, descriptions, icons, visibility |
| `/admin/education` | Page (SSR / Dynamic) | Authenticated Admin | Education records & certifications manager |
| `/admin/homepage` | Page (SSR / Dynamic) | Authenticated Admin | Hero text/CTA editor, section visibility toggles |
| `/admin/messages` | Page (SSR / Dynamic) | Authenticated Admin | Contact lead manager, message viewer, read/unread |
| `/admin/seo` | Page (SSR / Dynamic) | Authenticated Admin | Page titles, meta descriptions, OG images, favicon |
| `/admin/theme` | Page (SSR / Dynamic) | Authenticated Admin | Theme mode and curated accent color switcher |
| `/admin/settings` | Page (SSR / Dynamic) | Authenticated Admin | Site email, social media links, footer text |
| `POST /api/contact` | Route Handler | Anonymous (Public) | Contact form submission with rate limiting & honeypot |
| `POST /api/uploads/sign` | Route Handler | Authenticated Admin | Generate signed Cloudinary upload params & signature |
| `* /api/auth/*` | Route Handler | Public / Admin | NextAuth authentication endpoints |
| Server Actions (`*.actions.ts`) | Next.js Server Action | Authenticated Admin | Direct type-safe database mutations |

---

## 2. Public API Handlers

### 2.1 Contact Submission Endpoint: `POST /api/contact`
* **Caller**: Public website visitors.
* **Security & Safeguards**:
  - **Honeypot Field**: Form includes an off-screen `<input name="website" tabindex="-1" autocomplete="off" />`. If filled, submission is silently rejected (bot bait).
  - **IP Rate Limiting**: Max 3 submissions per IP per hour.
  - **Server-side Zod Validation**:
    - `name`: string (2 - 100 chars, trimmed, sanitized)
    - `email`: valid email string (max 255 chars)
    - `subject`: optional string (max 150 chars)
    - `message`: string (10 - 3000 chars, trimmed)
* **Response**:
  - `201 Created`: `{ success: true, message: "Thank you! Your message has been sent." }`
  - `400 Bad Request`: `{ success: false, errors: [...] }`
  - `429 Too Many Requests`: `{ success: false, error: "Too many messages sent. Please try again later." }`

---

## 3. Administrative Server Actions (Mutations)

Server Actions are used for all admin mutations to eliminate REST boilerplate and provide end-to-end type safety. Every Server Action asserts admin privileges before running.

### 3.1 Project Actions (`lib/actions/project.actions.ts`)
* `createProject(data: CreateProjectInput)`:
  - Validates `slug` uniqueness.
  - Creates project and associated images in a transaction.
  - Triggers `revalidateTag('portfolio:projects')` and `revalidatePath('/')`.
* `updateProject(id: string, data: UpdateProjectInput)`:
  - Updates project fields, tech stack, URLs, and image relations.
  - Revalidates cache tags.
* `deleteProject(id: string)`:
  - Deletes project (cascades to `ProjectImage`).
  - Revalidates cache tags.
* `toggleProjectPublish(id: string, published: boolean)`:
  - Instantly publishes/unpublishes a project.
  - Immediately purges public cache.
* `reorderProjects(orderedIds: string[])`:
  - Bulk updates `order` field for listed project IDs.

### 3.2 Skill & Category Actions (`lib/actions/skill.actions.ts`)
* `createCategory(data: CreateCategoryInput)` / `updateCategory(id, data)` / `deleteCategory(id)`
* `createSkill(data: CreateSkillInput)` / `updateSkill(id, data)` / `deleteSkill(id)`
* `reorderCategories(orderedIds: string[])`
* `reorderSkills(categoryId: string, orderedIds: string[])`
* Triggers `revalidateTag('portfolio:skills')`.

### 3.3 Service Actions (`lib/actions/service.actions.ts`)
* `createService(data: CreateServiceInput)`
* `updateService(id: string, data: UpdateServiceInput)`
* `deleteService(id: string)`
* `toggleServiceVisibility(id: string, visible: boolean)`
* `reorderServices(orderedIds: string[])`
* Triggers `revalidateTag('portfolio:services')`.

### 3.4 Education & Certification Actions (`lib/actions/timeline.actions.ts`)
* `createEducation(data)` / `updateEducation(id, data)` / `deleteEducation(id)`
* `createCertification(data)` / `updateCertification(id, data)` / `deleteCertification(id)`
* Triggers `revalidateTag('portfolio:education')`.

### 3.5 Homepage & Section Visibility Actions (`lib/actions/homepage.actions.ts`)
* `updateHomepageContent(data: HomepageContentInput)`:
  - Updates Hero headings, tagline, and CTA links.
* `toggleSectionVisibility(sectionKey: SectionKey, visible: boolean)`:
  - Updates `heroVisible`, `aboutVisible`, `skillsVisible`, `projectsVisible`, `servicesVisible`, `timelineVisible`, or `contactVisible`.
  - Triggers `revalidateTag('portfolio:homepage')` and `revalidatePath('/')`.

### 3.6 Theme & SEO Actions (`lib/actions/settings.actions.ts`)
* `updateThemeSettings(data: ThemeSettingsInput)`:
  - Updates default mode (DARK/LIGHT/SYSTEM) and accent color (EMERALD/CYAN/INDIGO/VIOLET/AMBER/ROSE).
  - Triggers `revalidateTag('portfolio:theme')`.
* `updateSeoSettings(data: SeoSettingsInput)`:
  - Updates title, meta description, keywords, OG image, and favicon URL.
  - Triggers `revalidatePath('/', 'layout')`.
* `updateSiteSettings(data: SiteSettingsInput)`:
  - Updates contact email, footer text, copyright notice.
  - Triggers `revalidateTag('portfolio:settings')`.
* `updateProfile(data: ProfileInput)`:
  - Updates bio, title, location, avatar, and resume PDF URL.
  - Triggers `revalidateTag('portfolio:profile')`.

### 3.7 Contact Lead Management Actions (`lib/actions/message.actions.ts`)
* `markMessageRead(id: string, isRead: boolean)`
* `deleteMessage(id: string)`
* `bulkDeleteMessages(ids: string[])`
* All live updates to dashboard messages table.

---

## 4. Media Upload API: `POST /api/uploads/sign`

* **Caller**: Authenticated Admin.
* **Function**: Generates signed upload parameters for Cloudinary.
* **Payload**: `{ folder: 'portfolio/projects' | 'portfolio/avatars' | 'portfolio/documents' }`
* **Flow**:
  1. Verifies admin session.
  2. Generates a timestamped HMAC-SHA1 signature using `CLOUDINARY_API_SECRET`.
  3. Returns `{ timestamp, signature, apiKey, cloudName, folder }`.
  4. The client browser uploads directly to Cloudinary's secure API endpoint.
  5. The server never has to buffer massive multipart binaries, preserving serverless performance and eliminating memory leaks.
