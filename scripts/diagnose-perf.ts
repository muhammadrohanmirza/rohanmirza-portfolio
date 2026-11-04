import { chromium } from "playwright";

async function diagnose() {
  console.log("=== STARTING DIAGNOSTIC TRACE ON PRODUCTION BUILD ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  // Track long tasks
  await page.addInitScript(() => {
    (window as any).__longTasks = [];
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__longTasks.push({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
          });
        }
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch (e) {
      console.warn("Longtask observer not supported or errored", e);
    }
  });

  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Measure 1: Hero Typewriter text progression over 3 seconds
  console.log("Measuring Typewriter behavior...");
  const typewriterSnapshots: { time: number; text: string; h1Text: string }[] = [];
  const startTypeTime = Date.now();
  for (let i = 0; i < 20; i++) {
    const data = await page.evaluate(`(() => {
      const h1 = document.querySelector("#hero h1")?.textContent || "";
      const subtitle = document.querySelector("#hero .min-h-\\\\[1\\\\.4em\\\\]")?.textContent || "";
      return { h1, subtitle };
    })()`);
    typewriterSnapshots.push({
      time: Date.now() - startTypeTime,
      text: (data as any).subtitle,
      h1Text: (data as any).h1Text,
    });
    await page.waitForTimeout(150);
  }
  console.log("Typewriter snapshots sample:", typewriterSnapshots.slice(0, 8));

  // Measure 2: Nav click to start of scroll latency
  console.log("Measuring Nav click to scroll latency...");
  
  // Test clicking "About" link
  const navClickMeasurement = await page.evaluate(`(async () => {
    const aboutLink = document.querySelector('nav a[href="#about"]');
    if (!aboutLink) return { error: "About link not found" };

    const initialY = window.scrollY;
    const clickTime = performance.now();

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (Math.abs(window.scrollY - initialY) > 2) {
          const scrollStartTime = performance.now();
          clearInterval(interval);
          resolve({
            clickTime,
            scrollStartTime,
            latencyMs: scrollStartTime - clickTime,
            initialY,
            finalY: window.scrollY,
          });
        }
        if (performance.now() - clickTime > 3000) {
          clearInterval(interval);
          resolve({ error: "Scroll did not start within 3s", latencyMs: -1 });
        }
      }, 2);
      aboutLink.click();
    });
  })()`);
  console.log("Nav click latency (About):", navClickMeasurement);

  await page.waitForTimeout(1200);

  // Test clicking "Projects" link
  const projectsClickMeasurement = await page.evaluate(`(async () => {
    const link = document.querySelector('nav a[href="#projects"]');
    if (!link) return { error: "Projects link not found" };

    const initialY = window.scrollY;
    const clickTime = performance.now();

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (Math.abs(window.scrollY - initialY) > 2) {
          const scrollStartTime = performance.now();
          clearInterval(interval);
          resolve({
            latencyMs: scrollStartTime - clickTime,
            initialY,
            finalY: window.scrollY,
          });
        }
        if (performance.now() - clickTime > 3000) {
          clearInterval(interval);
          resolve({ error: "Scroll did not start within 3s", latencyMs: -1 });
        }
      }, 2);
      link.click();
    });
  })()`);
  console.log("Nav click latency (Projects):", projectsClickMeasurement);

  await page.waitForTimeout(1200);

  // Measure 3: Long tasks accumulated
  const longTasks = await page.evaluate(`(() => window.__longTasks || [])()`);
  console.log(`Detected ${(longTasks as any[]).length} long tasks over 50ms:`, longTasks);

  // Measure 4: Check scroll listener frequency during manual scroll
  const scrollStats = await page.evaluate(`(async () => {
    let scrollEventCount = 0;
    const onScroll = () => { scrollEventCount++; };
    window.addEventListener("scroll", onScroll, { passive: true });

    const startTime = performance.now();
    for (let pos = 0; pos <= 1500; pos += 25) {
      window.scrollTo(0, pos);
      await new Promise(r => setTimeout(r, 8));
    }
    const duration = performance.now() - startTime;
    window.removeEventListener("scroll", onScroll);
    return { scrollEventCount, durationMs: duration };
  })()`);
  console.log("Scroll event volume test:", scrollStats);

  // Measure 5: Check Three.js canvas behavior when scrolled far down
  const canvasStats = await page.evaluate(`(() => {
    const canvas = document.querySelector("#hero canvas");
    const heroEl = document.getElementById("hero");
    const rect = heroEl?.getBoundingClientRect();
    return {
      hasCanvas: Boolean(canvas),
      heroRectTop: rect?.top,
      heroRectBottom: rect?.bottom,
      isHeroOffscreen: (rect?.bottom || 0) < 0,
    };
  })()`);
  console.log("Hero / Three.js canvas offscreen status at scroll 1500:", canvasStats);

  await browser.close();
  console.log("=== DIAGNOSTIC FINISHED ===");
}

diagnose().catch(console.error);
