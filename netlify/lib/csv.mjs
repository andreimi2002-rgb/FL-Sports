export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"' && field === '') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row);
      row = []; field = '';
    } else field += ch;
  }
  if (quoted) throw new Error('CSV invalid: ghilimelele nu sunt închise.');
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function parseNflPlayerIds(csv) {
  const [rawHeaders, ...records] = parseCsv(csv);
  if (!rawHeaders) throw new Error('CSV nflverse fără antet.');
  const headers = rawHeaders.map((v, i) => i ? v : v.replace(/^\uFEFF/, ''));
  const indexes = Object.fromEntries(['gsis_id', 'espn_id', 'last_season'].map(name => [name, headers.indexOf(name)]));
  if (Object.values(indexes).some(i => i < 0)) throw new Error('Schema nflverse players.csv schimbată.');
  const parsed = records.map(cells => ({
    gsis: cells[indexes.gsis_id] || '',
    espn: cells[indexes.espn_id] || '',
    season: Number(cells[indexes.last_season])
  })).filter(p => p.gsis && /^\d+$/.test(p.espn));
  const latest = Math.max(0, ...parsed.map(p => p.season).filter(Number.isFinite));
  const ids = new Map();
  for (const p of parsed) {
    if (!Number.isFinite(p.season) || p.season < latest - 2) continue;
    const existing = ids.get(p.espn);
    if (existing && existing !== p.gsis) throw new Error(`ID ESPN duplicat cu GSIS diferit: ${p.espn}`);
    ids.set(p.espn, p.gsis);
  }
  return [...ids.entries()];
}
