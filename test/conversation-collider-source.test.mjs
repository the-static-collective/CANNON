import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {evaluateSourceMap,coldVerifySourceMap,validateSourceMap,PLAN_SCHEMA} from '../scripts/conversation-collider-source.mjs';
const git=(dir,...args)=>execFileSync('git',['-C',dir,...args],{encoding:'utf8'}).trim();
const contract={type:'object',additionalProperties:false,required:['schema','payload_refs'],
 properties:{schema:{const:'relatte.crossing-envelope/v0'},payload_refs:{type:'array',items:{
 type:'object',additionalProperties:false,required:['address','role'],
 properties:{address:{type:'string'},role:{type:'string'}}}}}};
const crossing={schema:'relatte.crossing-envelope/v0',payload_refs:[{address:'sha256:abc',role:'test'}]};
function fixture(){
 const home=mkdtempSync(join(tmpdir(),'cannon-collider-source-'));const roots={};
 const entries=[
  {repo:'lab/alpha',id:'external',role:'INSTANCE',file:'input.json',value:{...crossing,payload_refs:[{...crossing.payload_refs[0],byte_length:22}]}},
  {repo:'lab/beta',id:'contract',role:'JSON_SCHEMA_CONTRACT',file:'contract.json',value:contract},
  {repo:'lab/beta',id:'native',role:'INSTANCE',file:'native.json',value:crossing},
  {repo:'lab/gamma',id:'unrelated',role:'INSTANCE',file:'other.json',value:{schema:'unrelated.payload/v3',data:12}}
 ];
 for(const repo of [...new Set(entries.map(e=>e.repo))]){
  const dir=join(home,repo.split('/')[1]);mkdirSync(dir);
  git(dir,'init','-q');git(dir,'config','user.email','test@example.invalid');
  git(dir,'config','user.name','Cannon collider lab');
  git(dir,'remote','add','origin','https://github.com/'+repo+'.git');
  for(const item of entries.filter(e=>e.repo===repo))writeFileSync(join(dir,item.file),JSON.stringify(item.value,null,2)+'\n');
  git(dir,'add','.');git(dir,'commit','-qm','original');
  roots[repo]=dir;
 }
 const plan={schema:PLAN_SCHEMA,sources:entries.map(e=>({
  id:e.id,role:e.role,repository:e.repo,commit:git(roots[e.repo],'rev-parse','HEAD'),path:e.file
 }))};
 return {home,roots,plan,cleanup:()=>rmSync(home,{recursive:true,force:true})};
}
function lab(fn){const x=fixture();try{fn(x);}finally{x.cleanup();}}
const changed=(v,f)=>{const obj=structuredClone(v);f(obj);return obj;};
test('discovers source-declared identity, actual mismatch, and exact baseline',()=>lab(f=>{
 const r=evaluateSourceMap(f.plan,f.roots);
 assert.equal(r.candidates.length,2);
 assert.deepEqual(r.candidates.map(x=>[x.instance,x.structural_status]),[
  ['external','INCOMPATIBLE'],['native','STRUCTURALLY_COMPATIBLE']
 ]);
 assert.deepEqual(r.candidates[0].violations.map(v=>v.path),['/payload_refs/0/byte_length']);
 assert.equal(r.candidates[0].source_relationship,'CROSS_REPOSITORY');
 assert.equal(r.candidates[1].source_relationship,'SAME_REPOSITORY_BASELINE');
 assert.deepEqual(r.unmatched,[{id:'unrelated',status:'GIT_OBJECT_VERIFIED'}]);
 assert.ok(r.sources.every(s=>s.status==='GIT_OBJECT_VERIFIED'&&s.witness.blob_sha256.startsWith('sha256:')));
 assert.equal(r.authority,'PROPOSAL_ONLY_NO_EXECUTION');
 assert.equal(r.receiver_admitted,false);
 assert.equal(r.git_mutations,0);
}));
test('cold replay exactly matches independently read Git objects',()=>lab(f=>{
 const r=evaluateSourceMap(f.plan,f.roots);
 assert.equal(coldVerifySourceMap(f.plan,f.roots,r).status,'PINNED_SOURCE_COLLIDER_COLD_REPLAY_VERIFIED');
 assert.throws(()=>coldVerifySourceMap(f.plan,f.roots,{...r,receiver_admitted:true}),/COLD_SOURCE_REPLAY_MISMATCH/);
}));
test('moving a branch never retargets the immutable source',()=>lab(f=>{
 const before=evaluateSourceMap(f.plan,f.roots);
 const dir=f.roots['lab/alpha'];
 writeFileSync(join(dir,'input.json'),JSON.stringify(crossing));
 git(dir,'add','.');git(dir,'commit','-qm','moving head must not alter observation');
 assert.deepEqual(evaluateSourceMap(f.plan,f.roots),before);
}));
test('absent or unverified original source is HOLD and no candidate for it',()=>lab(f=>{
 const p=changed(f.plan,x=>x.sources[0].commit='f'.repeat(40));
 const r=evaluateSourceMap(p,f.roots);
 assert.equal(r.sources.find(x=>x.id==='external').status,'HOLD');
 assert.deepEqual(r.candidates.map(x=>x.instance),['native']);
 assert.ok(r.unmatched.some(x=>x.id==='external'&&x.status==='HOLD'));
}));
test('falsified origin configuration refuses verification',()=>lab(f=>{
 git(f.roots['lab/alpha'],'remote','set-url','origin','https://github.com/other/wrong.git');
 const r=evaluateSourceMap(f.plan,f.roots);
 assert.equal(r.sources.find(x=>x.id==='external').status,'HOLD');
 assert.equal(r.candidates.length,1);
}));
test('unsupported schema syntax must HOLD rather than fake match',()=>lab(f=>{
 const dir=f.roots['lab/beta'];writeFileSync(join(dir,'contract2.json'),
  JSON.stringify({...contract,allOf:[]}));
 git(dir,'add','.');git(dir,'commit','-qm','unsupported schema');
 const p=changed(f.plan,x=>{x.sources[1].path='contract2.json';x.sources[1].commit=git(dir,'rev-parse','HEAD');});
 const r=evaluateSourceMap(p,f.roots);
 assert.equal(r.sources.find(x=>x.id==='contract').status,'HOLD');
 assert.equal(r.candidates.length,0);
}));
test('source schema identity changes break the proposed edge',()=>lab(f=>{
 const dir=f.roots['lab/alpha'];writeFileSync(join(dir,'unmatched.json'),JSON.stringify({...crossing,schema:'another.proto/v1'}));
 git(dir,'add','.');git(dir,'commit','-qm','different identity');
 const p=changed(f.plan,x=>{x.sources[0].path='unmatched.json';x.sources[0].commit=git(dir,'rev-parse','HEAD');});
 const r=evaluateSourceMap(p,f.roots);
 assert.equal(r.candidates.length,1);assert.equal(r.candidates[0].instance,'native');
 assert.ok(r.unmatched.some(x=>x.id==='external'));
}));
test('root manifest does not authorize directory traversal',()=>lab(f=>{
 const p=changed(f.plan,x=>x.sources[0].path='../private.json');
 assert.throws(()=>validateSourceMap(p),/SOURCE_PIN_INVALID/);
}));
test('untrusted authority and conversation-content fields are rejected',()=>lab(f=>{
 for(const field of ['authority','transcript','chat_history','admit']){
  const p=changed(f.plan,x=>x.sources[0][field]=true);
  assert.throws(()=>validateSourceMap(p),/SOURCE_FIELDS_INVALID/);
 }
}));
test('duplicate IDs, invalid source roles, moving branch names, and missing contract roles are refused',()=>lab(f=>{
 const edits=[
  p=>p.sources[2].id=p.sources[0].id,
  p=>p.sources[0].role='EXECUTE',
  p=>p.sources[0].commit='main',
  p=>p.sources[1].role='INSTANCE'
 ];
 for(const e of edits){
  const p=changed(f.plan,e);assert.throws(()=>validateSourceMap(p));
 }
}));
test('ordering of inspection roles does not change candidate content',()=>lab(f=>{
 const r=evaluateSourceMap(f.plan,f.roots);
 const other=changed(f.plan,p=>p.sources.reverse());
 const r2=evaluateSourceMap(other,f.roots);
 assert.deepEqual(r.candidates,r2.candidates);
 assert.deepEqual(r.sources,r2.sources);
 assert.notEqual(r.plan_sha256,r2.plan_sha256); // plans have different sequences: distinct source-manifest claim
}));
test('report cannot silently import a private source from a missing checkout',()=>lab(f=>{
 const roots=changed(f.roots,x=>delete x['lab/alpha']);
 const r=evaluateSourceMap(f.plan,roots);
 assert.equal(r.candidates.length,1);
 assert.equal(r.sources.find(x=>x.id==='external').status,'HOLD');
}));
