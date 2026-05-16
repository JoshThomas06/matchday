import { NextResponse } from "next/server";
import { getPastMatches } from "@/services/cricapi";
import { getPastEPLResults } from "@/services/footballapi_api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") ?? "cricket";
  const offset = parseInt(searchParams.get("offset") ?? "0");

  try {
    if (sport === "cricket") {
      const matches = await getPastMatches(offset);
      return NextResponse.json({ matches, sport });
    } else {
      const matches = await getPastEPLResults();
      return NextResponse.json({ matches, sport });
    }
  } catch {
    return NextResponse.json({ matches: [], sport });
  }
}