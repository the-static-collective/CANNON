import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {evaluate,coldVerify,validatePlan,PLAN_SCHEMA} from '../scripts/conversation-collider-work.mjs';
const git=(root,...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
const clone=x=>structuredClone(x);
const files={
 GHOT_PANTRY:[
  'EXECUTORS: dict[str, dict[str, object]] = {',
  '    "python": { "capabilities": ["runtime.python.version"] },',
  '    "ffprobe": { "capabilities": ["runtime.ffprobe.version", "media.probe"] },',
  '}',
  '',
  'def _first_command(commands):',
  '    return None'
 ].join('\n'),
 GHOT_BUILTINS:[
  'def _base_offers(executors):',
  '    builtins = [{"kind": "ghot.offer", "available": True}',
  '      for capability in [',
  '        "system.echo",',
  '        "system.hash",',
  '      ]]',
  '    return builtins',
  '',
  'def body_identity():',
  '    return {}'
 ].join('\n'),
 LIVE_PACKET:JSON.stringify({
  version:'static-live.performance-packet/v0.1',
  requiredCapabilities:['lead-vocal.live','drums.live'],
  stems:[{id:'drums-fallback',kind:'fallback',coversCapability:'drums.live',path:'stems/drums.wav'},
         {id:'textures',kind:'always',path:'stems/textures.wav'}]
 },null,2),
 PRINTER_TECH_REGISTRY:JSON.stringify({
  schema:'static-os.print-technology-registry/v0',
  purpose:'OPEN_WORLD_MACHINE_DISCOVERY_NOT_HARDWARE_AUTHORITY',
  machine_execution_enabled:false,supported_printer_count_claim:0,
  families:[
   {id:'FFF_FDM',required_bridge:'machine-specific-filament-slicer-profile',reference_adapter:'VIRTUAL_PRUSASLICER_011',physical_execution_verified:false},
   {id:'MSLA',required_bridge:'model-specific-layer-exposure-and-resin-profile',reference_adapter:null,physical_execution_verified:false}
  ]
 },null,2)
};
const entries=[
 ['GHOT_PANTRY','the-static-collective/GHoT','ghot/executor_pantry.py'],
 ['GHOT_BUILTINS','the-static-collective/GHoT','ghot/reference_node.py'],
 ['LIVE_PACKET','the-static-collective/static-live','fixtures/live-001/song.json'],
 ['PRINTER_TECH_REGISTRY','the-static-collective/static-os','fixtures/printer-field-012/technology-registry.json']
];
function fixture(){
 const home=mkdtempSync(join(tmpdir(),'cannon-work-003-')),roots={};
 for(const repository of [...new Set(entries.map(x=>x[1]))]){
  const dir=join(home,repository.split('/')[1]);mkdirSync(dir,{recursive:true});
  git(dir,'init','-q');git(dir,'config','user.email','test@example.invalid');
  git(dir,'config','user.name','CANNON source fixture');
  git(dir,'remote','add','origin','https://github.com/'+repository+'.git');
  roots[repository]=dir;
  for(const [role,r,path] of entries.filter(x=>x[1]===repository)){
   const full=join(dir,path);mkdirSync(dirname(full),{recursive:true});writeFileSync(full,files[role]);
  }
  git(dir,'add','.');git(dir,'commit','-qm','pinned originals');
 }
 const plan={schema:PLAN_SCHEMA,sources:entries.map(([role,repository,path])=>({
  role,repository,commit:git(roots[repository],'rev-parse','HEAD'),path
 }))};
 return {home,roots,plan,cleanup:()=>rmSync(home,{recursive:true,force:true})};
}
const lab=fn=>{const f=fixture();try{fn(f);}finally{f.cleanup();}};
function modify(f,role,data){
 const x=f.plan.sources.find(s=>s.role===role),path=join(f.roots[x.repository],x.path);
 writeFileSync(path,data);
 git(f.roots[x.repository],'add','.');git(f.roots[x.repository],'commit','-qm','alter specimen');
 const sha=git(f.roots[x.repository],'rev-parse','HEAD');
 for(const s of f.plan.sources.filter(s=>s.repository===x.repository))s.commit=sha;
}
test('real-shaped GHoT offers generate conditional media inspection, not a live offer',()=>lab(f=>{
 const r=evaluate(f.plan,f.roots);
 assert.equal(r.sources.length,4);assert.ok(r.sources.every(s=>s.status==='GIT_OBJECT_VERIFIED'));
 assert.ok(r.ghot_declared_capabilities.includes('media.probe'));
 assert.ok(r.ghot_declared_capabilities.includes('system.hash'));
 assert.equal(r.ghot_offers_status,'SOURCE_DECLARED_ONLY_NOT_PROBED_NOW');
 assert.equal(r.conditional_media_inspections.length,1);
 assert.deepEqual(r.conditional_media_inspections[0].candidate_assets,['stems/drums.wav','stems/textures.wav']);
 assert.equal(r.conditional_media_inspections[0].executor_available_now,false);
 assert.equal(r.actual_executor_presence_tested,false);
}));
test('human stage capabilities remain separate from runtime capabilities',()=>lab(f=>{
 const r=evaluate(f.plan,f.roots);
 assert.ok(r.static_live_required_stage_capabilities.every(x=>x.status==='NO_MATCH_HUMAN_STAGE_CAPABILITY'));
 assert.ok(r.static_live_required_stage_capabilities.every(x=>x.ghot_is_live_performer===false));
}));
test('printer technology is HOLD, not hardware inventory',()=>lab(f=>{
 const r=evaluate(f.plan,f.roots);
 assert.equal(r.printer_technology_field.length,2);
 assert.equal(r.physical_printer_execution_authorized,false);
 assert.equal(r.physical_printer_count_verified,0);
 assert.ok(r.printer_technology_field.every(x=>x.status==='HOLD_PHYSICAL_PROFILE_AND_OPERATOR_PERMISSION'));
 assert.equal(r.executions,0);assert.equal(r.physical_parts_created,0);
}));
test('cold replay detects permission tamper',()=>lab(f=>{
 const r=evaluate(f.plan,f.roots);
 assert.equal(coldVerify(f.plan,f.roots,r).status,'WORK_COLLIDER_003_COLD_SOURCE_REPLAY_VERIFIED');
 assert.throws(()=>coldVerify(f.plan,f.roots,{...r,physical_printer_execution_authorized:true}),/COLD_SOURCE_REPLAY_MISMATCH/);
}));
test('moving branch tip cannot change source',()=>lab(f=>{
 const before=evaluate(f.plan,f.roots),root=f.roots['the-static-collective/GHoT'];
 writeFileSync(join(root,'noise.txt'),'new HEAD');git(root,'add','.');git(root,'commit','-qm','head drift');
 assert.deepEqual(evaluate(f.plan,f.roots),before);
}));
test('missing source holds dependent media candidate',()=>lab(f=>{
 const p=clone(f.plan);p.sources.find(s=>s.role==='GHOT_PANTRY').commit='f'.repeat(40);
 const r=evaluate(p,f.roots);
 assert.equal(r.conditional_media_inspections.length,0);
 assert.ok(r.missing_source_roles.includes('GHOT_PANTRY'));
}));
test('forged local origin rejects source',()=>lab(f=>{
 git(f.roots['the-static-collective/GHoT'],'remote','set-url','origin','https://github.com/forger/repo.git');
 const r=evaluate(f.plan,f.roots);
 assert.ok(r.missing_source_roles.includes('GHOT_PANTRY'));
 assert.ok(r.missing_source_roles.includes('GHOT_BUILTINS'));
 assert.equal(r.conditional_media_inspections.length,0);
}));
test('source claim of printer permission fails closed',()=>lab(f=>{
 const obj=JSON.parse(files.PRINTER_TECH_REGISTRY);obj.machine_execution_enabled=true;
 modify(f,'PRINTER_TECH_REGISTRY',JSON.stringify(obj));
 const r=evaluate(f.plan,f.roots);
 assert.ok(r.missing_source_roles.includes('PRINTER_TECH_REGISTRY'));
 assert.equal(r.physical_printer_execution_authorized,false);
}));
test('unrecognized Python expression is HOLD, not evaluated',()=>lab(f=>{
 modify(f,'GHOT_PANTRY',files.GHOT_PANTRY.replace('"media.probe"','__import__("os").system("echo unsafe")'));
 const r=evaluate(f.plan,f.roots);
 assert.ok(r.missing_source_roles.includes('GHOT_PANTRY'));
 assert.equal(r.conditional_media_inspections.length,0);
}));
test('without media.probe declaration there is no media candidate',()=>lab(f=>{
 modify(f,'GHOT_PANTRY',files.GHOT_PANTRY.replace('"runtime.ffprobe.version", "media.probe"','"runtime.ffprobe.version"'));
 const r=evaluate(f.plan,f.roots);
 assert.equal(r.conditional_media_inspections.length,0);
}));
test('path traversal in declared live packet refuses candidate',()=>lab(f=>{
 const obj=JSON.parse(files.LIVE_PACKET);obj.stems[0].path='../secrets.wav';
 modify(f,'LIVE_PACKET',JSON.stringify(obj));
 const r=evaluate(f.plan,f.roots);
 assert.ok(r.missing_source_roles.includes('LIVE_PACKET'));
 assert.equal(r.conditional_media_inspections.length,0);
}));
test('strict plan rejects forged authority, chat data, wrong repo, branch or role',()=>lab(f=>{
 const mutations=[
  p=>p.execution_authority='YES',
  p=>p.sources[0].transcript='raw chat',
  p=>p.sources[0].repository='wrong/repo',
  p=>p.sources[0].commit='main',
  p=>p.sources[0].role='PRINTER_TECH_REGISTRY'
 ];
 for(const edit of mutations){const p=clone(f.plan);edit(p);assert.throws(()=>validatePlan(p));}
}));
test('manifest order is not hidden source selection',()=>lab(f=>{
 const r=evaluate(f.plan,f.roots),p=clone(f.plan);p.sources.reverse();
 const v=evaluate(p,f.roots);
 assert.deepEqual(r.conditional_media_inspections,v.conditional_media_inspections);
 assert.deepEqual(r.static_live_required_stage_capabilities,v.static_live_required_stage_capabilities);
 assert.deepEqual(r.printer_technology_field,v.printer_technology_field);
 assert.deepEqual(r.sources,v.sources);
}));
