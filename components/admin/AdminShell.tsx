"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { X } from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
  unreadCount?: number;
  adminName?: string;
  adminEmail?: string;
  adminAvatar?: string | null;
}

export function AdminShell({
  children,
  unreadCount = 0,
  adminName = "Rohan Admin",
  adminEmail = "admin@rohan.dev",
  adminAvatar,
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer and restore scroll on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "";
  }, [pathname]);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileMenuOpen(false);
      };
      const handleResize = () => {
        if (window.innerWidth >= 1024) setMobileMenuOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", handleResize);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("resize", handleResize);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  return (
    <div className="admin-layout min-h-screen bg-[#eef0f3] text-slate-800 flex font-sans antialiased overflow-x-hidden p-3 sm:p-4 lg:p-5 gap-4 lg:gap-6">
      {/* Desktop Persistent Rounded Dark Navy Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 h-[calc(100vh-2.5rem)] sticky top-5">
        <AdminSidebar
          unreadCount={unreadCount}
          adminName={adminName}
          adminEmail={adminEmail}
          adminAvatar={adminAvatar}
        />
      </div>

      {/* Mobile Drawer with Backdrop rendered via Portal to prevent clipping */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <div
            id="admin-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation"
            className="fixed inset-0 z-[10000] lg:hidden flex"
          >
            <div
              role="button"
              tabIndex={0}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity cursor-pointer z-[10000]"
              onClick={() => setMobileMenuOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setMobileMenuOpen(false);
              }}
              aria-label="Close menu backdrop"
            />
            <div className="relative w-72 max-w-[85vw] h-dvh p-3 z-[10001] flex flex-col animate-in slide-in-from-left duration-200">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-5 right-5 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-white bg-black/40 border border-white/20 transition-colors cursor-pointer z-30"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex-1 h-full overflow-hidden">
                <AdminSidebar
                  unreadCount={unreadCount}
                  adminName={adminName}
                  adminEmail={adminEmail}
                  adminAvatar={adminAvatar}
                  onNavigate={() => {
                    document.body.style.overflow = "";
                    setTimeout(() => {
                      setMobileMenuOpen(false);
                    }, 100);
                  }}
                />
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <AdminHeader
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          mobileMenuOpen={mobileMenuOpen}
          adminName={adminName}
          adminEmail={adminEmail}
          unreadCount={unreadCount}
        />
        <main className="flex-1 mt-4 max-w-7xl w-full min-w-0 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
