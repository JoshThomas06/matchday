const BASE = "https://api.cricapi.com/v1";
const KEY = process.env.NEXT_PUBLIC_CRICAPI_KEY ?? "";

export async function getAllLiveMatches() {
  const res = await fetch(`${BASE}/currentMatches?apikey=${KEY}&offset=0`);
  const data = await res.json();
  return data.data ?? [];
}

export async function getMatchById(id: string) {
  const res = await fetch(`${BASE}/match_info?apikey=${KEY}&id=${id}`);
  const data = await res.json();
  return data.data ?? null;
}

export async function getMatchScorecard(id: string) {
  const res = await fetch(`${BASE}/match_scorecard?apikey=${KEY}&id=${id}`);
  const data = await res.json();
  return data.data ?? null;
}

export async function getPastMatches(offset: number = 0) {
  const res = await fetch(`${BASE}/matches?apikey=${KEY}&offset=${offset}`);
  const data = await res.json();
  return data.data ?? [];
}

export async function getSeriesMatches(seriesId: string) {
  const res = await fetch(`${BASE}/series_info?apikey=${KEY}&id=${seriesId}`);
  const data = await res.json();
  return data.data ?? null;
}