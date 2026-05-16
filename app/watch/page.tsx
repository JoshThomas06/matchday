"use client";

const PARTNERS = [
  { name: "JioCinema",      sports: "INDIAN PREMIER LEAGUE",       color: "#6C3CE2" },
  { name: "Disney+ Hotstar", sports: "ICC EVENTS • PREMIER LEAGUE", color: "#1A6FE8" },
  { name: "SonyLIV",         sports: "CHAMPIONS LEAGUE • TENNIS",   color: "#E8531A" },
  { name: "Sky Sports",      sports: "F1 • BOXING • GOLF",          color: "#0080C8" },
];

const CHANNELS = [
  { league: "PREMIER LEAGUE", title: "Liverpool vs Arsenal",       watching: "45,210", url: "https://www.skysports.com" },
  { league: "FORMULA 1",      title: "Monaco Grand Prix: Race Day", watching: "1.2M",  url: "https://www.f1.com" },
  { league: "ATP MASTERS",    title: "Djokovic vs Alcaraz",         watching: "88k",   url: "https://www.atptour.com" },
];

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)", border: "1px solid var(--border)", borderRadius: 12, ...style }}>
      {children}
    </div>
  );
}

export default function WatchPage() {
  return (
    <div style={{ padding: 24, minHeight: "100%" }}>
      {/* Featured hero */}
      <Card style={{ position: "relative", overflow: "hidden", marginBottom: 40, borderRadius: 16 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,20,36,0.97) 35%, rgba(5,20,36,0.5) 70%, transparent)", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #051424 0%, #0d2a1a 50%, #051424 100%)", opacity: 0.9 }} />
        <div style={{ position: "relative", zIndex: 2, padding: "48px 40px", maxWidth: 640 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <span style={{ background: "#ef4444", color: "#fff", padding: "5px 12px", borderRadius: 4, fontWeight: 700, fontSize: 12, letterSpacing: "0.06em" }}>● LIVE NOW</span>
            <span style={{ background: "rgba(0,255,135,0.1)", color: "var(--green)", border: "1px solid rgba(0,255,135,0.2)", padding: "5px 12px", borderRadius: 4, fontSize: 12, letterSpacing: "0.06em", fontWeight: 700 }}>IPL 2024 • MATCH 45</span>
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 900, fontStyle: "italic", color: "#fff", lineHeight: 1.1, marginBottom: 16 }}>
            CHENNAI SUPER KINGS <span style={{ color: "var(--amber)" }}>VS</span> MUMBAI INDIANS
          </h1>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, marginBottom: 28, maxWidth: 480 }}>
            The greatest rivalry in IPL history continues. Watch the legendary MS Dhoni take on the formidable Hardik Pandya in this high-stakes clash at the Chepauk.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="https://www.jiocinema.com" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--green)", color: "var(--green-dark)", padding: "14px 28px", borderRadius: 8, fontWeight: 700, fontSize: 15, letterSpacing: "0.04em" }}>
              ▶ Watch on JioCinema
            </a>
            <button style={{ background: "rgba(255,255,255,0.08)", color: "var(--text)", border: "1px solid var(--border)", padding: "14px 24px", borderRadius: 8, fontSize: 15, fontWeight: 700 }}>
              Match Info
            </button>
          </div>
          <p style={{ marginTop: 14, fontSize: 12, color: "var(--green)", display: "flex", alignItems: "center", gap: 6 }}>
            📍 India: Stream for free on JioCinema
          </p>
        </div>
      </Card>

      {/* Streaming Partners */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Official Streaming Partners</h2>
          <button style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, letterSpacing: "0.04em" }}>View All</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {PARTNERS.map(p => (
            <Card key={p.name} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 700, fontStyle: "italic", color: "#fff" }}>{p.name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>{p.sports}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Live Event Channels */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Live Event Channels</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>⚙ Filter</button>
            <button style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>↕ Sort By</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {CHANNELS.map(ch => (
            <a key={ch.title} href={ch.url} target="_blank" rel="noopener noreferrer">
              <Card style={{ overflow: "hidden", transition: "transform 0.2s", display: "block" }}>
                <div style={{ height: 140, background: "linear-gradient(135deg, #0d2a1a, #051424)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <span style={{ position: "absolute", top: 10, left: 10, background: "#ef4444", color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>● LIVE</span>
                  <span style={{ fontSize: 40 }}>🏟️</span>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: 6 }}>{ch.league}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{ch.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{ch.watching} watching →</div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}