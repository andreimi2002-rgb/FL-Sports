import assert from 'node:assert/strict';
import {excitementIndex as score}from '../netlify/lib/excitement.mjs';
const series=p=>p.map(homeWinPercentage=>({homeWinPercentage}));
const calm=series([...Array(99).fill(.98),1]);const tight=series([...Array(99).fill(.5),1]);const wild=series([...Array.from({length:99},(_,i)=>i%2?.7:.3),1]);
assert.ok(score(wild,'NBA','post').value>score(calm,'NBA','post').value);assert.ok(score(tight,'NBA','post').value>score(calm,'NBA','post').value);
for(const l of ['NBA','NFL'])for(const a of [calm,tight,wild]){const v=score(a,l,'post').value;assert.ok(v>=0&&v<=100)}
assert.equal(score(wild,'NHL','post').reason,'unsupported');assert.equal(score(wild,'NFL','in').reason,'unfinished');assert.equal(score(series(Array(100).fill(.5)),'NBA','post').reason,'incomplete');assert.equal(score([{homeWinPercentage:null}],'NBA','post').value,null);assert.equal(score(series([0,1]),'NBA','post').value,null);
assert.notEqual(score(wild,'NBA','post').value,score(wild,'NFL','post').value);assert.equal(score(wild,'NBA','post').points,100);assert.doesNotMatch(JSON.stringify(score(wild,'NBA','post')),/winner|home|away|overtime/);
console.log('Excitement: sport weights, raw points, bounds, unknown/invalid/live/incomplete states and neutral result OK');
import {normalizeSummary} from '../netlify/lib/espn.mjs';
const raw={header:{competitions:[{status:{type:{state:'post'}}}]},winprobability:series([...Array.from({length:800},(_,i)=>i%2?.8:.2),1])};
const normalized=normalizeSummary(raw,'NBA');assert.equal(normalized.excitement.points,801);assert.ok(normalized.wp.length<801);assert.equal(normalized.excitement.value,score(raw.winprobability,'NBA','post').value);
assert.equal(score(wild,'NBA','post').value,score(wild.map(x=>({homeWinPercentage:1-x.homeWinPercentage})),'NBA','post').value);
