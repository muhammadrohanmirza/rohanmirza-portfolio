# 06 - Component Inventory & Design Tokens
**Project:** Rohan.Dev Personal Portfolio & Admin CMS  
**Role / Persona:** Full Stack Developer & AI Engineer  
**Date:** October 2026  
**Status:** Planning (Phase 0)

---

## 1. Component Hierarchy & Boundary Strategy

Components follow React 19 / Next.js 16 Server Component (RSC) patterns:
- **Server Components (Default)**: Fetch data, render semantic HTML, stream via `<Suspense>`, and minimize client bundle size.
- **Client Components (`'use client'`)**: Isolated to interactive islands (form handling, modals, dropdowns, drag-and-drop, theme toggles, and Framer Motion triggers).

```
Components Breakdown:
├── UI Primitives (Shared)       -> 12 components (Button, Input, Modal, Badge...)
├── Public Portfolio Components  -> 11 components (Navbar, Hero, Projects, Contact...)
└── Admin Dashboard Components   -> 14 components (Sidebar, DataTable, ImageUploader...)
```

---

## 2. Shared UI Primitives (`components/ui/`)

These primitives provide consistent styling, focus rings, accessibility attributes, and variant management across both public and admin interfaces.

| Component | Boundary | Props / Variants | Accessibility & Details |
| :--- | :--- | :--- | :--- |
| `Button` | Shared (Client or Server) | `variant: 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive'`, `size: 'sm' \| 'md' \| 'lg'`, `loading?: boolean`, `icon?: LucideIcon` | Built with standard `<button>`, includes focus-visible rings, disabled state, aria-busy during async actions |
| `Input` | Shared (Client) | `type`, `label?: string`, `error?: string`, `helperText?: string`, `icon?: LucideIcon` | Unique `id` with associated `<label>`, `aria-invalid` if error, `aria-describedby` for helper text |
| `Textarea` | Shared (Client) | `rows`, `label?: string`, `error?: string`, `maxLength?: number`, `charCount?: boolean` | Resizable vertical, focus rings, integrated character counter |
| `Switch` | Client | `checked: boolean`, `onCheckedChange: (v: boolean) => void`, `label?: string` | Semantic ARIA `role="switch"`, accessible keyboard navigation (Space/Enter) |
| `Badge` | Shared | `variant: 'default' \| 'accent' \| 'success' \| 'warning' \| 'outline'`, `size: 'sm' \| 'md'` | Colored pill with accessible contrast ratios |
| `Dialog` / `Modal` | Client | `open: boolean`, `onOpenChange: (open: boolean) => void`, `title?: string`, `description?: string` | Trap focus inside modal, escape key dismiss, backdrop click dismiss, `aria-modal="true"`, portal mounting |
| `ConfirmDialog` | Client | `title`, `message`, `confirmText`, `cancelText`, `isDestructive?: boolean`, `onConfirm: () => void` | Guard modal for deletions and state resets |
| `DropdownMenu` | Client | `trigger`, `items: { label, icon, onClick, destructive? }[]` | Keyboard navigable dropdown for row actions and user menus |
| `Toast` / `Sonner` | Client | `message`, `type: 'success' \| 'error' \| 'info'` | Accessible live region `role="status"` or `role="alert"` for real-time operation feedback |
| `Skeleton` | Shared | `className?: string` | CSS shimmer placeholder for loading states |
| `Tabs` | Client | `tabs: { id, label, content }[]`, `activeTab`, `onChange` | WAI-ARIA tab pattern with arrow key switching |
| `Tooltip` | Client | `content: string`, `children: ReactNode` | Floating micro-tooltip with delay, hidden from screen readers if content is redundant |

---

## 3. Public Portfolio Components (`components/public/`)

