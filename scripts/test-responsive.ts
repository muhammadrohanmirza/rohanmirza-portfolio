import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { signSessionToken } from "../lib/auth";

interface ViewportDef {
  name: string;
  width: number;
  height: number;
  isMobile?: boolean;
}

const TEST_VIEWPORTS: ViewportDef[] = [
  { name: "320px (Small Mobile)", width: 320, height: 640, isMobile: true },
  { name: "375px (iPhone SE/12)", width: 375, height: 667, isMobile: true },
  { name: "414px (Large Phone)", width: 414, height: 896, isMobile: true },
  { name: "768px (Tablet Portrait)", width: 768, height: 1024, isMobile: false },
  { name: "1024px (Tablet Landscape / Small Laptop)", width: 1024, height: 768, isMobile: false },
  { name: "1280px (Desktop / Laptop)", width: 1280, height: 800, isMobile: false },
  { name: "1440px (Desktop Widescreen)", width: 1440, height: 900, isMobile: false },
  { name: "1920px (Full HD Monitor)", width: 1920, height: 1080, isMobile: false },
  { name: "2560px (2K Ultra-wide)", width: 2560, height: 1440, isMobile: false },
];

const ROUTES = [
  { path: "/", name: "Public Homepage", auth: false },
  { path: "/projects", name: "Public All Projects", auth: false },
  { path: "/projects/learnsphere-ai", name: "Project Detail", auth: false },
  { path: "/login", name: "CMS Login", auth: false },
  { path: "/admin", name: "Admin Overview", auth: true },
  { path: "/admin/homepage", name: "Admin Homepage Settings", auth: true },
  { path: "/admin/theme", name: "Admin Theme Settings", auth: true },
  { path: "/admin/profile", name: "Admin Profile", auth: true },
  { path: "/admin/projects", name: "Admin Projects", auth: true },
  { path: "/admin/skills", name: "Admin Skills", auth: true },
  { path: "/admin/services", name: "Admin Services", auth: true },
  { path: "/admin/education", name: "Admin Education", auth: true },
  { path: "/admin/messages", name: "Admin Messages", auth: true },
];

interface TestResult {
  route: string;
  viewport: string;
  width: number;
  status: "PASS" | "FAIL";
  scrollWidth: number;
  innerWidth: number;
  screenshot: string;
  error?: string;
}

