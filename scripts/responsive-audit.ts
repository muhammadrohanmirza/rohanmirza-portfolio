import { chromium, type Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { signSessionToken } from "../lib/auth";

interface ViewportDef {
  name: string;
  width: number;
  height: number;
  isMobile?: boolean;
}

const VIEWPORT_SIZES: ViewportDef[] = [
  { name: "320px (small phone)", width: 320, height: 640, isMobile: true },
  { name: "375px (iPhone)", width: 375, height: 667, isMobile: true },
  { name: "414px (large phone)", width: 414, height: 896, isMobile: true },
  { name: "667x375 (landscape phone)", width: 667, height: 375, isMobile: true },
  { name: "768px (tablet portrait)", width: 768, height: 1024, isMobile: false },
  { name: "1024px (tablet landscape)", width: 1024, height: 768, isMobile: false },
  { name: "1280px (desktop)", width: 1280, height: 800, isMobile: false },
  { name: "1440px (desktop large)", width: 1440, height: 900, isMobile: false },
  { name: "1920px (full HD)", width: 1920, height: 1080, isMobile: false },
  { name: "2560px (ultra-wide/2K)", width: 2560, height: 1440, isMobile: false },
];

interface AuditFinding {
  page: string;
  width: string;
  problem: string;
  element?: string;
  fixPlanned: string;
}

async function auditPageDOM(page: Page, isMobile: boolean) {
  return await page.evaluate((mobile) => {
    const issues: {
      horizontalScroll: boolean;
      scrollWidth: number;
      innerWidth: number;
      overflowElements: string[];
      smallTapTargets: string[];
      smallTextElements: string[];
    } = {
      horizontalScroll: false,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflowElements: [],
      smallTapTargets: [],
      smallTextElements: [],
    };

    // 1. Horizontal scroll check
    if (document.documentElement.scrollWidth > window.innerWidth + 1) {
      issues.horizontalScroll = true;
      const allElements = document.querySelectorAll("*");
      for (const el of Array.from(allElements)) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.right > window.innerWidth + 2) {
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : "";
          const cls = el.className && typeof el.className === "string" ? `.${el.className.split(" ").slice(0, 2).join(".")}` : "";
          const desc = `${tag}${id}${cls} (w:${Math.round(rect.width)}, r:${Math.round(rect.right)})`;
          if (issues.overflowElements.length < 5) {
            issues.overflowElements.push(desc);
          }
        }
      }
    }

    // 2. Tap target check (mobile only)
    if (mobile) {
      const interactiveElements = document.querySelectorAll("button, a, input, select, textarea, [role='button']");
      for (const el of Array.from(interactiveElements)) {
        const rect = el.getBoundingClientRect();
        // Visible elements only
        if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight * 2) {
          const style = window.getComputedStyle(el);
          if (style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0") {
            if (rect.width < 40 || rect.height < 40) {
              const tag = el.tagName.toLowerCase();
              const text = (el.textContent || "").trim().slice(0, 25);
              const label = text ? `"${text}"` : (el.getAttribute("aria-label") || el.getAttribute("name") || tag);
              const desc = `${tag} (${Math.round(rect.width)}x${Math.round(rect.height)}px: ${label})`;
              if (!issues.smallTapTargets.some(t => t.includes(label)) && issues.smallTapTargets.length < 8) {
                issues.smallTapTargets.push(desc);
              }
            }
          }
        }
      }
    }

    // 3. Small text check (mobile only)
    if (mobile) {
      const textNodes = document.querySelectorAll("p, span, label, li");
      for (const el of Array.from(textNodes)) {
        if (el.children.length === 0 && (el.textContent || "").trim().length > 3) {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          if (fontSize < 12.5 && style.display !== "none" && style.visibility !== "hidden") {
            const text = (el.textContent || "").trim().slice(0, 30);
            const desc = `${fontSize}px: "${text}"`;
            if (!issues.smallTextElements.some(t => t.includes(text)) && issues.smallTextElements.length < 5) {
              issues.smallTextElements.push(desc);
            }
          }
        }
      }
    }

    return issues;
  }, isMobile);
}

