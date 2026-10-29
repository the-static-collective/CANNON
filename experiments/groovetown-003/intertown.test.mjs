import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {compileIntertown,fixture,sanitizeScenario,solveModel,openPledges,localDecision,demo,formatHtml} from './intertown.mjs';

const clone=x=>structuredClone(x);

test('four-town model unlocks a chain the recipient cannot produce alone',()=>{
 const raw=fixture(),s=sanitizeScenario(raw),p=compileIntertown(raw);
 assert.equal(solveModel(s,{allowCrossings:false}).status,'NO_CHAIN_IN_DECLARED_MODEL');
 assert.equal(p.verdict,'CONDITIONAL_CHAIN_FOUND');
 assert.equal(p.emergence.networkUnlocksTargetInModel,true);
 assert.deepEqual(p.proposedOperations.map(x=>x.kind),['SUPPLY','MOVE','PROCESS','MOVE','RECIPIENT']);
 assert.deepEqual(p.proposedOperations.filter(x=>x.kind==='MOVE').map(x=>x.quantity),[6,12]);
 assert.deepEqual(p.emergence.essentialPartnersInThisModel,['bridgeport','millford','ovenham']);
 assert.equal(p.accounting.delivered,0);
 assert.equal(p.executionAuthority,'HOLD_NO_APPROVALS');
});

test('supply, oven and routes are capacity-constrained and never counted twice',()=>{
 for(const [field,edit] of [
   ['supplies',x=>x.supplies[0].quantity=5],
   ['processes',x=>x.processes[0].maxRuns=5],
   ['routes-flour',x=>x.routes[0].capacity=5],
   ['routes-bread',x=>x.routes[1].capacity=11],
 ]){const raw=fixture();edit(raw);const p=compileIntertown(raw);assert.equal(p.verdict,'NO_CHAIN_IN_DECLARED_MODEL',field)}
});

test('removing any critical owner blocks the modeled outcome',()=>{
 const s=sanitizeScenario(fixture());
 for(const owner of ['millford','ovenham','bridgeport']){
   const trial={...s,supplies:s.supplies.filter(x=>x.owner!==owner),processes:s.processes.filter(x=>x.owner!==owner),routes:s.routes.filter(x=>x.owner!==owner)};
   assert.equal(solveModel(trial).status,'NO_CHAIN_IN_DECLARED_MODEL',owner);
 }
});

test('private data never powers the route, appears in exported plan or changes digest',()=>{
 const raw=fixture();const baseline=compileIntertown(raw);
 raw.supplies.push({...raw.supplies[0],id:'hidden-flour',quantity:1000,visibility:'PRIVATE',sourceId:'secret-reference'});
 assert.equal(compileIntertown(raw).hash,baseline.hash);
 assert.ok(!JSON.stringify(compileIntertown(raw)).includes('secret-reference'));
 raw.supplies[0].visibility='PRIVATE';
 assert.equal(compileIntertown(raw).verdict,'NO_CHAIN_IN_DECLARED_MODEL');
});

test('opaque extra fields on target and process inputs cannot escape public projections',()=>{
 const raw=fixture(),before=compileIntertown(raw);
 raw.target.privateMemo='HIDDEN MEDICAL DETAIL';
 raw.processes[0].input.secret='SENSITIVE INPUT';
 raw.processes[0].output.secret='SENSITIVE OUTPUT';
 const after=compileIntertown(raw);
 assert.equal(before.hash,after.hash);
 assert.ok(!JSON.stringify(after).includes('SENSITIVE'));
 assert.ok(!JSON.stringify(after).includes('HIDDEN'));
});

test('another carrier route produces alternative feasible plan and distinct creative stages',()=>{
 const raw=fixture(), old=compileIntertown(raw);
 for(const route of raw.routes){route.owner='millford';route.id='millford-haul-'+route.resource;route.sourceId='synthetic-millford-'+route.resource;}
 const next=compileIntertown(raw);
 assert.equal(next.verdict,'CONDITIONAL_CHAIN_FOUND');
 assert.notEqual(next.hash,old.hash);
 assert.notDeepEqual(next.audienceOutputs.creative.stages,old.audienceOutputs.creative.stages);
 assert.ok(!next.emergence.essentialPartnersInThisModel.includes('bridgeport'));
});

