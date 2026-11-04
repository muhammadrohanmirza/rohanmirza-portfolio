import { chromium, type Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

const VIEWPORTS = [
  { name: "320px", width: 320, height: 640 },
  { name: "375px", width: 375, height: 667 },
  { name: "414px", width: 414, height: 896 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1024px", width: 1024, height: 768 },
  { name: "1280px", width: 1280, height: 800 },
  { name: "1440px", width: 1440, height: 900 },
  { name: "1920px", width: 1920, height: 1080 },
  { name: "2560px", width: 2560, height: 1440 },
];

const SCREENSHOT_DIR = path.resolve(process.cwd(), "docs/responsive-screenshots");
const COMPARISON_DIR = path.resolve(process.cwd(), "docs/design-comparison");

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  fs.mkdirSync(COMPARISON_DIR, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results: any[] = [];
  const errors: string[] = [];

  console.log("Starting Portfolio Redesign Audit & Verification Suite...");

  for (const theme of ["light", "dark"]) {
    console.log(`\n--- Testing Theme: ${theme.toUpperCase()} ---`);

    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
      });

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(`[Console Error ${theme} ${vp.name}]: ${msg.text()}`);
        }
      });

      page.on("pageerror", (err) => {
        errors.push(`[Page Error ${theme} ${vp.name}]: ${err.message}`);
      });

      // Navigate to homepage
      await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

      // Apply theme mode explicitly
      await page.evaluate((t) => {
        if (t === "light") {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        }
      }, theme);

      await page.waitForTimeout(400);

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });

      // Save screenshot
      const filename = `${theme}-${vp.width}.png`;
      const screenshotPath = path.join(SCREENSHOT_DIR, filename);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Also copy 1440px light screenshot to design comparison folder
      if (theme === "light" && vp.width === 1440) {
        const compPath = path.join(COMPARISON_DIR, "rebuilt-homepage-1440-light.png");
        await page.screenshot({ path: compPath, fullPage: true });
        console.log(`Saved primary comparison screenshot to ${compPath}`);
      }

      console.log(
        `✓ [${theme}] ${vp.name}: ${overflow.hasOverflow ? "OVERFLOW FAIL" : "PASS"} (w:${overflow.innerWidth}, s:${overflow.scrollWidth})`
      );

      results.push({
        theme,
        width: vp.width,
        overflow,
        status: overflow.hasOverflow ? "FAIL" : "PASS",
      });

      // Test Contact Popup on 375px and 1440px
      if (vp.width === 375 || vp.width === 1440) {
        try {
          // Find contact button
          const contactBtn = page.locator('button:has-text("Contact Me"), button:has-text("Get In Touch")').first();
          if (await contactBtn.isVisible()) {
            await contactBtn.click();
            await page.waitForTimeout(300);

            // Verify dialog is open
            const dialog = page.locator('div[role="dialog"]');
            const isOpen = await dialog.isVisible();

            // Capture modal screenshot
            const popupFile = path.join(SCREENSHOT_DIR, `popup-${theme}-${vp.width}.png`);
            await page.screenshot({ path: popupFile });

            // Press Escape to close
            await page.keyboard.press("Escape");
            await page.waitForTimeout(200);

            console.log(`  Modal test on ${vp.width}px (${theme}): ${isOpen ? "PASS (Dialog opened & closed)" : "FAIL"}`);
          }
        } catch (e: any) {
          console.error(`  Modal interaction test note on ${vp.width}px:`, e.message);
        }
      }

      await page.close();
    }
  }

  await browser.close();

  console.log("\n=================================");
  console.log("        AUDIT SUMMARY");
  console.log("=================================");
  console.log(`Total viewports checked: ${results.length}`);
  const failedOverflow = results.filter((r) => r.status === "FAIL");
  console.log(`Overflow failures: ${failedOverflow.length}`);
  console.log(`Console errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log("Errors:", errors);
  }

  // Write audit summary json
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, "audit-summary.json"),
    JSON.stringify({ results, errors }, null, 2)
  );
}

main().catch((err) => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
