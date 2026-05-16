"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TopAppBarProps {
  title?: string;
  subtitle?: string;
  isLive?: boolean;
  icon?: string;
  className?: string;
}

export default function TopAppBar({ 
  title = "MATCHDAY", 
  subtitle = "LIVE", 
  isLive = true,
  icon = "sports_soccer",
  className 
}: TopAppBarProps) {
  return (
    <header className={cn(
      "absolute top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(0,228,120,0.1)]",
      className
    )}>
      <div className="flex items-center justify-between px-gutter w-full max-w-[390px] mx-auto h-16">
        <div className="flex items-center gap-stack-sm">
          <span className="material-symbols-outlined text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
          <h1 className="font-headline-md text-headline-md tracking-tight text-primary-fixed">
            {title} {subtitle && <span className="opacity-80 font-normal text-sm"> • {subtitle}</span>}
          </h1>
        </div>
        
        <div className="flex items-center gap-stack-sm">
          {isLive && (
            <div className="flex items-center gap-1.5 bg-error/20 px-2 py-0.5 rounded-full border border-error/30">
              <div className="w-2 h-2 bg-error rounded-full live-pulse"></div>
              <span className="font-label-caps text-[10px] text-error">LIVE</span>
            </div>
          )}
          <span className="material-symbols-outlined text-on-surface-variant hover:opacity-80 transition-opacity cursor-pointer">
            sensors
          </span>
        </div>
      </div>
    </header>
  );
}
