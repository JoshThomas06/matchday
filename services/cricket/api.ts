import { useQuery } from "@tanstack/react-query";
import { normalizeCricketMatch, NormalizedCricMatch, RawCricbuzzMatch } from "@/lib/normalizers/cricket";

export function useCricketMatches() {
  return useQuery({
    queryKey: ["cricket", "matches"],
    queryFn: async (): Promise<NormalizedCricMatch[]> => {
      const res = await fetch("/api/match");
      if (!res.ok) throw new Error("Failed to fetch cricket matches");
      const data = await res.json();
      const rawMatches: RawCricbuzzMatch[] = data.cricket || [];
      return rawMatches.map(normalizeCricketMatch);
    },
    refetchInterval: 30000,
  });
}
