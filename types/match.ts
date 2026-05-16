export type Sport = "cricket" | "football";

export type MatchPhase =
  | "PRE_MATCH"
  | "FIRST_INNINGS"
  | "INNINGS_BREAK"
  | "SECOND_INNINGS"
  | "FIRST_HALF"
  | "HALFTIME"
  | "SECOND_HALF"
  | "FULL_TIME";

export interface Player {
  name: string;
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  overs?: number;
  wickets?: number;
  economy?: number;
}

export interface WatchLink {
  name: string;
  url: string;
  region: string;
  isLive: boolean;
}

export interface MatchState {
  id: string;
  sport: Sport;
  team1: string;
  team2: string;
  team1Short: string;
  team2Short: string;
  team1Color: string;
  team2Color: string;
  venue: string;
  status: "LIVE" | "UPCOMING" | "ENDED";
  phase: MatchPhase;
  score: string;
  overs?: string;
  target?: number;
  rrr?: number;
  currentRR?: number;
  batter1?: Player;
  batter2?: Player;
  bowler?: Player;
  lastBalls?: string[];
  fanPulse: { team1: number; team2: number };
  watchLinks: WatchLink[];
  lastUpdated: number;
}