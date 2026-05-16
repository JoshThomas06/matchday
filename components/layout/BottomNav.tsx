"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/moments", icon: "movie_filter", label: "Moments" },
  { href: "/predictions", icon: "query_stats", label: "Predict" },
  { href: "/quiz", icon: "forum", label: "Quiz" },
  { href: "/stats", icon: "leaderboard", label: "Stats" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="absolute bottom-0 w-full z-50 bg-surface/60 backdrop-blur-xl rounded-t-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex justify-around items-center w-full max-w-[390px] mx-auto h-20 pb-[env(safe-area-inset-bottom)] px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-200 active:scale-110",
                isActive 
                  ? "text-primary-fixed drop-shadow-[0_0_8px_rgba(0,228,120,0.6)]" 
                  : "text-outline hover:text-primary"
              )}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="font-label-caps text-[10px] uppercase tracking-widest mt-1">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}