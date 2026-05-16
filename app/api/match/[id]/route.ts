import { NextResponse } from "next/server";
import { getMatchById, getMatchScorecard } from "@/services/cricapi";
import { getFixtureById, getMatchStats } from "@/services/footballapi_api";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") ?? "cricket";

  try {
    if (sport === "cricket") {
      const [info, scorecard] = await Promise.all([
        getMatchById(id),
        getMatchScorecard(id),
      ]);
      return NextResponse.json({ info, scorecard, sport });
    } else {
      const [fixture, stats] = await Promise.all([
        getFixtureById(id),
        getMatchStats(id),
      ]);
      return NextResponse.json({ fixture, stats, sport });
    }
  } catch {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
}