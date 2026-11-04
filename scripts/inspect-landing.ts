import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

async function inspectLandingPage() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const viewports = [
    { name: "320px", width: 320, height: 640 },
    { name: "375px", width: 375, height: 667 },
    { name: "425px", width: 425, height: 800 },
    { name: "768px", width: 768, height: 1024 },
  ];

  const debugDir = path.resolve(process.cwd(), "docs/debug-landing");
  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }

  for (const vp of viewports) {
    console.log(`\n================ Inspecting ${vp.name} (${vp.width}x${vp.height}) ================`);
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();

    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(600);

    // Scroll down gradually to trigger all whileInView observers
    await page.evaluate(async () => {
      const scrollHeight = document.body.scrollHeight;
      for (let i = 0; i <= scrollHeight; i += 350) {
        window.scrollTo(0, i);
        await new Promise((r) => setTimeout(r, 50));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);

    // Full page screenshot
    const shotPath = path.join(debugDir, `landing_${vp.width}w_full.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log(`Saved screenshot: ${shotPath}`);

    // Check document scrollWidth vs window.innerWidth
    const metrics = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const bodyW = document.body.scrollWidth;
      const winW = window.innerWidth;

      const overflowing: any[] = [];
      const all = document.querySelectorAll("*");
      for (const el of Array.from(all)) {
        const r = el.getBoundingClientRect();
        if (r.width > winW + 1 || r.right > winW + 1 || r.left < -1) {
          const tag = el.tagName.toLowerCase();
          const cls = (el.className || "").toString().slice(0, 60);
          const id = el.id ? `#${el.id}` : "";
          overflowing.push({
            selector: `${tag}${id}.${cls}`,
            width: Math.round(r.width),
            left: Math.round(r.left),
            right: Math.round(r.right),
          });
        }
      }

      // Check section heights and bounding boxes
      const sections = Array.from(document.querySelectorAll("section, header, nav, main > *")).map(s => {
        const r = s.getBoundingClientRect();
        return {
          tag: s.tagName.toLowerCase(),
          id: s.id,
          cls: (s.className || "").toString().slice(0, 40),
          width: Math.round(r.width),
          height: Math.round(r.height),
          left: Math.round(r.left),
          right: Math.round(r.right),
        };
      });

      return { docW, bodyW, winW, overflowing: overflowing.slice(0, 15), sections };
    });

    console.log(`Document scrollWidth: ${metrics.docW}px, window.innerWidth: ${metrics.winW}px`);
    if (metrics.docW > metrics.winW) {
      console.log(`⚠️ HORIZONTAL SCROLL DETECTED: +${metrics.docW - metrics.winW}px`);
    } else {
      console.log(`No root document horizontal scroll.`);
    }

    if (metrics.overflowing.length > 0) {
      console.log(`Elements extending outside viewport:`);
      for (const o of metrics.overflowing) {
        console.log(`  - ${o.selector}: w=${o.width}, left=${o.left}, right=${o.right}`);
      }
    } else {
      console.log(`No elements extending outside viewport bounds.`);
    }

    console.log(`Sections overview:`);
    for (const s of metrics.sections) {
      console.log(`  [${s.tag}#${s.id || "no-id"}] w=${s.width}, h=${s.height}, left=${s.left}`);
    }

    await ctx.close();
  }

  await browser.close();
}

inspectLandingPage().catch(err => {
  console.error("Diagnosis error:", err);
  process.exit(1);
});
