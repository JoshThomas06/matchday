export interface RawCricbuzzMatch {
  id: string;
  name: string;
  status: string;
  teams: string[];
  score: { r: number; w: number; o: number; inning: string }[];
  venue: string;
  matchStarted: boolean;
  matchEnded: boolean;
}

export interface NormalizedCricMatch {
  id: string;
  name: string;
  status: string;
  matchState: "LIVE" | "UPCOMING" | "COMPLETED" | "ABANDONED" | "DELAYED";
  teams: string[];
  homeTeam: string;
  awayTeam: string;
  venue: string;
  scores: {
    runs: number;
    wickets: number;
    overs: number;
    inning: string;
  }[];
  isLive: boolean;
}

export function normalizeCricketMatch(raw: RawCricbuzzMatch): NormalizedCricMatch {
  let matchState: NormalizedCricMatch["matchState"] = "UPCOMING";
  
  const statusLower = (raw.status || "").toLowerCase();
  
  if (raw.matchEnded || statusLower.includes("won") || statusLower.includes("completed")) {
    matchState = "COMPLETED";
  } else if (statusLower.includes("abandon") || statusLower.includes("no result")) {
    matchState = "ABANDONED";
  } else if (statusLower.includes("delay") || statusLower.includes("rain")) {
    matchState = "DELAYED";
  } else if (raw.matchStarted) {
    matchState = "LIVE";
  }

  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    matchState,
    teams: raw.teams || [],
    homeTeam: raw.teams?.[0] || "Home",
    awayTeam: raw.teams?.[1] || "Away",
    venue: raw.venue || "Unknown Venue",
    scores: (raw.score || []).map(s => ({
      runs: s.r || 0,
      wickets: s.w || 0,
      overs: s.o || 0,
      inning: s.inning || "1"
    })),
    isLive: matchState === "LIVE" || matchState === "DELAYED",
  };
}
