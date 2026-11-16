import { $, esc } from './ui.js';
import { store, SPOIL, getJSON } from './core.js';
import { MINE } from './mine.js';
import { TEAMS } from './teams.js';
import { VIDEO_SOURCES, VIDEO_KINDS, durationLabel, isLongRecap, matchRecaps, mentionsTeam, youtubeId, videoUrl, validVideoId } from './video-data.js';

const read = (key, fallback) => { try { return JSON.parse(store.get(key) || 'null') ?? fallback; } catch { return fallback; } };
const saved = () => { const x = read('flgames-video-saved', []); return Array.isArray(x) ? x.filter(v => validVideoId(v?.id)) : []; };
const prefs = { l: 'NBA', kind: '', source: '', onlySaved: false, onlyMine: false };
let catalog = null, loading = null, catalogError = false;
const games = new Map();
const sourceName = v => VIDEO_SOURCES.find(s => s.id === v.source)?.name || 'Adăugat de tine';
const allVideos = () => [...new Map([...(catalog?.videos || []), ...saved()].map(v => [v.id, v])).values()];
const sourcePrefs = () => { const x = read('flgames-video-sources', []); return Array.isArray(x) ? x : []; };
const safeTitle = v => SPOIL.on ? `${VIDEO_KINDS[v.kind] || 'Clip'} · ${sourceName(v)}` : v.title;
export function videoCard(v) {
  const has = saved().some(s => s.id === v.id);
  return `<article class="video-card" data-video-card="${esc(v.id)}">
    <div class="video-stage">${SPOIL.on ? '<span class="video-shield">◉ Fără spoilere</span>' : `<img loading="lazy" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" width="480" height="360">`}<button type="button" class="video-play" data-video-play="${v.id}" aria-label="Redă clipul">▶ Redă</button></div>
    <div class="video-copy"><small>${esc(v.l)} · ${esc(sourceName(v))}</small><h3>${esc(safeTitle(v))}</h3><p>${esc(VIDEO_KINDS[v.kind] || 'Clip')} · ${durationLabel(v.seconds)}${isLongRecap(v) ? ' · Rezumat lung' : ''}</p>
    <div class="btns"><button class="ghost" type="button" data-video-save="${v.id}" aria-pressed="${has}">${has ? '♥ Salvat' : '♡ Salvează'}</button><a class="ghost" href="${videoUrl(v.id)}" target="_blank" rel="noopener noreferrer">YouTube ↗</a></div></div></article>`;
}
async function load() {
  if (catalog) return catalog;
  loading ||= getJSON('/api/videos', 14000).catch(() => getJSON('/data/video-catalog.json')).then(j => { catalog = j; catalogError = false; return j; }, () => { catalogError = true; return { videos: [] }; }).finally(() => { loading = null; });
  return loading;
}
export function renderVideoLibrary() {
  const root = $('videoview'); if (!root || root.hidden) return;
  const followed = sourcePrefs(), savedIds = new Set(saved().map(v => v.id));
  const mine = MINE.list.map(t => TEAMS[t.id]?.espn || t.name).filter(Boolean);
  const videos = allVideos().filter(v => (!prefs.l || v.l === prefs.l) && (!prefs.kind || v.kind === prefs.kind) && (!prefs.source || v.source === prefs.source) && (!prefs.onlySaved || savedIds.has(v.id)) && (!prefs.onlyMine || mine.some(t => mentionsTeam(v.title, t, v.l))));
  root.innerHTML = `<section class="video-library"><div class="video-heading"><span class="eyebrow">Dincolo de tabela de scor</span><h2>Game Night</h2><p>Pregame, atmosfera arenei, pauze, studio, culise și rezumate. Pachetul întreg, când sursele oficiale îl publică.</p></div>
  <div class="video-filters"><label>Ligă<select data-video-filter="l"><option value="">Toate ligile</option>${['NBA','NFL','NHL','MLS','MLB'].map(l => `<option${prefs.l === l ? ' selected' : ''}>${l}</option>`).join('')}</select></label><label>Moment<select data-video-filter="kind"><option value="">Tot pachetul</option>${Object.entries(VIDEO_KINDS).map(([k,v]) => `<option value="${k}"${prefs.kind === k ? ' selected' : ''}>${v}</option>`).join('')}</select></label><label>Sursă<select data-video-filter="source"><option value="">Toate sursele</option>${VIDEO_SOURCES.filter(s => !prefs.l || s.l === prefs.l).map(s => `<option value="${s.id}"${prefs.source === s.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>
  <label class="video-check"><input type="checkbox" data-video-filter="onlySaved"${prefs.onlySaved ? ' checked' : ''}> Salvate</label><label class="video-check"><input type="checkbox" data-video-filter="onlyMine"${prefs.onlyMine ? ' checked' : ''}> Echipele mele</label></div>
  <p class="fn">${SPOIL.on ? 'Titlurile și imaginile sunt ascunse. Redarea sau deschiderea YouTube poate dezvălui rezultatul.' : 'Activează „Fără spoilere” ca să ascunzi titlurile și imaginile.'} Durata necunoscută rămâne necunoscută; unele clipuri permit doar vizionarea pe YouTube.</p>
  <details class="video-sources"><summary>Surse oficiale urmărite (${followed.length})</summary><p>Restrânge biblioteca la o sursă apăsând pe numele ei. Urmărirea păstrează alegerea pe acest dispozitiv.</p><div class="btns">${VIDEO_SOURCES.map(s => `<span><button type="button" class="ghost" data-video-source="${s.id}">${esc(s.name)}</button> <button type="button" class="ghost" data-video-follow="${s.id}" aria-label="Urmărește ${esc(s.name)}" aria-pressed="${followed.includes(s.id)}">${followed.includes(s.id) ? '✓' : '+'}</button></span>`).join('')}</div><label><input type="checkbox" data-video-filter="following"${prefs.following ? ' checked' : ''}> Doar sursele urmărite</label></details>
  <div class="video-grid">${videos.filter(v => !prefs.following || followed.includes(v.source)).slice(0, 100).map(videoCard).join('') || `<p class="fn">${!catalog && !catalogError ? 'Se încarcă biblioteca…' : catalogError ? 'Biblioteca nu este disponibilă. Încearcă din nou când revine conexiunea.' : 'Niciun clip pentru aceste filtre. Încearcă alt moment sau altă ligă.'}</p>`}</div>
  <p class="fn">${catalog?.updated ? `Catalog actualizat: ${esc(new Date(catalog.updated).toLocaleString('ro-RO'))}. ` : ''}Catalogul păstrează 45 de zile. Clipurile salvate rămân în acest browser. Acoperirea depinde de publicările canalelor; nu fiecare meci are rezumat lung.</p></section>`;
  if (!catalog && !loading && !catalogError) load().then(renderVideoLibrary);
}
const overrides = () => { const x = read('flgames-video-overrides', {}); return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; };
export function gameVideosHtml(g, summary) {
  games.set(g.l + '/' + g.id, { g, summary });
  const key = g.l + '/' + g.id;
  return `<section class="game-videos" id="game-videos" data-video-game="${key}">${gameInner(g, summary)}</section>`;
}
function gameInner(g, summary) {
  const key = g.l + '/' + g.id, custom = overrides()[key];
  const candidates = matchRecaps(catalog?.videos || [], { l: g.l, home: g.H.name, away: g.A.name, date: g.d.toISOString() });
  const chosen = custom && validVideoId(custom.id) ? custom : candidates[0];
  const related = (catalog?.videos || []).filter(v => v.l === g.l && v.kind !== 'recap' && Math.abs(Date.parse(v.published) - +g.d) < 72 * 36e5 && mentionsTeam(v.title, g.H.name, g.l) && mentionsTeam(v.title, g.A.name, g.l)).slice(0, 4);
  const espn = summary?.videos || [];
  return `<h3>Video & Game Night</h3><p class="fn">${chosen?.manual ? 'Alegerea ta pentru acest meci.' : chosen?.match === 'date' ? 'Rezumat asociat după echipe și data din titlu.' : chosen ? 'Sugestie după echipe și momentul publicării. Verifică asocierea.' : 'Nu avem încă un rezumat YouTube asociat sigur acestui meci.'} ${SPOIL.on ? 'Titlurile și imaginile rămân ascunse până alegi redarea.' : ''}</p>
  ${chosen ? `<div class="video-grid">${videoCard(chosen)}</div>` : ''}
  ${candidates.length > 1 && !custom ? `<details><summary>Alte rezumate posibile</summary><div class="video-grid">${candidates.slice(1).map(videoCard).join('')}</div></details>` : ''}
  ${espn.length ? `<details><summary>Alternativă ESPN (${espn.length})</summary>${espn.map((v, i) => `<div class="video-espn"><p>${SPOIL.on ? 'Clip ESPN · titlu ascuns' : esc(v.title || v.caption || 'Clip ESPN')}</p><button type="button" class="ghost" data-espn-play="${i}">▶ Redă ESPN</button><div data-espn-player="${i}"></div></div>`).join('')}</details>` : '<p class="fn">ESPN nu oferă momentan un clip pentru acest meci.</p>'}
  ${related.length ? `<details><summary>În jurul meciului · sugestii Game Night</summary><p class="fn">Asociere orientativă după echipe și publicare, fără confirmarea momentului filmării.</p><div class="video-grid">${related.map(videoCard).join('')}</div></details>` : ''}
  <details><summary>Corectează sau adaugă manual rezumatul</summary><form data-video-manual="${key}"><label>Link YouTube<input type="url" name="url" required placeholder="https://www.youtube.com/watch?v=…"></label><button class="ghost" type="submit">Folosește pentru acest meci</button><p role="status" data-video-error></p></form>${custom ? '<button type="button" class="ghost" data-video-reset>Revino la asocierea automată</button>' : ''}<p class="fn">Alegerea este salvată pe acest dispozitiv. Un link introdus manual nu este verificat ca sursă oficială.</p></details>
  <a class="linkish" href="#video" data-goview="video">Deschide tot Game Night ›</a>`;
}
export async function loadGameVideos(g, summary) {
  await load();
  const el = $('game-videos');
  if (el?.dataset.videoGame !== g.l + '/' + g.id || el.querySelector('iframe,video')) return;
  games.set(g.l + '/' + g.id, { g, summary }); el.innerHTML = gameInner(g, summary);
}
function redrawGame(el) {
  const root = el.closest('[data-video-game]'), record = games.get(root?.dataset.videoGame);
  if (record && !root.querySelector('iframe,video')) root.innerHTML = gameInner(record.g, record.summary);
}
document.addEventListener('change', e => {
  const el = e.target.closest('[data-video-filter]'); if (!el) return;
  prefs[el.dataset.videoFilter] = el.type === 'checkbox' ? el.checked : el.value;
  if (el.dataset.videoFilter === 'l') prefs.source = '';
  renderVideoLibrary();
});
document.addEventListener('submit', e => {
  const form = e.target.closest('[data-video-manual]'); if (!form) return;
  e.preventDefault(); const id = youtubeId(new FormData(form).get('url'));
  if (!id) { form.querySelector('[data-video-error]').textContent = 'Introdu un link HTTPS YouTube valid.'; return; }
  const key = form.dataset.videoManual, record = games.get(key); if (!record) return;
  const v = { id, l: record.g.l, kind: 'recap', title: `${record.g.A.name} – ${record.g.H.name}`, source: 'manual', manual: true, seconds: null };
  const all = overrides(); all[key] = v; store.set('flgames-video-overrides', JSON.stringify(Object.fromEntries(Object.entries(all).slice(-200)))); redrawGame(form);
});
document.addEventListener('click', e => {
  const el = e.target.closest('[data-video-play],[data-video-save],[data-video-source],[data-video-follow],[data-video-reset],[data-espn-play]'); if (!el) return;
  if (el.hasAttribute('data-video-reset')) { const key = el.closest('[data-video-game]')?.dataset.videoGame; const all = overrides(); delete all[key]; store.set('flgames-video-overrides', JSON.stringify(all)); redrawGame(el); return; }
  if (el.dataset.videoFollow) { const list = sourcePrefs(), id = el.dataset.videoFollow; store.set('flgames-video-sources', JSON.stringify(list.includes(id) ? list.filter(x => x !== id) : [...list, id])); renderVideoLibrary(); return; }
  if (el.dataset.videoSource) { prefs.source = el.dataset.videoSource; prefs.l = ''; renderVideoLibrary(); return; }
  if (el.hasAttribute('data-espn-play')) {
    const root = el.closest('[data-video-game]'), record = games.get(root?.dataset.videoGame), v = record?.summary?.videos?.[Number(el.dataset.espnPlay)];
    const url = v?.mp4;
    try { const u = new URL(url); if (u.protocol !== 'https:' || !/(^|\.)espncdn\.com$/.test(u.hostname)) return; } catch { return; }
    const slot = root.querySelector(`[data-espn-player="${el.dataset.espnPlay}"]`); slot.innerHTML = `<p class="fn">Le poți vedea în clip: scorul, comentariul și rezultatul.</p><video controls playsinline preload="none" src="${esc(url)}"></video>`; return;
  }
  const id = el.dataset.videoPlay || el.dataset.videoSave, v = allVideos().find(v => v.id === id) || Object.values(overrides()).find(v => v.id === id);
  if (!v || !validVideoId(id)) return;
  if (el.dataset.videoSave) {
    const list = saved(); store.set('flgames-video-saved', JSON.stringify(list.some(x => x.id === id) ? list.filter(x => x.id !== id) : [...list, v].slice(-200)));
    el.setAttribute('aria-pressed', saved().some(x => x.id === id)); el.textContent = saved().some(x => x.id === id) ? '♥ Salvat' : '♡ Salvează';
    if (prefs.onlySaved) renderVideoLibrary(); return;
  }
  el.closest('.video-stage').innerHTML = `<p class="fn">Clipul și sugestiile YouTube pot dezvălui rezultatul. Dacă redarea este restricționată, folosește linkul YouTube.</p><iframe title="Player video YouTube" src="https://www.youtube-nocookie.com/embed/${id}?rel=0" allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
});
