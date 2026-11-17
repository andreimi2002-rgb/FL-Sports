import { $, esc, emb } from './ui.js';
import { LEAGUES } from './teams.js';
import { store, getJSON, keepExtra, mineOf, fmtTime, entryOf } from './core.js';
import { easternDay, previousDay, validDay, morningGames } from './morning-model.js';
import { recapUrl } from './game.js';
import { scoreGame } from './motd.js';
import { morningRecap, rankMorningGames, prepareMorningQueue } from './morning-video.js';
const cache = new Map(), pending = new Map(), videoCache = new Map();
const savedLeagues = (() => { try { const a=JSON.parse(store.get('flgames-morning-leagues')); return Array.isArray(a) ? a.filter(l=>LEAGUES[l]) : null; } catch { return null; } })();
export const MORNING = { day: previousDay(easternDay(Date.now())), leagues: new Set(savedLeagues || Object.keys(LEAGUES)), priority: true, tv: false, budget: 15, queue: null, index: 0, preparing: false, run: 0 };
const favorite = g => mineOf(g).length > 0;
const timeText = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const externalLink = g => `<a href="${esc(recapUrl(g))}" target="_blank" rel="noopener">Caută rezumatul pe YouTube ↗</a>`;
function resetQueue() { MORNING.run++; MORNING.queue = null; MORNING.index = 0; MORNING.preparing = false; }
function setTV(on) {
  MORNING.tv = on;
  const root = $('morningview'), button = root.querySelector('[data-morning-tv]'), note = root.querySelector('.morning-head .fn');
  root.classList.toggle('morning-tv', on);
  button.setAttribute('aria-pressed', String(on));
  button.textContent = on ? 'Ieși din Mod TV' : 'Mod TV / canapea';
  note.textContent = (on ? 'Săgeți: mută selecția · Enter: deschide meciul · Escape: închide meciul, apoi iese din Mod TV.' : 'Deschide un meci pentru pagina completă și clipurile ESPN disponibile.') + ' Nu toate meciurile au video; păstrăm playerul existent.';
}
async function loadRecap(g) {
  const key = `${g.l}:${g.id}`, hit = videoCache.get(key);
  if (hit && Date.now() - hit.at < (hit.video ? 86400000 : 300000)) return hit.video;
  const video = await morningRecap(g, url => getJSON(url, 10000));
  videoCache.set(key, { video, at: Date.now() });
  return video;
}
async function prepareQueue() {
  const record = cache.get(MORNING.day);
  if (!record || record.failed || MORNING.preparing) return;
  const rows = morningGames(record.games, MORNING.leagues, favorite);
  const ranked = rankMorningGames(rows, favorite, g => scoreGame({ ...g, mine: [] }, { entry: entryOf, watchTime: false }).score);
  const run = ++MORNING.run;
  MORNING.preparing = true; MORNING.queue = null; MORNING.index = 0;
  renderMorning();
  const result = await prepareMorningQueue(ranked, MORNING.budget * 60, loadRecap, p => {
    const status = $('morning-progress');
    if (status) status.textContent = `Caut rezumate ESPN: ${p.checked} din ${p.total} meciuri verificate…`;
  }, () => MORNING.run === run);
  if (!result || MORNING.run !== run) return;
  MORNING.queue = result; MORNING.preparing = false;
  renderMorning();
}
function playerHtml() {
  const q = MORNING.queue, item = q?.queue[MORNING.index];
  if (!item) return '';
  return `<div class="morning-player"><p><b>${esc(item.game.a)} – ${esc(item.game.h)}</b> · ${esc(item.game.l)} · ${MORNING.index + 1}/${q.queue.length}</p>
    <video id="morning-video" controls preload="metadata" playsinline src="${esc(item.video.mp4)}"${item.video.thumb ? ` poster="${esc(item.video.thumb)}"` : ''}></video>
    <p class="fn">${esc(item.video.title)} · ${timeText(item.video.dur)}</p>
    <p id="morning-player-status" role="status">Apasă redare. ${externalLink(item.game)}</p>
    <div class="btns"><button type="button" class="ghost" data-morning-prev${MORNING.index === 0 ? ' disabled' : ''}>‹ Anterior</button><button type="button" class="ghost" data-morning-next${MORNING.index + 1 >= q.queue.length ? ' disabled' : ''}>Următor ›</button></div></div>`;
}
function renderPlayer(play = false) {
  const slot = $('morning-player-slot');
  if (!slot) return;
  slot.innerHTML = playerHtml();
  if (play) {
    const video = $('morning-video');
    if (video) video.play().catch(() => { const status = $('morning-player-status'), game = MORNING.queue?.queue[MORNING.index]?.game; if (status && game) status.innerHTML = `Redarea automată a fost blocată. Apasă redare pe clip. ${externalLink(game)}`; });
  }
}
function queueHtml() {
  const q = MORNING.queue;
  if (!q) return '';
  const links = [...q.unavailable, ...q.errors];
  return `<div class="morning-queue-result"><p role="status"><b>${timeText(q.seconds)}</b> din ${MORNING.budget} minute alese · ${q.queue.length} ${q.queue.length === 1 ? 'rezumat' : 'rezumate'} · ${q.checked} din ${q.total} meciuri verificate${q.errors.length ? ` · ${q.errors.length} cu eroare ESPN` : ''}.</p>
    ${q.queue.length ? `<div id="morning-player-slot">${playerHtml()}</div><ol>${q.queue.map((item, i) => `<li><button type="button" class="link" data-morning-play="${i}">${esc(item.game.a)} – ${esc(item.game.h)} · ${esc(item.game.l)} · ${timeText(item.video.dur)}</button></li>`).join('')}</ol>` : '<p>Nu am găsit rezumate cu durată cunoscută care să încapă în timpul ales.</p>'}
    ${links.length ? `<details><summary>Alte meciuri · căutare YouTube (${links.length})</summary><p class="fn">Rezumatul ESPN lipsește, nu are durată cunoscută, nu încape în timpul rămas sau nu a putut fi verificat. Căutarea nu garantează un clip sau durata lui.</p><ul>${links.map(g => `<li>${esc(g.a)} – ${esc(g.h)} · ${externalLink(g)}</li>`).join('')}</ul></details>` : ''}
    <p class="fn">Duratele sunt estimări ESPN. Clipurile se cer direct de la ESPN; căutările externe se deschid pe YouTube. Redarea automată depinde de browser.</p></div>`;
}
async function load(day) {
  if (pending.has(day)) return pending.get(day);
  const task = getJSON('/api/scores?d='+day.replace(/-/g,''),15000).then(j => {
    const games = Object.values(j.leagues || {}).flat();
    if (!j.leagues) throw Error('format');
    const record = { games:keepExtra(games), errors:j.errors || [], at:Date.now() };
    cache.set(day,record); store.set('flgames-morning-cache',JSON.stringify({day,...j,savedAt:Date.now()}));
  }).catch(() => {
    let backup; try { backup=JSON.parse(store.get('flgames-morning-cache') || 'null'); } catch {}
    cache.set(day,backup?.day===day ? {games:keepExtra(Object.values(backup.leagues || {}).flat()),errors:backup.errors || [],at:backup.savedAt,offline:true} : {games:[],failed:true});
  }).finally(()=>{pending.delete(day); if (!$('morningview')?.hidden && MORNING.day===day) renderMorning();});
  pending.set(day,task); return task;
}
export function renderMorning() {
  const root=$('morningview'); if (!root || root.hidden) return;
  root.classList.toggle('morning-tv',MORNING.tv);
  const record=cache.get(MORNING.day), rows=morningGames(record?.games || [],MORNING.leagues,favorite,MORNING.priority);
  root.innerHTML=`<section class="morning-head"><p class="sub">TOATĂ NOAPTEA · NBA / NHL / NFL / MLS / MLB</p><h2>Dimineața mea</h2><p>Meciurile din toate ligile alese. Favoritele au prioritate, dar nu excludem restul echipelor.</p><div class="btns"><button type="button" class="primary" data-morning-tv aria-pressed="${MORNING.tv}">${MORNING.tv?'Ieși din Mod TV':'Mod TV / canapea'}</button><button type="button" class="ghost" data-morning-refresh>Actualizează</button></div><p class="fn">${MORNING.tv?'Săgeți: mută selecția · Enter: deschide meciul · Escape: închide meciul, apoi iese din Mod TV.':'Deschide un meci pentru pagina completă și clipurile ESPN disponibile.'} Nu toate meciurile au video; păstrăm playerul existent.</p></section>
  <div class="morning-controls"><label>Ziua meciurilor (SUA, Est)<input type="date" id="morning-day" value="${MORNING.day}" max="${easternDay(Date.now())}"></label><label><input type="checkbox" id="morning-priority"${MORNING.priority?' checked':''}> Favoritele primele</label></div><div class="btns" role="group" aria-label="Ligile dimineții">${Object.keys(LEAGUES).map(l=>`<button type="button" class="ghost" data-morning-league="${l}" aria-pressed="${MORNING.leagues.has(l)}">${l}</button>`).join('')}</div>
  <p class="fn" role="status">${!record?'Se încarcă meciurile…':record.failed?'Nu am putut încărca această zi. Folosește Actualizează pentru a reîncerca.':`${record.offline?'Date salvate, conexiunea nu răspunde':'Date ESPN'} · ${rows.length} meciuri încheiate sau în desfășurare · verificat ${new Date(record.at).toLocaleString('ro-RO')}`}</p>${record?.errors?.length?'<p class="fn">Unele ligi nu au răspuns. Lista poate fi incompletă; reîncearcă Actualizează.</p>':''}
  <section class="morning-queue"><h3>Rezumatul meu video</h3><p>Alege cât timp ai: favoritele și meciurile importante sunt prioritare. Se folosesc clasamentele curente, faza competiției și transmisiunile; se verifică doar meciurile încheiate.</p><div class="btns" role="group" aria-label="Timp disponibil">${[15,30,60].map(n=>`<button type="button" class="ghost" data-morning-budget="${n}" aria-pressed="${MORNING.budget===n}">${n} min</button>`).join('')}<button type="button" class="primary" data-morning-prepare${!record || record.failed || MORNING.preparing ? ' disabled' : ''}>Pregătește coada</button></div><p id="morning-progress" role="status">${MORNING.preparing?'Caut rezumate direct la ESPN…':''}</p>${queueHtml()}</section>
  <div class="morning-grid">${rows.map(g=>`<button type="button" class="morning-card" data-game="${esc(g.id)}"><span class="morning-kicker">${g.l} · ${g.state==='in'?'LIVE':'Meci încheiat'}${favorite(g)?' · ★ Favorită':''}</span><span class="morning-duel">${emb(g.A,'lg')}<span>${esc(g.A.name)}<small>la</small>${esc(g.H.name)}</span>${emb(g.H,'lg')}</span><span class="morning-result">${g.as ?? '–'} – ${g.hs ?? '–'}</span><span class="fn">Start: ${fmtTime.ro.format(g.d)} · ora României</span><span class="morning-open">Deschide meciul și clipurile disponibile ›</span></button>`).join('')}</div>${record&&!record.failed&&!rows.length?`<p class="empty">${MORNING.leagues.size?'Niciun meci încheiat sau în desfășurare în selecția acestei zile. Încearcă altă zi.':'Alege cel puțin o ligă.'}</p>`:''}`;
  if (!record) load(MORNING.day);
}
document.addEventListener('click',e=>{
  const tv=e.target.closest('[data-morning-tv]'), league=e.target.closest('[data-morning-league]');
  if(tv) setTV(!MORNING.tv);
  if(league){const l=league.dataset.morningLeague; MORNING.leagues.has(l)?MORNING.leagues.delete(l):MORNING.leagues.add(l);store.set('flgames-morning-leagues',JSON.stringify([...MORNING.leagues]));resetQueue();renderMorning();$('morningview').querySelector(`[data-morning-league="${l}"]`).focus();}
  if(e.target.closest('[data-morning-refresh]')){resetQueue();cache.delete(MORNING.day);renderMorning();}
  const budget=e.target.closest('[data-morning-budget]');
  if(budget){MORNING.budget=Number(budget.dataset.morningBudget);resetQueue();renderMorning();$('morningview').querySelector(`[data-morning-budget="${MORNING.budget}"]`).focus();}
  if(e.target.closest('[data-morning-prepare]')) prepareQueue().catch(error=>{console.error('morning queue:',error);MORNING.preparing=false;renderMorning();const status=$('morning-progress');if(status)status.textContent='Coada nu a putut fi pregătită. Încearcă din nou.';});
  const chosen=e.target.closest('[data-morning-play]');
  if(chosen){MORNING.index=Number(chosen.dataset.morningPlay);renderPlayer(true);}
  if(e.target.closest('[data-morning-prev]') && MORNING.index>0){MORNING.index--;renderPlayer(true);}
  if(e.target.closest('[data-morning-next]') && MORNING.index+1<MORNING.queue?.queue.length){MORNING.index++;renderPlayer(true);}
});
document.addEventListener('change',e=>{
  if(e.target.id==='morning-day'){if(validDay(e.target.value)&&e.target.value<=easternDay(Date.now())){MORNING.day=e.target.value;resetQueue();renderMorning();}}
  if(e.target.id==='morning-priority'){MORNING.priority=e.target.checked;renderMorning();$('morning-priority').focus();}
});
document.addEventListener('ended',e=>{
  if(e.target.id!=='morning-video')return;
  if(MORNING.index+1<MORNING.queue?.queue.length){MORNING.index++;renderPlayer(true);}
  else {const status=$('morning-player-status');if(status)status.textContent='Ai ajuns la finalul cozii.';}
},true);
document.addEventListener('error',e=>{
  if(e.target.id!=='morning-video')return;
  const status=$('morning-player-status'), game=MORNING.queue?.queue[MORNING.index]?.game;
  if(status && game) status.innerHTML=`Clipul nu a putut fi redat. ${externalLink(game)} sau treci la următorul.`;
},true);
document.addEventListener('keydown',e=>{
  const root=$('morningview'); if(!root||root.hidden||!MORNING.tv||!$('ov').hidden||e.defaultPrevented||e.target.closest('#ov'))return;
  if(e.key==='Escape'){setTV(false);root.querySelector('[data-morning-tv]').focus();return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||e.target.matches('input,select,textarea,video'))return;
  const cards=[...root.querySelectorAll('.morning-card')], current=e.target.closest('.morning-card');if(!cards.length)return;
  e.preventDefault(); if(!current){cards[0].focus();return;}
  const a=current.getBoundingClientRect(),cx=a.x+a.width/2,cy=a.y+a.height/2;
  const horizontal=/Left|Right/.test(e.key), positive=/Right|Down/.test(e.key);
  const best=cards.filter(c=>c!==current).map(c=>{const b=c.getBoundingClientRect(),dx=b.x+b.width/2-cx,dy=b.y+b.height/2-cy;return {c,primary:horizontal?dx:dy,cross:Math.abs(horizontal?dy:dx)};}).filter(p=>positive?p.primary>5:p.primary< -5).sort((a,b)=>(Math.abs(a.primary)+a.cross*3)-(Math.abs(b.primary)+b.cross*3))[0];
  best?.c.focus();
});
