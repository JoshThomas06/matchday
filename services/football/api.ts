import { useQuery } from "@tanstack/react-query";
import { normalizeFootballMatch, normalizeTeamStats, NormalizedFbMatch, TeamStats, FbFixture } from "@/lib/normalizers/football";

export function useFootballMatches() {
  return useQuery({
    queryKey: ["football", "matches"],
    queryFn: async (): Promise<NormalizedFbMatch[]> => {
      const res = await fetch("/api/match");
      if (!res.ok) throw new Error("Failed to fetch football matches");
      const data = await res.json();
      const rawMatches: FbFixture[] = data.football || [];
      return rawMatches.map(normalizeFootballMatch);
    },
    refetchInterval: 30000, // Poll every 30s
  });
}

export function useFootballStats(fixtureId: string | null) {
  return useQuery({
    queryKey: ["football", "stats", fixtureId],
    queryFn: async (): Promise<{ fixture: NormalizedFbMatch | null, stats: TeamStats[] }> => {
      if (!fixtureId) return { fixture: null, stats: [] };
      const res = await fetch(`/api/match/${fixtureId}?sport=football`);
      if (!res.ok) throw new Error("Failed to fetch match stats");
      const data = await res.json();
      const normalizedStats = normalizeTeamStats(data.stats || []);
      const normalizedFixture = data.fixture ? normalizeFootballMatch(data) : null; // `data` includes fixture under `fixture` key?
      return { fixture: normalizedFixture, stats: normalizedStats };
    },
    enabled: !!fixtureId, // Only fetch if we have an ID
    refetchInterval: 60000, // Poll every 60s
  });
}
