import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function getSortedEntries() {
  const users = db.getAllUsers();
  // Add some demo users if DB is empty
  const demoUsers = [
    { userId: "user_1", points: 14250, correctPredictions: 142, totalPredictions: 168 },
    { userId: "user_2", points: 13910, correctPredictions: 138, totalPredictions: 170 },
    { userId: "user_3", points: 12400, correctPredictions: 124, totalPredictions: 155 },
    { userId: "user_4", points: 11800, correctPredictions: 118, totalPredictions: 150 },
    { userId: "user_5", points: 10200, correctPredictions: 102, totalPredictions: 140 },
  ];
  const allUsers = [...users];
  demoUsers.forEach(du => {
    if (!users.find(u => u.userId === du.userId)) {
      allUsers.push({ ...du, history: [], accuracy: 0 });
    }
  });

  return allUsers.sort((a, b) => b.points - a.points);
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
    displayName: e.userId.startsWith("guest_") ? "Guest_" + e.userId.slice(6, 10) : (e.userId.startsWith("user_") ? "DemoUser_" + e.userId.slice(5) : e.userId),
    points: e.points,
    accuracy: e.totalPredictions > 0
      ? Math.round((e.correctPredictions / e.totalPredictions) * 100)
      : 0,
  }));

  const response: Record<string, unknown> = { top10 };

  if (userId) {
    const user = sorted.find(u => u.userId === userId);
    if (user) {
      response.me = {
        rank: getRank(userId),
        userId: user.userId,
        displayName: user.userId,
        points: user.points,
        accuracy: user.totalPredictions > 0
          ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
          : 0,
        matchHistory: user.history || [], 
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

  const user = db.getUser(userId);
  user.points += pointsAwarded;
  user.totalPredictions += 1;
  if (correct) user.correctPredictions += 1;
  db.updateUser(user);

  return NextResponse.json({
    userId,
    newTotal: user.points,
    rank: getRank(userId),
    pointsAwarded,
  });
}
