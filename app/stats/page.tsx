"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFootballStats } from "@/services/football/api";
import { useCricketMatches } from "@/services/cricket/api";
import { calculateCricketAnalytics } from "@/services/cricket/analytics";
import { TeamStats, StatItem } from "@/lib/normalizers/football";

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style,
    }}>{children}</div>
  );
}

function DonutChart({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--surface-top)" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 1s" }} />
        <text x="70" y="65" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700" fontFamily="var(--font)">{pct}%</text>
        <text x="70" y="82" textAnchor="middle" fill="var(--muted)" fontSize="10" fontWeight="700" fontFamily="var(--font)" letterSpacing="2">{label}</text>
      </svg>
    </div>
  );
}

function StatRow({ label, home, away }: { label: string; home: string; away: string }) {
  // Parse percentage for bar viz
  const homePct = label.toLowerCase().includes("possession") ? parseInt(home) : null;
  const awayPct = homePct ? 100 - homePct : null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <span style={{ fontWeight: 700, color: "var(--green)", fontSize: 14, minWidth: 60 }}>{home}</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", flex: 1, textAlign: "center" }}>{label}</span>
        <span style={{ fontWeight: 700, color: "var(--amber)", fontSize: 14, minWidth: 60, textAlign: "right" }}>{away}</span>
      </div>
      {homePct !== null && (
        <div style={{ height: 4, background: "var(--surface-top)", borderRadius: 9999, overflow: "hidden", display: "flex" }}>
          <div style={{ height: "100%", width: `${homePct}%`, background: "var(--green)", transition: "width 0.8s" }} />
          <div style={{ height: "100%", flex: 1, background: "var(--amber)" }} />
        </div>
      )}
    </div>
  );
}

function SkeletonBlock({ h = 200 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 12, background: "rgba(255,255,255,0.05)", marginBottom: 16, animation: "pulse-dot 1.5s infinite" }} />;
}

