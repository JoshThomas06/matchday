"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useFootballMatches, useFootballStats } from "@/services/football/api";
import { NormalizedFbMatch, TeamStats, StatItem } from "@/lib/normalizers/football";

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style }}>{children}</div>;
}

function DonutChart({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 54; const circ = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--surface-top)" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
        strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 1s" }} />
      <text x="70" y="65" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700" fontFamily="var(--font)">{pct}%</text>
      <text x="70" y="82" textAnchor="middle" fill="var(--muted)" fontSize="10" fontWeight="700" fontFamily="var(--font)" letterSpacing="2">{label}</text>
    </svg>
  );
}

function Stat({ label, val, color }: { label: string; val: string | number; color: string }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: fixtures = [], isLoading: loading } = useFootballMatches();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select first fixture if none selected
  useEffect(() => {
    if (fixtures.length > 0 && !selectedId) {
      setSelectedId(fixtures[0].id);
    }
  }, [fixtures, selectedId]);

  const selected = fixtures.find(f => f.id === selectedId) || null;
  
  const { data: statsData, isLoading: statsLoading } = useFootballStats(selectedId);
  const teamStats = statsData?.stats || [];

  const getStat = (stats: StatItem[], type: string) => stats.find(s => s.type === type)?.value ?? "—";
  const homePossession = teamStats[0] ? parseInt(String(getStat(teamStats[0].statistics, "Ball Possession"))) || 50 : 50;

  const homeStats = teamStats[0]?.statistics ?? [];
  const awayStats = teamStats[1]?.statistics ?? [];

  return (
    <div style={{ padding: "24px 24px 48px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "var(--green)", marginBottom: 4, textTransform: "uppercase" }}>Advanced Analytics</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
          MATCH <span style={{ color: "var(--green)" }}>ANALYTICS</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Select a fixture to view detailed performance analytics.</p>
      </div>

      {/* Fixture selector */}
      {!loading && fixtures.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24 }}>
          {fixtures.slice(0, 10).map(f => (
            <button key={f.id} onClick={() => setSelectedId(f.id)} style={{
              flexShrink: 0, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", whiteSpace: "nowrap",
              background: selected?.id === f.id ? "var(--green)" : "rgba(18,33,49,0.7)",
              color: selected?.id === f.id ? "var(--green-dark)" : "var(--muted)",
              fontFamily: "var(--font)", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em",
              outline: `1px solid ${selected?.id === f.id ? "transparent" : "rgba(255,255,255,0.07)"}`,
              transition: "all 0.2s",
            }}>
              {f.homeTeam.slice(0, 10)} vs {f.awayTeam.slice(0, 10)}
            </button>
          ))}
        </div>
      )}

      {loading && <div style={{ height: 300, borderRadius: 12, background: "rgba(255,255,255,0.05)", animation: "pulse-dot 1.5s infinite" }} />}

      {!loading && !selected && (
        <Card style={{ padding: "36px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No Fixtures Available</h2>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Football fixture data will appear here during match days.</p>
          <Link href="/football" style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", background: "rgba(96,165,250,0.12)", border: "1px solid #60a5fa", borderRadius: 8, color: "#60a5fa", fontWeight: 700, fontSize: 13 }}>⚽ View Football</Link>
        </Card>
      )}

      {!loading && selected && (
        <>
          {/* Match header */}
          <Card style={{ padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{selected.league}</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{selected.homeTeam} <span style={{ color: "var(--muted)" }}>vs</span> {selected.awayTeam}</h2>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{selected.venue} · {selected.statusLong}</div>
              </div>
              <div style={{ fontSize: 40, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.02em" }}>
                {selected.homeGoals ?? 0} — {selected.awayGoals ?? 0}
              </div>
            </div>
          </Card>

          {statsLoading && <div style={{ height: 220, borderRadius: 12, background: "rgba(255,255,255,0.05)", animation: "pulse-dot 1.5s infinite", marginBottom: 20 }} />}

          {!statsLoading && teamStats.length >= 2 && (
            <>
              {/* Possession + key stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <Card style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>Ball Possession</h3>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    <DonutChart pct={homePossession} color="var(--green)" label={selected.homeTeam.toUpperCase().slice(0, 6)} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--green)" }}>{homePossession}%</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{selected.homeTeam}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--amber)" }}>{100 - homePossession}%</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{selected.awayTeam}</div>
                    </div>
                  </div>
                </Card>

                <Card style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>Key Stats</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Stat label="Home Shots" val={getStat(homeStats, "Total Shots")} color="var(--green)" />
                    <Stat label="Away Shots" val={getStat(awayStats, "Total Shots")} color="var(--amber)" />
                    <Stat label="Home Corners" val={getStat(homeStats, "Corner Kicks")} color="var(--green)" />
                    <Stat label="Away Corners" val={getStat(awayStats, "Corner Kicks")} color="var(--amber)" />
                    <Stat label="Home Fouls" val={getStat(homeStats, "Fouls")} color="var(--text)" />
                    <Stat label="Away Fouls" val={getStat(awayStats, "Fouls")} color="var(--text)" />
                    <Stat label="Home Saves" val={getStat(homeStats, "Goalkeeper Saves")} color="var(--green)" />
                    <Stat label="Away Saves" val={getStat(awayStats, "Goalkeeper Saves")} color="var(--amber)" />
                  </div>
                </Card>
              </div>
            </>
          )}

          {!statsLoading && teamStats.length < 2 && (
            <Card style={{ padding: "24px", textAlign: "center" }}>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Detailed statistics are not yet available for this fixture. They appear once a match is in progress or completed.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}