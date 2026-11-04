"use client";

import React from "react";
import Link from "next/link";
import { SocialIcon } from "./SocialIcon";

interface FooterProps {
  siteSettings?: {
    brandName?: string | null;
    brandMonogram?: string | null;
    footerText?: string | null;
    copyrightNotice?: string | null;
  } | null;
  socialLinks?: any[];
  profileTitle?: string | null;
}

export function Footer({ siteSettings, profileTitle, socialLinks = [] }: FooterProps) {
  const brandName = siteSettings?.brandName || "Rohan.Dev";
  const subtitle = profileTitle || "Full Stack Developer & AI Engineer";
  const currentYear = new Date().getFullYear();
  const copyright =
    siteSettings?.copyrightNotice?.replace("[Year]", currentYear.toString()) ||
    `© ${currentYear} ${brandName}. All rights reserved.`;

  const footerNav = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Services", href: "#services" },
    { label: "Education", href: "#education" },
    { label: "Contact", href: "#contact" },
  ];

  // Default social links if none provided in db
  const displayedSocials =
    socialLinks && socialLinks.length > 0
      ? socialLinks
      : [
          { platform: "GitHub", url: "https://github.com" },
          { platform: "LinkedIn", url: "https://linkedin.com" },
          { platform: "X", url: "https://x.com" },
        ];

  return (
    <footer className="border-t border-[var(--border)] bg-transparent py-10 px-4 sm:px-6 relative text-xs">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Subtitle Left */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <Link
            href="#hero"
            className="flex items-center gap-2 text-base font-bold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors font-heading"
          >
            <div className="w-6 h-6 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-heading font-black text-xs shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <path d="M4 4h7a4 4 0 0 1 4 4 4 4 0 0 1-4 4H4z" />
                <path d="M4 12h5l5 8" />
              </svg>
            </div>
            <span>
              {brandName.includes(".") ? (
                <>
                  {brandName.substring(0, brandName.lastIndexOf("."))}
                  <span className="text-[var(--accent)]">
                    {brandName.substring(brandName.lastIndexOf("."))}
                  </span>
                </>
              ) : (
                brandName
              )}
            </span>
          </Link>
          <span className="text-[var(--foreground-muted)] font-sans text-xs">
            {subtitle}
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {footerNav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors py-1 font-medium text-xs"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Social Icons & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-2.5">
          <div className="flex items-center gap-3">
            {displayedSocials.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors p-1"
                aria-label={s.platform}
              >
                <SocialIcon platform={s.platform} className="w-4 h-4" />
              </a>
            ))}
          </div>
          <div className="text-[var(--foreground-muted)] text-center md:text-right font-sans text-xs">
            {copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}
