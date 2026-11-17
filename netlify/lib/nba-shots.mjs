// ESPN coordinates: feet relative to the attacking basket (x=25,y=0).
export function nbaShots(j){
 const names=new Map(),official=[];for(const t of j.boxscore?.players||[]){for(const g of t.statistics||[])for(const a of g.athletes||[])names.set(String(a.athlete?.id),a.athlete?.displayName||'Jucător');const g=t.statistics?.[0],i=g?.keys?.indexOf('fieldGoalsMade-fieldGoalsAttempted');const val=i>=0?g.totals?.[i]:null;const m=/^(\d+)-(\d+)$/.exec(val||'');if(m)official.push({team:String(t.team.id),made:+m[1],attempts:+m[2]});}
 const shots=[],seen=new Set();let missing=0,total=0;
 for(const p of j.plays||[]){if(!p.shootingPlay||![2,3].includes(p.pointsAttempted)||/free throw|overturned|no shot|nullified/i.test(p.type?.text||''))continue;const id=String(p.id||'');if(!id||seen.has(id))continue;seen.add(id);total++;
 const x=p.coordinate?.x,y=p.coordinate?.y;if(typeof x!=='number'||typeof y!=='number'||!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>50||y< -5.25||y>88.75){missing++;continue;}
 const player=String(p.participants?.[0]?.athlete?.id||'');shots.push({id,x,y,team:String(p.team?.id||''),player,name:names.get(player)||'Jucător',made:p.scoringPlay===true,points:p.pointsAttempted,period:p.period?.number||null,clock:p.clock?.displayValue||''});}
 const mismatch=official.some(o=>{const a=shots.filter(s=>s.team===o.team);return a.length!==o.attempts||a.filter(s=>s.made).length!==o.made});return {shots,total,missing,official,mismatch};
}
export function shotTotals(shots){const made=shots.filter(s=>s.made).length,threes=shots.filter(s=>s.made&&s.points===3).length;return {made,attempts:shots.length,fg:shots.length?100*made/shots.length:null,efg:shots.length?100*(made+.5*threes)/shots.length:null};}
