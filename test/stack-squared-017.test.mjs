import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {compose,validate,emit,coldVerify} from '../src/stack-squared-017.mjs';

const originalPlan=()=>JSON.parse(readFileSync(new URL('../examples/stack-squared-017.plan.json',import.meta.url),'utf8'));
const originalLoadout=()=>JSON.parse(readFileSync(new URL('../examples/branch-loadout-008.plan.json',import.meta.url),'utf8'));
const git=(root,...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();

function makeSource(root,repo,path,data){
  mkdirSync(root,{recursive:true});
  git(root,'init','-q','-b','experimental');
  git(root,'config','user.name','Synthetic Fixture');
  git(root,'config','user.email','synthetic@example.invalid');
  git(root,'remote','add','origin','https://github.com/the-static-collective/'+repo+'.git');
  const dest=join(root,path);
  mkdirSync(join(dest,'..'),{recursive:true});
  writeFileSync(dest,data);
  if(repo==='planZ')writeFileSync(join(root,'alternative.mjs'),'throw Error("NEVER_EXECUTE_ALTERNATIVE");\n');
  git(root,'add','.');
  git(root,'commit','-q','-m','Synthetic source only');
  return git(root,'rev-parse','HEAD');
}
function lab(t){
  const home=mkdtempSync(join(tmpdir(),'cannon-stack2-'));
  t.after(()=>rmSync(home,{recursive:true,force:true}));
  const first=join(home,'planz'),second=join(home,'cannon');
  const a=makeSource(first,'planZ','002/bin/sense-global.mjs','throw Error("DO_NOT_RUN_PLANZ");\n');
  const b=makeSource(second,'CANNON','scripts/conversation-collider-work.mjs','throw Error("DO_NOT_RUN_CANNON_DONOR");\n');
  const loadout=originalLoadout();
  loadout.entries[0].commit=a;loadout.entries[1].commit=b;
  const roots={'the-static-collective/planZ':first,'the-static-collective/CANNON':second};
  return {home,loadout,roots,plan:originalPlan()};
}
test('two real Git object witnesses, two local adapters, deterministic create-only receipt and cold replay',t=>{
  const {home,loadout,roots,plan}=lab(t);
  const r=compose(plan,loadout,roots);
  assert.equal(r.status,'LOCAL_SYNTHETIC_COMPOSITION_ONLY');
  assert.equal(r.original_git_witnesses.length,2);
  assert.equal(r.local_operator_trace.length,2);
  assert.equal(r.result.schema,'cannon.stack2.addressed/v0');
  assert.equal(r.result.text_codepoints,27);
  assert.equal(r.donor_programs_executed,0);
  assert.equal(r.owner_admitted,false);
  assert.equal(r.execution_authorized,false);
  assert.deepEqual(compose(plan,loadout,roots),r);
  const out=join(home,'output');
  assert.deepEqual(emit(plan,loadout,roots,out),r);
  assert.equal(coldVerify(plan,loadout,roots,out).status,'COLD_REPLAY_VERIFIED');
  assert.throws(()=>emit(plan,loadout,roots,out),/CREATE_ONLY_OUTPUT_EXISTS/);
  const altered={...r,owner_admitted:true};
  writeFileSync(join(out,'stack-squared-receipt.json'),JSON.stringify(altered));
  assert.throws(()=>coldVerify(plan,loadout,roots,out),/COLD_REPLAY_MISMATCH/);
});
test('source substitution changes witness and receipt but preserves the declared fixture port',t=>{
  const {loadout,roots,plan}=lab(t);
  const before=compose(plan,loadout,roots);
  const replacement=structuredClone(loadout);
  replacement.entries[0].path='alternative.mjs';
  const after=compose(plan,replacement,roots);
  assert.equal(before.result.schema,after.result.schema);
  assert.notEqual(before.receipt_id,after.receipt_id);
  assert.notEqual(before.original_git_witnesses[0].blob_sha256,after.original_git_witnesses[0].blob_sha256);
  assert.equal(after.donor_programs_executed,0);
  assert.equal(after.donor_runtime_compatibility_proven,false);
});
test('reject missing pins, forged authority, incompatible links, side effects, and source absence',t=>{
  const {loadout,roots,plan}=lab(t);
  const mutate=fn=>{const p=structuredClone(plan);fn(p);assert.throws(()=>validate(p,loadout));};
  mutate(p=>{p.cards[0].source_id='unknown';});
  mutate(p=>{p.cards[0].local_operator='RUN_DONOR';});
  mutate(p=>{p.cards[0].execution_authorized=true;});
  mutate(p=>{p.cards[1].consumes='unrelated';});
  mutate(p=>{p.link.to='wrong:in';});
  mutate(p=>{p.input.iteration=-1;});
  mutate(p=>{p.input.secret_key='anything';});
  mutate(p=>{p.mode='PRODUCTION';});
  const badLoadout=structuredClone(loadout);
  badLoadout.entries[0].commit='a'.repeat(40);
  assert.throws(()=>compose(plan,badLoadout,roots));
  assert.throws(()=>compose(plan,loadout,{}),/MISSING_REPO_ROOT/);
});
test('actual historical source loadout (when checked out) remains source-only',t=>{
  const location=process.env.STACK2_017_ROOTS;
  if(!location){t.skip('requires original pinned Git repositories');return;}
  const roots=JSON.parse(readFileSync(location,'utf8'));
  const r=compose(originalPlan(),originalLoadout(),roots);
  assert.equal(r.original_git_witnesses.length,2);
  assert.equal(r.donor_programs_executed,0);
  assert.equal(r.executed_native_cannon_008_source_verifier,true);
  assert.equal(r.original_git_witnesses[0].commit,'e8111fdb64c5587b33aece0fed639ed3d03375ac');
  assert.equal(r.original_git_witnesses[1].commit,'aabd276e4edb2ae4229ccf94eed8a7f561b17a0a');
});
