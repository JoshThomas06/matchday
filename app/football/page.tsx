"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
interface FbFixture {
  fixture: { id: number; status: { long: string; short: string; elapsed: number | null }; venue: { name: string } };
  teams: { home: { name: string; logo?: string }; away: { name: string; logo?: string } };
  goals: { home: number | null; away: number | null };
  league: { name: string; round: string };
  score: { halftime: { home: number | null; away: number | null } };
}

const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "P", "BT"];

function isLive(f: FbFixture) { return LIVE_STATUSES.includes(f.fixture.status.short); }
function isEnded(f: FbFixture) { return f.fixture.status.short === "FT"; }

// ── Shared atoms ───────────────────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style,
    }}>{children}</div>
  );
}

function SkeletonBlock({ h = 120 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 12, background: "rgba(255,255,255,0.05)", marginBottom: 12, animation: "pulse-dot 1.5s infinite" }} />;
}

// ── Fixture card ───────────────────────────────────────────────────────────
function FixtureCard({ f, featured = false }: { f: FbFixture; featured?: boolean }) {
  const live = isLive(f);
  const ended = isEnded(f);
  const elapsed = f.fixture.status.elapsed;
  const homeGoals = f.goals.home ?? 0;
  const awayGoals = f.goals.away ?? 0;

  return (
    <Link href={`/stats?fixture=${f.fixture.id}`}>
      <Card style={{
        padding: featured ? "24px 28px" : "14px 18px",
        marginBottom: 12, cursor: "pointer", transition: "border-color 0.2s",
        borderColor: live ? "rgba(0,255,135,0.25)" : "rgba(255,255,255,0.07)",
        boxShadow: live ? "0 0 20px rgba(0,255,135,0.06)" : "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {live && (
              <>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />
                <span style={{ fontSize: 10, fontWeight: 900, color: "#ef4444", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {elapsed ? `${elapsed}'` : "LIVE"}
                </span>
              </>
            )}
            {ended && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>FT</span>}
            {!live && !ended && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{f.fixture.status.short}</span>}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#60a5fa" }}>
            ⚽ {f.league.name} — {f.league.round}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: featured ? 18 : 15, fontWeight: 700, color: "#fff" }}>{f.teams.home.name}</div>
            {f.fixture.venue?.name && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>📍 {f.fixture.venue.name}</div>}
          </div>
          <div style={{ textAlign: "center", padding: "0 16px" }}>
            <div style={{ fontSize: featured ? 36 : 28, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.02em", textShadow: live ? "0 0 16px rgba(0,255,135,0.3)" : "none" }}>
              {homeGoals} — {awayGoals}
            </div>
            {f.score.halftime.home !== null && (
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>HT: {f.score.halftime.home}–{f.score.halftime.away}</div>
            )}
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: featured ? 18 : 15, fontWeight: 700, color: "#fff" }}>{f.teams.away.name}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>↗ View Stats</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function FootballPage() {
  const [fixtures, setFixtures] = useState<FbFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(0);
  const [tab, setTab] = useState<"all" | "live" | "finished">("all");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/match");
      const data = await res.json();
      setFixtures(data.football ?? []);
      setLastUpdated(data.lastUpdated);
      setError("");
    } catch {
      setError("Live connection unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30_000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const liveFixtures = fixtures.filter(isLive);
  const finishedFixtures = fixtures.filter(isEnded);
  const filtered = tab === "all" ? fixtures : tab === "live" ? liveFixtures : finishedFixtures;
  const featured = liveFixtures[0] ?? finishedFixtures[0];

  return (
    <div style={{ padding: "24px 24px 48px", minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "#60a5fa", marginBottom: 4, textTransform: "uppercase" }}>Football · EPL Hub</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
            FOOTBALL <span style={{ color: "#60a5fa" }}>LIVE</span>
          </h1>
        </div>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>
          {lastUpdated > 0 ? `↻ ${Math.round((Date.now() - lastUpdated) / 1000)}s ago` : "Connecting…"}
        </span>
      </div>

      {error && (
        <Card style={{ padding: "10px 16px", marginBottom: 16, borderColor: "rgba(255,186,58,0.25)" }}>
          <span style={{ fontSize: 12, color: "var(--amber)" }}>⚠ {error} — showing last cached results</span>
        </Card>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["all", "live", "finished"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 9999, border: "none",
            background: tab === t ? "rgba(96,165,250,0.15)" : "rgba(18,33,49,0.6)",
            outline: `1px solid ${tab === t ? "#60a5fa" : "var(--border)"}`,
            color: tab === t ? "#60a5fa" : "var(--muted)",
            fontFamily: "var(--font)", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.2s",
          }}>
            {t === "live" && liveFixtures.length > 0 && (
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#ef4444", marginRight: 6, verticalAlign: "middle" }} />
            )}
            {t === "all" ? `All (${fixtures.length})` : t === "live" ? `Live (${liveFixtures.length})` : `Finished (${finishedFixtures.length})`}
          </button>
        ))}
      </div>

      {loading && (
        <div>
          <SkeletonBlock h={160} />
          <SkeletonBlock h={80} />
          <SkeletonBlock h={80} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No {tab === "live" ? "Live" : ""} Fixtures Right Now</h2>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>EPL fixtures appear here during match days.</p>
        </Card>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
          <div>
            {featured && tab === "all" && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
                  {isLive(featured) ? "🔴 Featured Live Match" : "Most Recent"}
                </div>
                <FixtureCard f={featured} featured />
              </div>
            )}

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
              {tab === "all" ? "All Fixtures" : tab === "live" ? "Live Now" : "Finished"}
            </div>
            {filtered
              .filter(f => tab !== "all" || f !== featured)
              .slice(0, 15)
              .map(f => <FixtureCard key={f.fixture.id} f={f} />)}
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Live count */}
            <Card style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: liveFixtures.length > 0 ? "#ef4444" : "var(--muted)" }}>{liveFixtures.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>Live Now</div>
                </div>
                <div style={{ width: 1, background: "var(--border)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>{finishedFixtures.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>Finished</div>
                </div>
                <div style={{ width: 1, background: "var(--border)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>{fixtures.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>Total</div>
                </div>
              </div>
            </Card>

            {/* Quick links */}
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Explore</div>
              {[
                { label: "Predictions", href: "/predictions", icon: "📊", color: "var(--green)" },
                { label: "Live Stats", href: "/stats", icon: "📈", color: "var(--amber)" },
                { label: "Quiz", href: "/quiz", icon: "❓", color: "#60a5fa" },
              ].map(item => (
                <Link key={item.href} href={item.href} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: item.color, fontWeight: 700, fontSize: 13,
                }}>
                  <span>{item.icon}</span> {item.label} →
                </Link>
              ))}
            </Card>

            {/* Streaming */}
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Watch EPL</div>
              {[
                { name: "Sky Sports", url: "https://www.skysports.com/football", region: "UK" },
                { name: "NBC Sports", url: "https://www.nbcsports.com/soccer", region: "USA" },
                { name: "Peacock", url: "https://www.peacocktv.com/sports/soccer", region: "USA Streaming" },
              ].map(l => (
                <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{l.name}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{l.region}</div>
                  </div>
                  <span style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700 }}>▶</span>
                </a>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}