import assert from 'node:assert/strict';
import { normalizeNhlTeamStats } from '../netlify/lib/espn.mjs';
import player from '../netlify/functions/player.mjs';
import { playerHtml } from '../js/player.js';
import { rosterHtml, teamBasicStatsHtml } from '../js/teamx.js';
import { panelHtml } from '../js/game.js';

const realFetch = globalThis.fetch;
const skaterOverview = {
  statistics: {
    displayName: '2026-27 General',
    names: ['games', 'goals', 'assists', 'points', 'plusMinus', 'shotsTotal'],
    labels: ['GP', 'G', 'A', 'PTS', '+/-', 'S'],
    splits: [
      { displayName: 'Regular Season', stats: ['22', '5', '14', '19', '-1', '42'] },
      { displayName: 'Projected', stats: ['84', '19', '53', '72', '-3', '160'] },
      { displayName: 'Career', stats: ['1033', '353', '484', '837', '1', '2666'] }
    ]
  },
  gameLog: {
    statistics: [{
      displayName: 'center',
      names: ['goals', 'assists', 'points', 'plusMinus', 'shotsTotal'],
      events: [{ eventId: '401', stats: ['1', '0', '1', '1', '3'] }]
    }],
    events: { '401': { gameDate: '2026-11-15T20:00:00Z', opponent: { displayName: 'Boston Bruins' } } }
  }
};
const goalieOverview = {
  statistics: {
    displayName: '2026-27 Goaltending',
    names: ['games', 'wins', 'losses', 'avgGoalsAgainst', 'savePct', 'shutouts'],
    labels: ['GP', 'W', 'L', 'GAA', 'SV%', 'SO'],
    splits: [
      { displayName: 'Regular Season', stats: ['1', '0', '1', '3.15', '.857', '0'] },
      { displayName: 'Career', stats: ['1', '0', '1', '3.15', '.857', '0'] }
    ]
  },
  gameLog: {
    statistics: [{
      displayName: 'goaltender',
      names: ['games', 'wins', 'losses', 'avgGoalsAgainst', 'savePct', 'shutouts'],
      events: [{ eventId: '402', stats: ['1', '0', '1', '3.15', '.857', '0'] }]
    }],
    events: { '402': { gameDate: '2026-11-15T20:00:00Z', opponent: { displayName: 'New York Islanders' } } }
  }
};
const skaterStats = {
  teams: { 'new-york-rangers': { abbreviation: 'NYR' } },
  categories: [{
    name: 'center',
    displayName: 'Center',
    names: ['games', 'goals', 'assists', 'points', 'plusMinus', 'shotsTotal', 'shootingPct', 'faceoffPercent'],
    totals: ['1033', '353', '484', '837', '1', '2666', '13.2', '52.4'],
    statistics: [
      { season: { year: 2026, displayName: '25-26' }, teamSlug: 'new-york-rangers', stats: ['81', '34', '44', '78', '-20', '215', '15.8', '53.1'] },
      { season: { year: 2027, displayName: '26-27' }, teamSlug: 'new-york-rangers', stats: ['22', '5', '14', '19', '-1', '42', '11.9', '54.5'] }
    ]
  }]
};
const goalieStats = {
  teams: { 'florida-panthers': { abbreviation: 'FLA' } },
  categories: [{
    name: 'goaltender',
    displayName: 'Goaltender',
    names: ['games', 'wins', 'losses', 'avgGoalsAgainst', 'savePct', 'shutouts'],
    totals: ['1', '0', '1', '3.15', '.857', '0'],
    statistics: [{ season: { year: 2027, displayName: '26-27' }, teamSlug: 'florida-panthers', stats: ['1', '0', '1', '3.15', '.857', '0'] }]
  }]
};

globalThis.fetch = async input => {
  const url = String(input);
  if (url.endsWith('/2562637')) return Response.json({ athlete: {
    id: '2562637', displayName: 'Mika Zibanejad', position: { abbreviation: 'C' }, age: 33, height: 74, weight: 217,
    team: { displayName: 'New York Rangers' }, headshot: { href: 'https://a.espncdn.com/i/headshots/nhl/players/full/2562637.png' }
  } });
  if (url.endsWith('/2562637/overview')) return Response.json(skaterOverview);
  if (url.endsWith('/2562637/stats')) return Response.json(skaterStats);
  if (url.endsWith('/5206956')) return Response.json({ athlete: {
    id: '5206956', displayName: 'Cooper Black', position: { abbreviation: 'G' }, age: 24,
    team: { displayName: 'Florida Panthers' }
  } });
  if (url.endsWith('/5206956/overview')) return Response.json(goalieOverview);
  if (url.endsWith('/5206956/stats')) return Response.json(goalieStats);
  throw new Error(`Unexpected fetch ${url}`);
};

