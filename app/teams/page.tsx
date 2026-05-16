"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CricScore { r: number; w: number; o: number; inning: string; }
interface CricMatch {
  id: string; name: string; status: string; teams: string[];
  score?: CricScore[]; venue?: string;
  matchStarted?: boolean; matchEnded?: boolean;
}
interface NormalizedCricMatch {
  id: string; name: string; status: string;
  team1: string; team2: string;
  score1?: CricScore; score2?: CricScore;
  venue: string; isLive: boolean; isEnded: boolean;
  raw: CricMatch;
}

function normalize(m: CricMatch): NormalizedCricMatch {
  return {
    id: m.id,
    name: m.name,
    status: m.status,
    team1: m.teams?.[0] ?? "Team A",
    team2: m.teams?.[1] ?? "Team B",
    score1: m.score?.[0],
    score2: m.score?.[1],
    venue: m.venue ?? "—",
    isLive: !!(m.matchStarted && !m.matchEnded),
    isEnded: !!m.matchEnded,
    raw: m,
  };
}

function fmtScore(s?: CricScore) {
  if (!s) return null;
  return `${s.r}/${s.w} (${typeof s.o === "number" ? s.o.toFixed(1) : s.o} ov)`;
}

interface FbFixture {
  fixture: { id: number; status: { long: string; short: string }; venue: { name: string } };
  teams: { home: { name: string }; away: { name: string } };
  goals: { home: number | null; away: number | null };
  league: { name: string };
}

const STORAGE_KEY = "matchday_following";

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style }}>{children}</div>;
}

const DEFAULT_TEAMS = ["India", "Australia", "Arsenal", "Manchester City", "Chennai Super Kings", "Mumbai Indians", "Kolkata Knight Riders", "Gujarat Titans"];

export default function TeamsPage() {
  const [following, setFollowing] = useState<string[]>([]);
  const [cricketMatches, setCricketMatches] = useState<NormalizedCricMatch[]>([]);
  const [footballMatches, setFootballMatches] = useState<FbFixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setFollowing(saved ? JSON.parse(saved) : DEFAULT_TEAMS.slice(0, 8));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/match");
      const data = await res.json();
      const rawCric: CricMatch[] = data.cricket ?? [];
      setCricketMatches(rawCric.map(normalize));
      setFootballMatches(data.football ?? []);
    } catch { /* keep */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleFollow = (team: string) => {
    setFollowing(prev => {
      const next = prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Find matches involving followed teams
  const relevantCricket = cricketMatches.filter(m =>
    following.some(t => m.name.toLowerCase().includes(t.toLowerCase()) || m.raw.teams?.some(mt => mt.toLowerCase().includes(t.toLowerCase())))
  );
  const relevantFootball = footballMatches.filter(m =>
    following.some(t =>
      m.teams.home.name.toLowerCase().includes(t.toLowerCase()) ||
      m.teams.away.name.toLowerCase().includes(t.toLowerCase())
    )
  );

  // All unique teams from API
  const allCricketTeams = Array.from(new Set(cricketMatches.flatMap(m => m.raw.teams ?? []))).slice(0, 12);
  const allFootballTeams = Array.from(new Set(footballMatches.flatMap(m => [m.teams.home.name, m.teams.away.name]))).slice(0, 12);

  return (
    <div style={{ padding: "24px 24px 48px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "var(--green)", marginBottom: 4, textTransform: "uppercase" }}>Personalized</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>MY <span style={{ color: "var(--green)" }}>TEAMS</span></h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Follow teams to see their matches and stats on your feed.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
        <div>
          {/* Your Teams */}
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Following ({following.length})</h2>
          {following.length === 0 ? (
            <Card style={{ padding: "24px", marginBottom: 24, textAlign: "center" }}>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>You are not following any teams yet. Browse teams below to get started.</p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {following.map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(0,255,135,0.08)", border: "1px solid rgba(0,255,135,0.2)", borderRadius: 9999 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{t}</span>
                  <button onClick={() => toggleFollow(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Relevant matches */}
          {!loading && (relevantCricket.length > 0 || relevantFootball.length > 0) && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Your Teams' Matches</h3>
              {relevantCricket.map(m => (
                <Link key={m.id} href={`/dashboard?id=${m.id}&sport=cricket`}>
                  <Card style={{ padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{m.name}</div>
                      {m.isLive && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: "0.1em" }}>● LIVE</span>
                      )}
                      {m.isEnded && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em" }}>ENDED</span>
                      )}
                    </div>
                    {m.score1 && (
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--green)" }}>{fmtScore(m.score1)}</div>
                    )}
                    {m.score2 && (
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{fmtScore(m.score2)}</div>
                    )}
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>{m.status}</div>
                  </Card>
                </Link>
              ))}
              {relevantFootball.map(m => (
                <Link key={m.fixture.id} href={`/stats?fixture=${m.fixture.id}`}>
                  <Card style={{ padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.06em", marginBottom: 4 }}>{m.league.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{m.teams.home.name} vs {m.teams.away.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{m.fixture.status.long}</div>
                  </Card>
                </Link>
              ))}
            </>
          )}

          {!loading && relevantCricket.length === 0 && relevantFootball.length === 0 && following.length > 0 && (
            <Card style={{ padding: "20px", marginTop: 8 }}>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>No recent matches found for your followed teams. Check back during match days.</p>
            </Card>
          )}
        </div>

        {/* Browse teams sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {allCricketTeams.length > 0 && (
            <Card style={{ padding: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>🏏 Cricket Teams</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {allCricketTeams.map(t => (
                  <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 13, color: following.includes(t) ? "var(--green)" : "#fff", fontWeight: following.includes(t) ? 700 : 400 }}>{t}</span>
                    <button onClick={() => toggleFollow(t)} style={{
                      padding: "4px 12px", borderRadius: 9999, cursor: "pointer", border: "none",
                      background: following.includes(t) ? "rgba(0,255,135,0.12)" : "rgba(255,255,255,0.08)",
                      color: following.includes(t) ? "var(--green)" : "var(--muted)",
                      fontFamily: "var(--font)", fontSize: 11, fontWeight: 700,
                    }}>{following.includes(t) ? "Following ✓" : "+ Follow"}</button>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {allFootballTeams.length > 0 && (
            <Card style={{ padding: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>⚽ Football Teams</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {allFootballTeams.map(t => (
                  <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 13, color: following.includes(t) ? "#60a5fa" : "#fff", fontWeight: following.includes(t) ? 700 : 400 }}>{t}</span>
                    <button onClick={() => toggleFollow(t)} style={{
                      padding: "4px 12px", borderRadius: 9999, cursor: "pointer", border: "none",
                      background: following.includes(t) ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.08)",
                      color: following.includes(t) ? "#60a5fa" : "var(--muted)",
                      fontFamily: "var(--font)", fontSize: 11, fontWeight: 700,
                    }}>{following.includes(t) ? "Following ✓" : "+ Follow"}</button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}