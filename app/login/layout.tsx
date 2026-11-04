import type { Metadata } from "next";
import React from "react";

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

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
