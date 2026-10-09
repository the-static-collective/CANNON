import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {validateSubsetSchema,validatePlan,validateInstance,evaluate,emit,coldVerify,PLAN_SCHEMA} from '../src/typed-compatibility.mjs';
const git=(dir,...args)=>execFileSync('git',['-C',dir,...args],{encoding:'utf8'}).trim();
const contract={type:'object',additionalProperties:false,required:['schema','payload_refs'],properties:{
 schema:{const:'relatte.crossing-envelope/v0'},
 payload_refs:{type:'array',items:{type:'object',additionalProperties:false,required:['address','role'],properties:{address:{type:'string',minLength:1},role:{type:'string',minLength:1}}}}
}};
const crossing={schema:'relatte.crossing-envelope/v0',payload_refs:[{address:'sha256:abc',role:'payload'}]};
function fixture(){
 const home=mkdtempSync(join(tmpdir(),'cannon-fit-'));const roots={},sources=[];
 const entries=[
  {repo:'lab/operating-world',name:'static',value:{...crossing,payload_refs:[{address:'sha256:abc',role:'payload',byte_length:123}]}},
  {repo:'lab/relay-world',name:'contract',value:contract},
  {repo:'lab/relay-world',name:'reference',value:crossing}
 ];
 for(const repo of [...new Set(entries.map(e=>e.repo))]){
  const dir=join(home,repo.split('/')[1]);mkdirSync(dir);git(dir,'init','-q');git(dir,'config','user.email','test@example.invalid');git(dir,'config','user.name','Cannon lab');git(dir,'remote','add','origin','https://github.com/'+repo+'.git');
  for(const e of entries.filter(e=>e.repo===repo))writeFileSync(join(dir,e.name+'.json'),JSON.stringify(e.value,null,2)+'\n');
  git(dir,'add','.');git(dir,'commit','-qm','source');roots[repo]=dir;
 }
 for(const e of entries){sources.push({id:e.name,repository:e.repo,commit:git(roots[e.repo],'rev-parse','HEAD'),path:e.name+'.json',media_type:'application/json'});}
 const plan={schema:PLAN_SCHEMA,goal:'crossing compatibility without permission grant',sources,checks:[
  {id:'cross-repo-negative',instance:'static',contract:'contract'},
  {id:'local-positive',instance:'reference',contract:'contract'}
 ]};
 return {home,roots,plan,cleanup:()=>rmSync(home,{recursive:true,force:true})};
}
function inLab(fn){const x=fixture();try{fn(x);}finally{x.cleanup();}}
test('structural subset accepts reference and reveals additional field conflict',()=>{
 const ok=validateInstance(crossing,contract);assert.equal(ok.status,'STRUCTURALLY_COMPATIBLE');
 const bad=validateInstance({...crossing,payload_refs:[{address:'test',role:'payload',byte_length:1}]},contract);
 assert.equal(bad.status,'INCOMPATIBLE');
 assert.deepEqual(bad.violations.map(x=>x.path),['/payload_refs/0/byte_length']);
});
test('two independent Git repositories checked without canon selection or source mutation',()=>inLab(f=>{
 const {report}=evaluate(f.plan,f.roots);
 assert.equal(report.sources.static.status,'GIT_OBJECT_VERIFIED');
 assert.equal(report.checks[0].status,'INCOMPATIBLE');
 assert.equal(report.checks[1].status,'STRUCTURALLY_COMPATIBLE');
 assert.equal(report.git_mutations,0);assert.equal(report.permission_granted,false);
 assert.equal(report.signatures_verified,false);
}));
test('deterministic cold replay and no output overwrite',()=>inLab(f=>{
 const out=join(f.home,'out');const first=emit(f.plan,f.roots,out);
 assert.equal(coldVerify(f.plan,f.roots,out).status,'COMPATIBILITY_COLD_REPLAY_VERIFIED');
 assert.throws(()=>emit(f.plan,f.roots,out),/OUTPUT_ALREADY_EXISTS/);
 assert.ok(first.receipt_id.startsWith('sha256:'));
}));
test('tampering with report is detected',()=>inLab(f=>{
 const out=join(f.home,'out');emit(f.plan,f.roots,out);
 const file=join(out,'compatibility.json'),data=JSON.parse(readFileSync(file));
 data.permission_granted=true;writeFileSync(file,JSON.stringify(data));
 assert.throws(()=>coldVerify(f.plan,f.roots,out),/COLD_REPLAY_MISMATCH/);
}));
test('corrupt original Git witness is HOLD, not acceptance',()=>inLab(f=>{
 const bad=structuredClone(f.plan);bad.sources[0].commit='f'.repeat(40);
 const {report}=evaluate(bad,f.roots);
 assert.equal(report.sources.static.status,'HOLD');
 assert.equal(report.checks[0].status,'HOLD');
}));
test('moving a branch head cannot retarget the pinned Git input',()=>inLab(f=>{
 const first=evaluate(f.plan,f.roots).report;
 const dir=f.roots['lab/operating-world'];writeFileSync(join(dir,'static.json'),JSON.stringify(crossing));git(dir,'add','.');git(dir,'commit','-qm','move head');
 assert.deepEqual(evaluate(f.plan,f.roots).report,first);
}));
test('unsupported schema keywords and refs are never silently ignored',()=>inLab(f=>{
 assert.throws(()=>validateSubsetSchema({type:'object',allOf:[{type:'object'}]}),/UNSUPPORTED_SCHEMA_KEYWORD/);
 assert.throws(()=>validateSubsetSchema({$ref:'https://external.invalid/schema'}),/UNSUPPORTED_SCHEMA_KEYWORD/);
 assert.throws(()=>validateSubsetSchema({type:'string',pattern:'^a+$'}),/UNSUPPORTED_SCHEMA_KEYWORD/);
 const dir=f.roots['lab/relay-world'];
 writeFileSync(join(dir,'unsupported.json'),JSON.stringify({type:'object',allOf:[]}));git(dir,'add','.');git(dir,'commit','-qm','new schema');
 const p=structuredClone(f.plan);p.sources[1].commit=git(dir,'rev-parse','HEAD');p.sources[1].path='unsupported.json';
 assert.equal(evaluate(p,f.roots).report.checks[0].status,'HOLD');
}));
test('reject traversal, forged media type, duplicate IDs, extra authority or nonsense checks',()=>inLab(f=>{
 const edits=[p=>{p.sources[0].path='../x.json';},p=>{p.sources[1].id='static';},
 p=>{p.sources[0].media_type='text/javascript';},p=>{p.sources[0].authority='RUN';},
 p=>{p.checks[0].contract='static';},p=>{p.checks[0].instance='missing';}];
 for(const edit of edits){const p=structuredClone(f.plan);edit(p);assert.throws(()=>validatePlan(p));}
}));
test('wrong const, duplicate items, bad type and undeclared fields are reported',()=>{
 const spec={type:'object',required:['x','list'],additionalProperties:false,properties:{x:{const:'A'},list:{type:'array',uniqueItems:true,items:{type:'integer'}}}};
 const x=validateInstance({x:'B',list:[1,1,'bad'],extra:true},spec);
 assert.equal(x.status,'INCOMPATIBLE');
 assert.ok(x.violations.some(v=>v.keyword==='const'));
 assert.ok(x.violations.some(v=>v.keyword==='uniqueItems'));
 assert.ok(x.violations.some(v=>v.keyword==='type'));
 assert.ok(x.violations.some(v=>v.keyword==='additionalProperties'));
});