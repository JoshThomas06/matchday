"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import { useCricketMatches } from "@/services/cricket/api";
import { NormalizedCricMatch } from "@/lib/normalizers/cricket";

type CommentaryType = "SIX" | "FOUR" | "WICKET" | "DOT" | "1 RUN" | "2 RUNS" | "WIDE" | "NO BALL";

const BADGE: Record<CommentaryType, { bg: string; color: string }> = {
  "SIX":     { bg: "#00ff87", color: "#003919" },
  "FOUR":    { bg: "#3b82f6", color: "#fff" },
  "WICKET":  { bg: "#ef4444", color: "#fff" },
  "DOT":     { bg: "#273647", color: "#849585" },
  "1 RUN":   { bg: "#273647", color: "#849585" },
  "2 RUNS":  { bg: "#273647", color: "#849585" },
  "WIDE":    { bg: "#f97316", color: "#fff" },
  "NO BALL": { bg: "#f97316", color: "#fff" },
};

function fmtScore(s?: { runs: number, wickets: number, overs: number }) {
  if (!s) return null;
  return `${s.runs}/${s.wickets} (${typeof s.overs === "number" ? s.overs.toFixed(1) : s.overs} ov)`;
}

// ── Reusable UI atoms ──────────────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style,
    }}>{children}</div>
  );
}

function LiveBadge() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)",
      padding: "8px 16px", borderRadius: 9999,
      border: "1px solid rgba(239,68,68,0.4)",
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />
      <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", color: "#fff", textTransform: "uppercase" }}>Live</span>
    </div>
  );
}

function SkeletonRow({ w = "100%", h = 16 }: { w?: string; h?: number }) {
  return <div style={{ width: w, height: h, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 8, animation: "pulse-dot 1.5s infinite" }} />;
}

// ── Match Picker strip ─────────────────────────────────────────────────────
function MatchPicker({ matches, selected, onSelect }: {
  matches: NormalizedCricMatch[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24 }}>
      {matches.map(m => {
        const active = m.id === selected;
        return (
          <button key={m.id} onClick={() => onSelect(m.id)} style={{
            flexShrink: 0, padding: "8px 16px", borderRadius: 8, border: "none",
            background: active ? "var(--green)" : "rgba(18,33,49,0.7)",
            color: active ? "var(--green-dark)" : "var(--muted)",
            fontFamily: "var(--font)", fontWeight: 700, fontSize: 11,
            letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
            outline: active ? "none" : "1px solid rgba(255,255,255,0.07)",
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}>
            {m.isLive && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: active ? "#003919" : "#ef4444", marginRight: 6, verticalAlign: "middle" }} />}
            {m.name.length > 34 ? m.name.slice(0, 34) + "…" : m.name}
          </button>
        );
      })}
    </div>
  );
}

