import { MatchState } from "@/types/match";

export const lsgCskMock: MatchState = {
  id: "ipl2026-m59-lsg-csk",
  sport: "cricket",
  team1: "Lucknow Super Giants",
  team2: "Chennai Super Kings",
  team1Short: "LSG",
  team2Short: "CSK",
  team1Color: "#004B87",
  team2Color: "#FDB913",
  venue: "Ekana Cricket Stadium, Lucknow",
  status: "LIVE",
  phase: "SECOND_INNINGS",
  score: "52/3",
  overs: "8.0",
  target: 174,
  rrr: 4.72,
  currentRR: 6.50,
  batter1: { name: "Dewald Brevis", runs: 34, balls: 28, fours: 3, sixes: 2 },
  batter2: { name: "Shivam Dube", runs: 12, balls: 9, fours: 1, sixes: 0 },
  bowler: { name: "Akash Singh", overs: 4, wickets: 3, runs: 26, economy: 6.5 },
  lastBalls: ["1", "W", "4", "0", "6"],
  fanPulse: { team1: 54, team2: 71 },
  watchLinks: [
    { name: "JioHotstar", url: "https://www.jiohotstar.com", region: "India", isLive: true },
    { name: "JioTV", url: "https://www.jiotv.com", region: "Jio Users", isLive: true },
    { name: "Star Sports", url: "https://www.startv.com/starsports", region: "India TV", isLive: true }
  ],
  lastUpdated: Date.now()
};