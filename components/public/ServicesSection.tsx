"use client";

import React from "react";
import {
  Layout,
  Bot,
  Server,
  Code,
  Sparkles,
  Terminal,
  Database,
  Cpu,
  Layers,
  Network,
  Palette,
  Globe,
  MessageSquare,
  Briefcase,
  Users,
  LucideIcon,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const serviceIconMap: Record<string, LucideIcon> = {
  Layout,
  Bot,
  Server,
  Code,
  Sparkles,
  Terminal,
  Database,
  Cpu,
  Layers,
  Network,
  Palette,
  Globe,
  MessageSquare,
  Briefcase,
  Users,
};

interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  deliverableTag?: string | null;
}

interface ServicesSectionProps {
  services?: Service[];
  eyebrow?: string | null;
  title?: string | null;
  intro?: string | null;
}

export function ServicesSection({
  services = [],
  eyebrow,
  title,
  intro,
}: ServicesSectionProps) {
  if (!services || services.length === 0) return null;

  const defaultIntro =
    "I offer modern web development and AI solutions tailored to your needs. From concept to deployment, I help turn your ideas into powerful digital products.";

  return (
    <section
      id="services"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative scroll-mt-20 sm:scroll-mt-24 border-t border-white/[0.04]"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Eyebrow, Heading, and Short Intro Paragraph (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <SectionHeading
              eyebrow={eyebrow || "SERVICES"}
              title={title || "What *I Do*"}
              defaultTitle="What I Do"
              defaultHighlight="I Do"
              description={intro || defaultIntro}
            />
          </div>

          {/* Right Column: 3-column grid on desktop, 2-column on tablet, 1-column on mobile (col-span-8) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const Icon = serviceIconMap[service.iconName] || Code;
                return (
                  <div
                    key={service.id}
                    className="flex flex-col items-start text-left group"
                  >
                    {/* Icon in a rounded square tinted with the accent */}
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:border-blue-500/40 group-hover:bg-blue-500/15 transition-all duration-200">
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight mb-1 group-hover:text-blue-300 transition-colors">
                      {service.title}
                    </h3>

                    {/* One-line description */}
                    <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
