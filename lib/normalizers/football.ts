export interface FbFixture {
  fixture: {
    id: number;
    status: { long: string; short: string; elapsed: number | null };
    venue: { name: string };
  };
  teams: {
    home: { name: string; logo?: string; id?: number };
    away: { name: string; logo?: string; id?: number };
  };
  goals: { home: number | null; away: number | null };
  league: { name: string; round: string };
  score: { halftime: { home: number | null; away: number | null } };
}

export interface NormalizedFbMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  statusShort: string;
  statusLong: string;
  elapsed: number | null;
  venue: string;
  league: string;
  isLive: boolean;
  isFinished: boolean;
}

export function normalizeFootballMatch(raw: FbFixture): NormalizedFbMatch {
  const liveStatuses = ["1H", "2H", "HT", "ET", "P", "BT", "LIVE"];
  const finishedStatuses = ["FT", "AET", "PEN"];
  
  const statusShort = raw.fixture?.status?.short || "NS";
  
  return {
    id: String(raw.fixture?.id || ""),
    homeTeam: raw.teams?.home?.name || "Home",
    awayTeam: raw.teams?.away?.name || "Away",
    homeGoals: raw.goals?.home ?? 0,
    awayGoals: raw.goals?.away ?? 0,
    statusShort,
    statusLong: raw.fixture?.status?.long || "Not Started",
    elapsed: raw.fixture?.status?.elapsed || null,
    venue: raw.fixture?.venue?.name || "Unknown Venue",
    league: raw.league?.name || "Unknown League",
    isLive: liveStatuses.includes(statusShort),
    isFinished: finishedStatuses.includes(statusShort),
  };
}

export interface StatItem {
  type: string;
  value: string | number | null;
}

export interface TeamStats {
  team: { id: number; name: string };
  statistics: StatItem[];
}

export function normalizeTeamStats(rawStats: any[]): TeamStats[] {
  // If no stats available yet, just return empty
  if (!rawStats || rawStats.length === 0) return [];

  return rawStats.map(teamStat => ({
    team: {
      id: teamStat.team?.id ?? 0,
      name: teamStat.team?.name ?? "Unknown",
    },
    statistics: (teamStat.statistics ?? []).map((s: any) => ({
      type: s.type,
      value: s.value !== null ? String(s.value) : "0",
    }))
  }));
}
