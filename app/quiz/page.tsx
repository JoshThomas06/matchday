"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const PRESET_QUIZ = [
  { q: "Who holds the record for most runs in a single IPL season?", opts: ["Virat Kohli", "Chris Gayle", "Jos Buttler", "David Warner"], ans: 0 },
  { q: "Which team has won the most English Premier League titles?", opts: ["Arsenal", "Chelsea", "Manchester City", "Manchester United"], ans: 3 },
  { q: "Who scored the fastest century in ODI cricket?", opts: ["AB de Villiers", "Corey Anderson", "Shahid Afridi", "Virat Kohli"], ans: 0 },
  { q: "In which year did the Premier League start?", opts: ["1990", "1992", "1995", "1998"], ans: 1 },
];

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style }}>{children}</div>;
}

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === PRESET_QUIZ[current].ans) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (current < PRESET_QUIZ.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (showResult) {
    return (
      <div style={{ padding: 24, minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card style={{ padding: "64px 48px", textAlign: "center", maxWidth: 600, width: "100%" }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🏆</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", marginBottom: 16 }}>
            QUIZ COMPLETE
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 18, marginBottom: 32 }}>
            You scored <span style={{ color: "var(--green)", fontWeight: 700 }}>{score}</span> out of {PRESET_QUIZ.length}.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button onClick={() => { setCurrent(0); setScore(0); setSelected(null); setShowResult(false); }} style={{ padding: "12px 24px", background: "var(--green)", border: "none", borderRadius: 8, color: "var(--green-dark)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Play Again</button>
            <Link href="/dashboard" style={{ padding: "12px 24px", background: "rgba(0,255,135,0.1)", border: "1px solid var(--green)", borderRadius: 8, color: "var(--green)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Back to Matchday</Link>
          </div>
        </Card>
      </div>
    );
  }

  const q = PRESET_QUIZ[current];

  return (
    <div style={{ padding: 24, minHeight: "100%", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "var(--amber)", marginBottom: 4, textTransform: "uppercase" }}>Matchday Trivia</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
            LIVE <span style={{ color: "var(--amber)" }}>QUIZ</span>
          </h1>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>
          Question {current + 1} of {PRESET_QUIZ.length}
        </div>
      </div>

      <Card style={{ padding: "40px 32px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 32, lineHeight: 1.4 }}>
          {q.q}
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {q.opts.map((opt, i) => {
            let bg = "rgba(0,0,0,0.3)";
            let borderColor = "rgba(255,255,255,0.1)";
            let color = "#fff";
            
            if (selected !== null) {
              if (i === q.ans) {
                bg = "rgba(0,255,135,0.2)";
                borderColor = "var(--green)";
                color = "var(--green)";
              } else if (i === selected) {
                bg = "rgba(239,68,68,0.2)";
                borderColor = "#ef4444";
                color = "#ef4444";
              }
            }
            
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null} style={{
                padding: "16px 20px", textAlign: "left", borderRadius: 8, fontSize: 16, fontWeight: 700,
                background: bg, border: `1px solid ${borderColor}`, color: color,
                cursor: selected === null ? "pointer" : "default", transition: "all 0.2s"
              }}>
                {opt}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}