import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {validateForgePlan,forge,emit,coldVerify} from '../src/adapter-forge.mjs';
const git=(dir,...a)=>execFileSync('git',['-C',dir,...a],{encoding:'utf8'}).trim();
const envelope={schema:'relatte.crossing-envelope/v0',crossing_id:'signed-old-identity',
 signing:{algorithm:'TEST_ONLY',signature:'original-archived'},payload_refs:[
  {address:'sha256:source',role:'payload',media_type:'image/jpeg',byte_length:670478}]};
const schema={
 type:'object',additionalProperties:false,
 required:['schema','crossing_id','signing','payload_refs'],
 properties:{
  schema:{const:'relatte.crossing-envelope/v0'},
  crossing_id:{type:'string',minLength:8},
  signing:{type:'object'},
  payload_refs:{type:'array',items:{type:'object',additionalProperties:false,
   required:['address','role'],properties:{
    address:{type:'string'},role:{type:'string'},media_type:{type:'string'}
   }}}
 }
};
function fixture(){
 const home=mkdtempSync(join(tmpdir(),'cannon005-'));
 const roots={},sources=[];
 const entries=[['lab/source','crossing',envelope],['lab/contract','schema',schema]];
 for(const [repo,name,value] of entries){
  const dir=join(home,name);mkdirSync(dir);git(dir,'init','-q');
  git(dir,'config','user.email','test@example.invalid');git(dir,'config','user.name','CANNON lab');
  git(dir,'remote','add','origin','https://github.com/'+repo+'.git');
  writeFileSync(join(dir,name+'.json'),JSON.stringify(value,null,2)+'\n');
  git(dir,'add','.');git(dir,'commit','-qm','pinned source');
  roots[repo]=dir;
  sources.push({id:name,repository:repo,commit:git(dir,'rev-parse','HEAD'),path:name+'.json',media_type:'application/json'});
 }
 const plan={schema:'cannon.adapter-forge-plan/v0',goal:'translate only data with sidecar and no authority',
 sources,adapter:{id:'fixture-adapter',instance:'crossing',contract:'schema',mode:'PROPOSAL_ONLY',
 rules:[{id:'archive-unknown-size',op:'EXTERNALIZE_FIELD',pointer:'/payload_refs/*/byte_length',
 accepted_type:'safe_nonnegative_integer',disposition:'PRESERVE_IN_SIDECAR',
 rationale:'Retain the original field in an independent loss-accounting sidecar.'}]}};
 return {home,roots,plan,cleanup:()=>rmSync(home,{recursive:true,force:true})};
}
const inFixture=fn=>{const f=fixture();try{fn(f);}finally{f.cleanup();}};
test('forges a source-derived unsigned proposal; does not counterfeit a new signature',()=>inFixture(f=>{
 const {proposal,ledger,receipt}=forge(f.plan,f.roots);
 assert.equal(proposal.status,'HOLD_REISSUE_REQUIRED');
 assert.equal(proposal.signature_inherited,false);
 assert.equal(proposal.reLATTE_crossing_created,false);
 assert.equal(proposal.original_signed_object_modified,false);
 assert.equal(proposal.original_compatibility.status,'INCOMPATIBLE');
 assert.equal(proposal.transformed_compatibility.status,'INCOMPATIBLE');
 assert.deepEqual(proposal.transformed_compatibility.violations.map(v=>v.path).sort(),['/crossing_id','/signing']);
 assert.equal(Object.hasOwn(proposal.preview,'crossing_id'),false);
 assert.equal(Object.hasOwn(proposal.preview,'signing'),false);
 assert.equal(Object.hasOwn(proposal.preview.payload_refs[0],'byte_length'),false);
 assert.deepEqual(ledger.entries.map(e=>[e.pointer,e.value]),[['/payload_refs/0/byte_length',670478]]);
 assert.equal(receipt.externalized_entries,1);
 assert.equal(receipt.execution_authority,'NONE');
}));
test('source objects retain original committed bytes, including original signature',()=>inFixture(f=>{
 const before=readFileSync(join(f.roots['lab/source'],'crossing.json'));
 forge(f.plan,f.roots);
 const after=readFileSync(join(f.roots['lab/source'],'crossing.json'));
 assert.ok(before.equals(after));
 assert.equal(JSON.parse(after).signing.signature,'original-archived');
}));
test('fresh process equivalent cold replay and content-addressed receipt',()=>inFixture(f=>{
 const out=join(f.home,'candidate');
 const r=emit(f.plan,f.roots,out);
 assert.ok(r.receipt_id.startsWith('sha256:'));
 assert.equal(coldVerify(f.plan,f.roots,out).status,'ADAPTER_PROPOSAL_COLD_REPLAY_VERIFIED');
 assert.throws(()=>emit(f.plan,f.roots,out),/OUTPUT_ALREADY_EXISTS/);
}));
test('tampering with proposal sidecar or receipt fails cold verification',()=>inFixture(f=>{
 for(const target of ['proposal.json','sidecar.json','receipt.json']){
  const out=join(f.home,'out-'+target.replace('.json',''));emit(f.plan,f.roots,out);
  const path=join(out,target),data=JSON.parse(readFileSync(path));
  data.corrupted=true;writeFileSync(path,JSON.stringify(data));
  assert.throws(()=>coldVerify(f.plan,f.roots,out),/COLD_REPLAY_MISMATCH/);
 }
}));
test('unverified source identity yields HOLD and cannot build',()=>inFixture(f=>{
 const plan=structuredClone(f.plan);plan.sources[0].commit='a'.repeat(40);
 const result=forge(plan,f.roots);
 assert.equal(result.proposal.status,'HOLD');
 assert.equal(result.proposal.preview,null);
 assert.equal(result.proposal.sources.crossing.status,'HOLD');
 assert.throws(()=>emit(plan,f.roots,join(f.home,'out')),/NO_VERIFIED_ADAPTER_CANDIDATE/);
}));
test('extra incompatibility not declared by rules blocks proposal rather than dropping data',()=>inFixture(f=>{
 const dir=f.roots['lab/source'];
 writeFileSync(join(dir,'crossing.json'),JSON.stringify({...envelope,unknown:'secret'}));
 git(dir,'add','.');git(dir,'commit','-qm','new incompatibility');
 const plan=structuredClone(f.plan);
 plan.sources[0].commit=git(dir,'rev-parse','HEAD');
 const result=forge(plan,f.roots);
 assert.equal(result.proposal.status,'HOLD');
 assert.equal(result.proposal.reason,'UNHANDLED_OR_NONLOSSLESS_INCOMPATIBILITY');
}));
test('wrong sidecar field type refuses adapter projection',()=>inFixture(f=>{
 const dir=f.roots['lab/source'];
 writeFileSync(join(dir,'crossing.json'),JSON.stringify({...envelope,payload_refs:[{address:'a',role:'b',byte_length:-1}]}));
 git(dir,'add','.');git(dir,'commit','-qm','negative length');
 const plan=structuredClone(f.plan);plan.sources[0].commit=git(dir,'rev-parse','HEAD');
 const result=forge(plan,f.roots);
 assert.equal(result.proposal.status,'HOLD');
 assert.equal(result.proposal.reason,'UNSUPPORTED_FIELD_VALUE');
}));
test('cannot launder a nonexistent original signature into a new crossing',()=>inFixture(f=>{
 const dir=f.roots['lab/source'];const unsigned=structuredClone(envelope);delete unsigned.signing;
 writeFileSync(join(dir,'crossing.json'),JSON.stringify(unsigned));git(dir,'add','.');git(dir,'commit','-qm','unsigned');
 const plan=structuredClone(f.plan);plan.sources[0].commit=git(dir,'rev-parse','HEAD');
 assert.equal(forge(plan,f.roots).proposal.reason,'SOURCE_NOT_SIGNED_ENVELOPE');
}));
test('unsupported receiver schema semantics HOLD rather than silently claiming fit',()=>inFixture(f=>{
 const dir=f.roots['lab/contract'];writeFileSync(join(dir,'schema.json'),JSON.stringify({...schema,allOf:[]}));
 git(dir,'add','.');git(dir,'commit','-qm','requires unsupported keyword');
 const plan=structuredClone(f.plan);plan.sources[1].commit=git(dir,'rev-parse','HEAD');
 const result=forge(plan,f.roots);
 assert.equal(result.proposal.status,'HOLD');
 assert.match(result.proposal.reason,/UNSUPPORTED_SCHEMA_KEYWORD/);
}));
test('schema-recognized fields cannot be stripped as a supposed convenience',()=>inFixture(f=>{
 const plan=structuredClone(f.plan);
 plan.adapter.rules[0].pointer='/payload_refs/*/role';
 assert.throws(()=>validateForgePlan(plan),/DECLARED_PAYLOAD_FIELD_CANNOT_BE_EXTERNALIZED/);
}));
test('invalid plans with any authority/effect field are rejected',()=>inFixture(f=>{
 const plans=[];
 let p=structuredClone(f.plan);p.adapter.mode='EXECUTE';plans.push(p);
 p=structuredClone(f.plan);p.adapter.requested_effect='RUN';plans.push(p);
 p=structuredClone(f.plan);p.adapter.rules[0].op='DROP_FIELD';plans.push(p);
 p=structuredClone(f.plan);p.sources[0].path='../secret';plans.push(p);
 p=structuredClone(f.plan);p.adapter.rules[0].pointer='/signing/signature';plans.push(p);
 for(const v of plans)assert.throws(()=>validateForgePlan(v));
}));
test('branch head movement after commit does not change the selected original input',()=>inFixture(f=>{
 const first=forge(f.plan,f.roots);
 const dir=f.roots['lab/source'];writeFileSync(join(dir,'crossing.json'),JSON.stringify({schema:'new'}));
 git(dir,'add','.');git(dir,'commit','-qm','move branch');
 assert.deepEqual(forge(f.plan,f.roots),first);
}));