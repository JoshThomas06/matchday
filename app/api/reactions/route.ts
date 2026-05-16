import { NextRequest, NextResponse } from "next/server";

// ── In-memory fan pulse store ──────────────────────────────────────────────
interface PulseEntry {
  count: number;
  lastDecayAt: number;
}

// matchId → { team1: PulseEntry, team2: PulseEntry }
const pulseStore = new Map<string, { team1: PulseEntry; team2: PulseEntry }>();
const reactionLog = new Map<string, Set<string>>(); // `${matchId}_${team}` → Set<userId>

const DECAY_INTERVAL_MS = 30_000;
const DECAY_RATE = 0.05;

function applyDecay(entry: PulseEntry): number {
  const now = Date.now();
  const periods = Math.floor((now - entry.lastDecayAt) / DECAY_INTERVAL_MS);
  if (periods > 0) {
    entry.count = Math.round(entry.count * Math.pow(1 - DECAY_RATE, periods));
    entry.lastDecayAt = now;
  }
  return entry.count;
}

function ensureMatch(matchId: string) {
  if (!pulseStore.has(matchId)) {
    pulseStore.set(matchId, {
      team1: { count: 0, lastDecayAt: Date.now() },
      team2: { count: 0, lastDecayAt: Date.now() },
    });
  }
  return pulseStore.get(matchId)!;
}

// GET /api/reactions?matchId=xxx  → { team1: N, team2: N }
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) {
    // Return all matches
    const all: Record<string, { team1: number; team2: number }> = {};
    pulseStore.forEach((v, k) => {
      all[k] = { team1: applyDecay(v.team1), team2: applyDecay(v.team2) };
    });
    return NextResponse.json(all);
  }

  const entry = ensureMatch(matchId);
  return NextResponse.json({
    matchId,
    team1: applyDecay(entry.team1),
    team2: applyDecay(entry.team2),
    decayRate: "5% per 30s",
    lastUpdated: Date.now(),
  });
}

// POST /api/reactions  → { matchId, team: "team1"|"team2", userId }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { matchId, team, userId } = body as {
    matchId: string;
    team: "team1" | "team2";
    userId: string;
  };

  if (!matchId || !team || !userId) {
    return NextResponse.json({ error: "matchId, team, userId required" }, { status: 400 });
  }
  if (team !== "team1" && team !== "team2") {
    return NextResponse.json({ error: "team must be 'team1' or 'team2'" }, { status: 400 });
  }

  // Deduplicate per match+team per user (but allow re-reaction — just don't double-count per request)
  const entry = ensureMatch(matchId);
  entry[team].count += 1;
  applyDecay(entry.team1);
  applyDecay(entry.team2);

  return NextResponse.json({
    matchId,
    team1: entry.team1.count,
    team2: entry.team2.count,
    accepted: true,
  });
}
