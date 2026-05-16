import { NextRequest, NextResponse } from "next/server";

interface QuizQuestion {
  id: string;
  matchId: string;
  question: string;
  options: string[];
  correctIndex: number;
  xp: number;
  triggerEvent: string;
  createdAt: number;
  expiresAt: number;
  answered: Map<string, number>; // userId → optionIndex
}

const questions = new Map<string, QuizQuestion>();
let qSeq = 0;

// Event → question bank (keyed by bowler/player injected at trigger time)
function generateQuestion(event: string, context: Record<string, string>): {
  question: string;
  options: string[];
  correctIndex: number;
  xp: number;
} {
  const player = context.player ?? "the player";
  const team   = context.team ?? "the team";

  const banks: Record<string, { question: string; options: string[]; correctIndex: number; xp: number }> = {
    wicket: {
      question: `${player} has just taken a wicket! How many wickets has ${player} taken in T20 internationals this year?`,
      options:  ["Under 10", "10–20", "20–35", "35+"],
      correctIndex: 1,
      xp: 75,
    },
    goal: {
      question: `${player} just scored! How many goals has ${player} scored this season in all competitions?`,
      options:  ["1–5", "6–10", "11–15", "16+"],
      correctIndex: 1,
      xp: 50,
    },
    card: {
      question: `${player} received a card. How many yellows has ${team} accumulated in this competition?`,
      options:  ["1–3", "4–6", "7–10", "10+"],
      correctIndex: 0,
      xp: 40,
    },
    six: {
      question: `${player} hit a six! What is ${player}'s highest T20 score?`,
      options:  ["Under 50", "50–75", "76–100", "100+"],
      correctIndex: 2,
      xp: 60,
    },
  };

  return banks[event] ?? {
    question: `Quick fact: Which team won the last T20 World Cup?`,
    options:  ["India", "England", "Australia", "Pakistan"],
    correctIndex: 0,
    xp: 30,
  };
}

// GET /api/quiz/active?matchId=xxx  — active (non-expired) questions
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  const now = Date.now();
  const active = [...questions.values()].filter(q =>
    q.expiresAt > now && (!matchId || q.matchId === matchId)
  );

  return NextResponse.json(
    active.map(q => ({
      id:        q.id,
      matchId:   q.matchId,
      question:  q.question,
      options:   q.options,
      xp:        q.xp,
      expiresAt: q.expiresAt,
      createdAt: q.createdAt,
      triggerEvent: q.triggerEvent,
      answerCount: q.answered.size,
    }))
  );
}

// POST /api/quiz/active  — trigger a question from a match event
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { matchId, event, context = {}, durationSeconds = 90 } = body as {
    matchId: string;
    event: string;
    context?: Record<string, string>;
    durationSeconds?: number;
  };

  if (!matchId || !event) {
    return NextResponse.json({ error: "matchId and event required" }, { status: 400 });
  }

  const template = generateQuestion(event, context);
  const id = `quiz_${++qSeq}_${Date.now()}`;
  const now = Date.now();

  const q: QuizQuestion = {
    id,
    matchId,
    ...template,
    triggerEvent: event,
    createdAt: now,
    expiresAt: now + durationSeconds * 1000,
    answered: new Map(),
  };

  questions.set(id, q);
  return NextResponse.json({
    id: q.id,
    question: q.question,
    options: q.options,
    xp: q.xp,
    expiresAt: q.expiresAt,
  }, { status: 201 });
}

// PUT /api/quiz/active  — submit an answer
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { questionId, optionIndex, userId } = body as {
    questionId: string;
    optionIndex: number;
    userId: string;
  };

  const q = questions.get(questionId);
  if (!q) return NextResponse.json({ error: "Question not found" }, { status: 404 });
  if (Date.now() > q.expiresAt) return NextResponse.json({ error: "Question expired" }, { status: 409 });
  if (q.answered.has(userId)) return NextResponse.json({ error: "Already answered" }, { status: 409 });

  q.answered.set(userId, optionIndex);
  const correct = optionIndex === q.correctIndex;

  return NextResponse.json({
    correct,
    correctIndex: q.correctIndex,
    xpAwarded: correct ? q.xp : 0,
    message: correct ? `Correct! +${q.xp} XP` : "Wrong answer",
  });
}
