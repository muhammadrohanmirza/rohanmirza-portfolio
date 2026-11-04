import React from "react";

export function parseTwoToneText(text: string, fallbackHighlight?: string) {
  if (!text) return { before: "", highlight: "", after: "" };

  // Check for *highlight* syntax (e.g. "Who *I Am*" or "Featured *Projects*")
  const starMatch = text.match(/^(.*?)\*(.*?)\*(.*)$/);
  if (starMatch) {
    return {
      before: starMatch[1],
      highlight: starMatch[2],
      after: starMatch[3],
    };
  }

  // Fallback to explicit word or last word
  const words = text.trim().split(/\s+/);
  if (fallbackHighlight && text.includes(fallbackHighlight)) {
    const idx = text.indexOf(fallbackHighlight);
    return {
      before: text.slice(0, idx),
      highlight: fallbackHighlight,
      after: text.slice(idx + fallbackHighlight.length),
    };
  }

  if (words.length > 1) {
    const lastWord = words[words.length - 1];
    const lastIdx = text.lastIndexOf(lastWord);
    return {
      before: text.slice(0, lastIdx),
      highlight: lastWord,
      after: text.slice(lastIdx + lastWord.length),
    };
  }

  return { before: text, highlight: "", after: "" };
}

interface SectionHeadingProps {
  eyebrow?: string | null;
  title?: string | null;
  defaultTitle?: string;
  defaultHighlight?: string;
  description?: string | null;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  defaultTitle = "",
  defaultHighlight = "",
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const displayTitle = title?.trim() || defaultTitle;
  const { before, highlight, after } = parseTwoToneText(displayTitle, defaultHighlight);

  return (
    <div className={`space-y-1.5 ${align === "center" ? "text-center mx-auto" : "text-left"} ${className}`}>
      {eyebrow && (
        <span className="block text-xs font-mono font-semibold tracking-widest text-blue-400 uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading tracking-tight text-white leading-tight">
        <span>{before}</span>
        {highlight && (
          <span className="accent-gradient-text ml-1.5">{highlight}</span>
        )}
        {after && <span>{after}</span>}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal pt-1">
          {description}
        </p>
      )}
    </div>
  );
}
