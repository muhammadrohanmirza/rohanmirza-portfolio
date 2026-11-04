# 05 - UI Design System & Aesthetic Architecture
**Project:** Rohan.Dev Personal Portfolio & Admin CMS  
**Role / Persona:** Full Stack Developer & AI Engineer  
**Date:** October 2026  
**Status:** Planning (Phase 0)

---

## 1. Visual Identity & Design Principles

The design of **Rohan.Dev** balances two distinct interfaces:
1. **Public Portfolio Interface**: A modern creative-developer showcase emphasizing engineering craftsmanship, AI systems expertise, typography, subtle lighting effects, micro-interactions, and accessibility.
2. **Admin Dashboard / CMS Interface**: A calm, high-efficiency SaaS back-office workspace featuring dense, readable data tables, intuitive form layouts, real-time feedback, and zero visual clutter.

---

## 2. Typography Hierarchy

Using `next/font/google` for zero-layout-shift and optimal performance:

* **Display / Headings**: **Outfit** (or **Space Grotesk** / **Syne**)
  - Geometric, technical, yet elegant.
  - Conveys modern engineering, AI architecture, and creative precision.
* **Body & UI**: **Inter**
  - Ultra-clean, neutral, highly legible at small sizes across all screen densities.
* **Code / Technical Badges**: **JetBrains Mono**
  - High-clarity monospace for tech stacks, shell commands, and API badges.

### Scale:
- `Display Hero`: `text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none`
- `H1 / Section Titles`: `text-3xl md:text-5xl font-bold tracking-tight`
- `H2 / Subheadings`: `text-xl md:text-2xl font-semibold`
- `H3 / Card Titles`: `text-lg font-semibold tracking-normal`
- `Body Large`: `text-lg leading-relaxed text-neutral-300 dark:text-neutral-300`
- `Body Standard`: `text-sm md:text-base leading-normal text-neutral-400 dark:text-neutral-400`
- `Caption / Meta`: `text-xs font-mono tracking-wider uppercase`

---

## 3. Color Palettes & Theming Architecture

The system supports Light, Dark, and System modes, paired with a dynamic accent color selected in the Admin CMS.

### Neutral Foundation (Dark Mode Default):
- `Background Primary`: `#090a0f` (Deep cosmic obsidian)
- `Background Surface / Card`: `#12131a` (Subtle elevated dark slate)
- `Background Surface Hover`: `#1a1c26`
- `Borders & Dividers`: `#232634` (1px subtle border)
- `Foreground Text Primary`: `#f8fafc` (Slate 50)
- `Foreground Text Secondary`: `#94a3b8` (Slate 400)
- `Foreground Text Muted`: `#64748b` (Slate 500)

### Neutral Foundation (Light Mode):
- `Background Primary`: `#f8fafc` (Slate 50)
- `Background Surface / Card`: `#ffffff` (Pure white)
- `Borders & Dividers`: `#e2e8f0` (Slate 200)
- `Foreground Text Primary`: `#0f172a` (Slate 900)
- `Foreground Text Secondary`: `#475569` (Slate 600)

### Curated Dynamic Accent Palette:
Admin CMS provides a selectable accent color from 6 curated engineering themes. These apply to glow effects, buttons, active states, focus rings, and badge highlights:

| Accent Name | Primary Hex | Tailwind Token | CSS Variable (`--accent`) | Aesthetic Character |
| :--- | :--- | :--- | :--- | :--- |
| **Cyan** (Default) | `#06b6d4` | `cyan-500` | `6 182 212` | Futuristic, AI, Hyper-clean |
| **Emerald** | `#10b981` | `emerald-500`| `16 185 129` | Algorithmic, Terminal, Vitality |
| **Indigo** | `#6366f1` | `indigo-500` | `99 102 241` | Modern SaaS, Deep Logic |
| **Violet** | `#8b5cf6` | `violet-500` | `139 92 246` | Creative, Neural, Visionary |
| **Amber** | `#f59e0b` | `amber-500`  | `245 158 11` | Energetic, Warm Brass |
| **Rose** | `#f43f5e` | `rose-500`   | `244 63 94`  | Bold, Editorial, Passion |

The selected accent is saved to the `ThemeSettings` database record and injected as CSS custom properties (`--color-accent`, `--color-accent-hover`, `--color-accent-subtle`) in the root HTML tag.

---

## 4. Spacing, Grids & Layout Foundations

- **Max Content Width**: `max-w-6xl` (1152px) for reading focus, `max-w-7xl` (1280px) for admin workspace.
- **Section Spacing**: `py-20 md:py-32` for balanced breathing room.
- **Card Padding**: `p-6 md:p-8` for rich content hierarchy.
- **Border Radius**:
  - Cards: `rounded-2xl` (16px) with 1px border (`border-white/10`).
  - Buttons & Inputs: `rounded-xl` (12px) for modern ergonomics.
  - Badges & Tags: `rounded-full` (9999px).

---

## 5. Motion Rules & Animation Guidelines

