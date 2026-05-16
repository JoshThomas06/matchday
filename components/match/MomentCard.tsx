"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export interface Moment {
  id: string;
  type: "GOAL" | "WICKET" | "SIX" | "FOUR" | "YELLOW_CARD" | "EVENT";
  matchId: string;
  timeLabel: string;
  description: string;
  reactions: {
    fire: number;
    clap: number;
    shocked: number;
  };
}

interface MomentCardProps {
  moment: Moment;
}

export default function MomentCard({ moment }: MomentCardProps) {
  const [reactions, setReactions] = useState(moment.reactions);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const handleReact = (type: keyof typeof reactions) => {
    setActiveReaction(type);
    setReactions(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    setTimeout(() => setActiveReaction(null), 300);
  };

  let tag = 'EVENT'; 
  let tagIcon = 'bolt';
  let colorClass = 'bg-surface-variant text-on-surface-variant shadow-[0_0_10px_rgba(255,255,255,0.1)]';
  let borderColor = 'border-white/5';
  
  if (moment.type === 'GOAL') { 
    tag = 'GOAL'; tagIcon = 'sports_soccer'; 
    colorClass = 'bg-primary-container text-on-primary-container shadow-[0_0_10px_currentColor]'; 
    borderColor = 'border-primary-container/30'; 
  }
  if (moment.type === 'SIX' || moment.type === 'FOUR') { 
    tag = moment.type; tagIcon = 'sports_cricket'; 
    colorClass = 'bg-primary-container text-on-primary-container shadow-[0_0_10px_currentColor]'; 
    borderColor = 'border-primary-container/30'; 
  }
  if (moment.type === 'WICKET') { 
    tag = 'WICKET'; tagIcon = 'sports_cricket'; 
    colorClass = 'bg-error text-on-error shadow-[0_0_10px_currentColor]'; 
    borderColor = 'border-error/30'; 
  }
  if (moment.type === 'YELLOW_CARD') { 
    tag = 'YELLOW CARD'; tagIcon = 'style'; 
    colorClass = 'bg-[#FFD700] text-black shadow-[0_0_10px_currentColor]'; 
    borderColor = 'border-[#FFD700]/30'; 
  }

  return (
    <GlassCard className={cn("overflow-hidden flex flex-col border animate-fade-in shadow-[0_4px_20px_rgba(0,0,0,0.2)]", borderColor)}>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colorClass)}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {tagIcon}
            </span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {tag} • {moment.timeLabel}
            </h3>
            <p className="font-label-caps text-[10px] tracking-widest text-outline uppercase">
              {moment.matchId.includes('epl') ? 'PREMIER LEAGUE' : 'CRICKET'}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-on-surface-variant italic mt-2">
          "{moment.description}"
        </p>
        
        <div className="pt-2 flex gap-2">
          <ReactionButton 
            emoji="🔥" 
            count={reactions.fire} 
            isActive={activeReaction === 'fire'} 
            onClick={() => handleReact('fire')} 
          />
          <ReactionButton 
            emoji="👏" 
            count={reactions.clap} 
            isActive={activeReaction === 'clap'} 
            onClick={() => handleReact('clap')} 
          />
          <ReactionButton 
            emoji="😱" 
            count={reactions.shocked} 
            isActive={activeReaction === 'shocked'} 
            onClick={() => handleReact('shocked')} 
          />
        </div>
      </div>
    </GlassCard>
  );
}

function ReactionButton({ emoji, count, isActive, onClick }: { emoji: string, count: number, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "bg-surface-container-high px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/5 transition-all duration-300",
        isActive ? "bg-primary-container/20 scale-110" : "hover:bg-surface-container-highest"
      )}
    >
      <span>{emoji}</span>
      <span className="font-label-caps text-[10px] tracking-widest">{count}</span>
    </button>
  );
}
