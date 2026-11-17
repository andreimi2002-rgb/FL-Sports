import assert from 'node:assert/strict';
import player from '../netlify/functions/player.mjs';
import { normalizeMlsTeamStats, normalizeSummary } from '../netlify/lib/espn.mjs';
import { playerHtml } from '../js/player.js';
import { rosterHtml, teamBasicStatsHtml } from '../js/teamx.js';
import { panelHtml } from '../js/game.js';

const realFetch = globalThis.fetch;
const year = new Date().getFullYear();
const overview = {
  statistics: {
    displayName: `${year} MLS`,
    names: ['starts', 'totalGoals', 'goalAssists', 'totalShots', 'yellowCards', 'redCards'],
    splits: [{ leagueSlug: 'usa.1', displayName: `${year} MLS`, stats: ['30', '12', '8', '62', '4', '0'] }]
  },
  gameLog: {
    statistics: [{
      names: ['totalGoals', 'goalAssists', 'totalShots', 'shotsOnTarget', 'yellowCards', 'redCards'],
      events: [{ eventId: '401', stats: ['1', '0', '3', '2', '0', '0'] }]
    }],
    events: { '401': { gameDate: `${year}-06-01T20:00:00Z`, opponent: { displayName: 'Orlando City SC' } } }
  }
};
const fieldStats = {
  splits: { categories: [
    { name: 'general', stats: [{ name: 'appearances', value: 30, displayValue: '30' }, { name: 'yellowCards', value: 4, displayValue: '4' }, { name: 'redCards', value: 0, displayValue: '0' }] },
    { name: 'offensive', stats: [
      { name: 'totalGoals', value: 12, displayValue: '12' },
      { name: 'goalAssists', value: 8, displayValue: '8' },
      { name: 'totalShots', value: 62, displayValue: '62' }
    ] }
  ] }
};
const goalieStats = {
  splits: { categories: [
    { name: 'general', stats: [{ name: 'appearances', value: 28, displayValue: '28' }] },
    { name: 'goalKeeping', stats: [
      { name: 'cleanSheet', value: 4, displayValue: '4' },
      { name: 'saves', value: 75, displayValue: '75' },
      { name: 'goalsConceded', value: 49, displayValue: '49' },
      { name: 'savePct', value: 0.75, displayValue: '.750' }
    ] }
  ] }
};

globalThis.fetch = async input => {
  const url = String(input);
  if (url.endsWith('/12345/overview')) return Response.json(overview);
  if (url.endsWith('/54321/overview')) return Response.json({ statistics: overview.statistics });
  if (url.endsWith('/99999/overview')) return Response.json(overview);
  if (url.includes(`/seasons/${year}/types/0/athletes/12345/statistics`)) return Response.json(fieldStats);
  if (url.includes(`/seasons/${year}/types/0/athletes/54321/statistics`)) return Response.json(goalieStats);
  if (url.includes('/athletes/99999/statistics')) throw new Error('Stats unavailable');
  for (const [id, name, position] of [
    ['12345', 'Lionel Messi', 'F'],
    ['54321', 'Dayne St. Clair', 'G'],
    ['99999', 'MLS Player', 'M']
  ]) {
    if (url.endsWith(`/athletes/${id}`)) return Response.json({
      athlete: { id, displayName: name, position: { abbreviation: position }, team: { displayName: 'Inter Miami CF' } },
      season: { year }
    });
  }
  throw new Error(`Unexpected fetch ${url}`);
};

