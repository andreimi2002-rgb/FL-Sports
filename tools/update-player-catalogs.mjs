import { writeFile } from 'node:fs/promises';

const leagues = {
  NFL: 'football/nfl',
  NHL: 'hockey/nhl'
};
const api = 'https://site.api.espn.com/apis/site/v2/sports/';

async function getJSON(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function mapLimit(values, limit, fn) {
  const result = new Array(values.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (next < values.length) {
      const i = next++;
      result[i] = await fn(values[i]);
    }
  }));
  return result;
}

async function catalogFor(league, path) {
  const response = await getJSON(`${api}${path}/teams?limit=1000`);
  const teams = (response.sports?.[0]?.leagues?.[0]?.teams || []).map(x => x.team).filter(t => t?.id && t.displayName);
  if (!teams.length) throw new Error(`ESPN returned no ${league} teams.`);
  const rosters = await mapLimit(teams, 6, team => getJSON(`${api}${path}/teams/${team.id}/roster`));
  const players = new Map();
  for (let i = 0; i < teams.length; i++) {
    const groups = rosters[i].athletes || [];
    const athletes = groups[0]?.items ? groups.flatMap(g => g.items || []) : groups;
    for (const athlete of athletes) {
      const id = String(athlete.id || '');
      const name = athlete.displayName || athlete.fullName || '';
      if (!/^\d+$/.test(id) || !name) continue;
      players.set(id, {
        id,
        name,
        team: teams[i].displayName,
        pos: athlete.position?.abbreviation || ''
      });
    }
  }
  return {
    updated: new Date().toISOString(),
    players: [...players.values()].sort((a, b) => a.name.localeCompare(b.name))
  };
}

const catalogs = await Promise.all(Object.entries(leagues).map(async ([league, path]) => [league, await catalogFor(league, path)]));
for (const [league, catalog] of catalogs) {
  const target = new URL(`../data/${league.toLowerCase()}-players.json`, import.meta.url);
  await writeFile(target, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`${league} player catalog: ${catalog.players.length} players.`);
}
