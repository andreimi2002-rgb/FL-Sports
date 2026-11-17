import assert from 'node:assert/strict';
import {previousDay,easternDay,validDay,morningGames} from '../js/morning-model.js';
assert.equal(previousDay('2026-01-01'),'2025-12-31');assert.equal(previousDay('2024-03-01'),'2024-02-29');assert.equal(easternDay('2026-11-17T02:00:00Z'),'2026-11-16');assert.equal(validDay('2026-02-30'),false);
const games=[{id:'1',l:'NBA',state:'post',d:new Date(1)},{id:'2',l:'NFL',state:'post',d:new Date(2)},{id:'3',l:'NBA',state:'pre',d:new Date(3)},{id:'4',l:'NHL',state:'in',d:new Date(4)}];
const chosen=new Set(['NBA','NFL','NHL']),fav=g=>g.id==='2';assert.deepEqual(morningGames(games,chosen,fav).map(g=>g.id),['2','1','4']);assert.deepEqual(morningGames(games,chosen,fav,false).map(g=>g.id),['1','2','4']);assert.equal(morningGames(games,new Set(),fav).length,0);assert.equal(games[0].id,'1');console.log('Morning: US date boundary, leap days, favorite priority preserves other teams, leagues and live/finished selection OK');
