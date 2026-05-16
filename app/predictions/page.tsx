"use client";
import { useState } from "react";

const POLLS = [
  { id: 1, question: "Next Goal Scorer?", closes: "1:45", options: ["Arsenal", "Man City"], colors: ["#EF0107", "#6CABDD"], pct: [61, 39], votes: "12.4k" },
  { id: 2, question: "Final Score?", closes: "45:00", options: ["2-1 Arsenal", "Draw", "Man City Win"], colors: ["#EF0107", "#849585", "#6CABDD"], pct: [44, 22, 34], votes: "8.1k" },
];

const HISTORY = [
  { q: "Who wins the toss?", pick: "Arsenal", result: "correct", pts: 3 },
  { q: "First goal scorer?", pick: "Saka", result: "correct", pts: 3 },
  { q: "Half-time score?", pick: "1-0 Arsenal", result: "wrong", pts: 0 },
];

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "rgba(18,33,49,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, ...style }}>{children}</div>;
}

export default function PredictionsPage() {
  const [voted, setVoted] = useState<Record<number, number>>({});
  const [locked, setLocked] = useState<Record<number, boolean>>({});

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, padding: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, fontStyle: "italic", color: "#fff", marginBottom: 8 }}>Predictions</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>Make your predictions and earn points. Polls close automatically based on match events.</p>

        {POLLS.map(poll => (
          <Card key={poll.id} style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{poll.question}</h3>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "var(--amber)", fontWeight: 700, letterSpacing: "0.06em" }}>⏱ POLL CLOSES IN {poll.closes}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{poll.votes} voting</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${poll.options.length}, 1fr)`, gap: 10, marginBottom: 16 }}>
              {poll.options.map((opt, i) => {
                const isVoted = voted[poll.id] === i;
                return (
                  <button key={i} onClick={() => !locked[poll.id] && setVoted(v => ({ ...v, [poll.id]: i }))}
                    style={{
                      padding: "16px 12px", borderRadius: 8, border: `2px solid ${isVoted ? poll.colors[i % poll.colors.length] : "rgba(255,255,255,0.07)"}`,
                      background: isVoted ? `${poll.colors[i % poll.colors.length]}18` : "rgba(5,20,36,0.5)",
                      color: "#fff", fontFamily: "var(--font)", fontWeight: 700, fontSize: 15,
                      cursor: locked[poll.id] ? "default" : "pointer", transition: "all 0.2s",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${poll.colors[i % poll.colors.length]}33`, border: `2px solid ${poll.colors[i % poll.colors.length]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      {isVoted ? "✓" : "+"}
                    </div>
                    {opt}
                    {locked[poll.id] && <span style={{ fontSize: 12, color: "var(--muted)" }}>{poll.pct[i]}%</span>}
                  </button>
                );
              })}
            </div>

            {voted[poll.id] !== undefined && !locked[poll.id] && (
              <button onClick={() => setLocked(l => ({ ...l, [poll.id]: true }))}
                style={{ width: "100%", padding: "13px 0", background: "var(--green)", color: "var(--green-dark)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Lock Prediction 🔒
              </button>
            )}
            {locked[poll.id] && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {poll.options.map((opt, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "var(--text)" }}>{opt}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: voted[poll.id] === i ? "var(--green)" : "var(--muted)" }}>{poll.pct[i]}%</span>
                    </div>
                    <div style={{ height: 6, background: "var(--surface-top)", borderRadius: 9999 }}>
                      <div style={{ height: "100%", width: `${poll.pct[i]}%`, background: voted[poll.id] === i ? "var(--green)" : "var(--muted)", borderRadius: 9999 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Sidebar: history + leaderboard */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card style={{ padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>My Predictions</h4>
          {HISTORY.map((h, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < HISTORY.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{h.q}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: h.result === "correct" ? "var(--green)" : "#ef4444", fontWeight: 700 }}>
                  {h.result === "correct" ? "✓" : "✗"} {h.pick}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: h.result === "correct" ? "var(--green)" : "var(--muted)" }}>+{h.pts}pts</span>
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Your Stats</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[{ label: "Total Points", val: "2,450" }, { label: "Accuracy", val: "68%" }, { label: "Best Streak", val: "5" }, { label: "This Match", val: "6pts" }].map(s => (
              <div key={s.label} style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.1)", borderRadius: 8, padding: "12px 10px" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--green)" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}