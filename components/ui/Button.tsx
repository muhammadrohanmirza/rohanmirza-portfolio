import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-slate-950 font-semibold shadow-lg shadow-[var(--accent-glow)]",
      secondary:
        "bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)]",
      outline:
        "bg-gray-500 hover:bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--accent)]",
      ghost:
        "bg-transparent hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
      destructive:
        "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
