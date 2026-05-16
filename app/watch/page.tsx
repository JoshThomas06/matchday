"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface FbFixture {
  fixture: { id: number; status: { long: string; short: string }; venue: { name: string } };
  teams: { home: { name: string }; away: { name: string } };
  league: { name: string };
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style }}>{children}</div>;
}

const PRESET_FOOTBALL_MATCHES: FbFixture[] = [
  { fixture: { id: 1, status: { long: "First Half", short: "1H" }, venue: { name: "Emirates Stadium" } }, teams: { home: { name: "Arsenal" }, away: { name: "Manchester City" } }, league: { name: "Premier League" } },
  { fixture: { id: 2, status: { long: "Second Half", short: "2H" }, venue: { name: "Santiago Bernabeu" } }, teams: { home: { name: "Real Madrid" }, away: { name: "Barcelona" } }, league: { name: "La Liga" } },
  { fixture: { id: 3, status: { long: "Not Started", short: "NS" }, venue: { name: "Allianz Arena" } }, teams: { home: { name: "Bayern Munich" }, away: { name: "Dortmund" } }, league: { name: "Bundesliga" } }
];

export default function WatchPage() {
  const [footballMatches, setFootballMatches] = useState<FbFixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/match")
      .then(res => res.json())
      .then(data => {
        if (data.football && data.football.length > 0) {
          setFootballMatches(data.football);
        } else {
          // Fallback to presets if api is down or restricted
          setFootballMatches(PRESET_FOOTBALL_MATCHES as FbFixture[]);
        }
      })
      .catch(() => setFootballMatches(PRESET_FOOTBALL_MATCHES as FbFixture[]))
      .finally(() => setLoading(false));
  }, []);

  const getStreamingLinks = (match: FbFixture) => {
    const isLive = ["1H", "2H", "HT", "ET"].includes(match.fixture?.status?.short);
    return (
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <a href="https://www.peacocktv.com/sports/premier-league" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", background: "rgba(0,255,135,0.1)", border: "1px solid var(--green)", borderRadius: 8, color: "var(--green)", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
          {isLive ? "▶ WATCH LIVE" : "📺 HIGHLIGHTS"}
        </a>
        <a href="https://www.skysports.com/football" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
          Sky Sports
        </a>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, minHeight: "100%", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "var(--green)", marginBottom: 4, textTransform: "uppercase" }}>Broadcast Hub</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
          WATCH <span style={{ color: "var(--green)" }}>LIVE</span>
        </h1>
      </div>

      <div style={{ display: "grid", gap: 24 }}>
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            ⚽ Football Streams
          </h2>
          {loading ? (
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Loading streams...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {footballMatches.map((m, i) => {
                const isLive = ["1H", "2H", "HT", "ET"].includes(m.fixture?.status?.short);
                return (
                  <Card key={m.fixture?.id || i} style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {m.league.name}
                      </span>
                      {isLive && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: "0.1em" }}>● LIVE</span>
                      )}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                      {m.teams.home.name} <span style={{ color: "var(--muted)", fontSize: 14, fontWeight: 400 }}>vs</span> {m.teams.away.name}
                    </div>
                    {getStreamingLinks(m)}
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            🏏 Cricket Streams
          </h2>
          <Card style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
              IPL & International
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
              Live cricket streaming is available on our partner networks.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="https://www.jiocinema.com/" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", background: "rgba(0,255,135,0.1)", border: "1px solid var(--green)", borderRadius: 8, color: "var(--green)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                JioCinema
              </a>
              <a href="https://www.hotstar.com/" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                Disney+ Hotstar
              </a>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}