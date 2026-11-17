import { json } from '../lib/espn.mjs';
import { nflversePlayerMetrics } from '../lib/nflverse.mjs';

const SPORTS = {
  NBA: 'basketball/nba',
  NHL: 'hockey/nhl',
  NFL: 'football/nfl'
};

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function playerTable(table) {
  return table ? {
    names: table.names || [],
    labels: table.labels || [],
    displayNames: table.displayNames || [],
    categories: table.categories || [],
    rows: (table.splits || []).map(row => ({
      label: row.displayName === 'Career' ? 'Carieră' : row.displayName === 'Regular Season' ? 'Sezon regulat' : row.displayName,
      stats: row.stats || []
    }))
  } : null;
}

function nflSeasons(stats) {
  return (stats.categories || []).map(category => ({
    key: category.name || '',
    name: category.displayName || category.name || '',
    names: category.names || [],
    labels: category.labels || [],
    displayNames: category.displayNames || [],
    totals: category.totals || [],
    rows: (category.statistics || []).map(row => ({
      label: row.season?.displayName || '',
      team: stats.teams?.[row.teamSlug]?.abbreviation || '',
      stats: row.stats || []
    }))
  })).filter(category => category.rows.length);
}

function nhlSeasons(stats) {
  return (stats.categories || []).map(category => ({
    key: category.name || '',
    name: category.displayName || category.name || '',
    names: category.names || [],
    rows: (category.statistics || []).map(row => ({
      label: row.season?.displayName || '',
      team: stats.teams?.[row.teamSlug]?.abbreviation || '',
      stats: row.stats || []
    }))
  })).filter(category => category.rows.length);
}

function recentGames(overview) {
  const groups = Array.isArray(overview.gameLog)
    ? overview.gameLog
    : overview.gameLog?.statistics || [];
  const events = Array.isArray(overview.gameLog) ? {} : overview.gameLog?.events || {};
  const group = groups[0];
  if (!group) return null;
  return {
    names: group.names || [],
    rows: (group.events || []).slice(0, 5).map(row => {
      const event = events[row.eventId];
      return {
        id: row.eventId,
        date: event?.gameDate || '',
        opponent: event?.opponent?.displayName || '',
        stats: row.stats || []
      };
    })
  };
}

function nhlEfficiency(stats, position) {
  if (position === 'G') return null;
  const category = (stats.categories || []).find(item => item.names?.includes('shootingPct'));
  if (!category) return null;
  const rows = (category.statistics || []).slice().sort((a, b) => (b.season?.year || 0) - (a.season?.year || 0));
  const current = rows[0];
  if (!current) return null;
  const metric = (name, label) => {
    const index = category.names.indexOf(name);
    const raw = Number(current.stats?.[index]);
    if (index < 0 || !Number.isFinite(raw)) return null;
    return { label, value: raw > 1 ? raw / 100 : raw, unit: '%' };
  };
  const metrics = [metric('shootingPct', 'Procentaj la șuturi')];
  if (position === 'C') metrics.push(metric('faceoffPercent', 'Angajamente câștigate'));
  const available = metrics.filter(Boolean);
  return available.length ? {
    season: current.season?.displayName || String(current.season?.year || ''),
    metrics: available
  } : null;
}

