/**
 * Cricket API service — SERVER ONLY.
 * All functions must be called exclusively from Next.js API routes (app/api/**).
 * Never import this file from client components.
 */

const BASE = "https://api.cricapi.com/v1";

function getKey(): string {
  const key = process.env.CRICAPI_KEY;
  if (!key) throw new Error("CRICAPI_KEY env var is not set");
  return key;
}

export async function getAllLiveMatches() {
  const res = await fetch(`${BASE}/currentMatches?apikey=${getKey()}&offset=0`);
  if (!res.ok) throw new Error(`CricAPI error: ${res.status}`);
  const data = await res.json();
  return data.data ?? [];
}

export async function getMatchById(id: string) {
  const res = await fetch(`${BASE}/match_info?apikey=${getKey()}&id=${id}`);
  if (!res.ok) throw new Error(`CricAPI error: ${res.status}`);
  const data = await res.json();
  return data.data ?? null;
}

export async function getMatchScorecard(id: string) {
  const res = await fetch(`${BASE}/match_scorecard?apikey=${getKey()}&id=${id}`);
  if (!res.ok) throw new Error(`CricAPI error: ${res.status}`);
  const data = await res.json();
  return data.data ?? null;
}

export async function getPastMatches(offset = 0) {
  const res = await fetch(`${BASE}/matches?apikey=${getKey()}&offset=${offset}`);
  if (!res.ok) throw new Error(`CricAPI error: ${res.status}`);
  const data = await res.json();
  return data.data ?? [];
}

export async function getSeriesMatches(seriesId: string) {
  const res = await fetch(`${BASE}/series_info?apikey=${getKey()}&id=${seriesId}`);
  if (!res.ok) throw new Error(`CricAPI error: ${res.status}`);
  const data = await res.json();
  return data.data ?? null;
}