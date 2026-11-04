import { chromium } from "playwright";

const WIDTHS = [320, 375, 414, 768, 1023, 1024, 1280, 1440, 1920];
const THEMES = ["light", "dark"] as const;
const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("=== Testing Hero Photo Visibility & Responsive Constraints ===");
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  let allPassed = true;

  for (const theme of THEMES) {
    console.log(`\n--- Theme: ${theme.toUpperCase()} ---`);
    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
      });

      const page = await context.newPage();

      // Track whether any hero image request was dispatched
      const downloadedHeroImages: string[] = [];
      const downloadedAboutImages: string[] = [];
      page.on("request", (req) => {
        const url = req.url();
        if (url.includes("hero-photo-cutout")) {
          downloadedHeroImages.push(url);
        }
        if (url.includes("b531235f")) {
          downloadedAboutImages.push(url);
        }
      });

      await page.goto(BASE_URL, { waitUntil: "networkidle" });

      // Apply theme
      await page.evaluate((t) => {
        if (t === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, theme);

      await page.waitForTimeout(300);

      // 1. Check Horizontal Overflow
      const overflow = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;
        return {
          scrollWidth,
          clientWidth,
          hasOverflow: scrollWidth > clientWidth + 1,
        };
      });

      // 2. Check hero photo visibility (right column)
      const heroRightCol = await page.evaluate(() => {
        const hero = document.querySelector("#hero");
        if (!hero) return null;
        // Right column is the second column in the hero grid
        const cols = hero.querySelectorAll(".grid > div");
        if (cols.length < 2) {
          return { exists: false, isVisible: false };
        }
        const right = cols[1] as HTMLElement;
        const style = window.getComputedStyle(right);
        const rect = right.getBoundingClientRect();
        return {
          exists: true,
          display: style.display,
          isVisible: style.display !== "none" && rect.width > 0 && rect.height > 0,
        };
      });

      // 3. Check About section photo visibility (must be visible on ALL screens)
      const aboutPhoto = await page.evaluate(() => {
        const about = document.querySelector("#about");
        if (!about) return null;
        const img = about.querySelector("img");
        if (!img) return { found: false };
        const rect = img.getBoundingClientRect();
        const style = window.getComputedStyle(img);
        return {
          found: true,
          isVisible: style.display !== "none" && rect.width > 0 && rect.height > 0,
          width: rect.width,
          height: rect.height,
        };
      });

      // Expectations
      const isDesktop = width >= 1024;
      const heroPhotoExpectedVisible = isDesktop;
      const heroPhotoPass = heroRightCol ? (heroRightCol.isVisible === heroPhotoExpectedVisible) : false;
      const aboutPhotoPass = aboutPhoto ? aboutPhoto.isVisible : false;
      const overflowPass = !overflow.hasOverflow;
      
      // On mobile (< 1024), hero image should NOT be downloaded
      const downloadPass = isDesktop ? true : downloadedHeroImages.length === 0;

      const passed = heroPhotoPass && aboutPhotoPass && overflowPass && downloadPass;
      if (!passed) allPassed = false;

      console.log(
        `[${theme}] ${width}px: ${passed ? "PASS" : "FAIL"} | Hero Photo: ${
          heroRightCol?.isVisible ? "VISIBLE" : "HIDDEN"
        } (Expected: ${heroPhotoExpectedVisible ? "VISIBLE" : "HIDDEN"}) | About Photo: ${
          aboutPhoto?.isVisible ? "VISIBLE" : "HIDDEN"
        } | Overflow: ${overflow.scrollWidth <= overflow.clientWidth ? "NONE" : "DETECTED"} | Mobile Downloads: ${
          downloadedHeroImages.length
        }`
      );

      await context.close();
    }
  }

  // 4. Test Resizing Across 1024px boundary (1023px -> 1024px -> 1023px)
  console.log("\n--- Testing Dynamic Resize Across 1024px Boundary ---");
  const resizeContext = await browser.newContext({
    viewport: { width: 1023, height: 900 },
  });
  const resizePage = await resizeContext.newPage();
  await resizePage.goto(BASE_URL, { waitUntil: "networkidle" });

  const state1023 = await resizePage.evaluate(() => {
    const hero = document.querySelector("#hero");
    const right = hero?.querySelectorAll(".grid > div")[1] as HTMLElement;
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      rightDisplay: right ? window.getComputedStyle(right).display : null,
    };
  });

  await resizePage.setViewportSize({ width: 1024, height: 900 });
  await resizePage.waitForTimeout(300);

  const state1024 = await resizePage.evaluate(() => {
    const hero = document.querySelector("#hero");
    const right = hero?.querySelectorAll(".grid > div")[1] as HTMLElement;
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      rightDisplay: right ? window.getComputedStyle(right).display : null,
    };
  });

  await resizePage.setViewportSize({ width: 1023, height: 900 });
  await resizePage.waitForTimeout(300);

  const state1023Return = await resizePage.evaluate(() => {
    const hero = document.querySelector("#hero");
    const right = hero?.querySelectorAll(".grid > div")[1] as HTMLElement;
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      rightDisplay: right ? window.getComputedStyle(right).display : null,
    };
  });

  const resizePass =
    state1023.rightDisplay === "none" &&
    state1024.rightDisplay === "flex" &&
    state1023Return.rightDisplay === "none" &&
    state1023.scrollWidth <= state1023.clientWidth &&
    state1024.scrollWidth <= state1024.clientWidth &&
    state1023Return.scrollWidth <= state1023Return.clientWidth;

  console.log(`Resize test result: ${resizePass ? "PASS" : "FAIL"}`);
  console.log(`  1023px: rightDisplay = ${state1023.rightDisplay}, overflow = ${state1023.scrollWidth > state1023.clientWidth}`);
  console.log(`  1024px: rightDisplay = ${state1024.rightDisplay}, overflow = ${state1024.scrollWidth > state1024.clientWidth}`);
  console.log(`  Return 1023px: rightDisplay = ${state1023Return.rightDisplay}, overflow = ${state1023Return.scrollWidth > state1023Return.clientWidth}`);

  await resizeContext.close();
  await browser.close();

  if (!allPassed || !resizePass) {
    console.error("\nSOME TESTS FAILED!");
    process.exit(1);
  } else {
    console.log("\nALL TESTS PASSED SUCCESSFULLY!");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
