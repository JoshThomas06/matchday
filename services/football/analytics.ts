import { TeamStats, StatItem } from "@/lib/normalizers/football";

export interface FootballAnalytics {
  xG: number;
  attackPressure: number;
  passingEfficiency: number;
  eventMomentum: number;
}

export interface MatchAnalytics {
  home: FootballAnalytics;
  away: FootballAnalytics;
}

function getStatValue(stats: StatItem[], type: string): number {
  const stat = stats.find(s => s.type === type);
  if (!stat || !stat.value) return 0;
  // Handle percentage strings like "60%"
  if (typeof stat.value === "string" && stat.value.includes("%")) {
    return parseInt(stat.value.replace("%", ""));
  }
  return Number(stat.value) || 0;
}

function calculateTeamAnalytics(stats: StatItem[]): FootballAnalytics {
  const possession = getStatValue(stats, "Ball Possession") || 50;
  const totalShots = getStatValue(stats, "Total Shots");
  const shotsOnGoal = getStatValue(stats, "Shots on Goal");
  const passesTotal = getStatValue(stats, "Passes");
  const passesAccurate = getStatValue(stats, "Passes accurate");
  const dangerousAttacks = getStatValue(stats, "Dangerous Attacks");
  const corners = getStatValue(stats, "Corners");

  // 1. xG Estimate (Weighted heuristic: shots on goal have higher xG than off-target)
  // Standard approximation: SOG ~ 0.11 xG, Missed ~ 0.03 xG
  const missedShots = Math.max(0, totalShots - shotsOnGoal);
  let xG = (shotsOnGoal * 0.11) + (missedShots * 0.03);
  xG = Math.round(xG * 100) / 100;

  // 2. Attack Pressure (0-100 scale)
  // Derived from possession, dangerous attacks, and corners
  const attackPressure = Math.min(100, Math.round((possession * 0.4) + (dangerousAttacks * 0.5) + (corners * 2)));

  // 3. Passing Efficiency (%)
  const passingEfficiency = passesTotal > 0 ? Math.round((passesAccurate / passesTotal) * 100) : 0;

  // 4. Event Momentum (pulse -50 to +50 for a team, relative intensity)
  // Simplistic momentum calculation based on shots and possession intensity
  const eventMomentum = Math.min(100, Math.round((shotsOnGoal * 5) + (possession * 0.5)));

  return {
    xG,
    attackPressure,
    passingEfficiency,
    eventMomentum,
  };
}

export function calculateFootballAnalytics(teamStats: TeamStats[]): MatchAnalytics | null {
  if (!teamStats || teamStats.length < 2) return null;

  const homeStats = teamStats[0].statistics;
  const awayStats = teamStats[1].statistics;

  return {
    home: calculateTeamAnalytics(homeStats),
    away: calculateTeamAnalytics(awayStats),
  };
}
