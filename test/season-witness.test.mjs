import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {appendEvent, createLedger, hash, inspectLedger, SCHEMA} from '../src/season/witness.mjs';

const digest = value => hash('TEST_ONLY_' + value);
const dt = n => '2027-01-01T10:' + String(n).padStart(2,'0') + ':00Z';
const fresh = () => createLedger({caseId:'fictional-case',ownerId:'owner-opaque',
  purpose:'A fictional bounded community collaboration'});
const software = {id:'s1',kind:'SOFTWARE',actor:'builder',at:dt(0),
  resultDigest:digest('result'),artifactDigest:digest('build')};
const replay = {id:'r1',kind:'REPLAY',actor:'reviewer',at:dt(1),
  softwareId:'s1',resultDigest:digest('result'),methodDigest:digest('method')};
const gate = {id:'g1',kind:'TRIAL_GATE',actor:'safety-reviewer',at:dt(2),
  replayId:'r1',scopeDigest:digest('scope'),safetyDigest:digest('safety'),
  venueDigest:digest('venue'),consentPolicyDigest:digest('policy'),stewardId:'steward'};
const field = {id:'f1',kind:'FIELD',actor:'steward',at:dt(3),gateId:'g1',
  consentDigest:digest('consent'),reportDigest:digest('field')};
const outcome = {id:'o1',kind:'OUTCOME',actor:'observer',at:dt(4),fieldId:'f1',
  participantConfirmationDigest:digest('participant-confirmation'),
  reportDigest:digest('outcome')};
const step = (ledger, ...events) => events.reduce(appendEvent,ledger);
const through = n => step(fresh(),...[software,replay,gate,field,outcome].slice(0,n));
const expectHold = (f,pattern) => assert.throws(f,pattern);

