"use client";
import { useState } from "react";

type CommentaryType = "SIX" | "FOUR" | "WICKET" | "DOT" | "1 RUN" | "2 RUNS" | "WIDE" | "NO BALL";

const MATCH = {
  competition: "T20 World Cup Final",
  venue: "Melbourne Cricket Ground",
  homeTeam: "India",   homeShort: "IND", homeEmoji: "🇮🇳", homeBg: "#1a3a6e",
  awayTeam: "Australia", awayShort: "AUS", awayEmoji: "🇦🇺", awayBg: "#b8860b",
  score: "184/3", overs: "18.2", crr: "10.04", rrr: "12.00",
  batter1: { name: "V. Kohli*", runs: 74, balls: 42 },
  batter2: { name: "H. Pandya", runs: 38, balls: 21 },
  bowler:  { name: "P. Cummins", wkts: 1, runs: 32, overs: "3.2" },
  partnership: { runs: 92, p1: "Kohli", p1r: 54, p1b: 32, p2: "Pandya", p2r: 38, p2b: 21 },
  runRateData: [20, 35, 30, 45, 60, 55, 75, 85, 90],
  boundaryData: [8, 12, 6, 20, 10, 16, 8],
  polls: [{ name: "Adam Zampa", pct: 42 }, { name: "Josh Hazlewood", pct: 28 }, { name: "Run Out / Other", pct: 30 }],
  ratings: [
    { name: "Virat Kohli",   rating: 9.2, emoji: "🇮🇳", team: "home" as const },
    { name: "Hardik Pandya", rating: 8.5, emoji: "🇮🇳", team: "home" as const },
    { name: "Pat Cummins",   rating: 7.8, emoji: "🇦🇺", team: "away" as const },
  ],
  commentary: [
    { over: "18.2", type: "SIX" as CommentaryType, headline: "Kohli launches it!", body: "Massive strike over long-on. Cummins missed his length and Virat was all over it. The crowd at MCG has absolutely erupted. That brings up the 90-run partnership!" },
    { over: "18.1", type: "1 RUN" as CommentaryType, headline: "", body: "Slower ball from Cummins, Pandya tucks it away to deep mid-wicket. Easy single taken." },
    { over: "17.6", type: "DOT" as CommentaryType, headline: "", body: "Starc finishes with a wide yorker. Kohli can only dig it out. Strong finish to the over from Starc." },
  ],
};

const CATEGORIES = ["T20 World Cup", "IPL", "Test Matches", "ODI", "Series Hub"];

const BADGE_COLORS: Record<CommentaryType, { bg: string; color: string }> = {
  "SIX":     { bg: "#00ff87", color: "#003919" },
  "FOUR":    { bg: "#3b82f6", color: "#fff" },
  "WICKET":  { bg: "#ef4444", color: "#fff" },
  "DOT":     { bg: "#273647", color: "#b9cbb9" },
  "1 RUN":   { bg: "#273647", color: "#b9cbb9" },
  "2 RUNS":  { bg: "#273647", color: "#b9cbb9" },
  "WIDE":    { bg: "#f97316", color: "#fff" },
  "NO BALL": { bg: "#f97316", color: "#fff" },
};

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
      ...style,
    }}>{children}</div>
  );
}

function LiveBadge() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)",
      padding: "8px 16px", borderRadius: 9999,
      border: "1px solid rgba(0,255,135,0.25)",
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: "var(--green)",
        display: "inline-block", flexShrink: 0, animation: "pulse-dot 2s infinite",
      }} />
      <span style={{
        fontFamily: "var(--font)", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)",
      }}>Live · {MATCH.competition}</span>
    </div>
  );
}

