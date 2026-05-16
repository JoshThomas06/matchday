"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
interface CricketMatch {
  id: string; name: string; status: string;
  teams: string[];
  score?: { r: number; w: number; o: number; inning: string }[];
  venue?: string; matchStarted?: boolean; matchEnded?: boolean;
}
interface FootballMatch {
  fixture: { id: number; status: { long: string; short: string }; venue: { name: string } };
  teams: { home: { name: string }; away: { name: string } };
  goals: { home: number | null; away: number | null };
  league: { name: string };
}
interface MatchCard {
  id: string; sport: "cricket" | "football";
  name: string; status: string; score: string;
  venue: string; isLive: boolean; league: string;
}

// ── Shared sub-components ──────────────────────────────────────────────────
function Card({ children, style = {}, ...rest }: { children: React.ReactNode; style?: React.CSSProperties } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{
      background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid var(--border)", borderRadius: 12, ...style,
    }} {...rest}>{children}</div>
  );
}

function LiveBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)",
      color: "#ef4444", padding: "4px 12px", borderRadius: 9999,
      fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />
      LIVE
    </span>
  );
}

function SportPill({ sport, league }: { sport: "cricket" | "football"; league: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "3px 10px", borderRadius: 9999,
      background: sport === "cricket" ? "rgba(0,75,135,0.25)" : "rgba(0,255,135,0.08)",
      color: sport === "cricket" ? "#60a5fa" : "var(--green)",
    }}>{sport === "cricket" ? "🏏" : "⚽"} {league}</span>
  );
}

