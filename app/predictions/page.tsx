"use client";
import { useState, useEffect, useCallback } from "react";
import { getOrCreateGuestId } from "@/lib/userId";

// ── Types ──────────────────────────────────────────────────────────────────
interface LivePoll {
  id: string;
  matchId: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  totalVotes: number;
  createdAt: number;
  closesAt: number;
  closed: boolean;
  triggerEvent: string;
}

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

function Countdown({ closesAt }: { closesAt: number }) {
  const [secsLeft, setSecsLeft] = useState(Math.max(0, Math.round((closesAt - Date.now()) / 1000)));
  useEffect(() => {
    const iv = setInterval(() => setSecsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, [closesAt]);
  const m = Math.floor(secsLeft / 60).toString().padStart(2, "0");
  const s = (secsLeft % 60).toString().padStart(2, "0");
  return (
    <span style={{ color: secsLeft < 30 ? "#ef4444" : "var(--amber)", fontWeight: 700, fontSize: 13 }}>
      {secsLeft === 0 ? "CLOSED" : `⏱ ${m}:${s}`}
    </span>
  );
}

// ── Poll card ──────────────────────────────────────────────────────────────
function PollCard({ poll, userId, onVote }: {
  poll: LivePoll;
  userId: string;
  onVote: (pollId: string, optionIndex: number) => void;
}) {
  const [myVote, setMyVote] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isClosed = poll.closed || Date.now() > poll.closesAt;

  const handleVote = async (i: number) => {
    if (myVote !== null || isClosed || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/polls", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll.id, optionIndex: i, userId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Vote failed"); return; }
      setMyVote(i);
      onVote(poll.id, i);
    } catch { setError("Network error"); }
    finally { setSubmitting(false); }
  };

  const COLORS = ["#EF0107", "#6CABDD", "#00ff87", "#f97316"];

  return (
    <Card style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--green)", marginBottom: 6 }}>
            {poll.triggerEvent.toUpperCase()} EVENT
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>{poll.question}</h3>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
          {isClosed ? (
            <span style={{ padding: "4px 10px", background: "rgba(255,255,255,0.08)", borderRadius: 9999, fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>CLOSED</span>
          ) : (
            <Countdown closesAt={poll.closesAt} />
          )}
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{poll.totalVotes.toLocaleString()} votes</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(poll.options.length, 3)}, 1fr)`, gap: 10, marginBottom: myVote !== null || isClosed ? 16 : 0 }}>
        {poll.options.map((opt, i) => {
          const isMyVote = myVote === i;
          const color = COLORS[i % COLORS.length];
          return (
            <button key={i} onClick={() => handleVote(i)}
              disabled={myVote !== null || isClosed || submitting}
              style={{
                padding: "16px 10px", borderRadius: 8, cursor: myVote === null && !isClosed ? "pointer" : "default",
                border: `2px solid ${isMyVote ? color : "rgba(255,255,255,0.07)"}`,
                background: isMyVote ? `${color}18` : "rgba(5,20,36,0.5)",
                color: "#fff", fontFamily: "var(--font)", fontWeight: 700, fontSize: 14,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                transition: "all 0.2s", opacity: submitting ? 0.6 : 1,
              }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: isMyVote ? `${color}33` : "rgba(255,255,255,0.06)",
                border: `1px solid ${isMyVote ? color : "rgba(255,255,255,0.1)"}`,
                fontSize: 14,
              }}>
                {isMyVote ? "✓" : String.fromCharCode(65 + i)}
              </div>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Results bar — shown after voting or if closed */}
      {(myVote !== null || isClosed) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {poll.options.map((opt, i) => {
            const pct = poll.totalVotes > 0 ? Math.round((poll.votes[i] ?? 0) / poll.totalVotes * 100) : 0;
            const color = COLORS[i % COLORS.length];
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: myVote === i ? "#fff" : "var(--muted)" }}>{opt}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: myVote === i ? color : "var(--muted)" }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: "var(--surface-top)", borderRadius: 9999 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: myVote === i ? color : "var(--muted)", borderRadius: 9999, transition: "width 0.8s" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && <div style={{ marginTop: 10, fontSize: 12, color: "#ef4444" }}>⚠ {error}</div>}
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PredictionsPage() {
  const [polls, setPolls] = useState<LivePoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState<string>(() => typeof window !== "undefined" ? getOrCreateGuestId() : "guest");

  // Leaderboard from API
  const [leaderboardData, setLeaderboardData] = useState<{ top10: { rank: number; displayName: string; points: number; accuracy: number }[]; me?: { rank: number; points: number; accuracy: number; matchHistory: any[] } } | null>(null);

  const fetchPolls = useCallback(async () => {
    try {
      const res = await fetch("/api/polls");
      const data = await res.json();
      setPolls(Array.isArray(data) ? data : []);
    } catch { /* keep existing */ }
    finally { setLoading(false); }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/leaderboard?userId=${userId}`);
      const data = await res.json();
      setLeaderboardData(data);
    } catch { /* ignore */ }
  }, [userId]);

  useEffect(() => {
    fetchPolls();
    fetchLeaderboard();
    const iv = setInterval(() => {
      fetchPolls();
      fetchLeaderboard();
    }, 15_000);
    return () => clearInterval(iv);
  }, [fetchPolls, fetchLeaderboard]);

  const handleVote = useCallback((pollId: string, choiceIndex: number) => {
    // Re-fetch leaderboard immediately to update points and history locally
    setTimeout(fetchLeaderboard, 1000);
  }, [fetchLeaderboard]);

  const history = leaderboardData?.me?.matchHistory || [];

  const openPolls = polls.filter(p => !p.closed && Date.now() < p.closesAt);
  const closedPolls = polls.filter(p => p.closed || Date.now() >= p.closesAt);

  const userStats = {
    totalPredictions: history.length,
    accuracy: 0, // Can't calculate without ground truth, show live when match results come in
    points: leaderboardData?.me?.points ?? history.length * 3,
    rank: leaderboardData?.me?.rank ?? "—",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, padding: 24, minHeight: "100%", alignItems: "start" }}>
      <div>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "var(--green)", marginBottom: 4, textTransform: "uppercase" }}>Live Polls</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>PREDICTIONS</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>
            Vote on live match events. Polls open automatically during play.
          </p>
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2].map(i => <div key={i} style={{ height: 160, borderRadius: 12, background: "rgba(255,255,255,0.05)", animation: "pulse-dot 1.5s infinite" }} />)}
          </div>
        )}

        {!loading && openPolls.length === 0 && closedPolls.length === 0 && (
          <Card style={{ padding: "36px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No Active Polls Right Now</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, maxWidth: 300, margin: "0 auto" }}>
              Polls open automatically when match events occur — wickets, goals, and big moments. Check back during live play.
            </p>
          </Card>
        )}

        {!loading && openPolls.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ff87", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />
              {openPolls.length} Active {openPolls.length === 1 ? "Poll" : "Polls"}
            </div>
            {openPolls.map(p => <PollCard key={p.id} poll={p} userId={userId} onVote={handleVote} />)}
          </>
        )}

        {!loading && closedPolls.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginTop: 24, marginBottom: 12 }}>Closed Polls</div>
            {closedPolls.slice(0, 5).map(p => <PollCard key={p.id} poll={p} userId={userId} onVote={handleVote} />)}
          </>
        )}
      </div>

      {/* Right sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* My predictions */}
        <Card style={{ padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>My Predictions</h4>
          {history.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Your votes will appear here once you participate in a poll.</p>
          ) : (
            history.slice(-6).reverse().map((h, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < Math.min(5, history.length - 1) ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4, lineHeight: 1.4 }}>{h.question}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>→ {h.choice}</span>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>
                    {new Date(h.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Stats */}
        <Card style={{ padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Your Stats</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Total Votes", val: userStats.totalPredictions.toString() },
              { label: "Est. Points", val: userStats.points.toLocaleString() },
              { label: "Global Rank", val: `#${userStats.rank}` },
              { label: "Active Polls", val: openPolls.length.toString() },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.1)", borderRadius: 8, padding: "12px 10px" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--green)" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard */}
        {leaderboardData && (
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Leaderboard</h4>
            </div>
            {leaderboardData.top10.slice(0, 5).map(p => (
              <div key={p.rank} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: p.rank <= 3 ? "var(--amber)" : "var(--muted)", flexShrink: 0 }}>{p.rank}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.displayName}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.points.toLocaleString()} pts · {p.accuracy}% acc</div>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}