function FeaturedHero() {
  return (
    <Card style={{ position: "relative", overflow: "hidden", minHeight: 420 }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,135,0.07) 0%, transparent 65%), linear-gradient(to bottom, rgba(5,20,36,0.3) 0%, rgba(5,20,36,0.97) 100%)",
      }} />
      <div style={{ position: "relative", zIndex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 0, height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <LiveBadge />
          <Card style={{ padding: "8px 14px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--amber)" strokeWidth={1.8}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{ fontFamily: "var(--font)", fontSize: 14, color: "var(--text)" }}>{MATCH.venue}</span>
          </Card>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 48, gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: MATCH.homeBg, border: "2px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>{MATCH.homeEmoji}</div>
            <h2 style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 28, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.02em" }}>{MATCH.homeTeam}</h2>
            <span style={{ fontFamily: "var(--font)", fontSize: 11, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>Batting</span>
          </div>

          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 68, letterSpacing: "-0.04em", lineHeight: 1, color: "var(--green)", textShadow: "0 0 30px rgba(0,255,135,0.45)" }}>{MATCH.score}</div>
            <div style={{ fontFamily: "var(--font)", fontWeight: 600, fontSize: 22, color: "var(--text)", marginTop: 8 }}>{MATCH.overs} Overs</div>
            <div style={{ fontFamily: "var(--font)", fontSize: 12, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.04em" }}>
              CRR: {MATCH.crr} &nbsp;|&nbsp; RRR: {MATCH.rrr}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: MATCH.awayBg, border: "2px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>{MATCH.awayEmoji}</div>
            <h2 style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 28, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.02em" }}>{MATCH.awayTeam}</h2>
            <span style={{ fontFamily: "var(--font)", fontSize: 11, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>Bowling</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 36 }}>
          <Card style={{ padding: "10px 14px", borderLeft: "3px solid var(--green)", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font)", fontSize: 14 }}>
              <span style={{ fontWeight: 700, color: "#f1ffef" }}>{MATCH.batter1.name}</span>
              <span style={{ color: "var(--text)" }}>{MATCH.batter1.runs} ({MATCH.batter1.balls})</span>
            </div>
          </Card>
          <Card style={{ padding: "10px 14px", borderLeft: "3px solid var(--amber)", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font)", fontSize: 14 }}>
              <span style={{ fontWeight: 700, color: "#f1ffef" }}>{MATCH.bowler.name}</span>
              <span style={{ color: "var(--text)" }}>{MATCH.bowler.wkts}/{MATCH.bowler.runs} ({MATCH.bowler.overs})</span>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}

function BoundaryPulse() {
  return (
    <Card style={{ padding: 16, boxShadow: "0 0 16px rgba(0,255,135,0.15)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Boundary Pulse</span>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--green)" strokeWidth={2}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
      </div>
      <div style={{ height: 80, display: "flex", alignItems: "flex-end", gap: 4, padding: "0 4px" }}>
        {MATCH.boundaryData.map((h, i) => {
          const pct = (h / 20) * 100;
          const isHigh = i === 3;
          return (
            <div key={i} style={{
              flex: 1, borderRadius: "3px 3px 0 0", height: `${pct}%`, minHeight: 4,
              background: isHigh ? "var(--green)" : `rgba(0,255,135,${0.1 + pct / 200})`,
              transition: "height 0.3s",
              animation: isHigh ? "pulse-dot 1.5s infinite" : "none",
            }} />
          );
        })}
      </div>
      <p style={{ fontFamily: "var(--font)", fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        High excitement detected in the last 2 overs
      </p>
    </Card>
  );
}

function NextWicketPoll() {
  const [voted, setVoted] = useState<number | null>(null);
  return (
    <Card style={{ padding: 16 }}>
      <h3 style={{ fontFamily: "var(--font)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>
        Who takes the next wicket?
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MATCH.polls.map((opt, i) => (
          <button key={i} onClick={() => setVoted(i)} style={{
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            background: voted === i ? "rgba(0,255,135,0.1)" : "rgba(5,20,36,0.5)",
            border: `1px solid ${voted === i ? "rgba(0,255,135,0.35)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: 8, padding: "10px 14px", cursor: "pointer", transition: "all 0.2s",
          }}>
            <span style={{ fontFamily: "var(--font)", fontSize: 14, color: "var(--text)" }}>{opt.name}</span>
            <span style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 14, color: (i === 0 || voted === i) ? "var(--green)" : "var(--text-muted)" }}>{opt.pct}%</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function Partnership() {
  const p1pct = Math.round((MATCH.partnership.p1r / (MATCH.partnership.p1r + MATCH.partnership.p2r)) * 100);
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontFamily: "var(--font)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Partnership</h3>
        <span style={{ fontFamily: "var(--font)", fontWeight: 700, color: "var(--green)", fontSize: 14 }}>{MATCH.partnership.runs} Runs</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, textAlign: "right" }}>
          <p style={{ fontFamily: "var(--font)", fontWeight: 700, color: "#f1ffef", marginBottom: 2 }}>{MATCH.partnership.p1}</p>
          <p style={{ fontFamily: "var(--font)", fontSize: 12, color: "var(--text-muted)" }}>{MATCH.partnership.p1r} ({MATCH.partnership.p1b})</p>
        </div>
        <div style={{ width: 120, height: 8, background: "var(--surface-top)", borderRadius: 9999, overflow: "hidden", display: "flex", flexShrink: 0 }}>
          <div style={{ height: "100%", background: "var(--green)", width: `${p1pct}%`, transition: "width 1s" }} />
          <div style={{ height: "100%", background: "var(--amber)", flex: 1 }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "var(--font)", fontWeight: 700, color: "#f1ffef", marginBottom: 2 }}>{MATCH.partnership.p2}</p>
          <p style={{ fontFamily: "var(--font)", fontSize: 12, color: "var(--text-muted)" }}>{MATCH.partnership.p2r} ({MATCH.partnership.p2b})</p>
        </div>
      </div>
    </Card>
  );
}

function RunRateGraph() {
  return (
    <Card style={{ padding: 24, display: "flex", flexDirection: "column", minHeight: 280 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: "-0.01em" }}>Run Rate Progression</h3>
        <div style={{ display: "flex", gap: 16 }}>
          {[{ color: "var(--green)", label: "IND", dim: false }, { color: "var(--surface-top)", label: "AUS (Projected)", dim: true }].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, opacity: item.dim ? 0.4 : 1 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, display: "inline-block", border: item.dim ? "1px solid rgba(255,255,255,0.2)" : "none" }} />
              <span style={{ fontFamily: "var(--font)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 6, borderLeft: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 0 6px 6px", minHeight: 160 }}>
        {MATCH.runRateData.map((h, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ height: `${h}%`, minHeight: 4, background: "rgba(0,255,135,0.15)", borderTop: "2px solid var(--green)", borderRadius: "3px 3px 0 0", transition: "height 0.5s ease" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {["Over 1", "Over 10", "Over 20"].map(l => (
          <span key={l} style={{ fontFamily: "var(--font)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</span>
        ))}
      </div>
    </Card>
  );
}

function MatchRatings() {
  return (
    <Card style={{ padding: 20 }}>
      <h3 style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: "-0.01em", marginBottom: 20 }}>Match Ratings</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {MATCH.ratings.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: p.team === "home" ? "#1a3a6e" : "#b8860b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {p.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: "var(--font)", fontWeight: 700, color: "#f1ffef", fontSize: 14 }}>{p.name}</span>
                <span style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 14, color: p.team === "home" ? "var(--green)" : "var(--amber)" }}>{p.rating}</span>
              </div>
              <div style={{ height: 4, background: "var(--surface-top)", borderRadius: 9999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${p.rating * 10}%`, background: p.team === "home" ? "var(--green)" : "var(--amber)", borderRadius: 9999, transition: "width 1s" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button style={{ width: "100%", marginTop: 18, padding: "8px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font)", fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.2s" }}
        onMouseOver={e => (e.currentTarget.style.color = "var(--green)")}
        onMouseOut={e => (e.currentTarget.style.color = "var(--text-muted)")}>
        View Detailed Player Hub
      </button>
    </Card>
  );
}

function Commentary() {
  const [mode, setMode] = useState<"critical" | "full">("critical");
  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 22, color: "#fff" }}>Live Commentary</h3>
        <div style={{ display: "flex", gap: 6 }}>
          {(["critical", "full"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "4px 10px", borderRadius: 4, border: "none", cursor: "pointer",
              fontFamily: "var(--font)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              background: mode === m ? "var(--green)" : "var(--surface-top)",
              color: mode === m ? "#003919" : "var(--text-muted)",
              transition: "all 0.2s",
            }}>{m === "critical" ? "Critical Only" : "Full Feed"}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {MATCH.commentary.map((item, i) => {
          const badge = BADGE_COLORS[item.type];
          return (
            <div key={i} style={{ display: "flex", gap: 20, paddingBottom: 20, marginBottom: i < MATCH.commentary.length - 1 ? 20 : 0, borderBottom: i < MATCH.commentary.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 44 }}>
                <span style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 20, color: i === 0 ? "var(--green)" : "var(--text-muted)" }}>{item.over}</span>
                {i < MATCH.commentary.length - 1 && <div style={{ width: 1, flex: 1, background: "rgba(59,75,61,0.35)", marginTop: 8 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ background: badge.bg, color: badge.color, padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 900, fontFamily: "var(--font)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {item.type}
                  </span>
                  {item.headline && <span style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{item.headline}</span>}
                </div>
                <p style={{ fontFamily: "var(--font)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65 }}>{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div style={{ padding: "24px 24px 48px", background: "var(--bg)", minHeight: "100%" }}>
      {/* Category pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {CATEGORIES.map((cat, i) => (
          <button key={cat} onClick={() => setActiveCategory(i)} style={{
            padding: "8px 20px", borderRadius: 9999, whiteSpace: "nowrap",
            background: activeCategory === i ? "rgba(0,255,135,0.1)" : "rgba(18,33,49,0.6)",
            border: `1px solid ${activeCategory === i ? "var(--green)" : "rgba(255,255,255,0.07)"}`,
            color: activeCategory === i ? "var(--green)" : "var(--text-muted)",
            fontFamily: "var(--font)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
            cursor: "pointer", transition: "all 0.2s",
          }}>{cat}</button>
        ))}
      </div>

      {/* Bento grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>
        <div style={{ gridColumn: "span 8" }}><FeaturedHero /></div>
        <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: 16 }}>
          <BoundaryPulse />
          <NextWicketPoll />
          <Partnership />
        </div>
        <div style={{ gridColumn: "span 8" }}><RunRateGraph /></div>
        <div style={{ gridColumn: "span 4" }}><MatchRatings /></div>
        <div style={{ gridColumn: "1 / -1" }}><Commentary /></div>
      </div>

      {/* FAB */}
      <button style={{
        position: "fixed", bottom: 32, right: 32,
        width: 56, height: 56, borderRadius: "50%",
        background: "var(--green)", color: "#003919",
        border: "none", cursor: "pointer",
        boxShadow: "0 0 24px rgba(0,255,135,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "transform 0.2s", zIndex: 50, fontSize: 22,
      }}
        onMouseOver={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}>
        📊
      </button>
    </div>
  );
}
