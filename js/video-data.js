// Shared, keyless video configuration and conservative matching. No DOM or network.
export const VIDEO_SOURCES = [
  { id: 'nba', l: 'NBA', name: 'NBA', channel: 'UCWJ2lWNubArHWmf3FIHbfcQ', url: 'https://www.youtube.com/@NBA' },
  { id: 'nfl', l: 'NFL', name: 'NFL', channel: 'UCDVYQ4Zhbm3S2dlz7P1GBDg', url: 'https://www.youtube.com/@NFL' },
  { id: 'nhl', l: 'NHL', name: 'NHL', channel: 'UCqFMzb-4AUf6WAIbl132QKA', url: 'https://www.youtube.com/@NHL' },
  { id: 'mlb', l: 'MLB', name: 'MLB', channel: 'UCoLrcjPV5PbUrUyXq5mjc_A', url: 'https://www.youtube.com/@MLB' },
  { id: 'mls', l: 'MLS', name: 'Major League Soccer', channel: 'UCSZbXT5TLLW_i-5W8FZpFsg', url: 'https://www.youtube.com/@MLS' },
  { id: 'nba-espn', l: 'NBA', name: 'NBA on ESPN', channel: 'UCVSSpcmZD2PwPBqb8yKQKBA', url: 'https://www.youtube.com/@NBAonESPN' },
  { id: 'nba-nbc', l: 'NBA', name: 'NBA on NBC', channel: 'UCFw3-5NBx1XJTaF0TPcK8iQ', url: 'https://www.youtube.com/@NBAonNBC' },
  { id: 'nfl-network', l: 'NFL', name: 'NFL Network', channel: 'UC_1H9v258pXiyLDaW0R5exw', url: 'https://www.youtube.com/@NFLNetwork' },
  { id: 'nfl-films', l: 'NFL', name: 'NFL Films', channel: 'UCY3NEq2LYrmdoGkevo9BH5A', url: 'https://www.youtube.com/@NFLFilms' }
];
export const VIDEO_KINDS = { recap: 'Rezumate', pre: 'Pregame', arena: 'Atmosferă și pauze', post: 'Postgame', studio: 'Studio și analiză', backstage: 'Culise și Mic’d Up', other: 'Alte clipuri' };
export const validVideoId = id => /^[\w-]{11}$/.test(String(id || ''));
export function youtubeId(value) {
  try {
    const u = new URL(String(value).trim());
    if (u.protocol !== 'https:' || u.username || u.password || u.port) return null;
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    const id = host === 'youtu.be' ? u.pathname.slice(1).split('/')[0]
      : ['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host) ? (u.pathname === '/watch' ? u.searchParams.get('v') : /^\/(?:shorts|embed|live)\/([\w-]{11})(?:\/|$)/.exec(u.pathname)?.[1]) : null;
    return validVideoId(id) ? id : null;
  } catch { return null; }
}
export const videoUrl = id => validVideoId(id) ? `https://www.youtube.com/watch?v=${id}` : '';
export const videoNorm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function videoKind(title, source) {
  const t = videoNorm(title);
  if (/\b(full game highlights|game highlights|extended highlights|match highlights|game recap|match recap)\b/.test(t)) return 'recap';
  if (/\b(mic d up|mic up|micd up|all access|behind the scenes|locker room|wired|sounds of the game)\b/.test(t)) return 'backstage';
  if (/\b(halftime|half time|player introductions|intro video|national anthem|mascot|dance team|arena show|tunnel|entrance)\b/.test(t)) return 'arena';
  if (/\b(postgame|post game|press conference|postmatch|post match)\b/.test(t)) return 'post';
  if (/\b(pregame|pre game|preview|warmup|warm up|warmups|tip off)\b/.test(t)) return 'pre';
  if (/\b(analysis|breakdown|film room|inside the nba|nba today|first take|nfl live|good morning football|enjoy basketball|football night)\b/.test(t) || ['nba-espn', 'nba-nbc', 'nfl-network'].includes(source)) return 'studio';
  return 'other';
}
export const durationLabel = seconds => Number.isFinite(seconds) && seconds > 0 ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'Durată necunoscută';
export const isLongRecap = v => v.kind === 'recap' && v.seconds >= 360;
const MULTI = /\b(trail blazers|red wings|blue jackets|maple leafs|golden knights|red sox|white sox|blue jays)$/;
export function teamAliases(name, league) {
  const full = videoNorm(name), aliases = [full, full.startsWith('los angeles ') ? full.replace(/^los angeles /, 'la ') : full.replace(/^la /, 'los angeles ')];
  if (league === 'MLS') aliases.push(full.replace(/\b(fc|sc|cf)\b/g, '').replace(/\s+/g, ' ').trim());
  else aliases.push(MULTI.exec(full)?.[1] || full.split(' ').pop());
  return [...new Set(aliases.filter(x => x?.length >= 3))];
}
export const mentionsTeam = (title, name, league) => teamAliases(name, league).some(a => (` ${videoNorm(title)} `).includes(` ${a} `));
export const usVideoDay = date => {
  const d = new Date(date);
  return Number.isFinite(+d) ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(d) : '';
};
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
export function titleGameDate(title, year) {
  const text = String(title || '');
  let m = /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/.exec(text);
  if (m) return `${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  m = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?\b/i.exec(text);
  return m ? `${m[3] || year}-${String(MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}` : null;
}
export function recapMatch(v, game) {
  if (v.l !== game.l || v.kind !== 'recap' || v.live || v.seconds != null && v.seconds < 120) return null;
  if (!mentionsTeam(v.title, game.home, game.l) || !mentionsTeam(v.title, game.away, game.l)) return null;
  const start = Date.parse(game.date), published = Date.parse(v.published), age = published - start;
  if (!Number.isFinite(age) || age < 0 || age > 72 * 36e5) return null;
  const day = usVideoDay(game.date), explicit = titleGameDate(v.title, day.slice(0, 4));
  if (explicit && explicit !== day) return null;
  // Without a date in the title, accept only a tight postgame publication window;
  // the UI labels this as a suggestion rather than a confirmed match.
  if (!explicit && (age < 36e5 || age > 18 * 36e5)) return null;
  return { ...v, match: explicit ? 'date' : 'published' };
}
export function matchRecaps(videos, game) {
  return videos.map(v => recapMatch(v, game)).filter(Boolean).sort((a, b) => Number(b.match === 'date') - Number(a.match === 'date') || Number(isLongRecap(b)) - Number(isLongRecap(a)) || (b.seconds || 0) - (a.seconds || 0)).slice(0, 4);
}
