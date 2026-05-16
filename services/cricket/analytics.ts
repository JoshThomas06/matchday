import { NormalizedCricMatch } from "@/lib/normalizers/cricket";

export interface CricketAnalytics {
  momentumScore: number; // 0 to 100 (50 is neutral)
  runAcceleration: number; // Current run rate vs overall run rate (positive is accelerating)
  phaseDominance: "Batting" | "Bowling" | "Neutral";
  projectedScore: number;
}

export function calculateCricketAnalytics(match: NormalizedCricMatch): CricketAnalytics {
  if (!match.scores || match.scores.length === 0) {
    return {
      momentumScore: 50,
      runAcceleration: 0,
      phaseDominance: "Neutral",
      projectedScore: 0,
    };
  }

  const currentInnings = match.scores[0];
  const runs = currentInnings.runs || 0;
  const wickets = currentInnings.wickets || 0;
  const overs = currentInnings.overs || 0;

  // Derive Run Rate
  const currentRR = overs > 0 ? runs / overs : 0;
  
  // A completely basic projection based on current RR (assuming T20 for simplicity, scale to 20 overs)
  const isT20 = match.name.toLowerCase().includes("t20") || match.name.toLowerCase().includes("ipl");
  const maxOvers = isT20 ? 20 : 50; 
  const projectedScore = Math.floor(currentRR * maxOvers);

  // Derive Momentum based on wickets lost and current run rate
  // Wickets drastically drop momentum, high run rate pushes it up
  let momentumScore = 50 + (currentRR * 2) - (wickets * 5);
  
  // Clamp momentum between 0 and 100
  momentumScore = Math.max(0, Math.min(100, momentumScore));

  // Determine Phase Dominance
  let phaseDominance: "Batting" | "Bowling" | "Neutral" = "Neutral";
  if (momentumScore > 65) {
    phaseDominance = "Batting";
  } else if (momentumScore < 35) {
    phaseDominance = "Bowling";
  }

  // Derive run acceleration (simplified: compare current RR to a baseline par RR)
  const parRR = isT20 ? 8.0 : 5.0;
  const runAcceleration = parseFloat((currentRR - parRR).toFixed(2));

  return {
    momentumScore: Math.round(momentumScore),
    runAcceleration,
    phaseDominance,
    projectedScore,
  };
}
