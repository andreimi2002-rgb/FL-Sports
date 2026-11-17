import { esc } from './ui.js';

const NBA_COLS = [['gamesPlayed', 'MJ'], ['avgMinutes', 'MIN'], ['avgPoints', 'PTS'], ['avgRebounds', 'REC'], ['avgAssists', 'AST'], ['fieldGoalPct', 'FG%'], ['threePointPct', '3P%'], ['freeThrowPct', 'FT%']];
const NFL_COLS = [
  [['gamesPlayed', 'MJ'], ['completions', 'COMP'], ['passingAttempts', 'ATT'], ['completionPct', 'COMP%'], ['passingYards', 'YDS'], ['passingTouchdowns', 'TD'], ['interceptions', 'INT'], ['QBRating', 'RTG']],
  [['gamesPlayed', 'MJ'], ['rushingAttempts', 'CAR'], ['rushingYards', 'YDS'], ['yardsPerRushAttempt', 'Y/A'], ['rushingTouchdowns', 'TD']],
  [['gamesPlayed', 'MJ'], ['receptions', 'REC'], ['receivingTargets', 'ȚINTE'], ['receivingYards', 'YDS'], ['yardsPerReception', 'Y/REC'], ['receivingTouchdowns', 'TD']],
  [['gamesPlayed', 'MJ'], ['totalTackles', 'PLAC'], ['soloTackles', 'SOLO'], ['assistTackles', 'ASIST'], ['sacks', 'SACK'], ['fumblesForced', 'FF'], ['interceptions', 'INT'], ['passesDefended', 'PD']],
  [['gamesPlayed', 'MJ'], ['fieldGoals', 'FG'], ['fieldGoalPct', 'FG%'], ['kickExtraPoints', 'PAT'], ['totalPoints', 'PTS']]
];
const NFL_GROUPS = [
  [['completions', 'passingAttempts', 'passingYards', 'QBRating'], NFL_COLS[0]],
  [['rushingAttempts', 'rushingYards', 'rushingTouchdowns'], NFL_COLS[1]],
  [['receptions', 'receivingTargets', 'receivingYards'], NFL_COLS[2]],
  [['totalTackles', 'soloTackles', 'assistTackles', 'passesDefended'], NFL_COLS[3]],
  [['fieldGoals', 'fieldGoalPct', 'kickExtraPoints'], NFL_COLS[4]]
];
const val = (t, row, key) => {
  let i = t.names.indexOf(key);
  if (i < 0 && key === 'threePointPct') i = t.names.indexOf('threePointFieldGoalPct');
  return i < 0 ? '—' : row.stats[i] ?? '—';
};

