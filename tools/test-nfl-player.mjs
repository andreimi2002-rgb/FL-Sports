import assert from 'node:assert/strict';
import { parseCsv, parseNflPlayerIds } from '../netlify/lib/csv.mjs';
import { normalizeNflTeamStats } from '../netlify/lib/espn.mjs';
import { parseNflSeasonStats, nflversePlayerMetrics } from '../netlify/lib/nflverse.mjs';
import player from '../netlify/functions/player.mjs';
import { playerHtml } from '../js/player.js';
import { rosterHtml, teamBasicStatsHtml } from '../js/teamx.js';
import { panelHtml } from '../js/game.js';

assert.deepEqual(parseCsv('a,b\r\n1,"two, words"\r\n2,"x""y"'), [['a', 'b'], ['1', 'two, words'], ['2', 'x"y']]);
assert.deepEqual(parseNflPlayerIds('gsis_id,espn_id,last_season,name\nold,1,2023,Old Player\nrecent,2,2025,"Name, Jr."\ncurrent,3,2026,Current Player'), [['2', 'recent'], ['3', 'current']]);
assert.throws(() => parseCsv('a,b\n1,"unfinished'), /ghilimelele/);

const fields = ['player_id', 'recent_team', 'attempts', 'sacks_suffered', 'passing_epa', 'passing_cpoe', 'pacr', 'carries', 'rushing_epa', 'targets', 'receiving_epa', 'racr', 'target_share', 'air_yards_share', 'wopr'];
const row = ['00-0033873', 'KC', '298', '12', '48.0052', '1.911', '1.334', '25', '3.139', '10', '8', '1.2', '0.2', '0.3', '0.4'];
const seasonCsv = `${fields.join(',')}\n${row.join(',')}`;
const parsedStats = parseNflSeasonStats(seasonCsv);
assert.equal(parsedStats.get('00-0033873').passing_epa, '48.0052');
assert.equal((await nflversePlayerMetrics('999999999', 2026, 'QB')).status, 'mapping-missing');

const realFetch = globalThis.fetch;
let season = 2026, failNflverse = false;
const overview = () => ({
  statistics: {
    displayName: `${season} Passing`,
    categories: [{ name: 'passing', displayName: 'Passing', count: 3 }, { name: 'rushing', displayName: 'Rushing', count: 2 }],
    labels: ['CMP', 'YDS', 'TD', 'CAR', 'YDS'],
    names: ['completions', 'passingYards', 'passingTouchdowns', 'rushingAttempts', 'rushingYards'],
    displayNames: ['Completions', 'Passing Yards', 'Passing Touchdowns', 'Rushing Attempts', 'Rushing Yards'],
    splits: [{ displayName: 'Regular Season', stats: ['199', '2,385', '19', '25', '100'] }, { displayName: 'Career', stats: ['3292', '38,324', '286', '521', '2,765'] }]
  },
  gameLog: {
    statistics: [{ displayName: 'Passing', names: ['completions', 'passingYards'], labels: ['CMP', 'YDS'], events: [{ eventId: '401', stats: ['22', '348'] }] }],
    events: { '401': { gameDate: '2026-11-15T20:00:00Z', opponent: { displayName: 'Atlanta Falcons' } } }
  }
});
const stats = () => ({
  teams: { 'kansas-city-chiefs': { abbreviation: 'KC' } },
  categories: [{ name: 'passing', displayName: 'Passing', names: ['gamesPlayed', 'passingYards', 'passingTouchdowns'], labels: ['GP', 'YDS', 'TD'],
    statistics: [{ season: { year: season, displayName: String(season) }, teamSlug: 'kansas-city-chiefs', stats: ['9', '2,385', '19'] }],
    totals: ['9', '2,385', '19'] }]
});
globalThis.fetch = async input => {
  const url = String(input);
  if (url.endsWith('/overview')) return Response.json(overview());
  if (url.endsWith('/stats')) return Response.json(stats());
  if (/\/athletes\/3139477$/.test(url)) return Response.json({ athlete: {
    id: '3139477', displayName: 'Patrick Mahomes', position: { abbreviation: 'QB' }, age: 31, height: 74, weight: 225,
    team: { displayName: 'Kansas City Chiefs' }, headshot: { href: 'https://a.espncdn.com/i/headshots/nfl/players/full/3139477.png' }
  } });
  if (url.endsWith(`/stats_player_reg_${season}.csv`)) {
    if (failNflverse) throw new Error('test source failure');
    return new Response(seasonCsv);
  }
  throw new Error(`Unexpected fetch ${url}`);
};

