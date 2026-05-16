"use client";

const STATS = [
  { label: "SHOTS (ON)", home: "12 (5)", away: "15 (7)" },
  { label: "CORNERS", home: "4", away: "8" },
  { label: "PASS ACCURACY", home: "82%", away: "89%", homeColor: "var(--green)", awayColor: "var(--amber)" },
  { label: "FOULS COMMITTED", home: "9", away: "11" },
  { label: "YELLOW CARDS", home: "2", away: "1" },
];

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style }}>{children}</div>;
}

function DonutChart({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 54; const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--surface-top)" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 1s" }} />
        <text x="70" y="65" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700" fontFamily="var(--font)">{pct}%</text>
        <text x="70" y="82" textAnchor="middle" fill="var(--muted)" fontSize="10" fontWeight="700" fontFamily="var(--font)" letterSpacing="2">{label}</text>
      </svg>
    </div>
  );
}

export default function StatsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, fontStyle: "italic", color: "#fff", marginBottom: 24 }}>Live Stats · ARS vs MCI</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Possession */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>Ball Possession</h3>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <DonutChart pct={44} color="var(--green)" label="ARSENAL" />
          </div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>● 44%</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--amber)" }}>● 56%</span>
          </div>
        </Card>

        {/* Match Performance */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>Match Performance</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {STATS.map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: (s as any).homeColor ?? "var(--green)", fontSize: 14 }}>{s.home}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: (s as any).awayColor ?? "var(--amber)", fontSize: 14 }}>{s.away}</span>
                </div>
                {i === 2 && (
                  <div style={{ height: 4, background: "var(--surface-top)", borderRadius: 9999, overflow: "hidden", display: "flex" }}>
                    <div style={{ height: "100%", width: "48%", background: "var(--green)" }} />
                    <div style={{ height: "100%", flex: 1, background: "var(--amber)" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Player spotlight */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#EF0107,#8B0000)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>
            ⚽
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Bukayo Saka</h3>
              <span style={{ background: "rgba(0,255,135,0.15)", color: "var(--green)", border: "1px solid rgba(0,255,135,0.3)", padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>MVP CANDIDATE</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Arsenal • RW</p>
            <div style={{ display: "flex", gap: 32 }}>
              {[{ label: "RATING", val: "8.7" }, { label: "GOALS", val: "1" }, { label: "ASSISTS", val: "1" }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--green)" }}>{s.val}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}