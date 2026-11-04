"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Terminal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useReducedMotion } from "framer-motion";

interface HeroStackBadgesProps {
  badges: string[];
}

export function HeroStackBadges({ badges }: HeroStackBadgesProps) {
  const shouldReduceMotion = useReducedMotion();

  const outerContainerRef = useRef<HTMLDivElement>(null);
  const measureRowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const singleSetRef = useRef<HTMLDivElement>(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Animation and drag state refs (avoid React re-renders on every animation frame)
  const offsetRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);

  // Accurately measure unconstrained natural width against container width
  const checkOverflow = useCallback(() => {
    if (!outerContainerRef.current || !measureRowRef.current) return;
    const containerWidth = outerContainerRef.current.clientWidth;
    const naturalContentWidth = measureRowRef.current.getBoundingClientRect().width;
    // If badges need more width than container, turn into marquee slider
    const overflows = naturalContentWidth > containerWidth - 12;
    setIsOverflowing(overflows);
  }, []);

  useEffect(() => {
    checkOverflow();

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    if (outerContainerRef.current) {
      resizeObserver.observe(outerContainerRef.current);
    }
    window.addEventListener("resize", checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [checkOverflow, badges]);

  // Keep hover/drag state in sync with ref for animation frame loop
  useEffect(() => {
    isPausedRef.current = isHovered || isDragging;
  }, [isHovered, isDragging]);

  // Hardware-accelerated subpixel animation loop
  useEffect(() => {
    if (!isOverflowing || shouldReduceMotion) return;

    let animId: number;
    const speed = 0.85; // pixels per frame at 60fps (~50px/sec)

    const updateSetWidth = () => {
      if (singleSetRef.current) {
        // Measure exact width of one badge set including spacing
        singleSetWidthRef.current = singleSetRef.current.offsetWidth + 16;
      }
    };
    updateSetWidth();

    const loop = () => {
      if (!isPausedRef.current && trackRef.current && singleSetWidthRef.current > 0) {
        offsetRef.current += speed;

        const loopWidth = singleSetWidthRef.current;
        if (offsetRef.current >= loopWidth) {
          offsetRef.current -= loopWidth;
        } else if (offsetRef.current < 0) {
          offsetRef.current += loopWidth;
        }

        trackRef.current.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOverflowing, shouldReduceMotion, badges]);

  if (!badges || badges.length === 0) return null;

  // Pointer drag handlers for desktop mouse and mobile touch
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    isPausedRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    if (trackRef.current) {
      trackRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    let newOffset = dragStartOffsetRef.current - deltaX;

    const loopWidth = singleSetWidthRef.current || 500;
    while (newOffset >= loopWidth) newOffset -= loopWidth;
    while (newOffset < 0) newOffset += loopWidth;

    offsetRef.current = newOffset;
    trackRef.current.style.transform = `translate3d(-${newOffset}px, 0, 0)`;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (trackRef.current) {
      try {
        trackRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture release fallback
      }
    }
    // Resume auto-scroll after a short user rest
    setTimeout(() => {
      isPausedRef.current = false;
    }, 800);
  };

  return (
    <div
      ref={outerContainerRef}
      className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-[var(--border)] relative w-full max-w-4xl mx-auto overflow-hidden select-none"
    >
      {/* 1. Off-screen unconstrained measurement element with width: max-content */}
      <div
        ref={measureRowRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          visibility: "hidden",
          width: "max-content",
          pointerEvents: "none",
          zIndex: -1,
        }}
        className="inline-flex items-center gap-2 sm:gap-3 whitespace-nowrap opacity-0 pointer-events-none"
      >
        <span className="font-mono mr-2 flex items-center gap-1.5 shrink-0 text-xs">
          <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" /> Stack:
        </span>
        {badges.map((b, i) => (
          <Badge key={`measure-${b}-${i}`} variant="default">
            {b}
          </Badge>
        ))}
      </div>

      {/* Case 1: Badges fit on screen without wrapping -> Center row exactly like now */}
      {!isOverflowing ? (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-[var(--foreground-muted)]">
          <span className="font-mono text-[var(--foreground-muted)] mr-2 flex items-center gap-1.5 shrink-0">
            <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" /> Stack:
          </span>
          {badges.map((badge, idx) => (
            <Badge key={`${badge}-${idx}`} variant="default">
              {badge}
            </Badge>
          ))}
        </div>
      ) : shouldReduceMotion ? (
        /* Case 2: Overflowing with prefers-reduced-motion -> Manually scrollable row (no auto-scroll) */
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none z-10" />

          <div
            className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2 px-6 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)",
              maskImage:
                "linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)",
            }}
          >
            <span className="font-mono text-[var(--foreground-muted)] mr-1 flex items-center gap-1.5 shrink-0 text-xs">
              <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" /> Stack:
            </span>
            {badges.map((badge, idx) => (
              <Badge key={`static-${badge}-${idx}`} variant="default">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        /* Case 3: Overflowing -> Smooth hardware-accelerated marquee slider */
        <div
          className="relative w-full overflow-hidden group py-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => {
            setTimeout(() => setIsHovered(false), 1000);
          }}
        >
          {/* Soft fade edges on left & right */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none z-10" />

          {/* Draggable & Auto-scrolling Subpixel Moving Track */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`inline-flex items-center gap-4 whitespace-nowrap will-change-transform cursor-grab ${
              isDragging ? "cursor-grabbing" : ""
            }`}
            style={{
              touchAction: "pan-y",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)",
            }}
          >
            {/* Set 1: Primary measured loop set */}
            <div
              ref={singleSetRef}
              className="inline-flex items-center gap-2.5 sm:gap-3 shrink-0"
            >
              <span className="font-mono text-[var(--foreground-muted)] mr-1 flex items-center gap-1.5 shrink-0 text-xs">
                <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" /> Stack:
              </span>
              {badges.map((badge, idx) => (
                <div key={`s1-${badge}-${idx}`} className="shrink-0">
                  <Badge variant="default">{badge}</Badge>
                </div>
              ))}
            </div>

            {/* Set 2: Duplicate for seamless loop wrap */}
            <div
              className="inline-flex items-center gap-2.5 sm:gap-3 shrink-0"
              aria-hidden="true"
            >
              <span className="font-mono text-[var(--foreground-muted)] mr-1 flex items-center gap-1.5 shrink-0 text-xs">
                <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" /> Stack:
              </span>
              {badges.map((badge, idx) => (
                <div key={`s2-${badge}-${idx}`} className="shrink-0">
                  <Badge variant="default">{badge}</Badge>
                </div>
              ))}
            </div>

            {/* Set 3: Triplicate to guarantee full viewport coverage on wide screens */}
            <div
              className="inline-flex items-center gap-2.5 sm:gap-3 shrink-0"
              aria-hidden="true"
            >
              <span className="font-mono text-[var(--foreground-muted)] mr-1 flex items-center gap-1.5 shrink-0 text-xs">
                <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" /> Stack:
              </span>
              {badges.map((badge, idx) => (
                <div key={`s3-${badge}-${idx}`} className="shrink-0">
                  <Badge variant="default">{badge}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