async function runResponsiveTests() {
  console.log("==================================================");
  console.log("   AUTOMATED RESPONSIVE SUITE: Rohan.Dev");
  console.log("==================================================");

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const adminToken = await signSessionToken({
    userId: "cmv5c6ine0000vekkmfjgehy9",
    email: "admin@rohan.dev",
    role: "ADMIN" as any,
    name: "Rohan Admin",
  });

  const screenshotDir = path.resolve(process.cwd(), "docs/responsive-screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const results: TestResult[] = [];
  let failureCount = 0;

  for (const vp of TEST_VIEWPORTS) {
    console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height})`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

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

    for (const route of ROUTES) {
      const page = await context.newPage();
      const consoleErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();
          if (!text.includes("favicon.ico") && !text.includes("Cloudinary")) {
            consoleErrors.push(text);
          }
        }
      });

      page.on("pageerror", (err) => {
        consoleErrors.push(err.message);
      });

      const url = `http://localhost:3000${route.path}`;
      const safeName = route.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      const screenshotFilename = `${safeName}_${vp.width}w.png`;
      const screenshotFile = path.join(screenshotDir, screenshotFilename);

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(400); // Allow responsive reflow

        // Capture screenshot
        await page.screenshot({ path: screenshotFile, fullPage: false });

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          const scrollWidth = document.documentElement.scrollWidth;
          const innerWidth = window.innerWidth;
          let overflowingElement = "";

          if (scrollWidth > innerWidth + 1) {
            for (const el of Array.from(document.querySelectorAll("*"))) {
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.right > innerWidth + 2) {
                overflowingElement = `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 30)} (w:${Math.round(r.width)}, r:${Math.round(r.right)})`;
                break;
              }
            }
          }

          return {
            hasOverflow: scrollWidth > innerWidth + 1,
            scrollWidth,
            innerWidth,
            overflowingElement,
          };
        });

        if (overflow.hasOverflow) {
          failureCount++;
          results.push({
            route: route.name,
            viewport: vp.name,
            width: vp.width,
            status: "FAIL",
            scrollWidth: overflow.scrollWidth,
            innerWidth: overflow.innerWidth,
            screenshot: screenshotFilename,
            error: `Horizontal overflow detected: ${overflow.overflowingElement || "content exceeded window width"}`,
          });
          console.log(`  ❌ ${route.name.padEnd(25)} @ ${vp.width}px: OVERFLOW (${overflow.scrollWidth} > ${overflow.innerWidth})`);
        } else if (consoleErrors.length > 0) {
          const fatalErrors = consoleErrors.filter(
            (e) => e.includes("Minified React error") || e.includes("Uncaught")
          );
          if (fatalErrors.length > 0) {
            failureCount++;
            results.push({
              route: route.name,
              viewport: vp.name,
              width: vp.width,
              status: "FAIL",
              scrollWidth: overflow.scrollWidth,
              innerWidth: overflow.innerWidth,
              screenshot: screenshotFilename,
              error: `Console errors: ${fatalErrors.join("; ")}`,
            });
            console.log(`  ❌ ${route.name.padEnd(25)} @ ${vp.width}px: CONSOLE ERROR`);
          } else {
            results.push({
              route: route.name,
              viewport: vp.name,
              width: vp.width,
              status: "PASS",
              scrollWidth: overflow.scrollWidth,
              innerWidth: overflow.innerWidth,
              screenshot: screenshotFilename,
            });
            console.log(`  ✅ ${route.name.padEnd(25)} @ ${vp.width}px: PASS`);
          }
        } else {
          results.push({
            route: route.name,
            viewport: vp.name,
            width: vp.width,
            status: "PASS",
            scrollWidth: overflow.scrollWidth,
            innerWidth: overflow.innerWidth,
            screenshot: screenshotFilename,
          });
          console.log(`  ✅ ${route.name.padEnd(25)} @ ${vp.width}px: PASS`);
        }
      } catch (err: unknown) {
        failureCount++;
        const message = err instanceof Error ? err.message : String(err);
        results.push({
          route: route.name,
          viewport: vp.name,
          width: vp.width,
          status: "FAIL",
          scrollWidth: 0,
          innerWidth: vp.width,
          screenshot: screenshotFilename,
          error: message,
        });
        console.log(`  ❌ ${route.name.padEnd(25)} @ ${vp.width}px: ERROR (${message})`);
      } finally {
        await page.close();
      }
    }

    await context.close();
  }

  await browser.close();

  console.log("\n==================================================");
  console.log(`TEST RESULTS SUMMARY: ${results.length - failureCount}/${results.length} PASSED`);
  console.log(`Total Failures: ${failureCount}`);
  console.log("==================================================");

  // Write results JSON
  const summaryJsonPath = path.resolve(process.cwd(), "docs/responsive-test-results.json");
  fs.writeFileSync(summaryJsonPath, JSON.stringify(results, null, 2));

  // Generate Markdown report
  const reportPath = path.resolve(process.cwd(), "docs/responsive-audit-results.md");
  let md = "# Automated Responsive & Overflow Audit Report\n\n";
  md += `**Date:** ${new Date().toISOString()}\n`;
  md += `**Total Viewports Tested:** ${TEST_VIEWPORTS.length} (320px, 375px, 414px, 768px, 1024px, 1280px, 1440px, 1920px, 2560px)\n`;
  md += `**Total Checks:** ${results.length}\n`;
  md += `**Passed:** ${results.length - failureCount}\n`;
  md += `**Failed:** ${failureCount}\n\n`;
  md += "## Viewport Breakdown\n\n";
  md += "| Route | Viewport | Status | Scroll Width | Inner Width | Screenshot |\n";
  md += "| :--- | :--- | :--- | :--- | :--- | :--- |\n";

  for (const r of results) {
    const icon = r.status === "PASS" ? "✅ PASS" : "❌ FAIL";
    md += `| ${r.route} | ${r.viewport} | ${icon} | ${r.scrollWidth}px | ${r.innerWidth}px | [${r.screenshot}](file:///${screenshotDir.replace(/\\/g, "/")}/${r.screenshot}) |\n`;
  }

  fs.writeFileSync(reportPath, md);
  console.log(`\n📄 Generated report at ${reportPath}`);

  if (failureCount > 0) {
    console.error(`\n❌ Responsive test failed with ${failureCount} failure(s).`);
    process.exit(1);
  } else {
    console.log("\n🎉 All target viewports passed with zero horizontal overflow and no errors!");
    process.exit(0);
  }
}

runResponsiveTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
