"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth.actions";
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

interface LoginFormProps {
  brandName?: string;
  brandMonogram?: string;
  avatarUrl?: string | null;
}

export function LoginForm({
  brandName = "Rohan.Dev",
  brandMonogram = "RM",
  avatarUrl = null,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const urlError = searchParams.get("error");
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === "expired"
      ? "Your session has expired. Please sign in again."
      : urlError === "unauthorized"
      ? "Unauthorized access. Administrator privileges required."
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await loginAction({ email, password });
      if (!result.success) {
        setErrorMessage(result.error || "Invalid email or password.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-y-auto overflow-x-hidden font-sans bg-gradient-to-b from-[#0ea5e9] via-[#0284c7] to-[#075985] text-white selection:bg-white selection:text-sky-900">
      {/* Subtle abstract texture and depth overlays (CSS only, no external image downloads) */}
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% 15%, rgba(255, 255, 255, 0.4) 0%, transparent 60%),
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, transparent 60%, rgba(3, 30, 60, 0.6) 100%)
          `,
          backgroundSize: "100% 100%, 36px 36px, 100% 100%",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-full h-[480px] bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 max-w-full h-72 bg-blue-950/40 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Column */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[360px] sm:max-w-[380px] flex flex-col items-center relative z-10 my-auto py-6 [@media(max-height:550px)]:py-2"
      >
        {/* Round Avatar Circle with White Ring & Soft Shadow */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 [@media(max-height:550px)]:w-14 [@media(max-height:550px)]:h-14 rounded-full border-[3.5px] border-white shadow-2xl shadow-sky-950/40 mb-3 sm:mb-4 [@media(max-height:550px)]:mb-1.5 shrink-0 overflow-hidden bg-white/20 flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={brandName}
              fill
              className="object-cover rounded-full"
              sizes="(max-width: 640px) 80px, 96px"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold font-heading text-2xl sm:text-3xl [@media(max-height:550px)]:text-lg select-none tracking-wider drop-shadow-sm">
              {brandMonogram}
            </div>
          )}
        </div>

        {/* Brand Name & Admin Label */}
        <div className="text-center mb-6 sm:mb-8 [@media(max-height:550px)]:mb-3">
          <h1 className="text-xl sm:text-2xl [@media(max-height:550px)]:text-lg font-bold font-heading text-white tracking-tight drop-shadow-sm">
            {brandName}
          </h1>
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-sky-100/90 drop-shadow-sm mt-0.5 sm:mt-1 block">
            Admin Login
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5 sm:space-y-4 [@media(max-height:550px)]:space-y-2.5">
          {/* Email Pill Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username or Email"
              disabled={isLoading}
              className="w-full h-12 min-h-[44px] [@media(max-height:550px)]:h-11 rounded-full bg-white text-slate-900 placeholder:text-slate-400 pl-11 pr-4 text-base shadow-lg shadow-sky-950/15 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-sky-600 transition-all disabled:opacity-60"
            />
          </div>

          {/* Password Pill Input with Show/Hide Eye Toggle */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
              className="w-full h-12 min-h-[44px] [@media(max-height:550px)]:h-11 rounded-full bg-white text-slate-900 placeholder:text-slate-400 pl-11 pr-12 text-base shadow-lg shadow-sky-950/15 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-sky-600 transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 min-w-[32px] min-h-[32px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Safe Error Banner (above the button) */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/90 text-white text-xs flex items-center gap-2.5 shadow-lg shadow-rose-950/20 backdrop-blur-sm animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="break-words min-w-0 flex-1">{errorMessage}</span>
            </div>
          )}

          {/* Full-width Pill Dark "Login" Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 min-h-[44px] [@media(max-height:550px)]:h-11 rounded-full bg-[#18181b] hover:bg-[#27272a] active:scale-[0.99] text-white font-semibold text-base shadow-xl shadow-black/35 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-sky-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* Return to Portfolio Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-white/80 hover:text-white transition-colors mt-6 [@media(max-height:550px)]:mt-2.5 drop-shadow-sm min-h-[40px] px-3 py-1.5 rounded-full hover:bg-white/10"
        >
          <span>← Back to {brandName}</span>
        </Link>
      </motion.div>
    </div>
  );
}
