// Video metadata shared by the game API and the browser's morning queue.
const MEDIA = /(^|\.)(espncdn\.com|espn\.com|akamaized\.net)$/i;
export const RECAP = /game highlights|full highlights?|condensed game|extended highlights/i;

const durationNumber = value => {
  if (value == null || value === '') return null;
  if (typeof value === 'object') return durationNumber(value.value ?? value.displayValue);
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
export function clip(v) {
  return {
    title: v.headline || '', dur: durationNumber(v.duration),
    mp4: v.links?.source?.HD?.href || v.links?.source?.href || '', thumb: v.thumbnail || ''
  };
}
const safeMedia = value => {
  try { const url = new URL(value); return url.protocol === 'https:' && MEDIA.test(url.hostname); }
  catch { return false; }
};
export const safeClip = v => safeMedia(v.mp4) && (!v.thumb || safeMedia(v.thumb));
export function recapInNews(j) {
  return (j?.articles || []).find(a => a.type === 'Media' && a.id &&
    (RECAP.test(a.headline || '') || (a.categories || []).some(c => /full highlight/i.test(c.description || '')))) || null;
}
