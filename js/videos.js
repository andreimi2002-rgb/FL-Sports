import { $, esc } from './ui.js';
import { store, SPOIL, getJSON } from './core.js';
import { VIDEO_SOURCES, VIDEO_KINDS, durationLabel, isLongRecap, matchRecaps, usVideoDay, youtubeId, videoUrl, validVideoId } from './video-data.js';

const read = (key, fallback) => { try { return JSON.parse(store.get(key) || 'null') ?? fallback; } catch { return fallback; } };
let catalog = null, loading = null, catalogError = false;
const games = new Map();
const sourceName = v => VIDEO_SOURCES.find(s => s.id === v.source)?.name || 'Adăugat de tine';
const allVideos = () => catalog?.videos || [];
const safeTitle = v => SPOIL.on ? `${VIDEO_KINDS[v.kind] || 'Clip'} · ${sourceName(v)}` : v.title;
export function videoCard(v) {
  return `<article class="video-card" data-video-card="${esc(v.id)}">
    <div class="video-stage">${SPOIL.on ? '<span class="video-shield">◉ Fără spoilere</span>' : `<img loading="lazy" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" width="480" height="360">`}<button type="button" class="video-play" data-video-play="${v.id}" aria-label="Redă clipul">▶ Redă</button></div>
    <div class="video-copy"><small>${esc(v.l)} · ${esc(sourceName(v))}</small><h3>${esc(safeTitle(v))}</h3><p>${esc(VIDEO_KINDS[v.kind] || 'Clip')} · ${durationLabel(v.seconds)}${isLongRecap(v) ? ' · Rezumat lung' : ''}</p>
    <div class="btns"><a class="ghost" href="${videoUrl(v.id)}" target="_blank" rel="noopener noreferrer">YouTube ↗</a></div></div></article>`;
}
async function load() {
  if (catalog) return catalog;
  loading ||= getJSON('/api/videos', 14000).catch(() => getJSON('/data/video-catalog.json')).then(j => { catalog = j; catalogError = false; return j; }, () => { catalogError = true; return { videos: [] }; }).finally(() => { loading = null; });
  return loading;
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
  const chosen = custom && validVideoId(custom.id) ? custom : candidates.find(v => v.match === 'date');
  const espn = summary?.recap ? (summary.videos || []).slice(0, 1) : [];
  return `<h3>Rezumatul meciului</h3><p class="fn">${chosen?.manual ? 'Alegerea ta pentru acest meci.' : chosen?.match === 'date' ? 'Rezumat asociat după echipe și data din titlu.' : chosen ? 'Sugestie după echipe și momentul publicării. Verifică asocierea.' : (g.state !== 'post' ? 'Rezumatul va putea apărea după încheierea meciului.' : !catalog && !catalogError ? 'Căutăm rezumatul acestui meci…' : 'Nu am găsit un rezumat YouTube confirmat pentru acest meci.')} ${SPOIL.on ? 'Titlurile și imaginile rămân ascunse până alegi redarea.' : ''}</p>
  ${chosen ? `<div class="video-grid">${videoCard(chosen)}</div>` : ''}
  ${espn.length ? `<details><summary>Alternativă ESPN (${espn.length})</summary>${espn.map((v, i) => `<div class="video-espn"><p>${SPOIL.on ? 'Clip ESPN · titlu ascuns' : esc(v.title || v.caption || 'Clip ESPN')}</p><button type="button" class="ghost" data-espn-play="${i}">▶ Redă ESPN</button><div data-espn-player="${i}"></div></div>`).join('')}</details>` : '<p class="fn">Nu avem un rezumat ESPN disponibil pentru acest meci.</p>'}
  <details><summary>Corectează sau adaugă manual rezumatul</summary><form data-video-manual="${key}"><label>Link YouTube<input type="url" name="url" required placeholder="https://www.youtube.com/watch?v=…"></label><button class="ghost" type="submit">Folosește pentru acest meci</button><p role="status" data-video-error></p></form>${custom ? '<button type="button" class="ghost" data-video-reset>Revino la asocierea automată</button>' : ''}<p class="fn">Alegerea este salvată pe acest dispozitiv. Un link introdus manual nu este verificat ca sursă oficială.</p></details>
  <a class="linkish" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/results?search_query=${encodeURIComponent(`${g.l} ${g.A.name} ${g.H.name} ${usVideoDay(g.d)} full game highlights`)}">Caută rezumatul acestui meci pe YouTube ↗</a><p class="fn">Căutarea se deschide pe YouTube; verifică data și canalul. Disponibilitatea unui rezumat nu este garantată.</p>`;
}
export async function loadGameVideos(g, summary) {
  await load();
  const el = $('game-videos');
  if (el?.dataset.videoGame !== g.l + '/' + g.id || el.querySelector('iframe,video')) return;
  games.set(g.l + '/' + g.id, { g, summary }); el.innerHTML = gameInner(g, summary);
}
function redrawGame(el, force = false) {
  const root = el.closest('[data-video-game]'), record = games.get(root?.dataset.videoGame);
  if (record && (force || !root.querySelector('iframe,video'))) root.innerHTML = gameInner(record.g, record.summary);
}
document.addEventListener('submit', e => {
  const form = e.target.closest('[data-video-manual]'); if (!form) return;
  e.preventDefault(); const id = youtubeId(new FormData(form).get('url'));
  if (!id) { form.querySelector('[data-video-error]').textContent = 'Introdu un link HTTPS YouTube valid.'; return; }
  const key = form.dataset.videoManual, record = games.get(key); if (!record) return;
  const v = { id, l: record.g.l, kind: 'recap', title: `${record.g.A.name} – ${record.g.H.name}`, source: 'manual', manual: true, seconds: null };
  const all = overrides(); all[key] = v; store.set('flgames-video-overrides', JSON.stringify(Object.fromEntries(Object.entries(all).slice(-200)))); redrawGame(form, true);
});
document.addEventListener('click', e => {
  const el = e.target.closest('[data-video-play],[data-video-reset],[data-espn-play]'); if (!el) return;
  if (el.hasAttribute('data-video-reset')) { const key = el.closest('[data-video-game]')?.dataset.videoGame; const all = overrides(); delete all[key]; store.set('flgames-video-overrides', JSON.stringify(all)); redrawGame(el, true); return; }
  if (el.hasAttribute('data-espn-play')) {
    const root = el.closest('[data-video-game]'), record = games.get(root?.dataset.videoGame), v = record?.summary?.videos?.[Number(el.dataset.espnPlay)];
    const url = v?.mp4;
    try { const u = new URL(url); if (u.protocol !== 'https:' || !/(^|\.)(espncdn\.com|espn\.com)$/.test(u.hostname) && u.hostname !== 'espnmedia-cdn.akamaized.net') return; } catch { return; }
    const slot = root.querySelector(`[data-espn-player="${el.dataset.espnPlay}"]`); slot.innerHTML = `<p class="fn">Le poți vedea în clip: scorul, comentariul și rezultatul.</p><video controls playsinline preload="none" src="${esc(url)}"></video>`; return;
  }
  const id = el.dataset.videoPlay, v = allVideos().find(v => v.id === id) || Object.values(overrides()).find(v => v.id === id);
  if (!v || !validVideoId(id)) return;
  el.closest('.video-stage').innerHTML = `<p class="fn">Clipul și sugestiile YouTube pot dezvălui rezultatul. Dacă redarea este restricționată, folosește linkul YouTube.</p><iframe title="Player video YouTube" src="https://www.youtube-nocookie.com/embed/${id}?rel=0" allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
});
