"use client";

import React, { useState } from "react";

interface ProjectsDonutChartProps {
  published: number;
  draft: number;
  featured: number;
}

export function ProjectsDonutChart({
  published,
  draft,
  featured,
}: ProjectsDonutChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const total = published + draft + featured;

  const segments = [
    { name: "Published", count: published, color: "#3498db" },
    { name: "Draft", count: draft, color: "#2c3e50" },
    { name: "Featured", count: featured, color: "#f97316" },
  ];

  if (total === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">No project data yet</p>
        <p className="text-xs text-slate-400 mt-0.5">Projects created will appear in this status breakdown.</p>
      </div>
    );
  }

  // Calculate SVG arc segments
  // Radius: 70, stroke width: 28, center at 100, 100
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col items-center">
      {/* Chart Canvas */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 my-2">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform">
          {/* Background circle track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="32"
          />

          {segments.map((segment) => {
            const percentage = total > 0 ? segment.count / total : 0;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += percentage * circumference;

            if (segment.count === 0) return null;

            const isHovered = hoveredSegment === segment.name;

            return (
              <circle
                key={segment.name}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={isHovered ? "36" : "32"}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment(segment.name)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
        </svg>

        {/* Central Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {hoveredSegment
              ? segments.find((s) => s.name === hoveredSegment)?.count || 0
              : total}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {hoveredSegment || "Total Projects"}
          </span>
        </div>
      </div>

      {/* Legend Matching Reference Screenshot */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-slate-100 w-full text-xs">
        {segments.map((segment) => {
          const percent = total > 0 ? Math.round((segment.count / total) * 100) : 0;
          return (
            <div
              key={segment.name}
              className="flex items-center gap-2 cursor-pointer transition-opacity"
              onMouseEnter={() => setHoveredSegment(segment.name)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border-2"
                style={{
                  borderColor: segment.color,
                  backgroundColor: hoveredSegment === segment.name ? segment.color : "transparent",
                }}
              />
              <span className="text-slate-600 font-medium">{segment.name}</span>
              <span className="text-slate-400 font-mono text-[11px]">
                ({segment.count} • {percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
