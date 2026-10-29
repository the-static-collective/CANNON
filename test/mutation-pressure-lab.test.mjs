import test from 'node:test';
import assert from 'node:assert/strict';
import {registryCheck,branchInput,summarize,run} from '../scripts/mutation-pressure-lab.mjs';

test('seven fixed pressures and a baseline',()=>{
 const r=registryCheck();
 assert.equal(r.methods.length,7);
 assert.equal(r.totalRuns,8);
 assert.equal(r.maxModelRequests,72);
 assert.equal(r.boundaries.promoteAutomatically,false);
 assert.equal(r.boundaries.scoresAreNotSemanticQuality,true);
 const changed=structuredClone(r);
 changed.boundaries.promoteAutomatically=true;
 assert.throws(()=>registryCheck(changed),/NO_AUTHORITY/);
});
test('branch mutations retain original braid and add traceable pressure',()=>{
 const x={schema:'iron-lung/triple-transfer-input/v1',
 rawText:'Connect two original software artifacts through a typed adapter.',
 sourceRefs:['synthetic:source'],
 braid:{schema:'iron-lung/braid/v0.1',id:'B0'}};
 const before=JSON.stringify(x);
 const variants=registryCheck().methods.map(m=>branchInput(x,m));
 assert.equal(new Set(variants.map(v=>v.rawText)).size,7);
 assert.ok(variants.every(v=>JSON.stringify(v.braid)===JSON.stringify(x.braid)));
 assert.ok(variants.every(v=>v.sourceRefs.length===2));
 assert.equal(JSON.stringify(x),before);
});
test('reports indicate proxies only and no automatic winner',()=>{
 const rows=['BASELINE',...registryCheck().methods.map(m=>m.id)].map(id=>({
 id,fieldSha256:'a'.repeat(64),sourceSha256:'b'.repeat(64),
 mode:'test',provider:{kind:'deterministic-fixture'},
 proxies:{distinctTextCount:3,exactRepeatCount:6,sourceEchoCount:1,
 lowInformationCount:2,literalCapabilityMatches:0}
 }));
 const r=summarize('c'.repeat(64),{commit:'source-only'},rows);
 assert.equal(r.totalBranches,8);
 assert.equal(r.totalNativeExecutions,0);
 assert.equal(r.modelAddedCapabilities,0);
 assert.equal(r.improvesAnyLexicalProxyCount,0);
 assert.equal(r.noAutoWinner,true);
 assert.equal(r.noSemanticQualityClaim,true);
});
test('CLI requires explicit local-only authorization',()=>{
 assert.equal(run(['list']).modes.length,8);
 assert.throws(()=>run(['list','--authorize','SYNTHETIC_TEST_ONLY']),/LIST_READ_ONLY/);
 assert.throws(()=>run(['build','--lung','/tmp']),/REQUIRED_/);
 assert.throws(()=>run(['build','--lung','/tmp','--provider','fixture',
 '--source','x','--out','y']),/AUTHORIZATION/);
});
