import { NextRequest, NextResponse } from "next/server";

// ── In-memory leaderboard (seed with some demo data) ───────────────────────
interface UserEntry {
  userId: string;
  displayName: string;
  points: number;
  correctPredictions: number;
  totalPredictions: number;
  matchHistory: { matchId: string; points: number; ts: number }[];
}

const board = new Map<string, UserEntry>([
  ["user_1", { userId: "user_1", displayName: "QuizMaster_99",  points: 14250, correctPredictions: 142, totalPredictions: 168, matchHistory: [] }],
  ["user_2", { userId: "user_2", displayName: "StadiumSurfer",  points: 13910, correctPredictions: 138, totalPredictions: 170, matchHistory: [] }],
  ["user_3", { userId: "user_3", displayName: "GoalGetter_Pro", points: 12400, correctPredictions: 124, totalPredictions: 155, matchHistory: [] }],
  ["user_4", { userId: "user_4", displayName: "CricketKing",    points: 11800, correctPredictions: 118, totalPredictions: 150, matchHistory: [] }],
  ["user_5", { userId: "user_5", displayName: "BallWatcher",    points: 10200, correctPredictions: 102, totalPredictions: 140, matchHistory: [] }],
]);

function getSortedEntries() {
  return [...board.values()].sort((a, b) => b.points - a.points);
}

function getRank(userId: string): number {
  return getSortedEntries().findIndex(e => e.userId === userId) + 1;
}

// GET /api/leaderboard?userId=xxx  → top10 + user rank/entry
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const sorted = getSortedEntries();
  const top10 = sorted.slice(0, 10).map((e, i) => ({
    rank: i + 1,
    userId: e.userId,
    displayName: e.displayName,
    points: e.points,
    accuracy: e.totalPredictions > 0
      ? Math.round((e.correctPredictions / e.totalPredictions) * 100)
      : 0,
  }));

  const response: Record<string, unknown> = { top10 };

  if (userId) {
    const user = board.get(userId);
    if (user) {
      response.me = {
        rank: getRank(userId),
        userId: user.userId,
        displayName: user.displayName,
        points: user.points,
        accuracy: user.totalPredictions > 0
          ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
          : 0,
        matchHistory: user.matchHistory.slice(-10),
      };
    } else {
      response.me = null;
    }
  }

  return NextResponse.json(response);
}

// POST /api/leaderboard  → award points after prediction resolves
// Body: { userId, displayName, matchId, pointsAwarded, correct }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, displayName, matchId, pointsAwarded, correct } = body as {
    userId: string;
    displayName: string;
    matchId: string;
    pointsAwarded: number;
    correct: boolean;
  };

  if (!userId || pointsAwarded == null) {
    return NextResponse.json({ error: "userId and pointsAwarded required" }, { status: 400 });
  }

  if (!board.has(userId)) {
    board.set(userId, {
      userId,
      displayName: displayName ?? userId,
      points: 0,
      correctPredictions: 0,
      totalPredictions: 0,
      matchHistory: [],
    });
  }

  const entry = board.get(userId)!;
  entry.points += pointsAwarded;
  entry.totalPredictions += 1;
  if (correct) entry.correctPredictions += 1;
  entry.matchHistory.push({ matchId, points: pointsAwarded, ts: Date.now() });

  return NextResponse.json({
    userId,
    newTotal: entry.points,
    rank: getRank(userId),
    pointsAwarded,
  });
}
