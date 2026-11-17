import assert from 'node:assert/strict';
globalThis.window=new EventTarget();globalThis.document=new EventTarget();const m=new Map();globalThis.localStorage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};globalThis.location={search:''};
const {gameVideosHtml}=await import('../js/videos.js');
const g={id:'123',l:'NBA',state:'post',d:new Date('2026-11-17T00:00:00Z'),H:{name:'Miami Heat'},A:{name:'Boston Celtics'}};
const html=gameVideosHtml(g,{recap:false,videos:[{title:'Random short',mp4:'https://a.espncdn.com/a.mp4'}]});assert.match(html,/Rezumatul meciului/);assert.doesNotMatch(html,/Game Night|Random short|data-video-save|data-video-filter/);assert.match(html,/search_query=.*Miami/);
const recap=gameVideosHtml(g,{recap:true,videos:[{title:'Official recap',mp4:'https://a.espncdn.com/a.mp4'}]});assert.match(recap,/Official recap/);assert.doesNotMatch(recap,/<iframe|<video/);console.log('Per-game recaps: no library, no unrelated clips, explicit search and click-to-load ESPN OK');
