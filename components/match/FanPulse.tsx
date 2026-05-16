"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface FanPulseProps {
  team1Label?: string;
  team2Label?: string;
  initialTeam1Pct?: number;
  totalVoters?: string;
}

export default function FanPulse({
  team1Label = "Arsenal Fans",
  team2Label = "City Fans",
  initialTeam1Pct = 61,
  totalVoters = "12.4k Voting"
}: FanPulseProps) {
  const [team1Pct, setTeam1Pct] = useState(initialTeam1Pct);
  
  const handleVote = (team: 1 | 2) => {
    // Basic interaction simulation
    if (team === 1) {
      setTeam1Pct(prev => Math.min(100, prev + 2));
    } else {
      setTeam1Pct(prev => Math.max(0, prev - 2));
    }
  };

  const team2Pct = 100 - team1Pct;

  return (
    <GlassCard className="p-stack-md relative overflow-hidden space-y-stack-md">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-fixed to-secondary"></div>
      
      <div className="flex items-center justify-between">
        <h2 className="font-label-caps text-primary-fixed flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">bolt</span>
          Fan Pulse
        </h2>
        <span className="text-[10px] text-outline font-label-caps">{totalVoters}</span>
      </div>
      
      <div className="space-y-stack-sm">
        <div className="flex justify-between font-display-score text-2xl">
          <span className="text-primary-fixed transition-all duration-500">{team1Pct}%</span>
          <span className="text-secondary transition-all duration-500">{team2Pct}%</span>
        </div>
        
        <div className="flex h-3 w-full rounded-full bg-surface-container overflow-hidden cursor-pointer">
          <div 
            onClick={() => handleVote(1)}
            className="h-full bg-primary-fixed shadow-[0_0_10px_rgba(0,228,120,0.6)] hover:brightness-125 transition-all duration-500 ease-out" 
            style={{ width: `${team1Pct}%` }}
          ></div>
          <div 
            onClick={() => handleVote(2)}
            className="h-full bg-secondary opacity-80 hover:brightness-125 transition-all duration-500 ease-out" 
            style={{ width: `${team2Pct}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-outline font-label-caps text-[10px]">
          <span>{team1Label}</span>
          <span>{team2Label}</span>
        </div>
      </div>
    </GlassCard>
  );
}
