import { NextResponse } from "next/server";

const CRICAPI_KEY = "607cf48a-9e0c-4696-b2c0-72b90a4e651d";
const FOOTBALL_KEY = "a994913237mshd4ecaeb4350d4b2p17ee6djsn86fa6f63a94a";

async function getLiveCricket() {
  const res = await fetch(
    `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`,
    { next: { revalidate: 30 } }
  );
  const data = await res.json();
  return data.data ?? [];
}

async function getLiveFootball() {
  const res = await fetch(
    "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
    {
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        "x-rapidapi-key": FOOTBALL_KEY,
      },
      next: { revalidate: 30 },
    }
  );
  const data = await res.json();
  return data.response ?? [];
}

async function getRecentFootball() {
  const res = await fetch(
    "https://api-football-v1.p.rapidapi.com/v3/fixtures?league=39&season=2024&last=10",
    {
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        "x-rapidapi-key": FOOTBALL_KEY,
      },
      next: { revalidate: 60 },
    }
  );
  const data = await res.json();
  return data.response ?? [];
}

export async function GET() {
  try {
    const [cricket, liveFootball, recentFootball] = await Promise.allSettled([
      getLiveCricket(),
      getLiveFootball(),
      getRecentFootball(),
    ]);

    const cricketData = cricket.status === "fulfilled" ? cricket.value : [];
    const footballLive = liveFootball.status === "fulfilled" ? liveFootball.value : [];
    const footballRecent = recentFootball.status === "fulfilled" ? recentFootball.value : [];

    // Merge live + recent, deduplicate by fixture id
    const footballIds = new Set(footballLive.map((f: any) => f.fixture.id));
    const mergedFootball = [
      ...footballLive,
      ...footballRecent.filter((f: any) => !footballIds.has(f.fixture.id)),
    ];

    return NextResponse.json({
      cricket: cricketData,
      football: mergedFootball,
      lastUpdated: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { cricket: [], football: [], error: "Data fetch failed", lastUpdated: Date.now() },
      { status: 200 } // return 200 so frontend doesn't crash
    );
  }
}