import React from "react";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: number | string;
  subValue?: string;
  icon: LucideIcon;
  href?: string;
  accentColor?: string;
}

export function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  href,
}: StatCardProps) {
  const content = (
    <div className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-[#3498db]/10 group-hover:text-[#3498db] transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-3xl font-bold tracking-tight text-slate-800 block">
            {value}
          </span>
          {subValue && (
            <span className="text-xs text-slate-500 mt-1 block">
              {subValue}
            </span>
          )}
        </div>

        {href && (
          <div className="p-1 rounded-lg text-slate-400 group-hover:text-[#3498db] transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
