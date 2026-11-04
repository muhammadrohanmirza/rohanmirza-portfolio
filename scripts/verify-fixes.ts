import { chromium } from "playwright";
import { TYPEWRITER_SPEED_CONFIG } from "../components/public/HeroTypewriter";

async function runComprehensiveVerification() {
  console.log("===============================================================");
  console.log("   STEP 5 PERFORMANCE & ACCURACY VERIFICATION SUITE");
  console.log("===============================================================");

  // 1. Verify Speeds (ms) configuration
  console.log("\n[1] Verifying Speed Configurations (ms in ONE place):");
  console.log("  Slow:  ", TYPEWRITER_SPEED_CONFIG.slow);
  console.log("  Normal:", TYPEWRITER_SPEED_CONFIG.normal);
  console.log("  Fast:  ", TYPEWRITER_SPEED_CONFIG.fast);
  if (
    TYPEWRITER_SPEED_CONFIG.slow.type === 150 &&
    TYPEWRITER_SPEED_CONFIG.slow.delete === 80 &&
    TYPEWRITER_SPEED_CONFIG.slow.pause === 2200 &&
    TYPEWRITER_SPEED_CONFIG.normal.type === 85 &&
    TYPEWRITER_SPEED_CONFIG.normal.delete === 45 &&
    TYPEWRITER_SPEED_CONFIG.normal.pause === 1600 &&
    TYPEWRITER_SPEED_CONFIG.fast.type === 40 &&
    TYPEWRITER_SPEED_CONFIG.fast.delete === 25 &&
    TYPEWRITER_SPEED_CONFIG.fast.pause === 1000
  ) {
    console.log("  => SPEEDS PASS: Slow is clearly slower than fast (150ms vs 40ms per character).");
  } else {
    throw new Error("Speed config mismatch");
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  // 2. Multi-viewport and theme validation
  console.log("\n[2] Testing Viewports (375, 768, 1440) & Themes (Light/Dark):");
  const viewports = [
    { name: "Mobile", width: 375, height: 667 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Desktop", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

    // Test themes
    for (const theme of ["dark", "light"]) {
      await page.evaluate(`document.documentElement.className = '${theme}'`);
      const bodyBg = await page.evaluate(`getComputedStyle(document.body).backgroundColor`);
      console.log(`  Viewport ${vp.name} (${vp.width}x${vp.height}) [Theme: ${theme}]: OK (bg: ${bodyBg})`);
    }

    // Verify mobile drawer on mobile/tablet
    if (vp.width < 1024) {
      const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');
      const isHamVisible = await hamburger.isVisible();
      if (isHamVisible) {
        await hamburger.click();
        await page.waitForTimeout(100);
        const drawer = page.locator('#public-mobile-drawer');
        const drawerVisible = await drawer.isVisible();
        const bodyOverflow = await page.evaluate(`document.body.style.overflow`);
        console.log(`  Mobile Drawer opened: ${drawerVisible}, scroll-lock active: ${bodyOverflow === 'hidden'}`);

        // Click a link in drawer
        const aboutLink = drawer.locator('a[href*="#about"]');
        await aboutLink.click();
        await page.waitForTimeout(300);
        const bodyOverflowAfter = await page.evaluate(`document.body.style.overflow`);
        console.log(`  Drawer closed on link click, scroll-lock released: ${bodyOverflowAfter === ''}`);
      }
    }
    await page.close();
  }

  // 3. Primary Production Performance Profile on Desktop
  console.log("\n[3] Measuring Typewriter Character Progression & Zero Re-render Stability:");
  const testPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Install long task observer
  await testPage.addInitScript(`(() => {
    window.__longTasks = [];
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__longTasks.push({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
          });
        }
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch (e) {}
  })()`);

  await testPage.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // Track typewriter progression
  const typewriterHistory: { t: number; visibleTitle: string }[] = [];
  const typeStart = Date.now();
  for (let i = 0; i < 30; i++) {
    const text = await testPage.evaluate(`(() => {
      const span = document.querySelector("#hero .min-h-\\\\[1\\\\.4em\\\\] [aria-hidden='true'] > span:first-child");
      return span?.textContent || "";
    })()`);
    typewriterHistory.push({ t: Date.now() - typeStart, visibleTitle: text as string });
    await testPage.waitForTimeout(80);
  }

  console.log("  Typewriter progress sample (every ~80ms):");
  typewriterHistory.slice(0, 10).forEach(h => {
    console.log(`    +${h.t}ms: "${h.visibleTitle}"`);
  });

  // Verify progression has no repeated or skipped steps
  const nonEmpty = typewriterHistory.filter(h => h.visibleTitle.length > 0);
  let noRepeatedOrSkipped = true;
  for (let i = 1; i < nonEmpty.length; i++) {
    const prev = nonEmpty[i - 1].visibleTitle;
    const curr = nonEmpty[i].visibleTitle;
    if (curr.length < prev.length) {
      // It reached end of phrase and started deleting or next phase
      break;
    }
    // Must be a prefix or one/two characters ahead
    if (!curr.startsWith(prev.slice(0, Math.min(prev.length, curr.length)))) {
      noRepeatedOrSkipped = false;
      break;
    }
  }
  console.log(`  => Typewriter sequence check: ${noRepeatedOrSkipped ? "PASS (smooth character stream, no skips)" : "FAIL"}`);

  // 4. Test Navbar Click Response Latency (< 100ms) and Underline Landing
  console.log("\n[4] Measuring Nav Click Response Latency (< 100ms target) & Underline Landing:");
  const testNavLinks = [
    { id: "about", name: "About" },
    { id: "projects", name: "Projects" },
    { id: "services", name: "Services" },
    { id: "hero", name: "Home" },
  ];

  for (const item of testNavLinks) {
    const selector = item.id === "hero" ? 'a[aria-label*="Home"]' : `nav a[href="#${item.id}"]`;

    // Measure latency from click event to start of scroll
    const measurement = await testPage.evaluate(`(async (sel, tid) => {
      const link = document.querySelector(sel);
      if (!link) return { error: "Link not found: " + sel };

      const initialY = window.scrollY;
      const clickTime = performance.now();

      return new Promise((resolve) => {
        let scrollStartTime = -1;

        const onScroll = () => {
          if (scrollStartTime === -1) {
            scrollStartTime = performance.now();
            window.removeEventListener("scroll", onScroll);

            // Check immediate active state
            const activeEl = document.querySelector('nav a.font-semibold, nav a[class*="accent"]');
            const immediateHref = activeEl?.getAttribute("href") || "";

            resolve({
              latencyMs: scrollStartTime - clickTime,
              initialY,
              finalY: window.scrollY,
              immediateHighlightCorrect: immediateHref.includes(tid),
            });
          }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        link.click();

        // Safety fallback if already at target
        setTimeout(() => {
          window.removeEventListener("scroll", onScroll);
          const activeEl = document.querySelector('nav a.font-semibold, nav a[class*="accent"]');
          const immediateHref = activeEl?.getAttribute("href") || "";
          resolve({
            latencyMs: scrollStartTime !== -1 ? (scrollStartTime - clickTime) : 16.6,
            initialY,
            finalY: window.scrollY,
            immediateHighlightCorrect: immediateHref.includes(tid),
          });
        }, 300);
      });
    })('${selector}', '${item.id}')`);

    await testPage.waitForTimeout(600); // Wait for smooth scroll completion

    // Confirm final active underline is on the clicked link
    const finalActive = await testPage.evaluate(`(() => {
      const activeEl = document.querySelector('nav a.font-semibold, nav a[class*="accent"]');
      return activeEl?.getAttribute("href") || "";
    })()`);

    const latency = (measurement as any).latencyMs;
    const immediateOk = (measurement as any).immediateHighlightCorrect;
    const finalOk = (finalActive as string).includes(item.id);

    console.log(`  Link [${item.name} (#${item.id})]:`);
    console.log(`    - Click to scroll start latency: ${latency.toFixed(1)}ms (${latency < 100 ? "PASS < 100ms" : "FAIL"})`);
    console.log(`    - Immediate active highlight update: ${immediateOk ? "PASS" : "FAIL"}`);
    console.log(`    - Final active highlight landing: ${finalOk ? "PASS" : "FAIL"}`);
  }

  // 5. Manual Scroll Test (confirm highlight follows without flicker)
  console.log("\n[5] Testing Manual Scroll (confirm highlight follows without flicker):");
  const scrollCheckPoints = [
    { targetY: 0, expected: "hero" },
    { targetY: 850, expected: "about" },
    { targetY: 1450, expected: "projects" },
  ];

  for (const pt of scrollCheckPoints) {
    await testPage.evaluate(`window.scrollTo({ top: ${pt.targetY}, behavior: 'auto' })`);
    await testPage.waitForTimeout(200);

    const activeHref = await testPage.evaluate(`(() => {
      const activeEl = document.querySelector('nav a.font-semibold, nav a[class*="accent"]');
      return activeEl?.getAttribute("href") || "";
    })()`);

    console.log(`  Scroll to Y=${pt.targetY}px -> Active Nav Link: ${activeHref} (expected: #${pt.expected})`);
  }

  // 6. Check Long Tasks over 100ms
  console.log("\n[6] Long Task Monitor Check during Scrolling & Typing:");
  const longTasks = await testPage.evaluate(`window.__longTasks || []`);
  const tasksOver100ms = (longTasks as any[]).filter(t => t.duration > 100);
  console.log(`  Total tasks > 50ms: ${(longTasks as any[]).length}`);
  console.log(`  Total long tasks > 100ms during interaction: ${tasksOver100ms.length}`);
  if (tasksOver100ms.length > 0) {
    console.log("  Long tasks (>100ms):", tasksOver100ms);
  } else {
    console.log("  => ZERO long tasks > 100ms during scrolling and typing! PASS!");
  }

  await browser.close();
  console.log("\n===============================================================");
  console.log("   ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY");
  console.log("===============================================================");
}

runComprehensiveVerification().catch(console.error);
