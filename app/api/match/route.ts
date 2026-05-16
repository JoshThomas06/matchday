import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

const CRICAPI_KEY = process.env.CRICAPI_KEY ?? "";
const FOOTBALL_KEY = process.env.FOOTBALL_API_KEY ?? "";

const FOOTBALL_HEADERS = {
  "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
  "x-rapidapi-key": FOOTBALL_KEY,
};

// ── Upstream fetchers (wrapped in TTL cache) ───────────────────────────────

async function fetchLiveCricket() {
  return cached("cricket:live", 60_000, async () => {
    const res = await fetch(
      "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live",
      {
        headers: {
          "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
          "x-rapidapi-key": FOOTBALL_KEY // Same RapidAPI key used
        },
        cache: "no-store"
      }
    );
    if (!res.ok) throw new Error(`Cricbuzz API ${res.status}`);
    const data = await res.json();
    const matches: any[] = [];
    if (data && data.typeMatches) {
      data.typeMatches.forEach((tm: any) => {
        if (tm.seriesMatches) {
          tm.seriesMatches.forEach((sm: any) => {
            if (sm.seriesAdWrapper && sm.seriesAdWrapper.matches) {
              sm.seriesAdWrapper.matches.forEach((m: any) => {
                 const minfo = m.matchInfo;
                 const mscore = m.matchScore;
                 matches.push({
                   id: String(minfo.matchId),
                   name: minfo.team1.teamName + ' vs ' + minfo.team2.teamName + ', ' + minfo.matchDesc,
                   status: minfo.status,
                   teams: [minfo.team1.teamName, minfo.team2.teamName],
                   venue: (minfo.venueInfo?.ground || '') + ', ' + (minfo.venueInfo?.city || ''),
                   matchStarted: minfo.state !== 'Preview',
                   matchEnded: minfo.state === 'Complete',
                   score: mscore ? [
                     { r: mscore.team1Score?.inngs1?.runs || 0, w: mscore.team1Score?.inngs1?.wickets || 0, o: mscore.team1Score?.inngs1?.overs || 0, inning: '1' },
                     { r: mscore.team2Score?.inngs1?.runs || 0, w: mscore.team2Score?.inngs1?.wickets || 0, o: mscore.team2Score?.inngs1?.overs || 0, inning: '2' }
                   ].filter(s => s.r > 0 || s.o > 0) : []
                 });
              });
            }
          });
        }
      });
    }

    if (matches.length > 0) {
      matches.sort((a, b) => {
        const aIpl = a.name.toLowerCase().includes('ipl') || a.name.toLowerCase().includes('premier league') || a.name.toLowerCase().includes('super kings');
        const bIpl = b.name.toLowerCase().includes('ipl') || b.name.toLowerCase().includes('premier league') || b.name.toLowerCase().includes('super kings');
        if (aIpl && !bIpl) return -1;
        if (!aIpl && bIpl) return 1;
        return 0;
      });
    }
    return matches;
  });
}

async function fetchLiveFootball() {
  return cached("football:live", 60_000, async () => {
    const res = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
      { headers: FOOTBALL_HEADERS, cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Football API ${res.status}`);
    const data = await res.json();
    return data.response ?? [];
  });
}

async function fetchRecentFootball() {
  return cached("football:recent", 300_000, async () => {
    // EPL 2024 season last 15 completed fixtures — cache 5 minutes (data doesn't change)
    const res = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?league=39&season=2024&last=15",
      { headers: FOOTBALL_HEADERS, cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Football API ${res.status}`);
    const data = await res.json();
    return data.response ?? [];
  });
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function GET() {
  const [cricketResult, liveFbResult, recentFbResult] = await Promise.allSettled([
    fetchLiveCricket(),
    fetchLiveFootball(),
    fetchRecentFootball(),
  ]);

  const cricketData = cricketResult.status === "fulfilled" ? cricketResult.value : [];
  const footballLive = liveFbResult.status === "fulfilled" ? liveFbResult.value : [];
  const footballRecent = recentFbResult.status === "fulfilled" ? recentFbResult.value : [];

  // Merge live + recent, deduplicate by fixture id
  const liveIds = new Set(footballLive.map((f: { fixture: { id: number } }) => f.fixture.id));
  const mergedFootball = [
    ...footballLive,
    ...footballRecent.filter((f: { fixture: { id: number } }) => !liveIds.has(f.fixture.id)),
  ];

  const errors: string[] = [];
  if (cricketResult.status === "rejected") errors.push("cricket");
  if (liveFbResult.status === "rejected") errors.push("football:live");
  if (recentFbResult.status === "rejected") errors.push("football:recent");

  return NextResponse.json(
    { cricket: cricketData, football: mergedFootball, lastUpdated: Date.now(), errors },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    }
  );
}