async function runAudit() {
  console.log("Starting systematic responsive audit...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const adminToken = await signSessionToken({
    userId: "cmv5c6ine0000vekkmfjgehy9",
    email: "admin@rohan.dev",
    role: "ADMIN" as any,
    name: "Rohan Admin",
  });

  const routes = [
    { path: "/", name: "Public Homepage", auth: false },
    { path: "/login", name: "CMS Login", auth: false },
    { path: "/projects/learnsphere-ai", name: "Project Detail", auth: false },
    { path: "/not-found", name: "404 Page", auth: false },
    { path: "/admin", name: "Admin Dashboard Overview", auth: true },
    { path: "/admin/profile", name: "Admin Profile", auth: true },
    { path: "/admin/homepage", name: "Admin Homepage & Hero", auth: true },
    { path: "/admin/skills", name: "Admin Skills", auth: true },
    { path: "/admin/projects", name: "Admin Projects List", auth: true },
    { path: "/admin/projects/new", name: "Admin New Project", auth: true },
    { path: "/admin/services", name: "Admin Services", auth: true },
    { path: "/admin/education", name: "Admin Timeline/Education", auth: true },
    { path: "/admin/stats", name: "Admin Stats", auth: true },
    { path: "/admin/testimonials", name: "Admin Testimonials", auth: true },
    { path: "/admin/messages", name: "Admin Messages", auth: true },
    { path: "/admin/theme", name: "Admin Theme", auth: true },
    { path: "/admin/seo", name: "Admin SEO", auth: true },
    { path: "/admin/settings", name: "Admin Settings", auth: true },
  ];

  const findings: AuditFinding[] = [];
  const screenshotDir = path.resolve(process.cwd(), "docs/responsive-screenshots/before");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  for (const vp of VIEWPORT_SIZES) {
    console.log(`\n--- Auditing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    // Set admin cookie
    await context.addCookies([
      {
        name: "rohan_admin_session",
        value: adminToken,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    const page = await context.newPage();

    for (const route of routes) {
      const url = `http://localhost:3000${route.path}`;
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(600); // Allow animations/layout to settle

        const safeName = route.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
        const screenshotFile = path.join(screenshotDir, `${safeName}_${vp.width}w.png`);
        await page.screenshot({ path: screenshotFile, fullPage: false });

        const domAudit = await auditPageDOM(page, !!vp.isMobile);

        if (domAudit.horizontalScroll) {
          findings.push({
            page: route.name,
            width: `${vp.width}px`,
            problem: `Horizontal overflow (scrollWidth: ${domAudit.scrollWidth}px > innerWidth: ${domAudit.innerWidth}px). Overflows: ${domAudit.overflowElements.join(", ")}`,
            fixPlanned: "Apply overflow-x-hidden / min-w-0 / flex-wrap / responsive max-w containers and cap oversized fixed widths.",
          });
        }

        if (domAudit.smallTapTargets.length > 0) {
          findings.push({
            page: route.name,
            width: `${vp.width}px`,
            problem: `Tap targets under 44x44px detected: ${domAudit.smallTapTargets.slice(0, 3).join("; ")}`,
            fixPlanned: "Ensure minimum touch targets (min-h-[44px] min-w-[44px] or p-2.5 touch padding) for interactive elements.",
          });
        }

        if (domAudit.smallTextElements.length > 0) {
          findings.push({
            page: route.name,
            width: `${vp.width}px`,
            problem: `Micro-text under 13px detected on mobile: ${domAudit.smallTextElements.slice(0, 2).join("; ")}`,
            fixPlanned: "Bump mobile body text to at least 14px (text-sm/text-base) for readability and inputs to 16px.",
          });
        }

      } catch (err: any) {
        console.error(`Error auditing ${route.name} at ${vp.width}px:`, err.message);
        findings.push({
          page: route.name,
          width: `${vp.width}px`,
          problem: `Page load / navigation failure: ${err.message}`,
          fixPlanned: "Investigate and resolve layout or route rendering failure.",
        });
      }
    }

    await context.close();
  }

  await browser.close();

  // Generate docs/10-responsive-audit.md
  let markdown = `# Responsive Design Audit & Remediation Plan (Step 1)

Audited Target Screen Widths:
- **320px** (Small mobile / Galaxy Fold)
- **375px** (iPhone standard)
- **414px** (Large smartphone)
- **667x375** (Mobile landscape orientation)
- **768px** (Tablet portrait / iPad)
- **1024px** (Tablet landscape / Small laptop)
- **1280px** (Standard laptop display)
- **1440px** (Desktop widescreen)
- **1920px** (Full HD monitor)
- **2560px** (2K / QHD ultra-wide monitor)

---

## Automated Findings & Planned Fixes

| Page / Component | Width | Problem | Fix Planned | Status |
| :--- | :--- | :--- | :--- | :--- |
`;

  for (const f of findings) {
    markdown += `| **${f.page}** | \`${f.width}\` | ${f.problem.replace(/\|/g, "\\|")} | ${f.fixPlanned.replace(/\|/g, "\\|")} | 🔍 Identified |\\n`;
  }

  markdown += `
---

## Comprehensive Architecture & Layout Findings

### 1. Public Portfolio
- **Viewport Meta & Mobile Insets**: Need safe-area insets and dvh/svh handling to avoid browser bar jump on iOS/Android.
- **Navbar**: Between 768px and 1024px nav links crowd the container; on mobile (<768px) needs smooth animated mobile drawer with 44px tap targets and accessible theme toggle.
- **Hero Section**:
  - Heading font size needs fluid clamp to prevent text clipping at 320px.
  - Typewriter height should be reserved with \`min-h-[...]\` to prevent cumulative layout shift (CLS).
  - CTA action buttons must be \`w-full sm:w-auto\` with \`flex-col sm:flex-row\` stacking.
  - Three.js particle canvas must have \`touch-action: pan-y\` and lighter particle density on mobile (<768px).
- **Projects Section**:
  - Filter tabs row must become a horizontally scrollable container with hidden scrollbars instead of wrapping into multiple staggered lines.
  - Project detail modal must fit \`max-h-[90dvh]\` with internal scroll and prominent touch-friendly close button.
  - Standalone project page (\`/projects/[slug]\`) needs responsive padding, container capping, and responsive image aspect ratios.
- **Timeline / Education**: Multi-column timeline layout must reflow into a clean single-column vertical timeline on mobile.
- **Testimonials & Services**: Grid must scale 1 column (mobile) -> 2 columns (tablet) -> 3 columns (desktop).
- **Contact & Footer**: Contact split layout must stack on mobile, inputs must have font-size >= 16px to prevent iOS auto-zoom on focus.

### 2. Admin Dashboard
- **Sidebar & Shell**: On viewports <1024px, the sidebar must become an off-canvas drawer with backdrop overlay, controlled by a hamburger toggle in the top bar. Body scroll must lock when open.
- **Top Bar**: Search bar should collapse on mobile to preserve space; user profile and live site links must be compact and easily tappable.
- **Data Tables**: Table layouts on mobile (<768px) must either offer responsive card views or horizontal scrolling with sticky primary columns and >=44px action buttons.
- **Forms**: Forms must stack into single-column layouts on mobile with full-width inputs and sticky action buttons for easy thumb access.
- **Modals & Dialogs**: Delete confirmation and reader modals must stay within \`max-w-[calc(100vw-32px)]\` and use bottom-sheet or centered sheet styling with internal scroll.

---

*Report automatically generated by Playwright Responsive Audit Suite.*
`;

  const auditPath = path.resolve(process.cwd(), "docs/10-responsive-audit.md");
  fs.writeFileSync(auditPath, markdown, "utf8");
  console.log(`\nAudit complete! Findings written to ${auditPath}`);
}

runAudit().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