| Component | Boundary | Responsibilities & Data Source |
| :--- | :--- | :--- |
| `Navbar` | Client Island | Sticky header with blur. Renders logo, navigation links, theme switcher, and mobile drawer. Observes viewport scroll to highlight active anchor. |
| `HeroSection` | Client Motion | Reads `HomepageContent` and `Profile`. Static greeting, animated typewriter heading, non-repetitive tagline, dual CTAs, and responsive marquee tech stack slider. |
| `HeroTypewriter` | Client Component | Types heading phrases character-by-character with blinking accent cursor, reserved layout height to prevent CLS, tab-visibility pause, and reduced-motion fallback. |
| `HeroStackBadges` | Client Component | Centered stack row when fitting; infinite auto-scrolling marquee with soft edge masks, mobile swipe/drag, pause-on-hover, and reduced-motion manual scroll when overflowing. |
| `AboutSection` | Server Component | Reads `Profile` and `SiteSettings`. Displays bio narrative, professional photo with fallback, location, and conditional Resume Download button. |
| `SkillsSection` | Server Component | Reads `SkillCategory[]` with nested `Skill[]`. Renders categorized cards with badges, proficiency ratings, and technology icons. |
| `ProjectsSection` | Server Component | Reads published `Project[]` ordered by `featuredOrder` and `order`. Renders grid of project cards with thumbnail previews. |
| `ProjectCard` | Client Island | Individual interactive card with hover elevation. Renders title, summary, tech pills, GitHub/Live links (only if valid), and "View Details" trigger. |
| `ProjectModal` | Client Island | Accessible modal rendering full project screenshots gallery, in-depth architectural description, complete tech stack, and outbound links. |
| `ServicesSection` | Server Component | Reads visible `Service[]`. Displays modern service cards with Lucide icons, descriptive capabilities, and clean spacing. |
| `TimelineSection` | Server Component | Reads visible `Education[]` and `Certification[]`. Displays interactive vertical timeline with verified credential links and badges. |
| `ContactSection` | Client Component | Form with fields: Name, Email, Subject, Message, and hidden honeypot. Validated client-side with Zod and posted to `/api/contact`. Includes feedback states. |
| `Footer` | Server Component | Reads `SiteSettings` and `SocialLink[]`. Displays copyright notice, back-to-top button, and social link badges. |

---

## 4. Admin Dashboard Components (`components/admin/`)

| Component | Boundary | Responsibilities & Data Source |
| :--- | :--- | :--- |
| `AdminShell` | Client Layout | Responsive layout container with persistent desktop sidebar and collapsible mobile drawer. |
| `AdminSidebar` | Client Component | Navigation list with active route indicators: Overview, Profile, Projects, Skills, Services, Timeline, Homepage, Messages, SEO, Theme, Settings. |
| `AdminHeader` | Client Component | Top navigation bar displaying breadcrumb, public site link ("View Live Site" in new tab), theme preview, and admin profile trigger. |
| `StatCard` | Server Component | Card displaying KPI number, title, sub-label, and Lucide icon (e.g. Published Projects, Unread Leads, Total Skills). |
| `DataTable` | Client Component | Reusable data table with sortable columns, search input, status filter dropdown, pagination, and multi-select for bulk actions. |
| `ProjectForm` | Client Component | Multi-field form for creating/editing projects: title, slug auto-generation, markdown description, tech stack tag input, URL inputs, and images. |
| `ImageUploader` | Client Component | Unified media uploader with thumbnail preview, Replace, Remove with confirmation prompt, and Edit URL mode. Deletes previous Cloudinary assets server-side upon replace/remove with admin session verification. Supports images and PDFs. |
| `FileUploader` | Client Component | Dedicated PDF uploader for resumes and credential documents (max 10MB, application/pdf). |
| `SkillManager` | Client Component | Accordion list of skill categories. Allows adding/editing categories, reordering categories, and managing skills within each group. |
| `SectionVisibilityToggles` | Client Component | Card with 7 toggle switches corresponding to each public homepage section, with immediate autosave or batch save. |
| `MessageDetailModal` | Client Component | View complete message submission, sender details, user agent, IP hash, with "Mark as Read/Unread" and "Delete" buttons. |
| `ThemePicker` | Client Component | Interactive color palette swatches (Cyan, Emerald, Indigo, Violet, Amber, Rose) with instant preview and save action. |
| `SeoForm` | Client Component | Page title and meta description form with real-time character counter, SERP snippet preview, and OG image upload. |
| `RecentMessagesWidget` | Server Component | Lightweight overview widget listing the last 5 contact inquiries with quick read toggles. |

---

## 5. State Management Approach

1. **Server State as Truth**:
   - The PostgreSQL database is the single source of truth.
   - Server Components query the database directly with Prisma.
   - Server Actions mutate the database and call `revalidateTag` / `revalidatePath`.
2. **Client Form State**:
   - Managed via React Hook Form with `@hookform/resolvers/zod` for zero-lag typing performance, schema-driven validation, and precise error states.
3. **UI Ephemeral State**:
   - Modal visibility, active mobile navigation, and temporary filter strings use standard React `useState`.
   - URL Search Params (`useSearchParams`, `useRouter`) are used for filter and pagination state in Admin DataTables, enabling bookmarkable search views.
