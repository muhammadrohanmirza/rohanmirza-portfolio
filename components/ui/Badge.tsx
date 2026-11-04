import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  children,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center font-mono font-medium rounded-full transition-colors";

  const sizes = {
    sm: "px-2.5 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  const variants = {
    default: "bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border)]",
    accent: "bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30",
    success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    outline: "border border-[var(--border)] text-[var(--foreground-muted)]",
  };

  return (
    <span className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
