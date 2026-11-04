"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Calendar } from "lucide-react";

interface MessageDateItem {
  id: string;
  createdAt: string | Date;
}

interface MessagesBarChartProps {
  messages: MessageDateItem[];
}

export function MessagesBarChart({ messages }: MessagesBarChartProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");
  const [hoveredBar, setHoveredBar] = useState<{ label: string; count: number } | null>(null);

  // Group messages based on timeframe
  const data = useMemo(() => {
    const now = new Date();

    if (timeframe === "week") {
      // Past 7 days (including today)
      const days: { label: string; dateStr: string; count: number }[] = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ymd = d.toISOString().slice(0, 10);
        days.push({
          label: dayNames[d.getDay()],
          dateStr: ymd,
          count: 0,
        });
      }

      for (const m of messages) {
        const mDate = new Date(m.createdAt).toISOString().slice(0, 10);
        const match = days.find((day) => day.dateStr === mDate);
        if (match) {
          match.count++;
        }
      }

      return days;
    } else {
      // Past 30 days grouped in 6 intervals of 5 days
      const intervals: { label: string; startDate: Date; endDate: Date; count: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const end = new Date(now);
        end.setDate(end.getDate() - i * 5);
        const start = new Date(end);
        start.setDate(start.getDate() - 4);
        intervals.push({
          label: `${start.getDate()}/${start.getMonth() + 1}`,
          startDate: start,
          endDate: end,
          count: 0,
        });
      }

      for (const m of messages) {
        const mTime = new Date(m.createdAt).getTime();
        for (const inter of intervals) {
          if (mTime >= inter.startDate.getTime() && mTime <= inter.endDate.getTime() + 86400000) {
            inter.count++;
            break;
          }
        }
      }

      return intervals.map((item) => ({
        label: item.label,
        dateStr: item.label,
        count: item.count,
      }));
    }
  }, [messages, timeframe]);

  const maxCount = Math.max(...data.map((d) => d.count), 0);
  const totalInPeriod = data.reduce((acc, curr) => acc + curr.count, 0);

  // Dynamic Y-axis scale
  const yMax = maxCount > 0 ? (maxCount <= 5 ? 5 : Math.ceil(maxCount / 5) * 5) : 5;
  const yTicks = [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0];

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Header controls with Timeframe selector */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs text-slate-500 font-medium">
            Total in period: <strong className="text-slate-800">{totalInPeriod}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
          <button
            type="button"
            onClick={() => setTimeframe("week")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              timeframe === "week"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("month")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              timeframe === "month"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {totalInPeriod === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Calendar className="w-8 h-8" />
          </div>
          <p className="text-sm font-medium text-slate-600">No message activity recorded</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Incoming visitor submissions in the past {timeframe === "week" ? "7 days" : "month"} will chart here.
          </p>
        </div>
      ) : (
        <div className="relative pt-2">
          {/* Hover Tooltip display */}
          <div className="h-6 mb-2 text-center text-xs">
            {hoveredBar ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white font-mono text-[11px] shadow">
                <span>{hoveredBar.label}:</span>
                <strong className="text-[#3498db]">{hoveredBar.count} message{hoveredBar.count === 1 ? "" : "s"}</strong>
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">Hover over a bar to inspect details</span>
            )}
          </div>

          {/* Bar Chart Container */}
          <div className="flex items-end gap-2 sm:gap-4 h-48 sm:h-52 w-full pt-4 pb-2 border-b border-slate-200">
            {/* Y-axis Ticks */}
            <div className="flex flex-col justify-between h-full pr-2 text-[10px] font-mono text-slate-400 select-none">
              {yTicks.map((tick, i) => (
                <span key={i}>{tick}</span>
              ))}
            </div>

            {/* Bars Area */}
            <div className="flex-1 flex items-end justify-around h-full gap-2 sm:gap-3">
              {data.map((bar, index) => {
                const heightPercent = yMax > 0 ? (bar.count / yMax) * 100 : 0;
                const isHovered = hoveredBar?.label === bar.label;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredBar({ label: bar.label, count: bar.count })}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div
                      className="w-full max-w-[28px] sm:max-w-[36px] rounded-t-md transition-all duration-200"
                      style={{
                        height: `${Math.max(heightPercent, bar.count > 0 ? 8 : 2)}%`,
                        backgroundColor: isHovered
                          ? "#3498db"
                          : bar.count > 0
                          ? "#2c3e50"
                          : "#e2e8f0",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis Labels */}
          <div className="flex justify-around pl-6 sm:pl-8 pt-2.5 text-xs font-mono text-slate-500">
            {data.map((bar, index) => (
              <span key={index} className="text-center truncate">
                {bar.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
