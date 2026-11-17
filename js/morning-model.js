// Pure selection: one US scoreboard day, all chosen leagues; favorite priority never removes other teams.
export const easternDay = now => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date(now));
export const previousDay = day => new Date(Date.parse(day + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10);
export function validDay(day) { return /^20\d{2}-\d{2}-\d{2}$/.test(day) && !isNaN(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day; }
export function morningGames(games, leagues, favorite, priority = true) {
  return games.filter(g => leagues.has(g.l) && ['post', 'in'].includes(g.state)).slice().sort((a,b) => (priority ? Number(favorite(b)) - Number(favorite(a)) : 0) || +a.d - +b.d || String(a.id).localeCompare(String(b.id)));
}