// ── Match List Item ────────────────────────────────────────────────────────
function MatchItem({ match, featured = false }: { match: MatchCard; featured?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/dashboard?id=${match.id}&sport=${match.sport}`}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
      <Card style={{
        padding: featured ? "20px 24px" : "14px 16px",
        marginBottom: 10,
        borderColor: match.isLive
          ? (hovered ? "rgba(0,255,135,0.4)" : "rgba(0,255,135,0.2)")
          : (hovered ? "rgba(255,255,255,0.15)" : "var(--border)"),
        boxShadow: match.isLive ? "0 0 20px rgba(0,255,135,0.07)" : "none",
        transition: "all 0.2s",
        cursor: "pointer",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {match.isLive && <LiveBadge />}
            {!match.isLive && (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>RECENT</span>
            )}
          </div>
          <SportPill sport={match.sport} league={match.league} />
        </div>

        <div style={{ fontSize: featured ? 18 : 15, fontWeight: 700, color: "#fff", marginBottom: match.score ? 8 : 0 }}>
          {match.name}
        </div>

        {match.score && (
          <div style={{
            fontSize: featured ? 28 : 22, fontWeight: 700,
            color: "var(--green)", letterSpacing: "-0.02em",
            marginBottom: 8, textShadow: "0 0 16px rgba(0,255,135,0.3)",
          }}>{match.score}</div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>📍 {match.venue || "—"}</span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: match.isLive ? "var(--green)" : "var(--muted)",
          }}>{match.status}</span>
        </div>
      </Card>
      </div>
    </Link>
  );
}

// ── Fan Pulse Widget ───────────────────────────────────────────────────────
function FanPulse({ matchId }: { matchId: string }) {
  const [pulse, setPulse] = useState({ team1: 65, team2: 35 });
  const [myVote, setMyVote] = useState<"team1" | "team2" | null>(null);

  useEffect(() => {
    fetch(`/api/reactions?matchId=${matchId}`)
      .then(r => r.json())
      .then(d => {
        if (typeof d.team1 === "number") {
          const total = d.team1 + d.team2 || 1;
          setPulse({
            team1: Math.round((d.team1 / total) * 100),
            team2: Math.round((d.team2 / total) * 100),
          });
        }
      })
      .catch(() => {/* use defaults */});
  }, [matchId]);

  const vote = async (team: "team1" | "team2") => {
    if (myVote) return;
    setMyVote(team);
    const newT1 = team === "team1" ? pulse.team1 + 2 : Math.max(1, pulse.team1 - 2);
    setPulse({ team1: Math.min(99, newT1), team2: 100 - Math.min(99, newT1) });
    await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, team, userId: `guest_${Math.random().toString(36).slice(2)}` }),
    }).catch(() => {});
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Fan Pulse</span>
        {myVote && <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 700 }}>✓ Voted!</span>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: "var(--green)" }}>{pulse.team1}%</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: "var(--amber)" }}>{pulse.team2}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 9999, overflow: "hidden", display: "flex", marginBottom: 12, cursor: myVote ? "default" : "pointer" }}>
        <div onClick={() => vote("team1")} style={{ height: "100%", width: `${pulse.team1}%`, background: "var(--green)", transition: "width 0.6s ease", boxShadow: "0 0 8px rgba(0,255,135,0.5)" }} />
        <div onClick={() => vote("team2")} style={{ height: "100%", flex: 1, background: "var(--amber)", transition: "flex 0.6s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
        <span>HOME FANS</span>
        <span>AWAY FANS</span>
      </div>
      {!myVote && (
        <p style={{ fontSize: 10, color: "var(--muted)", textAlign: "center", marginTop: 10, letterSpacing: "0.04em" }}>
          Tap a side to cast your vote
        </p>
      )}
    </div>
  );
}

// ── Key Moments Strip ──────────────────────────────────────────────────────
const KEY_MOMENTS = [
  { min: "23'",  type: "GOAL",   player: "Saka",    team: "ARS", color: "var(--green)" },
  { min: "41'",  type: "YELLOW", player: "Rodri",   team: "MCI", color: "var(--amber)" },
  { min: "58'",  type: "GOAL",   player: "Havertz", team: "ARS", color: "var(--green)" },
  { min: "63'",  type: "GOAL",   player: "Haaland", team: "MCI", color: "var(--amber)" },
  { min: "67'",  type: "SUB",    player: "Sterling",team: "ARS", color: "var(--muted)" },
];

function MomentsStrip() {
  return (
    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
      <div style={{ display: "flex", gap: 10, minWidth: "max-content" }}>
        {KEY_MOMENTS.map((m, i) => (
          <Card key={i} style={{
            padding: "10px 14px", borderLeft: `3px solid ${m.color}`,
            borderRadius: 8, minWidth: 110, flexShrink: 0,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: m.color, marginBottom: 2 }}>{m.min} · {m.type}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{m.player}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{m.team}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Quick Nav Cards ────────────────────────────────────────────────────────
const QUICK_NAV = [
  { href: "/dashboard",   icon: "🏏", label: "Cricket Dashboard", sub: "IPL & International" },
  { href: "/football",    icon: "⚽", label: "Football Hub",       sub: "EPL · Champions League" },
  { href: "/predictions", icon: "📊", label: "Predictions",        sub: "Earn XP on correct picks" },
  { href: "/quiz",        icon: "❓", label: "Quiz Center",         sub: "Daily trivia challenge" },
  { href: "/moments",     icon: "⚡", label: "Key Moments",         sub: "Goals, cards & highlights" },
  { href: "/stats",       icon: "📈", label: "Live Stats",          sub: "Possession, shots & more" },
];

function QuickNavGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {QUICK_NAV.map(item => (
        <Link key={item.href} href={item.href}
          onMouseOver={(e) => {
            const card = e.currentTarget.querySelector("div") as HTMLDivElement | null;
            if (card) { card.style.borderColor = "rgba(0,255,135,0.3)"; card.style.transform = "translateY(-2px)"; }
          }}
          onMouseOut={(e) => {
            const card = e.currentTarget.querySelector("div") as HTMLDivElement | null;
            if (card) { card.style.borderColor = "var(--border)"; card.style.transform = "translateY(0)"; }
          }}
        >
          <Card style={{ padding: "16px 14px", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{item.sub}</div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(0);
  const [tab, setTab] = useState<"all" | "cricket" | "football">("all");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/match");
      const data = await res.json();

      const cricket: MatchCard[] = (data.cricket || []).map((m: CricketMatch) => ({
        id: m.id, sport: "cricket", name: m.name, status: m.status,
        score: m.score?.[0] ? `${m.score[0].r}/${m.score[0].w} (${m.score[0].o} ov)` : "",
        venue: m.venue || "",
        isLive: !!(m.matchStarted && !m.matchEnded),
        league: m.name.includes("IPL") ? "IPL" : "International",
      }));

      const football: MatchCard[] = (data.football || []).map((m: FootballMatch) => ({
        id: String(m.fixture.id), sport: "football",
        name: `${m.teams.home.name} vs ${m.teams.away.name}`,
        status: m.fixture.status.long,
        score: `${m.goals.home ?? 0} - ${m.goals.away ?? 0}`,
        venue: m.fixture.venue?.name || "",
        isLive: ["1H", "2H", "HT", "ET"].includes(m.fixture.status.short),
        league: m.league?.name || "Football",
      }));

      setMatches([...cricket, ...football]);
      setLastUpdated(Date.now());
      setError("");
    } catch {
      setError("Live connection unavailable — showing cached data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const filtered = tab === "all" ? matches : matches.filter(m => m.sport === tab);
  const live    = filtered.filter(m => m.isLive);
  const recent  = filtered.filter(m => !m.isLive);
  const featuredLive = live[0] ?? recent[0];

  return (
    <div style={{ padding: "24px 24px 56px", minHeight: "100%", background: "var(--bg)" }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "var(--green)", marginBottom: 4, textTransform: "uppercase" }}>
            IPL · EPL · T20 · Live
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
            MATCH<span style={{ color: "var(--green)" }}>DAY</span>
          </h1>
        </div>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>
          {lastUpdated > 0
            ? `↻ ${Math.round((Date.now() - lastUpdated) / 1000)}s ago`
            : "Connecting…"}
        </span>
      </div>

      {/* ── Sport filter pills ───────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {(["all", "cricket", "football"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 9999, whiteSpace: "nowrap",
            background: tab === t ? "rgba(0,255,135,0.12)" : "rgba(18,33,49,0.6)",
            border: `1px solid ${tab === t ? "var(--green)" : "var(--border)"}`,
            color: tab === t ? "var(--green)" : "var(--muted)",
            fontFamily: "var(--font)", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.2s",
          }}>
            {t === "all" ? "All Sports" : t === "cricket" ? "🏏 Cricket" : "⚽ Football"}
          </button>
        ))}
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <Card style={{ padding: "10px 16px", marginBottom: 16, borderColor: "rgba(255,186,58,0.25)", borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: "var(--amber)" }}>⚠ {error}</span>
        </Card>
      )}

      {/* ── Loading state ────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12, display: "inline-block", animation: "pulse-dot 1.5s infinite" }}>⚡</div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Fetching live matches…</div>
        </div>
      )}

      {/* ── Main bento grid ──────────────────────────────────────────────── */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

          {/* LEFT COLUMN */}
          <div>
            {/* Featured match hero */}
            {featuredLive && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
                  {live.length > 0 ? "🔴 Featured Live" : "Last Result"}
                </div>
                <MatchItem match={featuredLive} featured />
              </div>
            )}

            {/* Remaining live matches */}
            {live.length > 1 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ef4444", marginBottom: 10 }}>
                  Also Live · {live.length - 1} more
                </div>
                {live.slice(1, 6).map(m => <MatchItem key={m.id} match={m} />)}
              </div>
            )}

            {/* No live state */}
            {live.length === 0 && !loading && (
              <Card style={{ padding: "28px 20px", marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🏟️</div>
                <div style={{ fontWeight: 700, color: "#fff", marginBottom: 6 }}>No live matches right now</div>
                <div style={{ fontSize: 13, color: "var(--muted)", maxWidth: 260, margin: "0 auto" }}>
                  Live scores appear here automatically during IPL or EPL match times
                </div>
              </Card>
            )}

            {/* Key moments strip */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Key Moments</span>
                <Link href="/moments" style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>View All →</Link>
              </div>
              <MomentsStrip />
            </div>

            {/* Recent results */}
            {recent.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                  Recent Results
                </div>
                {recent.slice(0, 5).map(m => <MatchItem key={m.id} match={m} />)}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Fan Pulse */}
            <Card style={{ padding: 16 }}>
              <FanPulse matchId={featuredLive?.id ?? "default"} />
            </Card>

            {/* Quick stats */}
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>
                Your Activity
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "XP Today",    val: "450",  color: "var(--green)" },
                  { label: "Predictions", val: "3/4",  color: "var(--amber)" },
                  { label: "Quiz Rank",   val: "#412", color: "var(--text)" },
                  { label: "Streak",      val: "5🔥",  color: "var(--text)" },
                ].map(s => (
                  <div key={s.label} style={{ background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Match count summary */}
            <Card style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "var(--green)" }}>{live.length}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Live Now</div>
                </div>
                <div style={{ width: 1, background: "var(--border)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text)" }}>{recent.length}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Completed</div>
                </div>
                <div style={{ width: 1, background: "var(--border)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "var(--amber)" }}>{matches.length}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Total</div>
                </div>
              </div>
            </Card>

            {/* Join chat CTA */}
            <Link href="/chat">
              <button style={{
                width: "100%", padding: "14px 0",
                background: "var(--green)", color: "var(--green-dark)",
                border: "none", borderRadius: 10,
                fontFamily: "var(--font)", fontWeight: 700, fontSize: 14,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: "pointer", boxShadow: "0 0 20px rgba(0,255,135,0.25)",
                transition: "filter 0.2s",
              }}
                onMouseOver={e => (e.currentTarget.style.filter = "brightness(1.1)")}
                onMouseOut={e => (e.currentTarget.style.filter = "brightness(1)")}>
                💬 Join Live Chat
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Quick Nav section ────────────────────────────────────────────── */}
      {!loading && (
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Explore</div>
          <QuickNavGrid />
        </div>
      )}
    </div>
  );
}