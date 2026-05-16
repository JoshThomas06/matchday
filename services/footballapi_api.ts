const BASE = "https://api-football-v1.p.rapidapi.com/v3";
const KEY = process.env.FOOTBALL_API_KEY ?? "";

const headers = {
    "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
    "x-rapidapi-key": KEY,
};

export async function getLiveFootballMatches() {
    const res = await fetch(`${BASE}/fixtures?live=all`, { headers });
    const data = await res.json();
    return data.response ?? [];
}

export async function getFixtureById(id: string) {
    const res = await fetch(`${BASE}/fixtures?id=${id}`, { headers });
    const data = await res.json();
    return data.response?.[0] ?? null;
}

export async function getEPLMatches(season: string = "2024") {
    const res = await fetch(
        `${BASE}/fixtures?league=39&season=${season}&status=NS-1H-HT-2H-FT`,
        { headers }
    );
    const data = await res.json();
    return data.response ?? [];
}

export async function getMatchStats(fixtureId: string) {
    const res = await fetch(`${BASE}/fixtures/statistics?fixture=${fixtureId}`, { headers });
    const data = await res.json();
    return data.response ?? [];
}

export async function getPastEPLResults(season: string = "2024") {
    const res = await fetch(
        `${BASE}/fixtures?league=39&season=${season}&status=FT&last=20`,
        { headers }
    );
    const data = await res.json();
    return data.response ?? [];
}