test('units and transfer directions are strict; invalid claims fail closed',()=>{
 const wrongUnit=fixture();wrongUnit.routes[0].unit='bag';
 assert.equal(compileIntertown(wrongUnit).verdict,'NO_CHAIN_IN_DECLARED_MODEL');
 const wrongDirection=fixture();wrongDirection.routes[1].from='lantern';wrongDirection.routes[1].to='ovenham';
 assert.equal(compileIntertown(wrongDirection).verdict,'NO_CHAIN_IN_DECLARED_MODEL');
 for(const mutate of [x=>x.supplies[0].quantity=-1,x=>x.routes[0].capacity=0,
    x=>x.supplies[0].evidence='VERIFIED',x=>x.routes[0].authority='AUTO',
    x=>x.towns[0].id=x.towns[1].id,x=>x.supplies[0].sourceId='fake key']){
   const raw=fixture();mutate(raw);assert.throws(()=>compileIntertown(raw));
 }
});

test('duplicate IDs and unsupported scenario structures cannot create extra capacity',()=>{
 const raw=fixture();raw.supplies.push({...raw.supplies[0]});assert.throws(()=>compileIntertown(raw),/duplicate/);
 const bad=fixture();bad.supplies[0].quantity=1.5;assert.throws(()=>compileIntertown(bad),/capacity/);
});

test('independent synthetic pledge changes never grant execution or physical credit',()=>{
 const p=compileIntertown(fixture());let d=openPledges(p);
 assert.deepEqual(d.owners,['bridgeport','lantern','millford','ovenham']);
 d=localDecision(d,'millford','YES');assert.equal(d.status,'AWAITING_INDEPENDENT_DECISIONS');
 assert.throws(()=>localDecision(d,'millford','YES'),/duplicate/);
 d=localDecision(d,'ovenham','YES');d=localDecision(d,'bridgeport','YES');
 d=localDecision(d,'lantern','YES');
 assert.equal(d.status,'ALL_SYNTHETIC_PLEDGES_PRESENT_FIELD_HOLD');
 assert.equal(d.physicalCredit,0);
 assert.throws(()=>localDecision(openPledges(p),'outsider','YES'),/nonparticipant/);
 assert.throws(()=>localDecision(openPledges(p),'millford','INVALID'),/invalid local decision/);
 const r=localDecision(openPledges(p),'bridgeport','NO');assert.equal(r.status,'REFUSED');
});

test('purpose compiler is actually called and refuses missing timing and contact',()=>{
 const p=compileIntertown(fixture());
 assert.equal(p.localPurpose.version,'GROOVETOWN-002/v1');
 assert.equal(p.localPurpose.status,'HOLD_MISSING_CONTEXT');
 assert.deepEqual(p.localPurpose.specificity.missing.sort(),['delivery window','permissioned contact route'].sort());
 assert.equal(p.localPurpose.action.automation,'HOLD');
});

test('per-partner output actually references partner contribution rather than generic quest',()=>{
 const p=compileIntertown(fixture());
 assert.equal(p.invitations.length,4);
 assert.ok(p.invitations.find(x=>x.town==='ovenham').details.some(x=>x.includes('6 kg flour → 12 loaf bread')));
 assert.ok(p.invitations.find(x=>x.town==='bridgeport').details.some(x=>x.includes('carriage of 12 loaf bread')));
 assert.ok(p.invitations.find(x=>x.town==='millford').details.some(x=>x.includes('6 kg flour')));
 assert.ok(p.invitations.find(x=>x.town==='lantern').details.some(x=>x.includes('receiving 12 loaf bread')));
 assert.equal(p.audienceOutputs.creative.realAudioRendered,false);
});

test('render escapes untrusted labels and does not run active HTML',()=>{
 const raw=fixture();raw.towns[0].name='<script>alert(1)</script>';
 const html=formatHtml(compileIntertown(raw));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>alert(1)</script>'));
});

test('demo artifact receipts are byte-identical on independent runs',()=>{
 const a=mkdtempSync(join(tmpdir(),'groovetown-003-a-')),b=mkdtempSync(join(tmpdir(),'groovetown-003-b-'));
 try{
    assert.deepEqual(demo(a),demo(b));
    for(const f of readdirSync(a))assert.deepEqual(readFileSync(join(a,f)),readFileSync(join(b,f)),f);
  }finally{rmSync(a,{recursive:true,force:true});rmSync(b,{recursive:true,force:true});}
});