try {
  assert.equal((await player(new Request('https://site.test/api/player?league=NHL&id=2562637', { method: 'POST' }))).status, 405);
  assert.equal((await player(new Request('https://site.test/api/player?league=MLS&id=2562637'))).status, 400);

  const skaterResponse = await player(new Request('https://site.test/api/player?league=NHL&id=2562637'));
  assert.equal(skaterResponse.status, 200);
  const skater = await skaterResponse.json();
  assert.equal(skater.league, 'NHL');
  assert.equal(skater.position, 'C');
  assert.equal(skater.partial, false);
  assert.equal(skater.seasons[0].rows[1].team, 'NYR');
  assert.equal(skater.recent.rows[0].opponent, 'Boston Bruins');
  assert.equal(skater.advanced.season, '26-27');
  assert.ok(Math.abs(skater.advanced.metrics.find(m => m.label === 'Procentaj la șuturi').value - 0.119) < Number.EPSILON * 2);
  assert.equal(skater.advanced.metrics.find(m => m.label === 'Angajamente câștigate').value, 0.545);

  const skaterHtml = playerHtml(skater, [{ id: '5206956', name: 'Cooper Black' }], {
    ...skater, id: '123', name: 'Alt centru'
  });
  assert.match(skaterHtml, /Sezon curent și carieră/);
  assert.match(skaterHtml, /Procentaj la șuturi/);
  assert.match(skaterHtml, /șuturilor pe poartă transformate în gol/);
  assert.match(skaterHtml, /Boston Bruins/);
  assert.match(skaterHtml, /Ultimele 5 meciuri/);
  assert.doesNotMatch(skaterHtml, /<th>GAA<\/th>|<th>SV%<\/th>/);
  assert.match(skaterHtml, /xG nu este disponibil/);

  const goalieResponse = await player(new Request('https://site.test/api/player?league=NHL&id=5206956'));
  const goalie = await goalieResponse.json();
  const goalieHtml = playerHtml(goalie);
  assert.equal(goalie.position, 'G');
  assert.match(goalieHtml, /GAA/);
  assert.match(goalieHtml, /SV%/);
  assert.match(goalieHtml, /xG nu este disponibil/);
  assert.doesNotMatch(goalieHtml, /Procentaj la șuturi|ȘUT/);

  const teamStats = normalizeNhlTeamStats({ results: { stats: { categories: [
    { name: 'offensive', stats: [
      { name: 'goals', perGameDisplayValue: '3.2' },
      { name: 'shotsTotal', perGameDisplayValue: '30.4' },
      { name: 'faceoffPercent', displayValue: '51.2' }
    ] },
    { name: 'defensive', stats: [
      { name: 'avgGoalsAgainst', displayValue: '2.7' },
      { name: 'shotsAgainst', perGameDisplayValue: '27.8' }
    ] }
  ] } } });
  assert.deepEqual(teamStats.map(s => s.value), ['3.2', '2.7', '30.4', '27.8', '51.2']);
  assert.match(teamBasicStatsHtml({ season: 2027, stats: teamStats }), /Goluri primite \/ meci/);
  assert.match(rosterHtml({ roster: [{ name: 'Goalies', players: [{ id: '5206956', n: 'Cooper Black', pos: 'G' }] }] }, 'NHL'), /data-league="NHL"/);

  const gameHtml = panelHtml(
    { state: 'post', l: 'NHL', h: 'New York Rangers', a: 'Florida Panthers', H: { name: 'New York Rangers' }, A: { name: 'Florida Panthers' } },
    { box: [{ side: 'home', groups: [{ name: 'forwards', keys: ['goals', 'assists'], rows: [{ id: '2562637', n: 'Mika Zibanejad', pos: 'C', v: ['1', '1'] }] }] }],
      teamStats: [], plays: [], injuries: [] },
    { tab: 'jucatori', side: 'home' }
  );
  assert.match(gameHtml, /data-player="2562637" data-league="NHL"/);
} finally {
  globalThis.fetch = realFetch;
}

console.log('NHL player profiles: skater/goalie basics, shooting efficiency, comparisons, recent games, and team stats OK');