test('empty ledger is an idea, not a field claim',()=>{
 const x=fresh(), i=inspectLedger(x);
 assert.equal(x.schema,SCHEMA);
 assert.equal(i.stage,'IDEA_ONLY');
 assert.equal(i.publishableHumanSuccess,false);
 assert.equal(i.authorizedRealWorldActions,false);
 assert.equal(i.authorizedMoneyMovements,false);
 assert.equal(i.participantDataStored,false);
});
test('five stages keep different evidence classes and never assert confirmed success',()=>{
 const labels=['IDEA_ONLY','SOFTWARE_EVIDENCE_RECORDED','INDEPENDENT_REPLAY_REPORTED',
  'FIELD_GATE_DOCUMENTED','FIELD_TRIAL_REPORTED','HUMAN_OUTCOME_REPORTED'];
 for(let n=0;n<=5;n++){
  const result=inspectLedger(through(n));
  assert.equal(result.stage,labels[n]);
  assert.equal(result.evidenceMeaning,'RECORDED_REPORTS_NOT_INDEPENDENTLY_AUTHENTICATED_FACTS');
  assert.equal(result.publishableHumanSuccess,false);
 }
});
test('ledger does not mutate earlier states on append',()=>{
 const original=fresh(), next=appendEvent(original,software);
 assert.equal(original.events.length,0);
 assert.equal(next.events.length,1);
 assert.match(next.events[0].hash,/^sha256:[a-f0-9]{64}$/);
});
test('proof does not skip straight to independent replay or trial',()=>{
 expectHold(()=>appendEvent(fresh(),replay),/HOLD_REPLAY_REQUIRES_SOFTWARE/);
 expectHold(()=>appendEvent(through(1),field),/HOLD_FIELD_REQUIRES_STEWARD_AND_GATE/);
 expectHold(()=>appendEvent(through(2),outcome),/HOLD_OUTCOME_REQUIRES_FIELD/);
});
test('builder cannot independently replay its own output',()=>{
 expectHold(()=>appendEvent(through(1),{...replay,actor:'builder'}),/INDEPENDENT_REPLAYER_REQUIRED/);
});
test('a mismatched digest does not pass replay even when independently reported',()=>{
 expectHold(()=>appendEvent(through(1),{...replay,resultDigest:digest('changed')}),/REPLAY_OUTPUT_DISAGREEMENT/);
});
test('gate reviewer cannot be the builder, replayer or trial steward',()=>{
 for (const actor of ['builder','reviewer','steward'])
  expectHold(()=>appendEvent(through(2),{...gate,actor}),/INDEPENDENT_GATE_REVIEWER_REQUIRED/);
});
test('field report needs a named opaque steward selected by the gate',()=>{
 expectHold(()=>appendEvent(through(3),{...field,actor:'other-steward'}),/FIELD_REQUIRES_STEWARD_AND_GATE/);
 expectHold(()=>appendEvent(through(3),{...field,gateId:'other-gate'}),/FIELD_REQUIRES_STEWARD_AND_GATE/);
});
test('outcome report needs an observer independent of builder and steward',()=>{
 for (const actor of ['builder','steward'])
  expectHold(()=>appendEvent(through(4),{...outcome,actor}),/INDEPENDENT_OUTCOME_OBSERVER_REQUIRED/);
});
test('any participant objection HOLDs progress; only objector may release that HOLD',()=>{
 const h={id:'h1',kind:'HOLD',actor:'critic',at:dt(2),reason:'CONSENT',
  detailDigest:digest('objection')};
 const held=step(through(2),h);
 assert.equal(inspectLedger(held).disposition,'HOLD');
 assert.deepEqual(inspectLedger(held).unresolvedHolds,['h1']);
 expectHold(()=>appendEvent(held,{...gate,id:'g2',at:dt(3)}),/UNRESOLVED_HUMAN_HOLD/);
 const release={id:'release1',kind:'RELEASE',actor:'critic',at:dt(3),
  holdId:'h1',resolutionDigest:digest('agreed-resolution')};
 expectHold(()=>appendEvent(held,{...release,actor:'steward'}),/HOLD_OWNER_RELEASE_REQUIRED/);
 const released=step(held,release,{...gate,at:dt(4)});
 assert.equal(inspectLedger(released).disposition,'OPEN');
 assert.equal(inspectLedger(released).stage,'FIELD_GATE_DOCUMENTED');
});
test('refusal is terminal and cannot be rewritten as success',()=>{
 const refused=appendEvent(through(1),{id:'no',kind:'REFUSE',actor:'critic',
  at:dt(2),reason:'PERMISSION',detailDigest:digest('no')});
 assert.equal(inspectLedger(refused).disposition,'REFUSED');
 expectHold(()=>appendEvent(refused,{...replay,id:'other',at:dt(3)}),/TERMINAL_IMMUTABLE/);
});
test('withdrawal is terminal even after an outcome was reported',()=>{
 const withdrawn=appendEvent(through(5),{id:'no2',kind:'WITHDRAW',actor:'participant',
  at:dt(5),reason:'CONSENT',detailDigest:digest('revocation')});
 assert.equal(inspectLedger(withdrawn).disposition,'WITHDRAWN');
 assert.equal(inspectLedger(withdrawn).publishableHumanSuccess,false);
 expectHold(()=>appendEvent(withdrawn,{id:'h2',kind:'HOLD',actor:'critic',at:dt(6),
  reason:'CONSENT',detailDigest:digest('late')}),/TERMINAL_IMMUTABLE/);
});
test('a changed stored receipt fails chain verification',()=>{
 const tampered=JSON.parse(JSON.stringify(through(3)));
 tampered.events[0].artifactDigest=digest('counterfeit');
 expectHold(()=>inspectLedger(tampered),/RECEIPT_MISMATCH/);
});
test('a changed header fails the first link',()=>{
 const tampered={...through(3),purpose:'An altered fictional purpose'};
 expectHold(()=>inspectLedger(tampered),/BROKEN_CHAIN/);
});
test('forged event shape and unreferenced PII are rejected',()=>{
 expectHold(()=>appendEvent(fresh(),{...software,participantName:'No real names here'}),/EVENT_SHAPE/);
 expectHold(()=>createLedger({caseId:'id',ownerId:'owner',purpose:'Email alice@example.org for help'}),/PURPOSE_MINIMAL_NONIDENTIFYING_TEXT/);
 expectHold(()=>appendEvent(fresh(),{...software,resultDigest:'https://example.org/a'}),/RESULTDIGEST_SHA256_REQUIRED/);
});
test('duplicate event id cannot be appended later',()=>{
 const x=through(1);
 expectHold(()=>appendEvent(x,{...replay,id:'s1'}),/DUPLICATE_EVENT/);
});
test('out-of-order event time fails even if the evidence is otherwise correct',()=>{
 expectHold(()=>appendEvent(through(1),{...replay,at:'2026-12-31T00:00:00Z'}),/TIME_ORDER/);
});
test('an invalid resolution id and an invented kind are rejected',()=>{
 const h={id:'h1',kind:'HOLD',actor:'critic',at:dt(2),reason:'SAFETY',detailDigest:digest('x')};
 const held=appendEvent(through(2),h);
 expectHold(()=>appendEvent(held,{id:'u1',kind:'RELEASE',actor:'critic',at:dt(3),
  holdId:'not-h1',resolutionDigest:digest('release')}),/HOLD_OWNER_RELEASE_REQUIRED/);
 expectHold(()=>appendEvent(held,{id:'spend1',kind:'SPEND',actor:'owner-opaque',at:dt(3)}),/UNKNOWN_KIND/);
});
test('CLI writes two explicitly fictional contrasting artifacts and verifies both',()=>{
 const tmp=mkdtempSync(join(tmpdir(),'season-witness-test-'));
 const script=fileURLToPath(new URL('../scripts/season-witness.mjs',import.meta.url));
 try{
  const out=join(tmp,'fixtures');
  const printed=JSON.parse(execFileSync(process.execPath,[script,'demo',out],{encoding:'utf8'}));
  assert.equal(printed[0].stage,'HUMAN_OUTCOME_REPORTED');
  assert.equal(printed[1].disposition,'REFUSED');
  for(const file of ['fictional-garden.json','fictional-refusal.json']){
   const inspection=JSON.parse(execFileSync(process.execPath,[script,'verify',join(out,file)],{encoding:'utf8'}));
   assert.equal(inspection.publishableHumanSuccess,false);
  }
  const refused=JSON.parse(readFileSync(join(out,'fictional-refusal.json'),'utf8'));
  refused.events[0].resultDigest=digest('corrupted');
  writeFileSync(join(out,'fictional-refusal.json'),JSON.stringify(refused));
  const invalid=spawnSync(process.execPath,[script,'verify',join(out,'fictional-refusal.json')],{encoding:'utf8'});
  assert.equal(invalid.status,2);
  assert.match(invalid.stderr,/HOLD \/ REFUSE: HOLD_RECEIPT_MISMATCH/);
 }finally{rmSync(tmp,{recursive:true,force:true})}
});
