import { NextRequest, NextResponse } from "next/server";

// ── In-memory store (resets on server restart; swap for Redis/DB in production) ──
interface Poll {
  id: string;
  matchId: string;
  question: string;
  options: string[];
  votes: Record<string, number>;   // optionIndex → count
  voters: Set<string>;             // userId → voted
  createdAt: number;
  closesAt: number;
  closed: boolean;
  triggerEvent: string;
}

const polls = new Map<string, Poll>();
let pollSeq = 0;

// Event type → poll template
const POLL_TEMPLATES: Record<string, { question: string; options: string[] }> = {
  wicket: { question: "Who takes the next wicket?", options: ["Opening bowler", "Spinner", "Other"] },
  goal:   { question: "Who scores next?",            options: ["Home team", "Away team", "No one"] },
  card:   { question: "Will there be another card?", options: ["Yes – same team", "Yes – other team", "No"] },
};

function closeStalePoll(poll: Poll) {
  if (!poll.closed && Date.now() > poll.closesAt) poll.closed = true;
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

// GET /api/polls?matchId=xxx — list active polls for a match
// POST /api/polls           — create a poll (trigger system)
// PUT  /api/polls           — cast a vote

export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  const all = [...polls.values()];
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

  const id = `poll_${++pollSeq}_${Date.now()}`;
  const now = Date.now();
  const poll: Poll = {
    id,
    matchId,
    question: template.question,
    options: template.options,
    votes: Object.fromEntries(template.options.map((_, i) => [i, 0])),
    voters: new Set(),
    createdAt: now,
    closesAt: now + durationSeconds * 1000,
    closed: false,
    triggerEvent: event,
  };

  polls.set(id, poll);
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

  const poll = polls.get(pollId);
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  closeStalePoll(poll);
  if (poll.closed) return NextResponse.json({ error: "Poll is closed" }, { status: 409 });
  if (poll.voters.has(userId)) return NextResponse.json({ error: "Already voted" }, { status: 409 });
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  poll.votes[optionIndex] = (poll.votes[optionIndex] ?? 0) + 1;
  poll.voters.add(userId);
  return NextResponse.json(pollToJSON(poll));
}