function table(t, columns = NBA_COLS) {
  if (!t?.rows?.length) return '<p class="fn">Date indisponibile.</p>';
  return `<div class="scroll"><table class="box"><thead><tr><th>Perioadă</th>${columns.map(c => `<th>${c[1]}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r => `<tr><th>${esc(r.label || r.opponent || 'Meci')}${r.team ? `<small>${esc(r.team)}</small>` : ''}</th>${columns.map(c => `<td>${esc(val(t, r, c[0]))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function nflColumns(names) {
  const set = new Set(names);
  const group = NFL_GROUPS.find(([signals]) => signals.some(key => set.has(key)))?.[1];
  return (group || []).filter(c => set.has(c[0]));
}

function summaryGroups(t) {
  if (!t?.rows?.length) return [];
  let offset = 0;
  const groups = (t.categories || []).map(c => {
    const names = t.names.slice(offset, offset + c.count);
    const group = {
      key: c.name,
      name: c.displayName || c.name,
      names,
      rows: t.rows.map(r => ({ ...r, stats: r.stats.slice(offset, offset + c.count) }))
    };
    offset += c.count;
    return group;
  });
  return groups.length ? groups : [{ key: '', name: '', names: t.names, rows: t.rows }];
}

function nflGroupHtml(group, { career = false, recent = false } = {}) {
  const names = group.names || [];
  const columns = nflColumns(names);
  if (!columns.length) return '';
  const rows = (group.rows || []).map(r => ({
    ...r,
    label: recent
      ? `${r.date && !isNaN(Date.parse(r.date)) ? new Date(r.date).toLocaleDateString('ro-RO') + ' · ' : ''}${r.opponent || 'Meci'}`
      : r.label
  }));
  if (career && group.totals?.length) rows.push({ label: 'Carieră', stats: group.totals });
  const heading = group.name ? `<h4>${esc(group.name)}</h4>` : '';
  return heading + table({ names, rows }, columns);
}

function nflSummaryHtml(t) {
  const rows = t?.rows?.filter(r => ['Sezon regulat', 'Carieră'].includes(r.label)) || [];
  const groups = summaryGroups({ ...t, rows });
  return groups.length ? groups.map(g => nflGroupHtml(g)).join('') : '<p class="fn">Date indisponibile.</p>';
}

function nflSeasonsHtml(groups) {
  return groups?.length ? groups.map(g => nflGroupHtml(g, { career: true })).join('') : '<p class="fn">Date indisponibile.</p>';
}

function nflRecentHtml(groups) {
  return groups?.length ? groups.map(g => nflGroupHtml(g, { recent: true })).join('') : '<p class="fn">Date indisponibile.</p>';
}

function nflCompareHtml(p, compare) {
  const theirs = summaryGroups(compare.summary);
  return summaryGroups(p.summary).map(group => {
    const other = theirs.find(g => g.key === group.key);
    if (!other) return '';
    const columns = nflColumns(group.names).filter(c => other.names.includes(c[0]));
    if (!columns.length) return '';
    const rowFor = g => g.rows.find(r => r.label === 'Sezon regulat') || g.rows[0];
    const first = rowFor(group), second = rowFor(other);
    if (!first || !second) return '';
    const rows = [first, second].map((r, i) => ({
      label: i ? compare.name : p.name,
      stats: columns.map(c => val(i ? other : group, r, c[0]))
    }));
    return `<h4>${esc(group.name)}</h4>${table({ names: columns.map(c => c[0]), rows }, columns)}`;
  }).join('') || '<p class="fn">Nu sunt statistici de sezon comparabile.</p>';
}

function advancedHtml(p) {
  if (p.advanced?.metrics?.length) {
    const metrics = p.advanced.metrics.map(m => {
      const n = Number(m.value);
      const value = m.unit === '%'
        ? new Intl.NumberFormat('ro-RO', { style: 'percent', maximumFractionDigits: 1 }).format(n)
        : new Intl.NumberFormat('ro-RO', { maximumFractionDigits: m.label.includes('/') || m.label === 'WOPR' || m.label === 'RACR' ? 3 : 1 }).format(n);
      return `<div class="stat"><div class="v">${esc(value)}${m.unit && m.unit !== '%' ? ` ${esc(m.unit)}` : ''}</div><div class="l">${esc(m.label)}</div></div>`;
    }).join('');
    return `<section><h3>Metrici avansate · ${esc(p.advanced.season)}</h3><div class="stats">${metrics}</div><p class="fn">Sursa: nflverse. EPA estimează valoarea adăugată pe baza punctelor așteptate; ratele sunt împărțite la dropback-uri, alergări sau ținte, după caz.</p></section>`;
  }
  const note = p.advancedStatus === 'unavailable'
    ? 'Metricile EPA nflverse nu sunt disponibile acum; încearcă din nou mai târziu.'
    : p.advancedStatus === 'unsupported'
      ? 'nflverse nu oferă metrici EPA pentru această poziție.'
      : 'Nu există metrici EPA nflverse pentru acest jucător și sezon.';
  return `<section><h3>Metrici avansate</h3><p class="fn">${note}</p></section>`;
}

export function playerHtml(p, options = [], compare = null, hideStats = false) {
  const league = p.league || 'NBA';
  const isNfl = league === 'NFL';
  const head = /^https:\/\/a\.espncdn\.com\//.test(p.head) ? `<img class="player-face" src="${esc(p.head)}" alt="" width="160" height="120">` : '';
  const recentNba = !isNfl && p.recent && {
    ...p.recent,
    rows: p.recent.rows.map(r => ({
      ...r,
      label: (r.date && !isNaN(Date.parse(r.date)) ? new Date(r.date).toLocaleDateString('ro-RO') + ' · ' : '') + r.opponent
    }))
  };
  const comparison = !compare ? '' : isNfl
    ? nflCompareHtml(p, compare)
    : table(p.summary && {
      names: p.summary.names,
      rows: [
        { label: p.name, stats: p.summary.rows?.[0]?.stats || [] },
        { label: compare?.name || '', stats: p.summary.names.map(k => {
          const i = compare?.summary?.names?.indexOf(k) ?? -1;
          return i >= 0 ? compare.summary.rows?.[0]?.stats?.[i] ?? '—' : '—';
        }) }
      ]
    });
  const stats = hideStats
    ? '<p class="fn">Statisticile sunt ascunse în modul fără spoilere.</p>'
    : isNfl
      ? `<section><h3>Sezon curent și carieră</h3>${nflSummaryHtml(p.summary)}</section>${advancedHtml(p)}<section><h3>Cariera, sezon cu sezon</h3>${nflSeasonsHtml(p.seasons)}</section><section><h3>Ultimele 5 meciuri</h3>${nflRecentHtml(p.recent)}</section><section><h3>Comparație · statistici în sezon</h3><label>Jucători din meciurile și loturile încărcate<select id="player-compare" data-league="${league}" data-player="${esc(p.id)}"><option value="">Alege un jucător</option>${options.filter(x => x.id !== p.id).map(x => `<option value="${esc(x.id)}"${compare?.id === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>${compare ? `<h4>${esc(p.name)} / ${esc(compare.name)}</h4>${comparison}` : ''}</section>`
      : `<section><h3>Sezon și carieră · medii pe meci</h3>${table(p.summary)}</section><section><h3>Cariera, sezon cu sezon</h3>${table(p.seasons)}</section><section><h3>Ultimele meciuri</h3>${table(recentNba, [['minutes', 'MIN'], ['points', 'PTS'], ['totalRebounds', 'REC'], ['assists', 'AST'], ['fieldGoalPct', 'FG%']])}</section><section><h3>Comparație · medii în sezon</h3><label>Jucători din meciurile încărcate<select id="player-compare" data-league="${league}" data-player="${esc(p.id)}"><option value="">Alege un jucător</option>${options.filter(x => x.id !== p.id).map(x => `<option value="${esc(x.id)}"${compare?.id === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>${compare ? `<h4>${esc(p.name)} / ${esc(compare.name)}</h4>${comparison}` : ''}</section>`;
  const note = isNfl
    ? 'Date biografice, statistici și meciuri recente ESPN; EPA și ratele avansate sunt de la nflverse. Valorile sezonului și carierei ESPN sunt totaluri. Comparația folosește doar statisticile comune din sezonul regulat.'
    : 'Date ESPN, pot fi parțiale. MJ = meciuri, REC = recuperări; valorile de sezon și carieră sunt medii pe meci. Comparația folosește primul segment de sezon regulat disponibil pentru fiecare jucător.';
  return `<div class="band plain"><div class="id">${head}<div><div class="lgn">${league} · ${esc(p.team)}</div><h2 id="prof-name">${esc(p.name)}</h2></div></div><button class="x" type="button" id="prof-x" aria-label="Închide">×</button></div><div class="pbody"><p>${[p.position, p.age ? p.age + ' ani' : '', p.height ? p.height + ' cm' : '', p.weight ? p.weight + ' kg' : ''].filter(Boolean).map(esc).join(' · ')}</p>${p.partial ? '<p class="fn">O parte din date nu a putut fi încărcată.</p>' : ''}${stats}<p class="fn">${note}</p></div>`;
}
