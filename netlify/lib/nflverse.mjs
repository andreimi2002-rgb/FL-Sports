import { parseCsv } from './csv.mjs';
import { NFL_PLAYER_IDS } from './nfl-player-ids.mjs';

const STATS_URL = 'https://github.com/nflverse/nflverse-data/releases/download/stats_player';
const FIELDS = ['player_id', 'recent_team', 'attempts', 'sacks_suffered', 'passing_epa', 'passing_cpoe', 'pacr',
  'carries', 'rushing_epa', 'targets', 'receiving_epa', 'racr', 'target_share', 'air_yards_share', 'wopr'];
const statsCache = new Map();

export function parseNflSeasonStats(csv) {
  const [headers, ...records] = parseCsv(csv);
  if (!headers) throw new Error('CSV nflverse fără antet.');
  const indexes = Object.fromEntries(FIELDS.map(name => [name, headers.indexOf(name)]));
  if (Object.values(indexes).some(i => i < 0)) throw new Error('Schema nflverse player stats schimbată.');
  const stats = new Map();
  for (const cells of records) {
    const id = cells[indexes.player_id];
    if (!id) continue;
    stats.set(id, Object.fromEntries(FIELDS.slice(1).map(name => [name, cells[indexes[name]] ?? ''])));
  }
  return stats;
}

async function seasonStats(season) {
  if (!Number.isInteger(season) || season < 1999 || season > 2100) throw new Error('Sezon NFL invalid pentru nflverse.');
  const cached = statsCache.get(season);
  if (cached && Date.now() - cached.at < 300000) return cached.promise;
  const entry = {
    at: Date.now(),
    promise: (async () => {
      const response = await fetch(`${STATS_URL}/stats_player_reg_${season}.csv`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`nflverse stats: HTTP ${response.status}`);
      return parseNflSeasonStats(await response.text());
    })()
  };
  statsCache.set(season, entry);
  try { return await entry.promise; }
  catch (error) {
    if (statsCache.get(season) === entry) statsCache.delete(season);
    throw error;
  }
}

const number = (row, key) => {
  const n = Number(row[key]);
  return row[key] === '' || !Number.isFinite(n) ? null : n;
};

function metricsFor(row, position) {
  const metrics = [], add = (label, value, unit = '') => {
    if (value !== null && Number.isFinite(value)) metrics.push({ label, value, unit });
  };
  const attempts = number(row, 'attempts'), sacks = number(row, 'sacks_suffered');
  const carries = number(row, 'carries'), targets = number(row, 'targets');
  if (position === 'QB') {
    const dropbacks = (attempts || 0) + (sacks || 0);
    const epa = number(row, 'passing_epa');
    if (dropbacks > 0) {
      add('Passing EPA', epa, 'puncte');
      if (epa !== null) add('EPA / dropback', epa / dropbacks);
      add('CPOE', number(row, 'passing_cpoe'), 'pp');
    }
    if (carries > 0) {
      const rushingEpa = number(row, 'rushing_epa');
      add('Rushing EPA', rushingEpa, 'puncte');
      if (rushingEpa !== null) add('EPA / alergare', rushingEpa / carries);
    }
  } else if (['RB', 'FB'].includes(position)) {
    if (carries > 0) {
      const epa = number(row, 'rushing_epa');
      add('Rushing EPA', epa, 'puncte');
      if (epa !== null) add('EPA / alergare', epa / carries);
    }
    if (targets > 0) {
      const epa = number(row, 'receiving_epa');
      add('Receiving EPA', epa, 'puncte');
      if (epa !== null) add('EPA / țintă', epa / targets);
      add('RACR', number(row, 'racr'));
    }
  } else if (['WR', 'TE'].includes(position) && targets > 0) {
    const epa = number(row, 'receiving_epa');
    add('Receiving EPA', epa, 'puncte');
    if (epa !== null) add('EPA / țintă', epa / targets);
    add('Ținte din echipă', number(row, 'target_share'), '%');
    add('Pondere air yards', number(row, 'air_yards_share'), '%');
    add('WOPR', number(row, 'wopr'));
    add('RACR', number(row, 'racr'));
  }
  return metrics;
}

export async function nflversePlayerMetrics(espnId, season, position) {
  const gsisId = NFL_PLAYER_IDS.get(String(espnId));
  if (!gsisId) return { status: 'mapping-missing' };
  const row = (await seasonStats(season)).get(gsisId);
  if (!row) return { status: 'stats-missing' };
  const metrics = metricsFor(row, position);
  if (!metrics.length) return { status: 'unsupported' };
  return { status: 'available', advanced: { season, team: row.recent_team, metrics } };
}
