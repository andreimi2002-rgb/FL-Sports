import { VIDEO_SOURCES, validVideoId, videoKind } from '../../js/video-data.js';

const text = s => String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => {
  const p = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n);
  return p > 0 && p <= 0x10ffff ? String.fromCodePoint(p) : '';
}).replace(/&(amp|lt|gt|quot|apos);/g, (_, n) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[n]);
const tag = (s, k) => text(new RegExp(`<${k}>([\\s\\S]*?)</${k}>`).exec(s)?.[1]);
export function parseFeed(xml, source) {
  if (!VIDEO_SOURCES.some(s => s.id === source.id && s.channel === source.channel)) throw new Error('Sursă necunoscută');
  const channel = tag(xml.split('<entry>')[0], 'yt:channelId');
  if (channel !== source.channel && 'UC' + channel !== source.channel) throw new Error('Canal neașteptat');
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 30).flatMap(([, entry]) => {
    const id = tag(entry, 'yt:videoId'), title = tag(entry, 'title'), published = tag(entry, 'published');
    return validVideoId(id) && title && Number.isFinite(Date.parse(published)) ? [{ id, title: title.slice(0, 400), published, source: source.id, l: source.l, kind: videoKind(title, source.id), seconds: null }] : [];
  });
}
// Only metadata is read; no media is downloaded. Fail closed if the owner cannot be verified.
export function watchMetadata(html, source) {
  const field = key => {
    const m = new RegExp(`"${key}":("(?:[^"\\\\]|\\\\.)*"|true|false)`).exec(html);
    try { return m ? JSON.parse(m[1]) : null; } catch { return null; }
  };
  if (field('channelId') !== source.channel) throw new Error('Proprietar video neașteptat');
  const seconds = Number(field('lengthSeconds')), published = field('publishDate'), title = field('title');
  return { ...(seconds > 0 && seconds < 86400 ? { seconds } : {}), ...(published && Number.isFinite(Date.parse(published)) ? { published } : {}), ...(title ? { title: title.slice(0, 400), kind: videoKind(title, source.id) } : {}), live: field('isLiveContent') === true };
}
export function mergeCatalog(previous, incoming, now = Date.now()) {
  const map = new Map();
  for (const v of [...previous, ...incoming]) {
    if (!validVideoId(v.id) || !VIDEO_SOURCES.some(s => s.id === v.source && s.l === v.l) || !Number.isFinite(Date.parse(v.published)) || now - Date.parse(v.published) > 45 * 864e5 || Date.parse(v.published) > now + 864e5) continue;
    const old = map.get(v.id);
    map.set(v.id, { ...old, ...v, seconds: v.seconds ?? old?.seconds ?? null, live: v.live ?? old?.live ?? false });
  }
  return [...map.values()].sort((a, b) => Date.parse(b.published) - Date.parse(a.published)).slice(0, 1500);
}
async function fetchText(url, ms, fetcher) {
  const r = await fetcher(url, { signal: AbortSignal.timeout(ms), headers: { 'accept-language': 'en-US,en;q=0.9' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const s = await r.text();
  if (s.length > 4e6) throw new Error('Răspuns prea mare');
  return s;
}
export async function collectCatalog(previous = {}, { fetcher = fetch, now = Date.now(), metadataLimit = 6 } = {}) {
  const incoming = [], statuses = [], pending = VIDEO_SOURCES.filter(s => ['nba', 'nfl', 'nhl', 'mlb', 'mls'].includes(s.id));
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (pending.length) {
      const source = pending.shift();
      try {
        incoming.push(...parseFeed(await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${source.channel}`, 3500, fetcher), source));
        statuses.push({ id: source.id, ok: true, checked: new Date(now).toISOString() });
      } catch { statuses.push({ id: source.id, ok: false, checked: new Date(now).toISOString() }); }
    }
  }));
  const videos = mergeCatalog(previous.videos || [], incoming, now).filter(v => v.kind === 'recap');
  // Prioritize potential recaps; metadata is optional and never guessed from titles.
  const candidates = videos.filter(v => v.seconds == null && !v.metadataChecked).sort((a, b) => Number(b.kind === 'recap') - Number(a.kind === 'recap')).slice(0, Math.min(metadataLimit, 6));
  await Promise.all(candidates.map(async v => {
    try { Object.assign(v, watchMetadata(await fetchText(`https://www.youtube.com/watch?v=${v.id}`, 3000, fetcher), VIDEO_SOURCES.find(s => s.id === v.source))); } catch { /* duration stays unknown */ }
    v.metadataChecked = new Date(now).toISOString();
  }));
  return { updated: new Date(now).toISOString(), videos, sources: statuses };
}
