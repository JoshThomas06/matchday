import { NextRequest, NextResponse } from "next/server";
import { cached } from "@/lib/cache";

const CRICAPI_KEY = process.env.CRICAPI_KEY ?? "";
const FOOTBALL_KEY = process.env.FOOTBALL_API_KEY ?? "";

const FOOTBALL_HEADERS = {
  "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
  "x-rapidapi-key": FOOTBALL_KEY,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sport = req.nextUrl.searchParams.get("sport") ?? "cricket";

  try {
    if (sport === "cricket") {
      const data = await cached(`cricket:match:${id}`, 60_000, async () => {
        // Try match_info first, then scorecard for richer data
        const [infoRes, scorecardRes] = await Promise.allSettled([
          fetch(`https://api.cricapi.com/v1/match_info?apikey=${CRICAPI_KEY}&id=${id}`, { cache: "no-store" }),
          fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${CRICAPI_KEY}&id=${id}`, { cache: "no-store" }),
        ]);

        const info = infoRes.status === "fulfilled" && infoRes.value.ok
          ? await infoRes.value.json()
          : { data: null };
        const scorecard = scorecardRes.status === "fulfilled" && scorecardRes.value.ok
          ? await scorecardRes.value.json()
          : { data: null };

        return {
          match: info.data ?? null,
          scorecard: scorecard.data ?? null,
        };
      });

      return NextResponse.json({ sport: "cricket", id, ...data });
    } else {
      // Football
      const data = await cached(`football:fixture:${id}`, 60_000, async () => {
        const [fixtureRes, statsRes] = await Promise.allSettled([
          fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?id=${id}`, { headers: FOOTBALL_HEADERS, cache: "no-store" }),
          fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics?fixture=${id}`, { headers: FOOTBALL_HEADERS, cache: "no-store" }),
        ]);

        const fixture = fixtureRes.status === "fulfilled" && fixtureRes.value.ok
          ? (await fixtureRes.value.json()).response?.[0] ?? null
          : null;
        const stats = statsRes.status === "fulfilled" && statsRes.value.ok
          ? (await statsRes.value.json()).response ?? []
          : [];

        return { fixture, stats };
      });

      return NextResponse.json({ sport: "football", id, ...data });
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch match detail", sport, id },
      { status: 500 }
    );
  }
}