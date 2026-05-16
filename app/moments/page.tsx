"use client";

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style }}>{children}</div>;
}

export default function MomentsPage() {
  return (
    <div style={{ padding: 24, minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card style={{ padding: "64px 48px", textAlign: "center", maxWidth: 600 }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>⚡</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <span style={{ background: "rgba(0,255,135,0.15)", color: "var(--green)", border: "1px solid rgba(0,255,135,0.3)", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>COMING SOON</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
          KEY MOMENTS
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          Experience the thrill of the match with instant highlights. Key moments like goals, wickets, and boundaries will automatically appear here as they happen in real-time. Discuss the action with other fans.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <a href="/dashboard" style={{ padding: "12px 24px", background: "rgba(0,255,135,0.1)", border: "1px solid var(--green)", borderRadius: 8, color: "var(--green)", fontWeight: 700, fontSize: 14 }}>Return to Matchday</a>
        </div>
      </Card>
    </div>
  );
}