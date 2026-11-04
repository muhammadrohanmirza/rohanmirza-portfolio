import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { cacheTag } from "next/cache";
import { Space_Grotesk, Inter, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import {
  getPublicSeoSettings,
  getPublicThemeSettings,
  getPublicSiteSettings,
} from "@/lib/queries/public.queries";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
  display: "swap",
});

export const instant = false;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  "use cache";
  cacheTag("portfolio:seo", "portfolio:settings");

  const [seo, siteSettings] = await Promise.all([
    getPublicSeoSettings().catch(() => null),
    getPublicSiteSettings().catch(() => null),
  ]);

  const brand = siteSettings?.brandName || "Rohan.Dev";

  const title =
    seo?.siteTitle || `${brand} | Full Stack Developer & AI Engineer`;
  const description =
    seo?.metaDescription ||
    "Portfolio of Rohan - Full Stack Developer & AI Engineer specializing in Next.js, Python, LLMs, and high-performance web systems.";
  const keywords = seo?.keywords
    ? seo.keywords.split(",").map((k: string) => k.trim())
    : [
        "Full Stack Developer",
        "AI Engineer",
        "Next.js",
        "TypeScript",
        "Python",
        "FastAPI",
        "OpenAI",
        "LangChain",
        "MCP",
        "Neon",
      ];
  const twitterHandle = seo?.twitterHandle || "@rohandev";
  const ogImage = seo?.ogImageUrl || undefined;
  const favicon = seo?.faviconUrl || "/favicon.ico";

  return {
    title,
    description,
    keywords,
    authors: [{ name: "Rohan" }],
    creator: "Rohan",
    icons: {
      icon: favicon,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: twitterHandle,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getPublicThemeSettings().catch(() => null);
  const defaultMode = theme?.defaultMode || "DARK";
  const accentColor = theme?.accentColor || "CYAN";
  const themeVersion = theme?.updatedAt ? new Date(theme.updatedAt).getTime().toString() : "0";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-accent={accentColor}
      data-default-mode={defaultMode}
      data-theme-version={themeVersion}
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${caveat.variable} antialiased font-sans`}
    >
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var currentVersion = '${themeVersion}';
                var defaultMode = '${defaultMode}';
                var storedTheme = localStorage.getItem('rohan_theme');
                var storedVersion = localStorage.getItem('rohan_theme_version');

                var theme = defaultMode || 'DARK';
                if (storedTheme && storedVersion && storedVersion === currentVersion) {
                  theme = storedTheme;
                } else if (storedTheme && storedVersion !== currentVersion) {
                  try {
                    localStorage.removeItem('rohan_theme');
                    localStorage.removeItem('rohan_theme_version');
                  } catch (e) {}
                  theme = defaultMode || 'DARK';
                }

                var isLight = false;
                if (theme === 'LIGHT') {
                  isLight = true;
                } else if (theme === 'SYSTEM') {
                  isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
                }

                if (isLight) {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-[100dvh] overflow-x-clip bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--accent)] selection:text-slate-950 transition-colors duration-200"
      >
        {children}
      </body>
    </html>
  );
}
