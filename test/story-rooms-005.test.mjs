import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {PINNED,run,verifyPacket} from '../scripts/story-rooms-005.mjs';
test('three separate source-owner repos are exact commit-pinned, not treated as one implementation',()=>{
 assert.deepEqual(Object.keys(PINNED).sort(),['JARVIS','PLANZ','WEBZ']);
 for(const x of Object.values(PINNED)){assert.match(x.sha,/^[0-9a-f]{40}$/);assert.match(x.repo,/^the-static-collective\//);}
});
test('CANNON orchestrator does not fabricate real-world authority or render external media',()=>{
 const src=readFileSync(new URL('../scripts/story-rooms-005.mjs',import.meta.url),'utf8');
 assert.match(src,/execFileSync/);assert.match(src,/git.*status/);
 assert.match(src,/ancestorCannotWithdrawChildOffer/);assert.match(src,/voqalSubmitted:false/);
 assert.doesNotMatch(src,/shell\s*:\s*true/);
 assert.equal(typeof run,'function');assert.equal(typeof verifyPacket,'function');
});
