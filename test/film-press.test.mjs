import test from 'node:test';import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
const base=new URL('../creative/',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,base)));
test('all five owners pin explicit commits',()=>{
 const data=read('film-press-sources.json');assert.equal(Object.keys(data.owners).length,5);
 for(const owner of Object.values(data.owners)){assert.match(owner.commit,/^[a-f0-9]{40}$/);assert.match(owner.repo,/^the-static-collective\//)}
 assert.equal(data.authority,'EXPERIMENT_HOLD_NO_MASTERS_NO_RELEASE');
});
test('no song/audio authority is fabricated from test timing',()=>{
 const track=read('film-press-synthetic-track.json');
 assert.equal(track.source,'synthetic://silent-timing-test');
 assert.equal(track.duration,3);
 assert.equal(track.gates[0].at,0);
 assert.ok(track.gates.some(x=>x.kind==='chorus'));
});
test('lyrics and awakenings cannot invent a licensed song',()=>{
 const x=read('film-press-synthetic-lyrics.json'),world=read('film-press-synthetic-world.json');
 assert.equal(x.schema,'full-measure.lyrics.v1');
 assert.ok(x.cues.every(c=>c.text.includes('NOT')||c.text.includes('TEST')));
 assert.equal(world.awakening,'proposal-only');
});
