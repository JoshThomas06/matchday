import { useState, useEffect, useCallback } from "react";

export interface LiveMatchSummary {
  id: string;
  name: string;
  status: string;
  sport: "cricket" | "football";
  teams: string[];
  score?: string;
  venue?: string;
  isLive: boolean;
}

export function useMatches() {
  const [liveMatches, setLiveMatches] = useState<LiveMatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/match");
      const data = await res.json();

      const cricketMatches: LiveMatchSummary[] = (data.cricket ?? []).map(
        (m: any) => ({
          id: m.id,
          name: m.name,
          status: m.status,
          sport: "cricket",
          teams: m.teams ?? [],
          score: m.score?.[0]?.r
            ? `${m.score[0].r}/${m.score[0].w} (${m.score[0].o} ov)`
            : undefined,
          venue: m.venue,
          isLive: m.matchStarted && !m.matchEnded,
        })
      );

      const footballMatches: LiveMatchSummary[] = (data.football ?? []).map(
        (m: any) => ({
          id: String(m.fixture?.id),
          name: `${m.teams?.home?.name} vs ${m.teams?.away?.name}`,
          status: m.fixture?.status?.long ?? "",
          sport: "football",
          teams: [m.teams?.home?.name, m.teams?.away?.name],
          score: `${m.goals?.home ?? 0} - ${m.goals?.away ?? 0}`,
          venue: m.fixture?.venue?.name,
          isLive: m.fixture?.status?.short === "1H" ||
                  m.fixture?.status?.short === "2H" ||
                  m.fixture?.status?.short === "HT",
        })
      );

      setLiveMatches([...cricketMatches, ...footballMatches]);
      setLastUpdated(data.lastUpdated);
      setError(null);
    } catch (err) {
      setError("Could not fetch live matches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  return { liveMatches, loading, error, lastUpdated, refresh: fetchMatches };
}