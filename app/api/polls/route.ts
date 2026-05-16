import { NextRequest, NextResponse } from "next/server";
import { db, Poll } from "@/lib/db";

// Event type → poll template
const POLL_TEMPLATES: Record<string, { question: string; options: string[] }> = {
  wicket: { question: "Who takes the next wicket?", options: ["Opening bowler", "Spinner", "Other"] },
  goal:   { question: "Who scores next?",            options: ["Home team", "Away team", "No one"] },
  card:   { question: "Will there be another card?", options: ["Yes – same team", "Yes – other team", "No"] },
};

function closeStalePoll(poll: Poll) {
  if (!poll.closed && Date.now() > poll.closesAt) {
    poll.closed = true;
    db.savePoll(poll);
  }
}

function pollToJSON(poll: Poll) {
  closeStalePoll(poll);
  return {
    id: poll.id,
    matchId: poll.matchId,
    question: poll.question,
    options: poll.options,
    votes: poll.votes,
    totalVotes: Object.values(poll.votes).reduce((a, b) => a + b, 0),
    createdAt: poll.createdAt,
    closesAt: poll.closesAt,
    closed: poll.closed,
    triggerEvent: poll.triggerEvent,
  };
}

export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  let all = db.getPolls();
  
  // Seed preset polls if empty
  if (all.length === 0) {
    const now = Date.now();
    const presetPolls: Poll[] = [
      {
        id: "poll_seed_1", matchId: "demo_1", question: "Who will win the toss?",
        options: ["Home Team", "Away Team"], votes: { 0: 45, 1: 55 },
        voters: [], createdAt: now - 10000, closesAt: now + 600000, closed: false, triggerEvent: "toss"
      },
      {
        id: "poll_seed_2", matchId: "demo_1", question: "Who scores the next goal?",
        options: ["Arsenal", "Man City", "No Goal"], votes: { 0: 120, 1: 150, 2: 30 },
        voters: [], createdAt: now - 300000, closesAt: now + 30000, closed: false, triggerEvent: "goal"
      },
      {
        id: "poll_seed_3", matchId: "demo_2", question: "How many runs in this over?",
        options: ["0-4", "5-8", "9-12", "13+"], votes: { 0: 10, 1: 50, 2: 30, 3: 5 },
        voters: [], createdAt: now - 50000, closesAt: now - 1000, closed: true, triggerEvent: "over"
      }
    ];
    for (const p of presetPolls) db.savePoll(p);
    all = db.getPolls();
  }

  const result = matchId
    ? all.filter(p => p.matchId === matchId)
    : all;
  result.forEach(closeStalePoll);
  return NextResponse.json(result.map(pollToJSON));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { matchId, event, durationSeconds = 120 } = body as {
    matchId: string;
    event: "wicket" | "goal" | "card";
    durationSeconds?: number;
  };

  if (!matchId || !event) {
    return NextResponse.json({ error: "matchId and event are required" }, { status: 400 });
  }

  const template = POLL_TEMPLATES[event];
  if (!template) {
    return NextResponse.json({ error: `Unknown event type: ${event}` }, { status: 400 });
  }

  const seq = db.getNextPollSeq();
  const id = `poll_${seq}_${Date.now()}`;
  const now = Date.now();
  const poll: Poll = {
    id,
    matchId,
    question: template.question,
    options: template.options,
    votes: Object.fromEntries(template.options.map((_, i) => [i, 0])),
    voters: [],
    createdAt: now,
    closesAt: now + durationSeconds * 1000,
    closed: false,
    triggerEvent: event,
  };

  db.savePoll(poll);
  return NextResponse.json(pollToJSON(poll), { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { pollId, optionIndex, userId } = body as {
    pollId: string;
    optionIndex: number;
    userId: string;
  };

  if (!pollId || optionIndex == null || !userId) {
    return NextResponse.json({ error: "pollId, optionIndex, userId required" }, { status: 400 });
  }

  const poll = db.getPoll(pollId);
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  closeStalePoll(poll);
  if (poll.closed) return NextResponse.json({ error: "Poll is closed" }, { status: 409 });
  if (poll.voters.includes(userId)) return NextResponse.json({ error: "Already voted" }, { status: 409 });
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  poll.votes[optionIndex] = (poll.votes[optionIndex] ?? 0) + 1;
  poll.voters.push(userId);
  db.savePoll(poll);

  // Give user some points for participating
  const user = db.getUser(userId);
  user.totalPredictions += 1;
  user.points += 3; // 3 points for voting
  user.history.push({
    pollId: poll.id,
    question: poll.question,
    choice: poll.options[optionIndex],
    choiceIndex: optionIndex,
    ts: Date.now(),
    matchId: poll.matchId,
  });
  db.updateUser(user);

  return NextResponse.json(pollToJSON(poll));
}
