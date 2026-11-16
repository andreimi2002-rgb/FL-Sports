import { VIDEO_SOURCES, matchRecaps } from '../../js/video-data.js';
import { json } from '../lib/espn.mjs';
import { videoStore } from '../lib/video-store.mjs';
export default async req => {
  if (req.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
  const q = new URL(req.url).searchParams, l = q.get('l');
  if (l && !VIDEO_SOURCES.some(s => s.l === l)) return json({ error: 'Ligă necunoscută' }, { status: 400, browser: 0, cdn: 0 });
  let data;
  try { data = await (await videoStore()).get(); } catch { const { default: seed } = await import('../../data/video-catalog.json', { with: { type: 'json' } }); data = seed; }
  const videos = data.videos.filter(v => !l || v.l === l);
  const game = { l, home: (q.get('home') || '').slice(0, 100), away: (q.get('away') || '').slice(0, 100), date: q.get('date') };
  return json({ ...data, videos, candidates: game.home && game.away && Number.isFinite(Date.parse(game.date)) ? matchRecaps(videos, game) : [] }, { browser: 120, cdn: 1800 });
};
export const config = { path: '/api/videos' };
