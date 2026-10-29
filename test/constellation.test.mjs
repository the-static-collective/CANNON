import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {checkSource} from '../src/constellation/sources.mjs';
import {authorizeSimulation,checkCrossing} from '../src/constellation/crossings.mjs';

// These assertions fail if source checks ignore a transitive import, or a
// crossing treats a grant/replay/foreign receipt as permission or field proof.
function fixture(){
 const root=mkdtempSync(join(tmpdir(),'constellation-source-'));
 const git=(...a)=>execFileSync('git',['-C',root,...a],{encoding:'utf8'}).trim();
 git('init','-q');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');
 git('remote','add','origin','https://github.com/the-static-collective/fixture.git');
 mkdirSync(join(root,'src'));writeFileSync(join(root,'src/a.mjs'),'export const a=1;\n');
 writeFileSync(join(root,'src/transitive.mjs'),'export const b=2;\n');git('add','.');git('commit','-qm','fixture');
 return {root,git,source:{repository:'the-static-collective/fixture',commit:git('rev-parse','HEAD')},cleanup:()=>rmSync(root,{recursive:true,force:true})};
}
test('whole tracked tree check refuses mutated transitive donor bytes',()=>{
 const f=fixture();try{
  assert.equal(checkSource(f.source,f.root).files,2);
  writeFileSync(join(f.root,'src/transitive.mjs'),'export const b=3;\n');
  assert.throws(()=>checkSource(f.source,f.root),/SOURCE_BYTES/);
 }finally{f.cleanup()}
});
test('missing donor, invalid pin, stale checkout and forged origin fail closed; exact unmerged commit is usable',()=>{
 const f=fixture();try{
  assert.throws(()=>checkSource(f.source,join(f.root,'missing')));
  assert.throws(()=>checkSource({...f.source,commit:'main'},f.root),/PIN/);
  assert.throws(()=>checkSource({...f.source,commit:'0'.repeat(40)},f.root));
  writeFileSync(join(f.root,'src/a.mjs'),'export const a=2;\n');f.git('add','.');f.git('commit','-qm','next');
  assert.throws(()=>checkSource(f.source,f.root),/CHECKOUT_PIN/);
  f.git('checkout','--detach',f.source.commit);assert.equal(checkSource(f.source,f.root).commit,f.source.commit);
  f.git('remote','set-url','origin','https://github.com/imposter/fixture.git');
  assert.throws(()=>checkSource(f.source,f.root),/ORIGIN/);
 }finally{f.cleanup()}
});
const grant={mission:'voqal',localOnly:true,fictionalOnly:true,authorized:true,revoked:false,receiver:'HOLD'};
test('denied or revoked consent and receiver refusal prevent local simulation admission',()=>{
 assert.equal(authorizeSimulation(grant).status,'ADMIT_LOCAL_SIMULATION_ONLY');
 assert.equal(authorizeSimulation({...grant,authorized:false}).status,'HOLD');
 assert.equal(authorizeSimulation({...grant,revoked:true}).status,'REFUSE');
 assert.equal(authorizeSimulation({...grant,receiver:'REFUSE'}).status,'REFUSE');
 for(const change of [{localOnly:false},{fictionalOnly:false},{physicalClaim:true},{contact:'someone'}])assert.throws(()=>authorizeSimulation({...grant,...change}));
});
test('typed crossing preserves owner status and refuses false field/hardware/compute claims',()=>{
 const crossing={schema:'constellation.crossing/v1',owner:'the-static-collective/fixture',pin:'a'.repeat(40),contract:'fixture/v1',status:'HOLD',evidence:'SIMULATED',fieldVerified:false,physicalActs:0,externalContacts:0,hardwarePower:'UNKNOWN',computeClaim:'LOCAL_PROCESS_ONLY'};
 assert.equal(checkCrossing(crossing),crossing);
 for(const change of [{fieldVerified:true},{physicalActs:1},{hardwarePower:'MEASURED'},{computeClaim:'FREE_UNLIMITED'},{status:'VERIFIED'},{evidence:'LIVE_FIELD'}])assert.throws(()=>checkCrossing({...crossing,...change}));
});

test('output location cannot be placed inside any donor, including names beginning with two dots',async()=>{
 const {buildPacket}=await import('../src/constellation/packet.mjs');
 const f=fixture();try{
  await assert.rejects(buildPacket({source:f.root},join(f.root,'..looks-outside')),/OUTPUT_INSIDE_DONOR/);
  assert.equal(existsSync(join(f.root,'..looks-outside')),false);
 }finally{f.cleanup()}
});

test('untracked nearer package cannot execute outside the exact donor source cut',()=>{
 const f=fixture();try{
  mkdirSync(join(f.root,'src/node_modules/shadow'),{recursive:true});
  writeFileSync(join(f.root,'src/node_modules/shadow/package.json'),'{"main":"index.mjs","type":"module"}');
  writeFileSync(join(f.root,'src/node_modules/shadow/index.mjs'),'throw Error("UNPINNED_SHADOW_CODE_EXECUTED");');
  assert.throws(()=>checkSource(f.source,f.root),/UNTRACKED_RUNTIME/);
 }finally{f.cleanup()}
});
test('untracked Python modules and nested package scope changes are refused before imports',()=>{
 const f=fixture();try{
  writeFileSync(join(f.root,'src/package.json'),'{"type":"commonjs"}');
  assert.throws(()=>checkSource(f.source,f.root),/UNTRACKED_RUNTIME/);
  rmSync(join(f.root,'src/package.json'));writeFileSync(join(f.root,'injected.py'),'raise RuntimeError("not pinned")');
  assert.throws(()=>checkSource(f.source,f.root),/UNTRACKED_RUNTIME/);
 }finally{f.cleanup()}
});

test('atlas records Git tree object identities distinct from observed commit identities',async()=>{
 const {ROOT}=await import('../src/constellation/sources.mjs');
 const {readFileSync}=await import('node:fs');
 const atlas=JSON.parse(readFileSync(join(ROOT,'constellation/atlas.json')));
 assert.equal(atlas.repositories.length,89);
 for(const r of atlas.repositories){assert.match(r.tree,/^[a-f0-9]{40}$/);assert.notEqual(r.tree,r.defaultHead,r.repository)}
 assert.equal(atlas.repositories.find(r=>r.repository.endsWith('/reLATTE')).tree,'60ec4ab07f0571218958676bd0cc7e2b33264a49');
});

test('Git replace objects cannot redefine exact pinned donor bytes',()=>{
 const f=fixture();try{
  writeFileSync(join(f.root,'src/a.mjs'),'throw Error("GIT_REPLACE_UNPINNED_CODE_EXECUTED");\n');f.git('add','.');
  const tree=f.git('write-tree'),replacement=f.git('commit-tree',tree,'-m','replacement');
  f.git('replace',f.source.commit,replacement);
  assert.equal(f.git('rev-parse','HEAD'),f.source.commit);
  assert.throws(()=>checkSource(f.source,f.root),/SOURCE_BYTES/);
 }finally{f.cleanup()}
});
