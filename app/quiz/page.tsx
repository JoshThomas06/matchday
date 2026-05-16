"use client";
import { useState, useEffect } from "react";

const QUESTIONS = [
  { q: "Who holds the record for the highest individual score in a T20 World Cup Final?", options: ["Marlon Samuels", "Virat Kohli", "Carlos Brathwaite", "Jos Buttler"], answer: 0 },
  { q: "Which team has won the most IPL titles?", options: ["Mumbai Indians", "Chennai Super Kings", "Kolkata Knight Riders", "Royal Challengers"], answer: 0 },
  { q: "How many players are on a cricket team?", options: ["9", "10", "11", "12"], answer: 2 },
];

const LEADERBOARD = [
  { rank: 1,   name: "QuizMaster_99",  pts: 14250 },
  { rank: 2,   name: "StadiumSurfer",  pts: 13910 },
  { rank: 3,   name: "GoalGetter_Pro", pts: 12400 },
  { rank: 412, name: "YOU",            pts: 2450,  isMe: true },
];

const CATEGORIES = [
  { icon: "🏏", label: "IPL Legend Quiz",          sub: "All-time greats",       pts: 400 },
  { icon: "⚽", label: "Champions League History", sub: "Iconic European nights", pts: 500 },
  { icon: "🏆", label: "Cricket World Cup Facts",  sub: "1975 - Present day",     pts: 300 },
];

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style }}>{children}</div>;
}

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [current]);

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === QUESTIONS[current].answer) setScore(s => s + 50);
  };

  const next = () => { if (current < QUESTIONS.length - 1) { setCurrent(c => c + 1); setSelected(null); setTimeLeft(60); } };

  const q = QUESTIONS[current];
  const progress = ((current) / QUESTIONS.length) * 100;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, padding: 24, minHeight: "100%", alignItems: "start" }}>

      {/* Main quiz area */}
      <div>
        {/* Hero banner */}
        <Card style={{ marginBottom: 24, overflow: "hidden" }}>
          <div style={{ padding: "32px 32px 24px", background: "linear-gradient(135deg, #051424, #0a2010)", position: "relative" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <span style={{ background: "var(--green)", color: "var(--green-dark)", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 900, letterSpacing: "0.06em" }}>LIVE CHALLENGE</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Daily Trivia Challenge</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>Test your speed and accuracy. 10 questions, 60 seconds. Can you beat the clock?</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button style={{ background: "var(--green)", color: "var(--green-dark)", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", cursor: "pointer" }}>START QUIZ</button>
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Resets in</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--amber)" }}>04:22:15</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Active question */}
        <Card style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Question {current + 1} of {QUESTIONS.length}</span>
            <span style={{ color: "var(--green)", fontWeight: 700 }}>⭐ {score} XP</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: "var(--surface-top)", borderRadius: 9999, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ height: "100%", background: "var(--green)", width: `${progress}%`, transition: "width 0.3s" }} />
          </div>

          {/* Timer */}
          <div style={{ textAlign: "right", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: timeLeft < 15 ? "#ef4444" : "var(--muted)" }}>⏱ {timeLeft}s</span>
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.5, marginBottom: 20 }}>{q.q}</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              let bg = "rgba(18,33,49,0.6)";
              let border = "rgba(255,255,255,0.07)";
              let color = "var(--text)";
              if (selected !== null) {
                if (i === q.answer) { bg = "rgba(0,255,135,0.12)"; border = "var(--green)"; color = "var(--green)"; }
                else if (i === selected && i !== q.answer) { bg = "rgba(239,68,68,0.1)"; border = "#ef4444"; color = "#ef4444"; }
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} style={{
                  background: bg, border: `1px solid ${border}`, borderRadius: 8,
                  padding: "14px 18px", textAlign: "left", color, fontSize: 15,
                  fontFamily: "var(--font)", cursor: selected === null ? "pointer" : "default",
                  transition: "all 0.2s",
                }}>{opt}</button>
              );
            })}
          </div>

          {selected !== null && current < QUESTIONS.length - 1 && (
            <button onClick={next} style={{ marginTop: 16, background: "var(--green)", color: "var(--green-dark)", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" }}>
              Next Question →
            </button>
          )}
        </Card>

        {/* Browse categories */}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Browse Categories</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {CATEGORIES.map(cat => (
            <Card key={cat.label} style={{ padding: 20, cursor: "pointer", transition: "border-color 0.2s" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{cat.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{cat.label}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{cat.sub}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>→ {cat.pts} POINTS</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Achievements */}
        <Card style={{ padding: 16 }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Achievements Unlocked</h4>
          <div style={{ height: 4, background: "var(--surface-top)", borderRadius: 9999, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ height: "100%", width: "35%", background: "var(--amber)" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ icon: "⚡", color: "var(--green)", unlocked: true }, { icon: "🎖️", color: "var(--amber)", unlocked: true }, { icon: "🔒", color: "var(--surface-top)", unlocked: false }].map((a, i) => (
              <div key={i} style={{ width: 56, height: 56, borderRadius: "50%", background: a.unlocked ? `${a.color}22` : "var(--surface-top)", border: `2px solid ${a.unlocked ? a.color : "var(--surface-hi)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {a.unlocked ? a.icon : "🔒"}
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Leaderboard</h4>
            <button style={{ background: "none", border: "none", color: "var(--green)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>VIEW →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LEADERBOARD.map(p => (
              <div key={p.rank} style={{ display: "flex", alignItems: "center", gap: 10, padding: (p as any).isMe ? "8px 10px" : "4px 0", background: (p as any).isMe ? "rgba(0,255,135,0.06)" : "transparent", borderRadius: 8, border: (p as any).isMe ? "1px solid rgba(0,255,135,0.15)" : "none" }}>
                <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: p.rank <= 3 ? "var(--amber)" : "var(--muted)", flexShrink: 0 }}>{p.rank}</span>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface-top)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                  {(p as any).isMe ? "👤" : "🎮"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: (p as any).isMe ? "var(--green)" : "#fff" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.pts.toLocaleString()} pts</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}