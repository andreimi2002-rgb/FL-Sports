import { esc } from './ui.js';

const NBA_COLS = [['gamesPlayed', 'MJ'], ['avgMinutes', 'MIN'], ['avgPoints', 'PTS'], ['avgRebounds', 'REC'], ['avgAssists', 'AST'], ['fieldGoalPct', 'FG%'], ['threePointPct', '3P%'], ['freeThrowPct', 'FT%']];
const NHL_SKATER_COLS = [['games', 'MJ'], ['goals', 'G'], ['assists', 'A'], ['points', 'PTS'], ['plusMinus', '+/-'], ['shotsTotal', 'ȘUT']];
const NHL_GOALIE_COLS = [['games', 'MJ'], ['wins', 'V'], ['losses', 'Î'], ['avgGoalsAgainst', 'GAA'], ['savePct', 'SV%'], ['shutouts', 'SO']];
const MLS_FIELD_COLS = [['appearances', 'MJ'], ['totalGoals', 'G'], ['goalAssists', 'A'], ['totalShots', 'ȘUT'], ['yellowCards', 'AG'], ['redCards', 'AR']];
const MLS_GOALIE_COLS = [['appearances', 'MJ'], ['cleanSheet', 'CS'], ['saves', 'SV'], ['goalsConceded', 'GP'], ['savePct', 'SV%']];
const NFL_COLS = [
  [['gamesPlayed', 'MJ'], ['completions', 'COMP'], ['passingAttempts', 'ATT'], ['passingYards', 'YDS'], ['passingTouchdowns', 'TD'], ['interceptions', 'INT']],
  [['gamesPlayed', 'MJ'], ['rushingAttempts', 'CAR'], ['rushingYards', 'YDS'], ['rushingTouchdowns', 'TD']],
  [['gamesPlayed', 'MJ'], ['receptions', 'REC'], ['receivingTargets', 'ȚINTE'], ['receivingYards', 'YDS'], ['receivingTouchdowns', 'TD']],
  [['gamesPlayed', 'MJ'], ['totalTackles', 'PLAC'], ['sacks', 'SACK'], ['interceptions', 'INT']],
  [['gamesPlayed', 'MJ'], ['fieldGoals', 'FG'], ['fieldGoalPct', 'FG%'], ['kickExtraPoints', 'PAT'], ['totalPoints', 'PTS']],
  [['gamesPlayed', 'MJ'], ['punts', 'PUN'], ['grossAvgPuntYards', 'Y/P'], ['puntsInside20', '20 YD']]
];
const NFL_GROUPS = [
  [['completions', 'passingAttempts', 'passingYards', 'QBRating'], NFL_COLS[0]],
  [['rushingAttempts', 'rushingYards', 'rushingTouchdowns'], NFL_COLS[1]],
  [['receptions', 'receivingTargets', 'receivingYards'], NFL_COLS[2]],
  [['totalTackles', 'soloTackles', 'assistTackles', 'passesDefended'], NFL_COLS[3]],
  [['fieldGoals', 'fieldGoalPct', 'kickExtraPoints'], NFL_COLS[4]],
  [['punts', 'grossAvgPuntYards', 'puntYards'], NFL_COLS[5]]
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

const NFL_POSITION_GROUPS = {
  QB: ['passing', 'rushing'],
  RB: ['rushing', 'receiving'],
  FB: ['rushing', 'receiving'],
  HB: ['rushing', 'receiving'],
  WR: ['receiving'],
  TE: ['receiving'],
  K: ['kicking'],
  P: ['punting']
};
const NFL_DEFENSE_POSITIONS = new Set(['DE', 'DT', 'NT', 'DL', 'LB', 'ILB', 'OLB', 'CB', 'DB', 'S', 'FS', 'SS']);

function nflGroupType(group) {
  const text = `${group.key || ''} ${group.name || ''}`.toLowerCase();
  if (/scoring|score/.test(text)) return 'scoring';
  if (/passing|pass/.test(text)) return 'passing';
  if (/rushing|rush/.test(text)) return 'rushing';
  if (/receiving|receive/.test(text)) return 'receiving';
  if (/kicking|kick/.test(text)) return 'kicking';
  if (/punting|punt/.test(text)) return 'punting';
  if (/defen|tackl|intercept/.test(text)) return 'defense';
  const names = new Set(group.names || []);
  if (['completions', 'passingAttempts', 'passingYards'].some(k => names.has(k))) return 'passing';
  if (['rushingAttempts', 'rushingYards'].some(k => names.has(k))) return 'rushing';
  if (['receptions', 'receivingTargets', 'receivingYards'].some(k => names.has(k))) return 'receiving';
  if (['totalTackles', 'soloTackles', 'passesDefended'].some(k => names.has(k))) return 'defense';
  if (['fieldGoals', 'fieldGoalPct', 'kickExtraPoints'].some(k => names.has(k))) return 'kicking';
  if (['punts', 'grossAvgPuntYards', 'puntYards'].some(k => names.has(k))) return 'punting';
  return '';
}

function nflPositionGroups(groups, position) {
  const allowed = NFL_POSITION_GROUPS[position] || (NFL_DEFENSE_POSITIONS.has(position) ? ['defense'] : []);
  return groups.filter(group => allowed.includes(nflGroupType(group)));
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

function nflSummaryHtml(t, position) {
  const rows = t?.rows?.filter(r => ['Sezon regulat', 'Carieră'].includes(r.label)) || [];
  const groups = nflPositionGroups(summaryGroups({ ...t, rows }), position);
  return groups.length ? groups.map(g => nflGroupHtml(g)).join('') : '<p class="fn">Date indisponibile.</p>';
}

function nflSeasonsHtml(groups, position) {
  const recent = nflPositionGroups(groups || [], position).map(g => ({ ...g, rows: g.rows.slice(-5) }));
  return recent.length
    ? `<details><summary>Istoric pe sezoane (ultimii 5)</summary>${recent.map(g => nflGroupHtml(g, { career: true })).join('')}</details>`
    : '<p class="fn">Date indisponibile.</p>';
}

function nflRecentHtml(groups, position) {
  const relevant = nflPositionGroups(groups || [], position);
  return relevant.length ? relevant.map(g => nflGroupHtml(g, { recent: true })).join('') : '<p class="fn">Date indisponibile.</p>';
}

function nflCompareHtml(p, compare) {
  const theirs = nflPositionGroups(summaryGroups(compare.summary), compare.position);
  return nflPositionGroups(summaryGroups(p.summary), p.position).map(group => {
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

function nhlColumns(names, position) {
  const allowed = position === 'G' ? NHL_GOALIE_COLS : NHL_SKATER_COLS;
  return allowed.filter(([key]) => names.includes(key));
}

function nhlSummaryHtml(summary, position) {
  const rows = summary?.rows?.filter(r => ['Sezon regulat', 'Carieră'].includes(r.label)) || [];
  const columns = nhlColumns(summary?.names || [], position);
  return rows.length && columns.length
    ? table({ names: summary.names, rows }, columns)
    : '<p class="fn">Date indisponibile.</p>';
}

function nhlGroupIsGoalie(group) {
  return /goal/i.test(`${group.key || ''} ${group.name || ''}`) ||
    (group.names || []).some(key => ['savePct', 'avgGoalsAgainst', 'goalsAgainst'].includes(key));
}

function nhlSeasonsHtml(groups, position) {
  const goalie = position === 'G';
  const recent = (groups || []).filter(g => nhlGroupIsGoalie(g) === goalie)
    .map(g => ({ ...g, rows: (g.rows || []).slice(-5) }))
    .filter(g => nhlColumns(g.names || [], position).length && g.rows.length);
  return recent.length
    ? recent.map(g => `<h4>${esc(g.name)}</h4>${table({ names: g.names, rows: g.rows }, nhlColumns(g.names, position))}`).join('')
    : '<p class="fn">Date indisponibile.</p>';
}

function nhlRecentHtml(recent, position) {
  const columns = nhlColumns(recent?.names || [], position);
  if (!recent?.rows?.length || !columns.length) return '<p class="fn">Date indisponibile.</p>';
  const rows = recent.rows.slice(0, 5).map(r => ({
    ...r,
    label: [r.date && !isNaN(Date.parse(r.date)) ? new Date(r.date).toLocaleDateString('ro-RO') : '', r.opponent].filter(Boolean).join(' · ') || 'Meci'
  }));
  return table({ names: recent.names, rows }, columns);
}

function nhlCompareHtml(p, compare) {
  if ((p.position === 'G') !== (compare.position === 'G')) return '<p class="fn">Compară doi jucători de aceeași categorie.</p>';
  const columns = nhlColumns(p.summary?.names || [], p.position).filter(([key]) => compare.summary?.names?.includes(key));
  const first = p.summary?.rows?.find(r => r.label === 'Sezon regulat');
  const second = compare.summary?.rows?.find(r => r.label === 'Sezon regulat');
  if (!columns.length || !first || !second) return '<p class="fn">Nu sunt statistici de sezon comparabile.</p>';
  return table({
    names: columns.map(([key]) => key),
    rows: [
      { label: p.name, stats: columns.map(([key]) => first.stats[p.summary.names.indexOf(key)] ?? '—') },
      { label: compare.name, stats: columns.map(([key]) => second.stats[compare.summary.names.indexOf(key)] ?? '—') }
    ]
  }, columns);
}

function mlsColumns(names, position) {
  const allowed = position === 'G' ? MLS_GOALIE_COLS : MLS_FIELD_COLS;
  return allowed.filter(([key]) => names.includes(key));
}

function mlsSummaryHtml(summary, position) {
  const columns = mlsColumns(summary?.names || [], position);
  return summary?.rows?.length && columns.length
    ? table(summary, columns)
    : '<p class="fn">Statisticile sezonului nu sunt disponibile.</p>';
}

function mlsRecentHtml(recent, position) {
  const columns = mlsColumns(recent?.names || [], position)
    .filter(([key]) => !['appearances', 'savePct', 'yellowCards', 'redCards'].includes(key));
  if (!recent?.rows?.length || !columns.length) return '<p class="fn">Date indisponibile.</p>';
  const rows = recent.rows.slice(0, 5).map(r => ({
    ...r,
    label: [r.date && !isNaN(Date.parse(r.date)) ? new Date(r.date).toLocaleDateString('ro-RO') : '', r.opponent]
      .filter(Boolean).join(' · ') || 'Meci'
  }));
  return table({ names: recent.names, rows }, columns);
}

function mlsCompareHtml(p, compare) {
  if ((p.position === 'G') !== (compare.position === 'G')) return '<p class="fn">Compară doi jucători de aceeași categorie.</p>';
  const columns = mlsColumns(p.summary?.names || [], p.position).filter(([key]) => compare.summary?.names?.includes(key));
  const first = p.summary?.rows?.[0], second = compare.summary?.rows?.[0];
  if (!columns.length || !first || !second) return '<p class="fn">Nu sunt statistici de sezon comparabile.</p>';
  return table({
    names: columns.map(([key]) => key),
    rows: [
      { label: p.name, stats: columns.map(([key]) => first.stats[p.summary.names.indexOf(key)] ?? '—') },
      { label: compare.name, stats: columns.map(([key]) => second.stats[compare.summary.names.indexOf(key)] ?? '—') }
    ]
  }, columns);
}

function advancedHtml(p) {
  if (p.league === 'NHL') {
    const metrics = p.advanced?.metrics || [];
    if (!metrics.length) return '';
    const help = {
      'Procentaj la șuturi': 'Procentul șuturilor pe poartă transformate în gol.',
      'Angajamente câștigate': 'Procentul angajamentelor câștigate.'
    };
    const cards = metrics.map(m => {
      const value = new Intl.NumberFormat('ro-RO', { style: 'percent', maximumFractionDigits: 1 }).format(Number(m.value));
      return `<div class="stat"><div class="v">${esc(value)}</div><div class="l">${esc(m.label)}</div></div>`;
    }).join('');
    const explanations = metrics.map(m => `<b>${esc(m.label)}</b>: ${help[m.label]}`).join(' ');
    return `<section><h3>Eficiență · ${esc(p.advanced.season)}</h3><div class="stats">${cards}</div><p class="fn">${explanations} Sursă: ESPN.</p></section>`;
  }
  const preferred = {
    QB: ['EPA / dropback', 'CPOE'],
    RB: ['EPA / alergare', 'EPA / țintă'],
    FB: ['EPA / alergare', 'EPA / țintă'],
    HB: ['EPA / alergare', 'EPA / țintă'],
    WR: ['EPA / țintă', 'Ținte din echipă'],
    TE: ['EPA / țintă', 'Ținte din echipă']
  }[p.position];
  if (!preferred) return '';
  const available = p.advanced?.metrics?.filter(m => preferred.includes(m.label)) || [];
  if (available.length) {
    const help = {
      'EPA / dropback': 'Puncte estimate adăugate pe pasă sau sack; arată eficiența QB-ului.',
      CPOE: 'Procent de completări peste sau sub așteptarea modelului.',
      'EPA / alergare': 'Puncte estimate adăugate, în medie, la o alergare.',
      'EPA / țintă': 'Puncte estimate adăugate, în medie, la o țintă primită.',
      'Ținte din echipă': 'Ponderea țintelor echipei care au mers către jucător.'
    };
    const metrics = available.map(m => {
      const n = Number(m.value);
      const value = m.unit === '%'
        ? new Intl.NumberFormat('ro-RO', { style: 'percent', maximumFractionDigits: 1 }).format(n)
        : new Intl.NumberFormat('ro-RO', { maximumFractionDigits: m.label.includes('/') || m.label === 'WOPR' || m.label === 'RACR' ? 3 : 1 }).format(n);
      return `<div class="stat"><div class="v">${esc(value)}${m.unit && m.unit !== '%' ? ` ${esc(m.unit)}` : ''}</div><div class="l">${esc(m.label)}</div></div>`;
    }).join('');
    const explanations = available.map(m => `<b>${esc(m.label)}</b>: ${help[m.label]}`).join(' ');
    return `<section><h3>Eficiență · ${esc(p.advanced.season)}</h3><div class="stats">${metrics}</div><p class="fn">${explanations} Sursă: nflverse.</p></section>`;
  }
  const note = p.advancedStatus === 'unavailable'
    ? 'Metricile EPA nflverse nu sunt disponibile acum; încearcă din nou mai târziu.'
    : 'Nu există date EPA pentru acest jucător și sezon.';
  return `<p class="fn">${note}</p>`;
}

export function playerHtml(p, options = [], compare = null) {
  const league = p.league || 'NBA';
  const isNfl = league === 'NFL';
  const isNhl = league === 'NHL';
  const isMls = league === 'MLS';
  const head = /^https:\/\/a\.espncdn\.com\//.test(p.head) ? `<img class="player-face" src="${esc(p.head)}" alt="" width="160" height="120">` : '';
  const recentNba = league === 'NBA' && p.recent && {
    ...p.recent,
    rows: p.recent.rows.map(r => ({
      ...r,
      label: (r.date && !isNaN(Date.parse(r.date)) ? new Date(r.date).toLocaleDateString('ro-RO') + ' · ' : '') + r.opponent
    }))
  };
  const comparison = !compare ? '' : isNfl
    ? nflCompareHtml(p, compare)
    : isNhl
      ? nhlCompareHtml(p, compare)
      : isMls
        ? mlsCompareHtml(p, compare)
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
  const stats = isNfl
      ? `<section><h3>Sezon curent și carieră</h3>${nflSummaryHtml(p.summary, p.position)}</section>${advancedHtml(p)}<section><h3>Ultimele 5 meciuri</h3>${nflRecentHtml(p.recent, p.position)}</section><section><h3>Comparație · statistici în sezon</h3><label>Jucători din meciurile și loturile încărcate<select id="player-compare" data-league="${league}" data-player="${esc(p.id)}"><option value="">Alege un jucător</option>${options.filter(x => x.id !== p.id).map(x => `<option value="${esc(x.id)}"${compare?.id === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>${compare ? `<h4>${esc(p.name)} / ${esc(compare.name)}</h4>${comparison}` : ''}</section><section><h3>Carieră</h3>${nflSeasonsHtml(p.seasons, p.position)}</section>`
      : isNhl
        ? `<section><h3>Sezon curent și carieră</h3>${nhlSummaryHtml(p.summary, p.position)}</section>${advancedHtml(p)}<section><h3>Ultimele 5 meciuri</h3>${nhlRecentHtml(p.recent, p.position)}</section><section><h3>Comparație · statistici în sezon</h3><label>Jucători din loturile NHL încărcate<select id="player-compare" data-league="${league}" data-player="${esc(p.id)}"><option value="">Alege un jucător</option>${options.filter(x => x.id !== p.id).map(x => `<option value="${esc(x.id)}"${compare?.id === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>${compare ? `<h4>${esc(p.name)} / ${esc(compare.name)}</h4>${comparison}` : ''}</section><section><h3>Carieră</h3><details><summary>Istoric pe sezoane (ultimii 5)</summary>${nhlSeasonsHtml(p.seasons, p.position)}</details></section>`
      : isMls
        ? `<section><h3>Sezon MLS</h3>${mlsSummaryHtml(p.summary, p.position)}</section><section><h3>Ultimele 5 meciuri</h3>${mlsRecentHtml(p.recent, p.position)}</section><section><h3>Comparație · statistici în sezon</h3><label>Jucători MLS din loturile încărcate<select id="player-compare" data-league="${league}" data-player="${esc(p.id)}"><option value="">Alege un jucător</option>${options.filter(x => x.id !== p.id).map(x => `<option value="${esc(x.id)}"${compare?.id === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>${compare ? `<h4>${esc(p.name)} / ${esc(compare.name)}</h4>${comparison}` : ''}</section>`
        : `<section><h3>Sezon și carieră · medii pe meci</h3>${table(p.summary)}</section><section><h3>Cariera, sezon cu sezon</h3>${table(p.seasons)}</section><section><h3>Ultimele meciuri</h3>${table(recentNba, [['minutes', 'MIN'], ['points', 'PTS'], ['totalRebounds', 'REC'], ['assists', 'AST'], ['fieldGoalPct', 'FG%']])}</section><section><h3>Comparație · medii în sezon</h3><label>Jucători din meciurile încărcate<select id="player-compare" data-league="${league}" data-player="${esc(p.id)}"><option value="">Alege un jucător</option>${options.filter(x => x.id !== p.id).map(x => `<option value="${esc(x.id)}"${compare?.id === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>${compare ? `<h4>${esc(p.name)} / ${esc(compare.name)}</h4>${comparison}` : ''}</section>`;
  const note = isNfl
    ? 'Date biografice, statistici și meciuri recente ESPN; EPA și ratele avansate sunt de la nflverse. Valorile sezonului și carierei ESPN sunt totaluri. Comparația folosește doar statisticile comune din sezonul regulat.'
    : isNhl
      ? 'Date ESPN, pot fi parțiale. GAA = goluri primite pe meci; SV% = procentul de șuturi apărate. xG nu este disponibil în statisticile ESPN folosite aici.'
      : isMls
        ? p.position === 'G'
          ? 'Statistici de sezon și meciuri recente de la ESPN. MJ = apariții; CS = meciuri fără gol primit; SV = șuturi apărate; GP = goluri primite; SV% = procentajul șuturilor apărate. ESPN nu oferă totaluri de carieră MLS în profilul folosit.'
          : 'Statistici de sezon și meciuri recente de la ESPN. MJ = apariții; G = goluri; A = pase decisive; ȘUT = șuturi; AG/AR = cartonașe galbene/roșii. ESPN nu oferă totaluri de carieră MLS în profilul folosit.'
      : 'Date ESPN, pot fi parțiale. MJ = meciuri, REC = recuperări; valorile de sezon și carieră sunt medii pe meci. Comparația folosește primul segment de sezon regulat disponibil pentru fiecare jucător.';
  return `<div class="band plain"><div class="id">${head}<div><div class="lgn">${league} · ${esc(p.team)}</div><h2 id="prof-name">${esc(p.name)}</h2></div></div><button class="x" type="button" id="prof-x" aria-label="Închide">×</button></div><div class="pbody"><p>${[p.position, p.age ? p.age + ' ani' : '', p.height ? p.height + ' cm' : '', p.weight ? p.weight + ' kg' : ''].filter(Boolean).map(esc).join(' · ')}</p>${p.partial ? '<p class="fn">O parte din date nu a putut fi încărcată.</p>' : ''}${stats}<p class="fn">${note}</p></div>`;
}