// ── Stats content (uses search params — must be in Suspense) ───────────────
function StatsContent() {
  const searchParams = useSearchParams();
  const fixtureId = searchParams.get("fixture");
  const matchId = searchParams.get("id");
  const sport = searchParams.get("sport") ?? "football";

  const { data: statsData, isLoading: fbLoading, error: fetchError } = useFootballStats(sport === "football" ? (fixtureId ?? matchId) : null);
  const { data: cricketMatches = [], isLoading: cricLoading } = useCricketMatches();
  
  const loading = sport === "football" ? fbLoading : cricLoading;
  
  const teamStats = statsData?.stats || [];
  const fixture = statsData?.fixture || null;
  const cricketMatch = sport === "cricket" ? cricketMatches.find(m => m.id === (fixtureId ?? matchId)) : null;

  const error = fetchError ? "Could not load stats" : "";

  const homeName = sport === "football" 
    ? (teamStats[0]?.team?.name ?? fixture?.homeTeam ?? "Home")
    : (cricketMatch?.homeTeam ?? "Home");
  const awayName = sport === "football"
    ? (teamStats[1]?.team?.name ?? fixture?.awayTeam ?? "Away")
    : (cricketMatch?.awayTeam ?? "Away");

  // Football stats
  const statRows: { label: string; home: string; away: string }[] = [];
  if (teamStats.length >= 2) {
    const homeStats = teamStats[0].statistics;
    const awayStats = teamStats[1].statistics;
    const keys = ["Ball Possession", "Total Shots", "Shots on Goal", "Passes", "Pass Accuracy", "Fouls", "Yellow Cards", "Red Cards", "Corners", "Offsides"];
    for (const key of keys) {
      const hStat = homeStats.find(s => s.type === key);
      const aStat = awayStats.find(s => s.type === key);
      if (hStat || aStat) {
        statRows.push({ label: key, home: String(hStat?.value ?? "—"), away: String(aStat?.value ?? "—") });
      }
    }
  }

  const possessionStat = statRows.find(s => s.label === "Ball Possession");
  const possessionPct = possessionStat ? parseInt(possessionStat.home) || 50 : 50;

  if (loading) return (
    <div style={{ padding: 24 }}>
      <SkeletonBlock h={60} />
      <SkeletonBlock h={200} />
      <SkeletonBlock h={300} />
    </div>
  );

  if (!fixtureId && !matchId) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, fontStyle: "italic", color: "#fff", marginBottom: 8 }}>Live Stats</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>Select a match from the Football or Cricket pages to view detailed statistics.</p>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/football" style={{ padding: "12px 24px", background: "rgba(96,165,250,0.12)", border: "1px solid #60a5fa", borderRadius: 8, color: "#60a5fa", fontWeight: 700, fontSize: 13 }}>⚽ Football Fixtures</a>
          <a href="/dashboard" style={{ padding: "12px 24px", background: "rgba(0,255,135,0.08)", border: "1px solid var(--green)", borderRadius: 8, color: "var(--green)", fontWeight: 700, fontSize: 13 }}>🏏 Cricket Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Match Statistics</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, fontStyle: "italic", color: "#fff" }}>
            {homeName} <span style={{ color: "var(--amber)" }}>vs</span> {awayName}
          </h1>
        </div>
        {sport === "football" && (fixture?.homeGoals !== undefined && fixture?.homeGoals !== null) && (
          <div style={{ fontSize: 36, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.02em" }}>
            {fixture.homeGoals} — {fixture.awayGoals}
          </div>
        )}
        {sport === "cricket" && cricketMatch?.scores && cricketMatch.scores[0] && (
          <div style={{ fontSize: 36, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.02em", textAlign: "right" }}>
            {cricketMatch.scores[0].runs}/{cricketMatch.scores[0].wickets}
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>({cricketMatch.scores[0].overs} ov)</div>
          </div>
        )}
      </div>

      {error && (
        <Card style={{ padding: "10px 16px", marginBottom: 16, borderColor: "rgba(255,186,58,0.25)" }}>
          <span style={{ fontSize: 12, color: "var(--amber)" }}>⚠ {error}</span>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: sport === "cricket" ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {sport === "cricket" ? (() => {
          const cricAnalytics = cricketMatch ? calculateCricketAnalytics(cricketMatch) : null;
          if (!cricAnalytics) return (
             <Card style={{ padding: 40, textAlign: "center", gridColumn: "1 / -1" }}>
               <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
               <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Match Not Found</h2>
             </Card>
          );
          return (
            <Card style={{ padding: 24, gridColumn: "1 / -1" }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>Cricket Intelligence</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green)" }}>{cricAnalytics.momentumScore}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginTop: 4 }}>Momentum Score</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: cricAnalytics.runAcceleration > 0 ? "var(--green)" : "var(--amber)" }}>
                    {cricAnalytics.runAcceleration > 0 ? "+" : ""}{cricAnalytics.runAcceleration}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginTop: 4 }}>Run Acceleration</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: cricAnalytics.phaseDominance === "Batting" ? "var(--green)" : "var(--amber)" }}>{cricAnalytics.phaseDominance}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginTop: 4 }}>Phase Dominance</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{cricAnalytics.projectedScore}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginTop: 4 }}>Projected Score</div>
                </div>
              </div>
            </Card>
          );
        })() : (
          <>
            {/* Possession */}
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>Ball Possession</h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <DonutChart pct={possessionPct} color="var(--green)" label={homeName.toUpperCase().slice(0, 6)} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>● {possessionPct}%</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--amber)" }}>● {100 - possessionPct}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{homeName}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{awayName}</span>
              </div>
            </Card>

            {/* Key stats grid */}
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>Match Performance</h3>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {statRows.length > 0
                  ? statRows.filter(s => s.label !== "Ball Possession").slice(0, 6).map(s => (
                      <StatRow key={s.label} {...s} />
                    ))
                  : (
                    <p style={{ color: "var(--muted)", fontSize: 13 }}>
                      {teamStats.length === 0 ? "Statistics not yet available for this match." : "Loading stats…"}
                    </p>
                  )
                }
              </div>
            </Card>
          </>
        )}
      </div>

      {/* All stats table */}
      {sport !== "cricket" && statRows.length > 6 && (
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>Full Statistics</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            {statRows.slice(6).map(s => <StatRow key={s.label} {...s} />)}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: "var(--muted)" }}>Loading stats…</div>}>
      <StatsContent />
    </Suspense>
  );
}