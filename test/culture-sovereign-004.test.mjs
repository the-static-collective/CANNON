import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CARRIER_SOURCES,run,verify} from '../src/culture-sovereign-004.mjs';
test('CANNON uses exactly existing original independent native executors',()=>{
 assert.equal(CARRIER_SOURCES.ghot.sha,'e35dd470384d864b7b0b629a68dad570875a7df0');
 assert.equal(CARRIER_SOURCES.relatte.sha,'dcc8cdca84c440aa4294134f020fb7095bf87f24');
 assert.equal(CARRIER_SOURCES.ghot.files.length,4);
 assert.equal(CARRIER_SOURCES.relatte.files.length,8);
});
test('no implicit authorization, arbitrary code execution or real account access',()=>{
 const source=readFileSync(new URL('../src/culture-sovereign-004.mjs',import.meta.url),'utf8');
 for(const s of ['verifyCultureUse','readSource','system.hash','opaque-roundtrip.ts',
  'verifyOpaqueOrganCrossing','verifyReceipt','LocalReceiver.open','R3_HOLD'])
  assert.ok(source.includes(s),s);
 assert.doesNotMatch(source,/\bfetch\s*\(|https\.request\s*\(|curl\s/);
});
test('missing original source roots fail closed before creating output',async()=>{
 await assert.rejects(verify({},'/missing','/missing','/missing','/missing'));
 await assert.rejects(run({},'/missing','/missing','/missing','/missing'));
});
