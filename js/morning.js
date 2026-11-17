import { $, esc, emb } from './ui.js';
import { LEAGUES } from './teams.js';
import { SPOIL, store, getJSON, keepExtra, mineOf, fmtTime } from './core.js';
import { easternDay, previousDay, validDay, morningGames } from './morning-model.js';
const cache = new Map(), pending = new Map();
const ratings = new Map(); let analyzing = false, byExcitement = false;
const ratingKey = g => g.l+'/'+g.id;
const ratingLabel = g => {
 const r=ratings.get(ratingKey(g));
 if(r?.value != null)return 'Spectacol · '+r.value+'/100';
 if(g.state!=='post')return 'Indice după încheiere';
 if(!['NBA','NFL'].includes(g.l))return 'Spectacol · date neconfirmate pentru această ligă';
 return r ? 'Spectacol · date insuficiente' : 'Spectacol · neanalizat';
};
async function analyze() {
 if(analyzing)return;
 const day=MORNING.day, record=cache.get(day);if(!record?.games)return;
 const candidates=morningGames(record.games,MORNING.leagues,favorite,false).filter(g=>['NBA','NFL'].includes(g.l)&&g.state==='post'&&!ratings.has(ratingKey(g))).slice(0,20);
 analyzing=true;byExcitement=true;renderMorning();
 await Promise.all(Array.from({length:3},async()=>{while(candidates.length && MORNING.day===day && !$('morningview')?.hidden){const g=candidates.shift();try{const j=await getJSON('/api/game?l='+g.l+'&id='+encodeURIComponent(g.id),10000);ratings.set(ratingKey(g),j.excitement || {value:null});}catch{ /* no permanent failure cache: button allows a later retry */ }}}));
 analyzing=false;if(!$('morningview')?.hidden)renderMorning();
}
const savedLeagues = (() => { try { const a=JSON.parse(store.get('flgames-morning-leagues')); return Array.isArray(a) ? a.filter(l=>LEAGUES[l]) : null; } catch { return null; } })();
export const MORNING = { day: previousDay(easternDay(Date.now())), leagues: new Set(savedLeagues || Object.keys(LEAGUES)), priority: true, tv: false };
const favorite = g => mineOf(g).length > 0;
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
  if(byExcitement)rows.sort((a,b)=>(ratings.get(ratingKey(b))?.value ?? -1)-(ratings.get(ratingKey(a))?.value ?? -1));
  root.innerHTML=`<section class="morning-head"><p class="sub">TOATĂ NOAPTEA · NBA / NHL / NFL / MLS / MLB</p><h2>Dimineața mea</h2><p>Meciurile din toate ligile alese. Favoritele au prioritate, dar nu excludem restul echipelor.</p><div class="btns"><button type="button" class="primary" data-morning-tv aria-pressed="${MORNING.tv}">${MORNING.tv?'Ieși din Mod TV':'Mod TV / canapea'}</button><button type="button" class="ghost" data-morning-refresh>Actualizează</button></div><p class="fn">${MORNING.tv?'Săgeți: mută selecția · Enter: deschide meciul · Escape: închide meciul, apoi iese din Mod TV.':'Deschide un meci pentru pagina completă și clipurile ESPN disponibile.'} Nu toate meciurile au video; păstrăm playerul existent.</p></section>
  <div class="morning-controls"><label>Ziua meciurilor (SUA, Est)<input type="date" id="morning-day" value="${MORNING.day}" max="${easternDay(Date.now())}"></label><label><input type="checkbox" id="morning-priority"${MORNING.priority?' checked':''}> Favoritele primele</label></div><div class="btns" role="group" aria-label="Ligile dimineții">${Object.keys(LEAGUES).map(l=>`<button type="button" class="ghost" data-morning-league="${l}" aria-pressed="${MORNING.leagues.has(l)}">${l}</button>`).join('')}</div>
  <p class="fn" role="status">${!record?'Se încarcă meciurile…':record.failed?'Nu am putut încărca această zi. Folosește Actualizează pentru a reîncerca.':`${record.offline?'Date salvate, conexiunea nu răspunde':'Date ESPN'} · ${rows.length} meciuri încheiate sau în desfășurare · verificat ${new Date(record.at).toLocaleString('ro-RO')}`}</p>${record?.errors?.length?'<p class="fn">Unele ligi nu au răspuns. Lista poate fi incompletă; reîncearcă Actualizează.</p>':''}
  <div class="btns"><button type="button" class="ghost" data-morning-analyze ${analyzing?'disabled':''}>${analyzing?'Se analizează…':'Analizează spectacolul (NBA/NFL)'}</button><label><input type="checkbox" id="morning-excitement"${byExcitement?' checked':''}> Ordine după indice</label></div><details class="morning-method"><summary>Cum calculăm indicele?</summary><p>Scor experimental, nu garanția unui meci bun. Folosim toate punctele de probabilitate furnizate de ESPN, înainte de simplificarea graficului: echilibru, tensiune în ultimele 20% din evenimente și oscilații. NBA: 45/30/25%; NFL: 30/40/30%. Este o măsurare pe evenimente, nu pe minute.</p><p>Doar meciuri încheiate, minimum 40 de puncte NBA / 20 NFL și probabilitate terminală aproape de 0 sau 1. Asta nu garantează că ESPN a furnizat fiecare fază. Pentru celelalte ligi, acoperirea este neconfirmată. La cerere analizăm cel mult 20 de meciuri noi din selecție; poți apăsa din nou pentru restul. Ordinea după indice are prioritate față de favorite. Indicele nu exprimă calitatea clipului sau disponibilitatea video.</p></details>
  <div class="morning-grid">${rows.map(g=>`<button type="button" class="morning-card" data-game="${esc(g.id)}"><span class="morning-kicker">${g.l} · ${g.state==='in'?'LIVE':'Meci încheiat'}${favorite(g)?' · ★ Favorită':''}</span><span class="morning-duel">${emb(g.A,'lg')}<span>${esc(g.A.name)}<small>la</small>${esc(g.H.name)}</span>${emb(g.H,'lg')}</span><span class="morning-index">${ratingLabel(g)}</span><span class="morning-result">${SPOIL.on?'Rezultat ascuns':`${g.as ?? '–'} – ${g.hs ?? '–'}`}</span><span class="fn">Start: ${fmtTime.ro.format(g.d)} · ora României</span><span class="morning-open">Deschide meciul și clipurile disponibile ›</span></button>`).join('')}</div>${record&&!record.failed&&!rows.length?`<p class="empty">${MORNING.leagues.size?'Niciun meci încheiat sau în desfășurare în selecția acestei zile. Încearcă altă zi.':'Alege cel puțin o ligă.'}</p>`:''}`;
  if (!record) load(MORNING.day);
}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-morning-analyze]')){analyze();return;}
  const tv=e.target.closest('[data-morning-tv]'), league=e.target.closest('[data-morning-league]');
  if(tv){MORNING.tv=!MORNING.tv;renderMorning();$('morningview').querySelector('[data-morning-tv]').focus();}
  if(league){const l=league.dataset.morningLeague; MORNING.leagues.has(l)?MORNING.leagues.delete(l):MORNING.leagues.add(l);store.set('flgames-morning-leagues',JSON.stringify([...MORNING.leagues]));renderMorning();$('morningview').querySelector(`[data-morning-league="${l}"]`).focus();}
  if(e.target.closest('[data-morning-refresh]')){cache.delete(MORNING.day);renderMorning();}
});
document.addEventListener('change',e=>{
  if(e.target.id==='morning-excitement'){byExcitement=e.target.checked;renderMorning();$('morning-excitement').focus();}
  if(e.target.id==='morning-day'){if(validDay(e.target.value)&&e.target.value<=easternDay(Date.now())){MORNING.day=e.target.value;renderMorning();}}
  if(e.target.id==='morning-priority'){MORNING.priority=e.target.checked;renderMorning();$('morning-priority').focus();}
});
document.addEventListener('keydown',e=>{
  const root=$('morningview'); if(!root||root.hidden||!MORNING.tv||!$('ov').hidden||e.defaultPrevented||e.target.closest('#ov'))return;
  if(e.key==='Escape'){MORNING.tv=false;renderMorning();root.querySelector('[data-morning-tv]').focus();return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||e.target.matches('input,select,textarea'))return;
  const cards=[...root.querySelectorAll('.morning-card')], current=e.target.closest('.morning-card');if(!cards.length)return;
  e.preventDefault(); if(!current){cards[0].focus();return;}
  const a=current.getBoundingClientRect(),cx=a.x+a.width/2,cy=a.y+a.height/2;
  const horizontal=/Left|Right/.test(e.key), positive=/Right|Down/.test(e.key);
  const best=cards.filter(c=>c!==current).map(c=>{const b=c.getBoundingClientRect(),dx=b.x+b.width/2-cx,dy=b.y+b.height/2-cy;return {c,primary:horizontal?dx:dy,cross:Math.abs(horizontal?dy:dx)};}).filter(p=>positive?p.primary>5:p.primary< -5).sort((a,b)=>(Math.abs(a.primary)+a.cross*3)-(Math.abs(b.primary)+b.cross*3))[0];
  best?.c.focus();
});