export default async function player(req) {
  if (req.method !== 'GET') return new Response(null, { status: 405 });
  const params = new URL(req.url).searchParams;
  const id = params.get('id');
  const league = (params.get('league') || 'NBA').toUpperCase();
  const sport = SPORTS[league];
  if (!sport) return json({ error: 'Ligă invalidă' }, { status: 400, browser: 0, cdn: 0 });
  if (!/^\d{1,12}$/.test(id || '')) return json({ error: 'ID invalid' }, { status: 400, browser: 0, cdn: 0 });

  const base = `https://site.web.api.espn.com/apis/common/v3/sports/${sport}/athletes/${id}`;
  const [bio, overview, stats] = await Promise.allSettled([
    get(base),
    get(`${base}/overview`),
    get(`${base}/stats`)
  ]);
  if (bio.status !== 'fulfilled' || !bio.value.athlete?.displayName) {
    return json({ error: 'Profil indisponibil' }, { status: 502, browser: 0, cdn: 30 });
  }

  const athlete = bio.value.athlete;
  const profile = overview.status === 'fulfilled' ? overview.value : {};
  const seasonStats = stats.status === 'fulfilled' ? stats.value : {};
  const feet = /^(\d+)'\s*(\d+)/.exec(athlete.displayHeight || '');
  const height = typeof athlete.height === 'number'
    ? Math.round(athlete.height * 2.54)
    : feet ? Math.round((+feet[1] * 12 + +feet[2]) * 2.54) : null;
  const pounds = /([\d.]+)\s*lbs/i.exec(athlete.displayWeight || '');
  const weight = typeof athlete.weight === 'number'
    ? Math.round(athlete.weight * 0.453592)
    : pounds ? Math.round(+pounds[1] * 0.453592) : null;
  const seasonNames = (seasonStats.categories || [])
    .flatMap(category => (category.statistics || []).map(row => Number(row.season?.year)))
    .filter(Number.isInteger);
  const seasonFromTitle = Number(/\b(20\d{2})\b/.exec(profile.statistics?.displayName || '')?.[1]);
  const season = league === 'NHL'
    ? Math.max(0, ...seasonNames, seasonFromTitle)
    : seasonFromTitle || Math.max(0, ...seasonNames) || new Date().getFullYear();

  let seasons = null;
  let recent = null;
  let advanced = null;
  let advancedStatus = 'not-applicable';
  if (league === 'NFL') {
    seasons = nflSeasons(seasonStats);
    recent = (profile.gameLog?.statistics || []).map(group => ({
      key: group.name || '',
      name: group.displayName || '',
      names: group.names || [],
      labels: group.labels || [],
      displayNames: group.displayNames || [],
      rows: (group.events || []).slice(0, 5).map(row => {
        const event = profile.gameLog.events?.[row.eventId];
        return {
          id: row.eventId,
          date: event?.gameDate,
          opponent: event?.opponent?.displayName || '',
          stats: row.stats || []
        };
      })
    })).filter(group => group.rows.length);
    try {
      const result = await nflversePlayerMetrics(id, season, athlete.position?.abbreviation || '');
      advanced = result.advanced || null;
      advancedStatus = result.status;
    } catch (error) {
      console.warn('nflverse player stats unavailable:', error.message);
      advancedStatus = 'unavailable';
    }
  } else if (league === 'NHL') {
    seasons = nhlSeasons(seasonStats);
    recent = recentGames(profile);
    advanced = nhlEfficiency(seasonStats, athlete.position?.abbreviation || '');
  } else {
    const career = seasonStats.categories?.find(category => category.name === 'averages');
    seasons = career ? {
      names: career.names || [],
      rows: (career.statistics || []).map(row => ({
        label: row.season?.displayName || '',
        team: row.teamSlug || '',
        stats: row.stats || []
      }))
    } : null;
    const group = profile.gameLog?.statistics?.[0];
    recent = group ? {
      names: group.names || [],
      rows: (group.events || []).slice(0, 10).map(row => {
        const event = profile.gameLog.events?.[row.eventId];
        return {
          id: row.eventId,
          date: event?.gameDate,
          opponent: event?.opponent?.displayName || '',
          stats: row.stats || []
        };
      })
    } : null;
  }

  return json({
    id,
    league,
    name: athlete.displayName,
    position: athlete.position?.abbreviation || '',
    age: athlete.age,
    height,
    weight,
    team: athlete.team?.displayName || '',
    head: athlete.headshot?.href || '',
    summary: playerTable(profile.statistics),
    seasons,
    recent,
    advanced,
    advancedStatus,
    partial: overview.status !== 'fulfilled' || stats.status !== 'fulfilled' || advancedStatus === 'unavailable'
  }, { browser: 300, cdn: 3600 });
}

export const config = { path: '/api/player' };