try {
  assert.equal((await player(new Request('https://site.test/api/player?league=MLS&id=12345', { method: 'POST' }))).status, 405);
  assert.equal((await player(new Request('https://site.test/api/player?league=MLS&id=invalid'))).status, 400);

  const fieldResponse = await player(new Request('https://site.test/api/player?league=MLS&id=12345'));
  assert.equal(fieldResponse.status, 200);
  const field = await fieldResponse.json();
  assert.equal(field.partial, false);
  assert.equal(field.summary.rows[0].label, `${year} MLS`);
  assert.deepEqual(field.summary.names, ['appearances', 'totalGoals', 'goalAssists', 'totalShots', 'yellowCards', 'redCards']);
  assert.equal(field.recent.rows[0].opponent, 'Orlando City SC');
  const fieldHtml = playerHtml(field, [{ id: '54321', name: 'Dayne St. Clair' }], field);
  assert.match(fieldHtml, /Sezon MLS/);
  assert.match(fieldHtml, /Ultimele 5 meciuri/);
  assert.match(fieldHtml, /Perioadă<\/th><th>G<\/th><th>A<\/th><th>ȘUT<\/th><\/tr>/);
  assert.match(fieldHtml, /Comparație · statistici în sezon/);
  assert.match(fieldHtml, /G = goluri; A = pase decisive/);
  assert.match(fieldHtml, /Statistici de sezon și meciuri recente de la ESPN/);

  const goalieResponse = await player(new Request('https://site.test/api/player?league=MLS&id=54321'));
  const goalie = await goalieResponse.json();
  assert.equal(goalie.position, 'G');
  assert.deepEqual(goalie.summary.names, ['appearances', 'cleanSheet', 'saves', 'goalsConceded', 'savePct']);
  assert.equal(goalie.summary.rows[0].stats.at(-1), '75.0%');
  assert.match(playerHtml(goalie), /SV%/);
  assert.match(playerHtml(goalie), /GP = goluri primite/);
  assert.doesNotMatch(playerHtml(goalie), /AG = cartonașe/);

  const fallbackResponse = await player(new Request('https://site.test/api/player?league=MLS&id=99999'));
  const fallback = await fallbackResponse.json();
  assert.equal(fallback.partial, true);
  assert.equal(fallback.summary.rows[0].label, `${year} MLS`);

  const teamStats = normalizeMlsTeamStats({ splits: { categories: [
    { name: 'general', stats: [{ name: 'appearances', value: 34 }] },
    { name: 'goalKeeping', stats: [{ name: 'avgGoalsConceded', displayValue: '1.74' }] },
    { name: 'offensive', stats: [
      { name: 'avgGoals', displayValue: '2.35' },
      { name: 'totalShots', value: 505 },
      { name: 'shotsOnTarget', value: 200 },
      { name: 'possessionPct', displayValue: '57' }
    ] }
  ] } });
  assert.deepEqual(teamStats.map(stat => stat.value), ['2.35', '1.74', '14.85', '5.88', '57']);
  assert.match(teamBasicStatsHtml({ season: year, stats: teamStats }), /Șuturi pe poartă \/ meci/);
  assert.match(rosterHtml({ roster: [{ players: [{ id: '12345', n: 'Lionel Messi', pos: 'F' }] }] }, 'MLS'), /data-league="MLS"/);

  const summary = normalizeSummary({
    header: { competitions: [{ competitors: [
      { homeAway: 'home', team: { id: '10', displayName: 'Inter Miami CF' } },
      { homeAway: 'away', team: { id: '11', displayName: 'Orlando City SC' } }
    ] }] },
    rosters: [{ homeAway: 'home', roster: [{
      athlete: { id: '12345', displayName: 'Lionel Messi' },
      position: { abbreviation: 'F' },
      starter: true,
      stats: [{ name: 'totalGoals', displayValue: '1' }]
    }] }]
  }, 'MLS');
  assert.equal(summary.box[0].groups[0].rows[0].id, '12345');
  const gameHtml = panelHtml(
    { state: 'post', l: 'MLS', h: 'Inter Miami CF', a: 'Orlando City SC', H: { name: 'Inter Miami CF' }, A: { name: 'Orlando City SC' } },
    { box: summary.box, teamStats: [], plays: [], injuries: [] },
    { tab: 'jucatori', side: 'home' }
  );
  assert.match(gameHtml, /data-player="12345" data-league="MLS"/);
} finally {
  globalThis.fetch = realFetch;
}

console.log('MLS player profiles: field/goalkeeper basics, overview fallback, comparisons, recent games, team stats, and links OK');
