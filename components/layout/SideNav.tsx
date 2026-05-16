"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// SVG icons — no external icon library needed
const Icons = {
  home:       <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  cricket:    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21l7-7m0 0l4-8 5 5-8 4zm7-7l3-3m2-5l3 3-1 1-3-3 1-1z"/></svg>,
  football:   <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  moments:    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  chat:       <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  stats:      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  teams:      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  analytics:  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  chatbubble: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  help:       <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  logout:     <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  watch:      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>,
  predict:    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  quiz:       <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

const PRIMARY_NAV = [
  { label: "HOME",       href: "/",            icon: Icons.home },
  { label: "CRICKET",    href: "/dashboard",   icon: Icons.cricket },
  { label: "FOOTBALL",   href: "/football",    icon: Icons.football },
  { label: "WATCH LIVE", href: "/watch",       icon: Icons.watch },
  { label: "MOMENTS",    href: "/moments",     icon: Icons.moments },
  { label: "PREDICTIONS",href: "/predictions", icon: Icons.predict },
  { label: "QUIZ",       href: "/quiz",        icon: Icons.quiz },
  { label: "STATS",      href: "/stats",       icon: Icons.stats },
];

const SECONDARY_NAV = [
  { label: "MY TEAMS",   href: "/teams",      icon: Icons.teams },
  { label: "ANALYTICS",  href: "/analytics",  icon: Icons.analytics },
];

export default function SideNav() {
  const path = usePathname();

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <aside style={{
      position: "fixed", left: 0, top: 64, bottom: 0, width: 240, zIndex: 40,
      background: "rgba(18,33,49,0.7)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column",
      padding: "20px 12px 16px",
      overflowY: "auto",
    }}>
      {/* Brand */}
      <div style={{ padding: "0 8px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font)", fontWeight: 700, fontStyle: "italic", fontSize: 20, color: "#f1ffef" }}>
          MATCHDAY
        </div>
        <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: 2 }}>
          Live Dashboard
        </div>
      </div>

      {/* Primary nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {PRIMARY_NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 16px", borderRadius: 8, textDecoration: "none",
              fontFamily: "var(--font)", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: active ? "#003919" : "var(--text-muted)",
              background: active ? "var(--green)" : "transparent",
              boxShadow: active ? "0 0 12px rgba(0,255,135,0.3)" : "none",
              transition: "all 0.2s",
            }}>
              <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Divider */}
        <div style={{ margin: "8px 0", height: 1, background: "rgba(255,255,255,0.06)" }} />

        {SECONDARY_NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 16px", borderRadius: 8, textDecoration: "none",
              fontFamily: "var(--font)", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: active ? "#003919" : "var(--text-muted)",
              background: active ? "var(--green)" : "transparent",
              transition: "all 0.2s",
            }}>
              <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom CTA */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
        <button style={{
          width: "100%", padding: "12px 0",
          background: "var(--green)", color: "#003919",
          border: "none", borderRadius: 8, cursor: "pointer",
          fontFamily: "var(--font)", fontWeight: 700, fontSize: 12,
          letterSpacing: "0.08em", textTransform: "uppercase",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "filter 0.2s",
        }}
          onMouseOver={e => (e.currentTarget.style.filter = "brightness(1.1)")}
          onMouseOut={e => (e.currentTarget.style.filter = "brightness(1)")}>
          {Icons.chatbubble}
          Join Live Chat
        </button>

        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { label: "HELP",   icon: Icons.help,   color: "var(--text-muted)" },
            { label: "LOGOUT", icon: Icons.logout, color: "#ff6b6b" },
          ].map(item => (
            <button key={item.label} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font)", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: item.color, width: "100%",
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
