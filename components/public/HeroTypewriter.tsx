"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { useReducedMotion } from "framer-motion";

export interface HeroTypewriterConfig {
  name: string;
  nameHighlight?: string;
  typeName?: boolean;
  phrases: string[];
  enabled?: boolean;
  speed?: "slow" | "normal" | "fast" | string;
  loop?: boolean;
  fallbackTitle: string;
  ignoreReducedMotion?: boolean;
}

/**
 * Standardized speeds (in ms) in ONE place:
 * slow:   type 150 / delete 80 / pause 2200
 * normal: type 85  / delete 45 / pause 1600
 * fast:   type 40  / delete 25 / pause 1000
 */
export const TYPEWRITER_SPEED_CONFIG = {
  slow: {
    type: 150,
    delete: 80,
    pause: 2200,
    pauseAfterName: 500,
    pauseEmpty: 250,
  },
  normal: {
    type: 85,
    delete: 45,
    pause: 1600,
    pauseAfterName: 400,
    pauseEmpty: 200,
  },
  fast: {
    type: 40,
    delete: 25,
    pause: 1000,
    pauseAfterName: 300,
    pauseEmpty: 150,
  },
} as const;

export function splitNameParts(fullName: string, highlightWord?: string) {
  const trimmed = (fullName || "").trim();
  if (!trimmed) {
    return { prefix: "", highlight: "", suffix: "" };
  }
  const words = trimmed.split(/\s+/);
  const target = highlightWord?.trim() || (words.length > 1 ? words[words.length - 1] : "");

  if (!target) {
    return { prefix: trimmed, highlight: "", suffix: "" };
  }

  const startIdx = trimmed.indexOf(target);
  if (startIdx === -1) {
    const lastWord = words[words.length - 1];
    const lastIdx = trimmed.lastIndexOf(lastWord);
    return {
      prefix: trimmed.slice(0, lastIdx).trimEnd(),
      highlight: lastWord,
      suffix: "",
    };
  }

  return {
    prefix: trimmed.slice(0, startIdx).trimEnd(),
    highlight: target,
    suffix: trimmed.slice(startIdx + target.length),
  };
}

export interface HeroHeadingTypewriterProps {
  fullName: string;
  nameHighlight?: string;
  typeName?: boolean;
  phrases: string[];
  enabled?: boolean;
  speed?: "slow" | "normal" | "fast" | string;
  loop?: boolean;
  fallbackTitle: string;
  ignoreReducedMotion?: boolean;
}

/**
 * HeroHeadingTypewriter:
 * Fully isolated client component that updates text via DOM refs.
 * Zero React re-renders of the parent HeroSection during typing.
 */
