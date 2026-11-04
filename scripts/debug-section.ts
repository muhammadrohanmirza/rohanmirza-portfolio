import { chromium } from "playwright";

async function run() {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 375, height: 667 } });
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const data = await p.evaluate(`(() => {
    const about = document.querySelector("#about");
    if (!about) return { error: "No about section found" };

    const firstDiv = about.querySelector("div");
    const h2 = about.querySelector("h2");
    const pTag = about.querySelector("p");

    const csAbout = window.getComputedStyle(about);
    const csFirstDiv = firstDiv ? window.getComputedStyle(firstDiv) : null;
    const csH2 = h2 ? window.getComputedStyle(h2) : null;

    return {
      about: {
        opacity: csAbout.opacity,
        display: csAbout.display,
        visibility: csAbout.visibility,
        color: csAbout.color,
        bg: csAbout.backgroundColor
      },
      firstDiv: csFirstDiv ? {
        opacity: csFirstDiv.opacity,
        display: csFirstDiv.display,
        transform: csFirstDiv.transform,
        inlineStyle: firstDiv.getAttribute("style")
      } : null,
      h2: csH2 ? {
        opacity: csH2.opacity,
        color: csH2.color,
        text: h2.textContent
      } : null,
      htmlSnippet: about.innerHTML.slice(0, 300)
    };
  })()`);

  console.log("BEFORE SCROLL:");
  console.log(JSON.stringify(data, null, 2));

  await p.evaluate(`document.querySelector("#about")?.scrollIntoView()`);
  await p.waitForTimeout(1000);

  const afterScroll = await p.evaluate(`(() => {
    const about = document.querySelector("#about");
    const firstDiv = about ? about.querySelector("div") : null;
    const csFirstDiv = firstDiv ? window.getComputedStyle(firstDiv) : null;
    return {
      firstDivOpacity: csFirstDiv?.opacity,
      firstDivTransform: csFirstDiv?.transform,
      inlineStyle: firstDiv?.getAttribute("style")
    };
  })()`);

  console.log("AFTER SCROLL:");
  console.log(JSON.stringify(afterScroll, null, 2));

  await b.close();
}

run().catch(console.error);
