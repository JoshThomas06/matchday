"use client";
import Link from "next/link";

const NAV = ["Live", "Schedule", "News"];

export default function TopBar() {
  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 64, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
      background: "rgba(5,20,36,0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 0 20px rgba(0,228,120,0.08)",
    }}>
      {/* Left: logo + nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font)", fontWeight: 900, fontStyle: "italic",
            fontSize: 26, color: "#f1ffef", letterSpacing: "-0.03em",
            textShadow: "0 0 20px rgba(0,255,135,0.2)",
          }}>MATCHDAY</span>
        </Link>
        <nav style={{ display: "flex", gap: 24 }}>
          {NAV.map((item, i) => (
            <a key={item} href="#" style={{
              fontFamily: "var(--font)", fontSize: 16, fontWeight: 400,
              color: i === 0 ? "#f1ffef" : "var(--text-muted)",
              textDecoration: "none",
              borderBottom: i === 0 ? "2px solid var(--green)" : "2px solid transparent",
              paddingBottom: 4,
              transition: "color 0.2s",
            }}>{item}</a>
          ))}
        </nav>
      </div>

      {/* Right: search + icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={2}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search matches..."
            style={{
              background: "rgba(1,15,31,0.8)", border: "1px solid rgba(59,75,61,0.35)",
              borderRadius: 9999, padding: "8px 16px 8px 38px",
              color: "var(--text)", fontSize: 14, width: 240, outline: "none",
              fontFamily: "var(--font)", transition: "border-color 0.2s",
            }}
          />
        </div>

        {/* Bell */}
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, lineHeight: 0 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        {/* Settings */}
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, lineHeight: 0 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        {/* Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #004B87, #00ff87)",
          border: "1.5px solid rgba(0,255,135,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14, color: "#003919", cursor: "pointer",
          flexShrink: 0, fontFamily: "var(--font)",
        }}>J</div>
      </div>
    </header>
  );
}