// ── Score hero ─────────────────────────────────────────────────────────────
function ScoreHero({ match }: { match: NormalizedCricMatch }) {
  const s1 = fmtScore(match.scores[0]);
  const s2 = fmtScore(match.scores[1]);
  return (
    <Card style={{ padding: "28px 32px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,255,135,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          {match.matchState === "LIVE" && <LiveBadge />}
          {match.matchState === "COMPLETED" && (
            <span style={{ padding: "6px 14px", borderRadius: 9999, background: "rgba(255,255,255,0.08)", color: "var(--muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>COMPLETED</span>
          )}
          {match.matchState === "UPCOMING" && (
            <span style={{ padding: "6px 14px", borderRadius: 9999, background: "rgba(255,186,58,0.12)", color: "var(--amber)", border: "1px solid rgba(255,186,58,0.2)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>UPCOMING</span>
          )}
          {match.matchState === "DELAYED" && (
            <span style={{ padding: "6px 14px", borderRadius: 9999, background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.2)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>DELAYED</span>
          )}
          {match.matchState === "ABANDONED" && (
            <span style={{ padding: "6px 14px", borderRadius: 9999, background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>ABANDONED</span>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Venue</div>
          <div style={{ fontSize: 13, color: "var(--text)" }}>{match.venue}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{match.homeTeam}</div>
          {s1 ? (
            <div style={{ fontSize: 36, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.02em", textShadow: "0 0 20px rgba(0,255,135,0.3)" }}>{s1}</div>
          ) : (
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--muted)" }}>Yet to bat</div>
          )}
        </div>
        <div style={{ textAlign: "center", padding: "0 16px" }}>
          <div style={{ fontSize: 22, fontWeight: 900, fontStyle: "italic", color: "var(--amber)" }}>VS</div>
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{match.awayTeam}</div>
          {s2 ? (
            <div style={{ fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{s2}</div>
          ) : (
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--muted)" }}>Yet to bat</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 13, color: "var(--muted)" }}>
        {match.status}
      </div>
    </Card>
  );
}

// ── Commentary balls strip ──────────────────────────────────────────────────
function BallsStrip({ balls }: { balls?: string[] }) {
  if (!balls?.length) return null;
  const displayBalls = balls.slice(-6);
  const colorMap: Record<string, { bg: string; text: string }> = {
    "W": { bg: "#ef4444", text: "#fff" },
    "6": { bg: "#00ff87", text: "#003919" },
    "4": { bg: "#3b82f6", text: "#fff" },
    "0": { bg: "#273647", text: "#849585" },
    "WD": { bg: "#f97316", text: "#fff" },
    "NB": { bg: "#f97316", text: "#fff" },
  };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginRight: 4 }}>THIS OVER</span>
      {displayBalls.map((b, i) => {
        const c = colorMap[b] ?? { bg: "#1c2b3c", text: "#d4e4fa" };
        return (
          <div key={i} style={{
            width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: c.bg, color: c.text, fontSize: 13, fontWeight: 700,
          }}>{b}</div>
        );
      })}
    </div>
  );
}

// ── No matches fallback ────────────────────────────────────────────────────
function NoMatches() {
  return (
    <Card style={{ padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No Live Cricket Right Now</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, maxWidth: 320, margin: "0 auto 24px" }}>
        Cricket matches will appear here automatically when they go live. Check back during IPL, Test matches, or international fixtures.
      </p>
      <Link href="/" style={{
        display: "inline-block", padding: "12px 28px", background: "var(--green)", color: "var(--green-dark)",
        borderRadius: 8, fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase",
      }}>← Back to Home</Link>
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
const CATEGORIES = ["IPL", "T20 World Cup", "Test Matches", "ODI", "Series Hub"];

export default function DashboardPage() {
  const { data: cricketMatches = [], isLoading: loading, error: fetchError } = useCricketMatches();
  const [selectedId, setSelectedId] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState(0);

  // Auto-select
  useEffect(() => {
    if (cricketMatches.length > 0 && !selectedId) {
      const live = cricketMatches.find(m => m.isLive);
      setSelectedId(live?.id ?? cricketMatches[0].id);
    }
  }, [cricketMatches, selectedId]);

  const error = fetchError ? "Live connection unavailable" : "";

  const activeCategoryName = CATEGORIES[activeCategory];
  const filteredMatches = cricketMatches.filter(m => {
    if (activeCategoryName === "IPL") return m.name.toLowerCase().includes("ipl") || m.name.toLowerCase().includes("premier league") || m.name.toLowerCase().includes("super kings") || m.name.toLowerCase().includes("knight riders") || m.name.toLowerCase().includes("royal challengers") || m.name.toLowerCase().includes("indians") || m.name.toLowerCase().includes("sunrisers") || m.name.toLowerCase().includes("capitals") || m.name.toLowerCase().includes("titans") || m.name.toLowerCase().includes("super giants");
    if (activeCategoryName === "Test Matches") return m.name.toLowerCase().includes("test");
    if (activeCategoryName === "T20 World Cup") return m.name.toLowerCase().includes("t20") && m.name.toLowerCase().includes("world cup");
    if (activeCategoryName === "ODI") return m.name.toLowerCase().includes("odi");
    return true; // Series Hub / Default
  });

  // Ensure selectedId is valid within filtered, else pick the first live or first available
  const validSelectedId = filteredMatches.find(m => m.id === selectedId) ? selectedId : (filteredMatches.find(m => m.isLive)?.id ?? filteredMatches[0]?.id ?? "");

  const selected = filteredMatches.find(m => m.id === validSelectedId);

  return (
    <div style={{ padding: "24px 24px 48px", minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "var(--green)", marginBottom: 4, textTransform: "uppercase" }}>
            Cricket · Live Dashboard
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
            CRICKET <span style={{ color: "var(--green)" }}>LIVE</span>
          </h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            {/* Updated state handles automatically by React Query */}
            {!loading && "LIVE POLLING ACTIVE"}
          </div>
          {error && <div style={{ fontSize: 11, color: "var(--amber)", marginTop: 2 }}>⚠ {error}</div>}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {CATEGORIES.map((cat, i) => (
          <button key={cat} onClick={() => setActiveCategory(i)} style={{
            padding: "7px 18px", borderRadius: 9999, border: "none", whiteSpace: "nowrap",
            background: activeCategory === i ? "rgba(0,255,135,0.12)" : "rgba(18,33,49,0.6)",
            outline: `1px solid ${activeCategory === i ? "var(--green)" : "var(--border)"}`,
            color: activeCategory === i ? "var(--green)" : "var(--muted)",
            fontFamily: "var(--font)", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
          }}>{cat}</button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div>
          <SkeletonRow h={200} />
          <SkeletonRow h={120} />
        </div>
      )}

      {/* No matches */}
      {!loading && filteredMatches.length === 0 && <NoMatches />}

      {/* Main content */}
      {!loading && filteredMatches.length > 0 && (
        <>
          {/* Match picker (only show if multiple) */}
          {filteredMatches.length > 1 && (
            <MatchPicker matches={filteredMatches} selected={validSelectedId} onSelect={setSelectedId} />
          )}

          {selected && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

              {/* LEFT — Score + Analytics */}
              <div>
                <ScoreHero match={selected} />

                {/* Status line */}
                <Card style={{ padding: "16px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", gap: 24 }}>
                    {selected.scores[0] && (
                      <div>
                        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>CRR</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--green)" }}>
                          {selected.scores[0].overs > 0 ? (selected.scores[0].runs / selected.scores[0].overs).toFixed(2) : "—"}
                        </div>
                      </div>
                    )}
                    {selected.scores[0] && (
                      <div>
                        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Wickets</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{selected.scores[0].wickets ?? "—"}/10</div>
                      </div>
                    )}
                    {selected.scores[0] && (
                      <div>
                        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Overs</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{selected.scores[0].overs ?? "—"}</div>
                      </div>
                    )}
                  </div>
                  <Link href={`/stats?id=${selected.id}&sport=cricket`}
                    style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    View Analytics →
                  </Link>
                </Card>

                {/* Removed fake Run Progression and Boundary Pulse widgets as per requirements */}
              </div>

              {/* RIGHT — Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Match list */}
                <Card style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>All Matches</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filteredMatches.slice(0, 6).map(m => (
                      <button key={m.id} onClick={() => setSelectedId(m.id)} style={{
                        padding: "10px 12px", borderRadius: 8, border: "none", textAlign: "left", cursor: "pointer",
                        background: m.id === validSelectedId ? "rgba(0,255,135,0.08)" : "rgba(0,0,0,0.2)",
                        outline: m.id === validSelectedId ? "1px solid rgba(0,255,135,0.3)" : "1px solid rgba(255,255,255,0.05)",
                        transition: "all 0.2s",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          {m.matchState === "LIVE" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0, display: "inline-block" }} />}
                          <span style={{ fontSize: 11, color: m.matchState === "LIVE" ? "#ef4444" : "var(--muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            {m.matchState}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                          {m.name.length > 36 ? m.name.slice(0, 36) + "…" : m.name}
                        </div>
                        {fmtScore(m.scores[0]) && (
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginTop: 4 }}>{fmtScore(m.scores[0])}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Next wicket poll link */}
                <Card style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Fan Interaction</div>
                  <Link href="/predictions" style={{
                    display: "block", padding: "12px", background: "rgba(0,255,135,0.08)",
                    border: "1px solid rgba(0,255,135,0.2)", borderRadius: 8, marginBottom: 8,
                    color: "var(--green)", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em",
                  }}>📊 Open Predictions →</Link>
                  <Link href="/quiz" style={{
                    display: "block", padding: "12px", background: "rgba(255,186,58,0.08)",
                    border: "1px solid rgba(255,186,58,0.2)", borderRadius: 8,
                    color: "var(--amber)", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em",
                  }}>❓ Live Quiz →</Link>
                </Card>

                {/* Watch links */}
                <Card style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Watch Live</div>
                  {[
                    { name: "JioHotstar", url: "https://www.jiohotstar.com", region: "India" },
                    { name: "Willow TV", url: "https://www.willow.tv", region: "USA" },
                    { name: "Sky Sports", url: "https://www.skysports.com", region: "UK" },
                  ].map(link => (
                    <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{link.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{link.region}</div>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>▶ Watch</span>
                    </a>
                  ))}
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