try {
  assert.equal((await player(new Request('https://site.test/api/player?id=3139477', { method: 'POST' }))).status, 405);
  assert.equal((await player(new Request('https://site.test/api/player?league=ZZZ&id=3139477'))).status, 400);
  const response = await player(new Request('https://site.test/api/player?league=NFL&id=3139477'));
  assert.equal(response.status, 200);
  const profile = await response.json();
  assert.equal(profile.league, 'NFL');
  assert.equal(profile.partial, false);
  assert.equal(profile.seasons[0].rows[0].team, 'KC');
  assert.equal(profile.recent[0].rows[0].opponent, 'Atlanta Falcons');
  assert.equal(profile.advancedStatus, 'available');
  assert.equal(profile.advanced.team, 'KC');
  assert.equal(profile.advanced.metrics.find(m => m.label === 'EPA / dropback').value, 48.0052 / 310);
  assert.equal(profile.advanced.metrics.find(m => m.label === 'CPOE').unit, 'pp');
  const receiverMetrics = await nflversePlayerMetrics('3139477', 2026, 'WR');
  assert.equal(receiverMetrics.advanced.metrics.find(m => m.label === 'EPA / țintă').value, 0.8);
  assert.equal(receiverMetrics.advanced.metrics.find(m => m.label === 'Ținte din echipă').value, 0.2);
  const runnerMetrics = await nflversePlayerMetrics('3139477', 2026, 'RB');
  assert.equal(runnerMetrics.advanced.metrics.find(m => m.label === 'EPA / alergare').value, 3.139 / 25);
  assert.equal(runnerMetrics.advanced.metrics.find(m => m.label === 'RACR').value, 1.2);
  const receiverHtml = playerHtml({ ...profile, position: 'WR', advanced: receiverMetrics.advanced });
  assert.match(receiverHtml, /EPA \/ țintă/);
  assert.match(receiverHtml, /Ținte din echipă/);
  assert.doesNotMatch(receiverHtml, /WOPR|RACR|CPOE/);
  const runnerHtml = playerHtml({ ...profile, position: 'RB', advanced: runnerMetrics.advanced });
  assert.match(runnerHtml, /EPA \/ alergare/);
  assert.match(runnerHtml, /EPA \/ țintă/);
  assert.doesNotMatch(runnerHtml, /RACR|CPOE/);

  const html = playerHtml(profile, [{ id: '123', name: 'Alt jucător' }], null);
  assert.match(html, /NFL · Kansas City Chiefs/);
  assert.match(html, /Eficiență · 2026/);
  assert.match(html, /EPA \/ dropback/);
  assert.match(html, /Puncte estimate adăugate pe pasă sau sack/);
  assert.match(html, /Sezon regulat/);
  assert.match(html, /Carieră/);
  assert.doesNotMatch(html, /Projected|Last 5 Games/);
  assert.match(html, /data-league="NFL"/);
  const compareSummary = {
    ...profile.summary,
    rows: profile.summary.rows.map(r => ({
      ...r,
      stats: r.stats.map((value, i) => r.label === 'Sezon regulat' && i === 0 ? '175' : value)
    }))
  };
  const compareHtml = playerHtml(profile, [{ id: '123', name: 'Josh Allen' }], {
    ...profile, id: '123', name: 'Josh Allen', summary: compareSummary
  });
  assert.match(compareHtml, /Josh Allen<\/th><td>175<\/td>/);

  const defender = {
    ...profile,
    position: 'DE',
    advanced: null,
    advancedStatus: 'unsupported',
    summary: {
      names: ['totalTackles', 'sacks', 'interceptions', 'totalTouchdowns'],
      categories: [{ name: 'defensive', displayName: 'Defense', count: 3 }, { name: 'scoring', displayName: 'Scoring', count: 1 }],
      rows: [{ label: 'Sezon regulat', stats: ['5', '2', '1', '0'] }, { label: 'Carieră', stats: ['50', '5', '2', '1'] }]
    },
    seasons: [
      { key: 'defensive', name: 'Defense', names: ['gamesPlayed', 'totalTackles', 'sacks', 'interceptions'], rows: [{ label: '2026', stats: ['9', '5', '2', '1'] }] },
      { key: 'scoring', name: 'Scoring', names: ['gamesPlayed', 'totalTouchdowns'], rows: [{ label: '2026', stats: ['9', '1'] }] }
    ],
    recent: [
      { name: 'Tackles', names: ['totalTackles', 'sacks'], rows: [{ label: '', opponent: 'Falcons', stats: ['5', '2'] }] },
      { name: 'Fumbles', names: ['fumblesForced'], rows: [{ label: '', opponent: 'Falcons', stats: ['1'] }] }
    ]
  };
  const defenderHtml = playerHtml(defender);
  assert.match(defenderHtml, /Defense/);
  assert.doesNotMatch(defenderHtml, /Scoring|Fumbles|Eficiență|Metrici avansate/);

  const teamStats = normalizeNflTeamStats({ results: { stats: { categories: [
    { name: 'scoring', stats: [{ name: 'totalPointsPerGame', displayValue: '20.5' }] },
    { name: 'passing', stats: [{ name: 'netPassingYardsPerGame', displayValue: '230.1' }] },
    { name: 'rushing', stats: [{ name: 'rushingYardsPerGame', displayValue: '115.2' }] },
    { name: 'defensive', stats: [{ name: 'sacks', perGameDisplayValue: '2.1' }] },
    { name: 'defensiveInterceptions', stats: [{ name: 'interceptions', displayValue: '8' }] }
  ] } } });
  assert.deepEqual(teamStats.map(s => s.value), ['20.5', '230.1', '115.2', '2.1', '8']);
  const teamHtml = teamBasicStatsHtml({ season: 2026, stats: teamStats });
  assert.match(teamHtml, /Puncte pe meci/);
  assert.match(teamHtml, /Yarzi din alergare pe meci/);
  assert.match(teamBasicStatsHtml(null, true), /Se încarcă statisticile echipei/);
  assert.match(teamBasicStatsHtml({ stats: [] }), /nu sunt disponibile/);

  assert.match(rosterHtml({ roster: [{ name: 'QB', players: [{ id: '3139477', n: 'Patrick Mahomes' }] }] }, 'NFL'), /data-league="NFL"/);
  const gameHtml = panelHtml(
    { state: 'post', l: 'NFL', h: 'Kansas City Chiefs', a: 'Miami Dolphins', H: { name: 'Kansas City Chiefs' }, A: { name: 'Miami Dolphins' } },
    { box: [{ side: 'home', groups: [{ name: 'passing', keys: ['completions', 'passingYards', 'passingTouchdowns'], rows: [{ id: '3139477', n: 'Patrick Mahomes', pos: 'QB', v: ['22', '348', '5'] }] }] }],
      teamStats: [], plays: [], injuries: [] },
    { tab: 'jucatori', side: 'home' }
  );
  assert.match(gameHtml, /data-player="3139477" data-league="NFL"/);
  assert.equal((await nflversePlayerMetrics('3139477', 2026, 'LB')).status, 'unsupported');

  season = 2027;
  failNflverse = true;
  const partial = await (await player(new Request('https://site.test/api/player?league=NFL&id=3139477'))).json();
  assert.equal(partial.partial, true);
  assert.equal(partial.advancedStatus, 'unavailable');
} finally {
  globalThis.fetch = realFetch;
}

console.log('NFL player profiles: routes, ESPN seasons/recent games, nflverse EPA, unsupported roles, and source failure OK');
