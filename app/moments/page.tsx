"use client";
import { useState } from "react";

const MOMENTS = [
  { type: "GOAL", min: 23, player: "Saka", team: "ARSENAL", teamColor: "#EF0107", desc: "Clinical finish into the bottom corner", reactions: { fire: 1200, heart: 854, shock: 421 }, hasBanner: false },
  { type: "YELLOW", min: 41, player: "Rodri", team: "MANCHESTER CITY", teamColor: "#6CABDD", desc: "Tactical foul to stop the break", reactions: { clap: 128, shock: 56 }, hasBanner: false },
  { type: "GOAL", min: 58, player: "Havertz", team: "ARSENAL", teamColor: "#EF0107", desc: "Powerful header from a corner", reactions: { fire: 2400, clap: 1100 }, hasBanner: true },
  { type: "GOAL", min: 63, player: "Haaland", team: "MANCHESTER CITY", teamColor: "#6CABDD", desc: "Thunderous strike from outside the box", reactions: { fire: 3100, heart: 420, shock: 890 }, hasBanner: true },
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  GOAL:   { bg: "#00ff87", text: "#003919" },
  YELLOW: { bg: "#ffba3a", text: "#000" },
  RED:    { bg: "#ef4444", text: "#fff" },
  VAR:    { bg: "#3b82f6", text: "#fff" },
};

function MomentCard({ m }: { m: typeof MOMENTS[0] }) {
  const badge = TYPE_COLORS[m.type] ?? { bg: "#273647", text: "#d4e4fa" };
  const isGoal = m.type === "GOAL";

  return (
    <div style={{ background: "rgba(18,33,49,0.65)", border: `1px solid ${m.hasBanner ? m.teamColor + "55" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      {isGoal && (
        <div style={{ height: 180, background: "linear-gradient(135deg, #051424, #0a1f12)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: badge.bg, color: badge.text, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 900, letterSpacing: "0.06em" }}>{m.type} • {m.min}'</span>
          </div>
          <span style={{ fontSize: 60 }}>⚽</span>
        </div>
      )}
      <div style={{ padding: "14px 16px" }}>
        {!isGoal && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, background: badge.bg, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: badge.text }}>
              {m.type === "YELLOW" ? "🟨" : "🟥"}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{m.player} • {m.min}'</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>{m.team}</div>
            </div>
          </div>
        )}
        {isGoal && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: 16 }}>{m.player}</span>
            <span style={{ color: "var(--muted)", fontSize: 13, marginLeft: 8 }}>{m.team}</span>
          </div>
        )}
        <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--text)", marginBottom: 12 }}>"{m.desc}"</p>
        <div style={{ display: "flex", gap: 16 }}>
          {Object.entries(m.reactions).map(([key, val]) => {
            const emoji: Record<string, string> = { fire: "🔥", heart: "❤️", shock: "😱", clap: "👏" };
            return (
              <button key={key} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: 13, fontFamily: "var(--font)" }}>
                {emoji[key]} {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MomentsPage() {
  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, fontStyle: "italic", color: "#fff", marginBottom: 24 }}>Key Moments</h1>
      {MOMENTS.map((m, i) => <MomentCard key={i} m={m} />)}
    </div>
  );
}