All animations are crafted to feel snappy, intentional, and purposeful. Heavy distracting parallax or lagging scroll effects are strictly avoided.

### Motion Principles:
1. **Restraint**: Animations accentuate hierarchy; they do not distract from reading or browsing.
2. **Spring Physics**: Durations between 200ms and 400ms with easing curves (`cubic-bezier(0.16, 1, 0.3, 1)`).
3. **Accessibility**: Strict adherence to `@media (prefers-reduced-motion: reduce)`. When enabled, transforms and transitions default to immediate state changes or gentle fades.
4. **Interactive Cards**: Subtle 3D tilt or border glow on pointer hover (`transform-gpu hover:-translate-y-1 transition-all duration-300`).
5. **Hero Background**: Tasteful subtle gradient radial glow with CSS mesh blur; zero heavy WebGL CPU drains.

---

## 6. Interface 1: Public Portfolio Specifications

### 6.1 Sticky Navigation Bar
- Frosted glass effect (`backdrop-blur-md bg-neutral-950/70 border-b border-white/10`).
- Logo: `Rohan.Dev` with an active accent dot indicator.
- Links: smooth-scrolling section anchors (`#about`, `#skills`, `#projects`, `#services`, `#timeline`, `#contact`).
- Active section highlighting using `IntersectionObserver`.
- Mobile drawer with fluid entry animation and keyboard ESC support.

### 6.2 Hero Section
- Badge: `"Full Stack Developer & AI Engineer"` with pulsing status indicator (`Available for Opportunities`).
- Heading: bold display typography with subtle gradient text mask.
- Subheading: concise value proposition.
- CTAs: Primary button with glowing accent hover; Secondary outline button.

### 6.3 About Me
- Split layout: high-resolution avatar with subtle glowing border + narrative bio.
- Resume download button (conditionally displayed if `Profile.resumeUrl` is populated).
- Quick statistics pills (Years of Experience, Core Focus).

### 6.4 Tech Stack & Skills
- Grouped into categorized interactive cards (AI & Machine Learning, Frontend, Backend & Databases).
- Skill pills with Lucide icons, proficiency indicators, or tech badges.
- Smooth hover elevation.

### 6.5 Featured Projects
- Multi-column responsive grid (1 col mobile, 2/3 col desktop).
- Card elements: primary screenshot, category tag, title, 2-line summary, tech stack pills.
- Action triggers: "View Details" (opens accessible modal), GitHub link button (if URL exists), Live Demo button (if URL exists).
- Zero broken links: buttons render **only** when corresponding database field is non-empty.

### 6.6 Services
- Card grid highlighting core architectural competencies (e.g., AI integration, Full Stack web engineering, API design).
- Icon containers with soft accent background tints.

### 6.7 Education & Certifications
- Sleek timeline / card layout showing academic milestones and verified technical credentials.
- External credential verification links with external-link icons.

### 6.8 Contact Channel
- Two-column section: Contact info & availability on left; secured interactive contact form on right.
- Real-time client-side Zod validation with friendly inline messages.
- Clear pending states (`Loader2` spinner), animated success state (`CheckCircle`), and error retry banner.

### 6.9 Dynamic Footer
- Back-to-top button.
- Social media icon row.
- CMS-controlled copyright and attribution.

---

## 7. Interface 2: Admin CMS Specifications

### 7.1 Layout Architecture
- Fixed left sidebar (`w-64`) on desktop with collapsed state option.
- Mobile bottom navigation bar / off-canvas sheet on smaller viewports.
- Top bar with:
  - Page title & breadcrumb
  - Live link to view public site in new tab
  - Quick theme toggle preview
  - Admin profile menu with one-click logout

### 7.2 CMS Dashboard Views
1. **Overview**: Metric stat cards with percentage trends, recent messages list with quick-read toggle, project status split (Published vs. Drafts).
2. **Projects Manager**: Data table with thumbnail preview, title, status badge (`Published` / `Draft`), featured switch, reorder arrows, edit action, delete action with modal confirmation.
3. **Project Editor**: Tabbed or stacked form with multi-image drag-and-drop uploader, markdown description editor, tag input for tech stack, URL inputs, and immediate preview.
4. **Skills Manager**: Category accordion with drag-and-drop skill list, add skill dialog, and visibility switches.
5. **Services & Timeline Managers**: Clean list view with inline edit and delete dialogs.
6. **Homepage Content**: Visual toggles for all 7 public sections, live text inputs for hero copy and CTAs.
7. **Messages Center**: Searchable, filterable mailbox. Message detail modal with contact email link and timestamp.
8. **Settings & SEO**: Form fields with live favicon/OG preview and metadata character counter.
9. **Theme Settings**: Interactive swatch selector for the 6 accent colors with live preview on a sample card.

### 7.3 Feedback & Interaction Standards
- **Destructive Actions**: Double-check confirmation modal with explicit warning before any delete operation.
- **Optimistic Updates & Toast**: Immediate toast notifications (`Sonner` / custom toast) for saves, updates, and errors.
- **Skeleton States**: Shimmer skeleton tables and cards while data re-fetches.
