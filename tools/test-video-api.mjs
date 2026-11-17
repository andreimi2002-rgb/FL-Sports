import assert from 'node:assert/strict';
import handler from '../netlify/functions/videos.mjs';
const r=await handler(new Request('https://test/api/videos?l=NBA'));assert.equal(r.status,200);const j=await r.json();assert.ok(j.videos.length);assert.ok(j.videos.every(v=>v.l==='NBA'));assert.equal((await handler(new Request('https://test/api/videos?l=BAD'))).status,400);assert.equal((await handler(new Request('https://test/api/videos',{method:'POST'}))).status,405);console.log('Video API: seed, league filtering, invalid league and read-only endpoint OK');
