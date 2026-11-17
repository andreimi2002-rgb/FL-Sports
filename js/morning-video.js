import { LEAGUES } from './teams.js';
import { clip, safeClip, RECAP, recapInNews } from './espn-video.js';

const SITE = 'https://site.api.espn.com/apis/site/v2/sports/';

// Reads ESPN in the browser: neither discovery nor video playback passes through Netlify.
export async function morningRecap(game, request) {
  if (!LEAGUES[game.l] || !/^\d{1,12}$/.test(String(game.id))) throw new Error('Meci invalid');
  const base = SITE + LEAGUES[game.l].path;
  const summary = await request(`${base}/summary?event=${encodeURIComponent(game.id)}`);
  if (!Array.isArray(summary?.videos)) {
    if (!summary || typeof summary !== 'object') throw new Error('Răspuns ESPN invalid');
  }
  const videos = (Array.isArray(summary.videos) ? summary.videos : []).map(clip).filter(safeClip);
  const own = videos.find(v => RECAP.test(v.title));
  if (own) return own;
  const news = await request(`${base}/news?event=${encodeURIComponent(game.id)}`);
  if (!Array.isArray(news?.articles)) throw new Error('Știri ESPN indisponibile');
  const article = recapInNews(news);
  if (!article) return null;
  const detail = await request(`https://content.core.api.espn.com/v1/video/clips/${encodeURIComponent(article.id)}`);
  if (!Array.isArray(detail?.videos)) throw new Error('Clip ESPN indisponibil');
  const result = detail.videos[0] && clip(detail.videos[0]);
  return result && safeClip(result) ? { ...result, title: result.title || article.headline || '' } : null;
}

export function rankMorningGames(games, favorite, score) {
  const ranked = games.filter(g => g.state === 'post').slice()
    .sort((a, b) => score(b) - score(a) || +a.d - +b.d || String(a.id).localeCompare(String(b.id)));
  const favorites = ranked.filter(favorite), others = ranked.filter(g => !favorite(g));
  if (!favorites.length || !others.length) return ranked;
  return [favorites[0], others[0], ...favorites.slice(1), ...others.slice(1)];
}

export async function prepareMorningQueue(games, budget, load, onProgress = () => {}, active = () => true) {
  const queue = [], unavailable = [], errors = [];
  let seconds = 0, checked = 0;
  for (const game of games) {
    if (!active()) return null;
    if (seconds >= budget) break;
    checked++;
    try {
      const video = await load(game);
      if (video && Number.isFinite(video.dur) && video.dur > 0 && seconds + video.dur <= budget) {
        queue.push({ game, video }); seconds += video.dur;
      } else {
        unavailable.push(game);
      }
    } catch (error) {
      errors.push(game);
    }
    if (!active()) return null;
    onProgress({ checked, total: games.length });
  }
  return { queue, unavailable, errors, seconds, checked, total: games.length };
}
