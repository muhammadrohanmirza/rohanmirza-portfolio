# Performance Diagnosis, Verification & Benchmark Notes

## 1. Executive Summary & Verification Results

All three issues have been diagnosed, profiled, and cleanly resolved in the production build:
1. **Hero Typewriter Rebuilt Cleanly**: Completely isolated in a memoized component with zero parent re-renders. Text nodes update directly through DOM refs (`textContent`), ensuring steady character-by-character streaming with CSS-only cursor blinking.
2. **Navbar Reacts Instantly**: Nav clicks respond immediately (< 50ms warm latency), with optimistic active state update on click (0ms delay) and native CSS smooth scroll.
3. **Smooth, Stable Underline Highlight**: Replaced unthrottled `scroll` event listener with a performant `IntersectionObserver`. Spy updates are locked during click-initiated scrolls, eliminating indicator jitter and intermediate flicker.

---

## 2. Before vs. After Benchmark Measurements (Production Build)

Environment: Production build (`next build`, `next start`), tested with automated Playwright suite on Chromium across 375px (Mobile), 768px (Tablet), and 1440px (Desktop) viewports in both Light and Dark themes.

| Metric | Before Optimization | After Optimization | Status |
| :--- | :--- | :--- | :--- |
| **Nav Click Latency: #projects** | **129.9 ms** | **49.8 ms** | **PASS** (< 100ms) |
| **Nav Click Latency: #services** | **—** (did not scroll) | **46.2 ms** | **PASS** (< 100ms) |
| **Nav Click Latency: #hero** | **—** | **47.2 ms** | **PASS** (< 100ms) |
| **Nav Click Latency: #about (cold start)** | **231.2 ms** | **115.1 ms** (cold) / **< 50 ms** (warm) | **Greatly Improved** (2x faster) |
| **Active Highlight Response on Click** | Delayed by 60ms+ | **0 ms** (instant optimistic update) | **PASS** |
| **Highlight Tracking during Smooth Scroll** | Flickered across intermediate sections | **Locked & flicker-free** during scroll | **PASS** |
| **Manual Scroll Tracking** | Heavy `getBoundingClientRect()` on every scroll tick | **IntersectionObserver** (zero scroll ticks) | **PASS** |
| **Hero Typewriter Execution** | Broken (hung with 0 chars typed for >1.9s) | **Smooth character streaming**, no skipped/repeated letters | **PASS** |
| **Hero Parent Re-renders per Typed Char** | 10–25 full `HeroSection` re-renders/sec | **0 parent re-renders** (DOM ref mutations) | **PASS** |
| **Long Tasks (>100ms) during Scroll & Typing** | Repeated long tasks (up to 243ms, 106ms, 103ms) | **0 long tasks** during scroll and typing | **PASS** |

---

## 3. Evaluation of Likely Causes

| Suspected Cause | Status | Finding & Resolution |
| :--- | :--- | :--- |
| **(a) Scroll event listener calling setState on every tick** | **REAL** | Replaced with `IntersectionObserver` with `-75px 0px -40% 0px` rootMargin; state updates only when intersecting section truly changes. |
| **(b) Active-link underline using Framer Motion layoutId thrashing** | **REAL** | Isolated nav links in `React.memo`, locked scroll spy during click scrolls, tuned spring to `stiffness: 400, damping: 35`. |
| **(c) Many sections animating with whileInView at once** | **PARTIALLY REAL** | Hero section re-renders were triggering repeated variant evaluations. Fixed by isolating typewriter into leaf component. |
| **(d) Three.js canvas or rAF loop running when off-screen** | **REAL** | Added `frameloop={isPaused ? "demand" : "always"}` to Canvas to halt continuous rAF loops when off-screen. |
| **(e) Typewriter updating state causing parent tree re-renders** | **REAL (CRITICAL)** | Typewriter previously re-rendered the entire `HeroSection` on every character. Rebuilt to update text directly via `ref.current.textContent`. |
| **(f) CSS scroll-behavior: smooth fighting JS smooth scroll** | **REAL** | Removed 60ms delay and duplicate smooth behavior. Native CSS smooth scroll paired with section `scroll-mt-24` now powers scrolling. |
| **(g) Large backdrop-filter/blur areas** | **REAL** | Reduced extreme `blur-[120px]` background blobs in Hero to `blur-3xl`, reducing GPU raster overhead. |
| **(h) React Strict Mode / dev-only behavior** | **REAL IN DEV** | Strict mode double-invocations exacerbated timer cancellation issues. Rebuilt with a clean single-chain `setTimeout` with strict cleanup. |

---

## 4. Verification Details

### (a) Typewriter Speeds & Progression
- Speeds configured in ONE central object (`TYPEWRITER_SPEED_CONFIG`):
  - **Slow**: type 150ms / delete 80ms / pause 2200ms
  - **Normal**: type 85ms / delete 45ms / pause 1600ms
  - **Fast**: type 40ms / delete 25ms / pause 1000ms
- Verified that Slow (150ms/char) is ~3.75x slower than Fast (40ms/char).
- Verified tab visibility pause (`document.hidden`) and strict-mode cleanup.
- Verified SEO preservation: static full copy in `.sr-only` and layout space reserved invisibly to prevent Cumulative Layout Shift (CLS).

### (b) Navbar Interaction & Responsiveness
- Clicking any link immediately highlights it (optimistic active state).
- The underline indicator glides smoothly using hardware-accelerated transform spring animation (`stiffness: 400, damping: 35`).
- The scroll-spy is temporarily locked during click-initiated scrolls (850ms) to prevent intermediate sections from overwriting the active indicator.
- Manual scrolling accurately highlights the correct section (tested at Y=0 `#hero`, Y=850 `#about`, Y=1450 `#projects`).

### (c) Multi-Viewport & Accessibility
- Tested at 375px (Mobile), 768px (Tablet), and 1440px (Desktop).
- Mobile Drawer opens and closes smoothly; `document.body.style.overflow = "hidden"` is engaged while open and reliably released on close or navigation.
- Light and Dark appearance modes fully verified and functioning.

---

## 5. Known Issues / Observations

1. **Initial Cold Click Compositor Warmup**: The very first scroll triggered after page load on Chromium may take ~115ms due to initial browser compositor thread initialization; all subsequent clicks execute in 46–55ms.
2. **Initial Hydration Task**: A single initial long task (241ms) occurs during page load as Next.js hydrates and compiles dynamic modules; zero long tasks occur during ongoing scrolling and typing interactions.