export const HeroHeadingTypewriter = React.memo(function HeroHeadingTypewriter({
  fullName,
  nameHighlight,
  typeName = true,
  phrases,
  enabled = true,
  speed = "normal",
  loop = true,
  fallbackTitle,
  ignoreReducedMotion = false,
}: HeroHeadingTypewriterProps) {
  const shouldReduceMotion = useReducedMotion();
  const isInstant = Boolean(!enabled || (shouldReduceMotion && !ignoreReducedMotion));

  // Normalize phrases stably
  const validPhrases = useMemo(() => {
    const list = (phrases || []).map((p) => p.trim()).filter(Boolean);
    return list.length > 0 ? list : [fallbackTitle || "Full Stack Developer & AI Engineer"];
  }, [phrases, fallbackTitle]);

  const phrasesKey = useMemo(() => validPhrases.join("||"), [validPhrases]);

  // Find longest phrase for CLS reservation
  const longestPhrase = useMemo(() => {
    return validPhrases.reduce(
      (longest, curr) => (curr.length > longest.length ? curr : longest),
      validPhrases[0] || fallbackTitle
    );
  }, [validPhrases, fallbackTitle]);

  // Split name parts
  const { prefix, highlight } = useMemo(
    () => splitNameParts(fullName, nameHighlight),
    [fullName, nameHighlight]
  );

  // Speed configuration lookup
  const delays = useMemo(() => {
    const normalized = (
      typeof speed === "string" ? speed.toLowerCase().trim() : "normal"
    ) as "slow" | "normal" | "fast";
    return TYPEWRITER_SPEED_CONFIG[normalized] || TYPEWRITER_SPEED_CONFIG.normal;
  }, [speed]);

  // DOM Refs for direct textContent mutations
  const prefixSpanRef = useRef<HTMLSpanElement>(null);
  const highlightSpanRef = useRef<HTMLSpanElement>(null);
  const nameCursorRef = useRef<HTMLSpanElement>(null);
  const titleSpanRef = useRef<HTMLSpanElement>(null);
  const titleCursorRef = useRef<HTMLSpanElement>(null);

  // Tab visibility tracker
  const isTabVisibleRef = useRef<boolean>(true);
  useEffect(() => {
    const handleVisibility = () => {
      isTabVisibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Main single-timeout typewriter animation chain
  useEffect(() => {
    if (isInstant) {
      if (prefixSpanRef.current) prefixSpanRef.current.textContent = prefix;
      if (highlightSpanRef.current) highlightSpanRef.current.textContent = highlight;
      if (titleSpanRef.current) titleSpanRef.current.textContent = validPhrases[0] || fallbackTitle;
      if (nameCursorRef.current) nameCursorRef.current.style.display = "none";
      if (titleCursorRef.current) titleCursorRef.current.style.display = "none";
      return;
    }

    let isCancelled = false;
    let timerId: NodeJS.Timeout | null = null;

    let currentPhase:
      | "type_prefix"
      | "type_highlight"
      | "pause_after_name"
      | "type_title"
      | "pause_title"
      | "delete_title"
      | "pause_empty"
      | "done" = typeName
      ? prefix.length > 0
        ? "type_prefix"
        : highlight.length > 0
        ? "type_highlight"
        : "pause_after_name"
      : "type_title";

    let prefixIdx = typeName ? 0 : prefix.length;
    let highlightIdx = typeName ? 0 : highlight.length;
    let titleIdx = 0;
    let phraseIdx = 0;

    // Initialize DOM visible elements
    if (prefixSpanRef.current) {
      prefixSpanRef.current.textContent = typeName ? "" : prefix;
    }
    if (highlightSpanRef.current) {
      highlightSpanRef.current.textContent = typeName ? "" : highlight;
    }
    if (nameCursorRef.current) {
      nameCursorRef.current.style.display = typeName ? "inline-block" : "none";
    }
    if (titleSpanRef.current) {
      titleSpanRef.current.textContent = "";
    }
    if (titleCursorRef.current) {
      titleCursorRef.current.style.display = typeName ? "none" : "inline-block";
    }

    function scheduleNext(delayMs: number) {
      if (isCancelled) return;
      timerId = setTimeout(tick, delayMs);
    }

    function tick() {
      if (isCancelled) return;

      if (!isTabVisibleRef.current) {
        scheduleNext(150);
        return;
      }

      // Phase 1: Typing Name Prefix
      if (currentPhase === "type_prefix") {
        if (prefixIdx < prefix.length) {
          prefixIdx++;
          if (prefixSpanRef.current) {
            prefixSpanRef.current.textContent = prefix.slice(0, prefixIdx);
          }
          scheduleNext(delays.type);
        } else {
          if (highlight.length > 0) {
            currentPhase = "type_highlight";
            scheduleNext(delays.type);
          } else {
            currentPhase = "pause_after_name";
            scheduleNext(delays.pauseAfterName);
          }
        }
        return;
      }

      // Phase 2: Typing Name Highlight
      if (currentPhase === "type_highlight") {
        if (highlightIdx < highlight.length) {
          highlightIdx++;
          if (highlightSpanRef.current) {
            highlightSpanRef.current.textContent = highlight.slice(0, highlightIdx);
          }
          scheduleNext(delays.type);
        } else {
          currentPhase = "pause_after_name";
          scheduleNext(delays.pauseAfterName);
        }
        return;
      }

      // Phase 3: Pause after Name, hand over cursor to title
      if (currentPhase === "pause_after_name") {
        if (nameCursorRef.current) nameCursorRef.current.style.display = "none";
        if (titleCursorRef.current) titleCursorRef.current.style.display = "inline-block";
        currentPhase = "type_title";
        titleIdx = 0;
        scheduleNext(delays.type);
        return;
      }

      const activePhrase = validPhrases[phraseIdx] || validPhrases[0] || fallbackTitle;

      // Phase 4: Typing Title Phrase
      if (currentPhase === "type_title") {
        if (titleIdx < activePhrase.length) {
          titleIdx++;
          if (titleSpanRef.current) {
            titleSpanRef.current.textContent = activePhrase.slice(0, titleIdx);
          }
          scheduleNext(delays.type);
        } else {
          if (validPhrases.length <= 1 && !loop) {
            currentPhase = "done";
            return;
          }
          currentPhase = "pause_title";
          scheduleNext(delays.pause);
        }
        return;
      }

      // Phase 5: Pause on completed phrase
      if (currentPhase === "pause_title") {
        currentPhase = "delete_title";
        scheduleNext(delays.delete);
        return;
      }

      // Phase 6: Deleting Title Phrase
      if (currentPhase === "delete_title") {
        if (titleIdx > 0) {
          titleIdx--;
          if (titleSpanRef.current) {
            titleSpanRef.current.textContent = activePhrase.slice(0, titleIdx);
          }
          scheduleNext(delays.delete);
        } else {
          phraseIdx = (phraseIdx + 1) % validPhrases.length;
          currentPhase = "pause_empty";
          scheduleNext(delays.pauseEmpty);
        }
        return;
      }

      // Phase 7: Pause when phrase deleted before next one
      if (currentPhase === "pause_empty") {
        currentPhase = "type_title";
        titleIdx = 0;
        scheduleNext(delays.type);
        return;
      }
    }

    scheduleNext(delays.type);

    return () => {
      isCancelled = true;
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    };
  }, [
    isInstant,
    typeName,
    prefix,
    highlight,
    phrasesKey,
    validPhrases,
    fallbackTitle,
    delays,
    loop,
  ]);

  return (
    <>
      {/* 1. Large Two-Tone Heading 1 for Name */}
      {fullName && (
        <h1 className="grid text-left text-4xl sm:text-5xl lg:text-[3.25rem] font-bold font-heading tracking-tight text-[var(--foreground)] mb-3 leading-[1.12]">
          {/* Full static text for SEO crawlers and screen readers */}
          <span className="sr-only">{fullName}</span>

          {/* Size reservation (invisible placeholder, same grid cell as visible text) */}
          <span
            className="col-start-1 row-start-1 [grid-area:1/1] invisible select-none pointer-events-none"
            aria-hidden="true"
          >
            <span>{prefix}</span>
            {highlight && (
              <span className="ml-2">
                {highlight}
              </span>
            )}
          </span>

          {/* Animated visual text with isolated DOM ref spans */}
          <span
            aria-hidden="true"
            className="col-start-1 row-start-1 [grid-area:1/1] text-left inline-flex items-center flex-wrap"
          >
            <span ref={prefixSpanRef}>
              {isInstant || !typeName ? prefix : ""}
            </span>
            {highlight && (
              <span
                ref={highlightSpanRef}
                className="text-[var(--accent)] accent-gradient-text ml-2"
              >
                {isInstant || !typeName ? highlight : ""}
              </span>
            )}
            <span
              ref={nameCursorRef}
              className="inline-block w-[3px] h-[0.85em] ml-1 align-middle bg-[var(--accent)] rounded-full typewriter-cursor"
              style={{
                display: isInstant || !typeName ? "none" : "inline-block",
              }}
              aria-hidden="true"
            />
          </span>
        </h1>
      )}

      {/* 2. Title Line (Typewriter) with reserved layout size */}
      <div
        className="grid text-left text-lg sm:text-xl lg:text-2xl font-semibold font-heading text-[var(--foreground)] mb-4"
        aria-label={validPhrases[0] || fallbackTitle}
      >
        {/* Screen-reader full copy */}
        <span className="sr-only">{validPhrases[0] || fallbackTitle}</span>

        {/* Size reservation (invisible, same grid cell as the animated text) */}
        <span
          className="col-start-1 row-start-1 [grid-area:1/1] invisible select-none pointer-events-none"
          aria-hidden="true"
        >
          {longestPhrase}
        </span>

        {/* Animated visual title text + cursor right after the last typed character */}
        <span
          aria-hidden="true"
          className="col-start-1 row-start-1 [grid-area:1/1] text-left inline-flex items-center"
        >
          <span ref={titleSpanRef}>
            {isInstant ? validPhrases[0] || fallbackTitle : ""}
          </span>
          <span
            ref={titleCursorRef}
            className="inline-block w-[2.5px] h-[0.85em] ml-1 align-middle bg-[var(--accent)] rounded-full typewriter-cursor"
            style={{
              display: isInstant ? "none" : typeName ? "none" : "inline-block",
            }}
            aria-hidden="true"
          />
        </span>
      </div>
    </>
  );
});

// Backward-compatible isolated component for title-only usage
export const HeroTypewriter = React.memo(function HeroTypewriter({
  phrases,
  enabled = true,
  speed = "normal",
  loop = true,
  fallbackText,
  ignoreReducedMotion = false,
}: {
  phrases: string[];
  enabled?: boolean;
  speed?: "slow" | "normal" | "fast" | string;
  loop?: boolean;
  fallbackText: string;
  ignoreReducedMotion?: boolean;
}) {
  return (
    <HeroHeadingTypewriter
      fullName=""
      typeName={false}
      phrases={phrases}
      enabled={enabled}
      speed={speed}
      loop={loop}
      fallbackTitle={fallbackText}
      ignoreReducedMotion={ignoreReducedMotion}
    />
  );
});

// Backward-compatible hook stub for any external consumers
export function useHeroDualTypewriter(config: HeroTypewriterConfig) {
  const { prefix, highlight } = splitNameParts(config.name, config.nameHighlight);
  return {
    nameParts: { prefix, highlight, suffix: "" },
    titleText: config.phrases?.[0] || config.fallbackTitle,
    activeLine: "done" as const,
    isReducedMotion: false,
    longestPhrase: config.phrases?.[0] || config.fallbackTitle,
  };
}
