import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getPublicSiteSettings, getPublicProfile } from "@/lib/queries/public.queries";
import { LoginForm } from "./LoginForm";
import { Loader2 } from "lucide-react";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin Login | Rohan.Dev",
  description: "Secure administrative login portal.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function LoginPage() {
  const [siteSettings, profile] = await Promise.all([
    getPublicSiteSettings().catch(() => null),
    getPublicProfile().catch(() => null),
  ]);

  const brandName = siteSettings?.brandName || "Rohan.Dev";
  const brandMonogram = siteSettings?.brandMonogram || "RM";
  const avatarUrl = profile?.avatarUrl || null;

  return (
    <Suspense
      fallback={
        <div className="min-h-dvh w-full flex items-center justify-center bg-gradient-to-b from-[#0ea5e9] via-[#0284c7] to-[#075985] text-white">
          <Loader2 className="w-8 h-8 animate-spin text-white opacity-80" />
        </div>
      }
    >
      <LoginForm
        brandName={brandName}
        brandMonogram={brandMonogram}
        avatarUrl={avatarUrl}
      />
    </Suspense>
  );
}
