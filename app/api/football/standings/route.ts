import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

const FOOTBALL_KEY = process.env.FOOTBALL_API_KEY ?? "";
const HEADERS = {
  "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
  "x-rapidapi-key": FOOTBALL_KEY,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const league = searchParams.get("league") ?? "39";    // 39 = EPL
  const season = searchParams.get("season") ?? "2024";

  try {
    const data = await cached(`football:standings:${league}:${season}`, 600_000, async () => {
      const res = await fetch(
        `https://api-football-v1.p.rapidapi.com/v3/standings?league=${league}&season=${season}`,
        { headers: HEADERS, cache: "no-store" }
      );
      if (!res.ok) throw new Error(`API-Football ${res.status}`);
      const json = await res.json();
      return json.response?.[0]?.league?.standings?.[0] ?? [];
    });

    return NextResponse.json({ standings: data, league, season });
  } catch (err) {
    return NextResponse.json({ standings: [], error: "Failed to fetch standings" }, { status: 500 });
  }
}
