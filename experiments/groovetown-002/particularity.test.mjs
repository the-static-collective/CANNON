import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {makeTown, report, confirm} from '../groovetown-001/groovetown.mjs';
import {compile,formatCard,validateFacts,demo} from './particularity.mjs';
const town=()=>makeTown({name:'A fictional place',needs:[{id:'bread',item:'loaves of bread',quantity:2}]});
const f=(v,visibility='SHARE')=>({value:v,visibility,sourceId:'fixture-source',evidence:'SYNTHETIC'});
const complete=()=>({source:f('Bakery'),handoff:f('Community Table'),window:f('2–3pm'),transport:f('walking'),contact:f('public opt-in board')});
test('a field-ready brief is specific and held for human review',()=>{
 const p=compile({town:town(),needId:'bread',facts:complete()});
 assert.equal(p.status,'READY_FOR_HUMAN_REVIEW');
 assert.match(p.action.title,/Bakery.*Community Table/);
 assert.equal(p.action.automation,'HOLD');
 assert.equal(p.outcome.actualExternalDelivery,'NOT_OBSERVED');
 assert.equal(p.score.nativeMediaRendered,false);
 assert.equal(p.specificity.provided,5);
});
test('missing facts become an explicit question and HOLD rather than a hallucination',()=>{
 const p=compile({town:town(),needId:'bread',facts:{source:f('Bakery')}});
 assert.equal(p.status,'HOLD_MISSING_CONTEXT');
 assert.equal(p.specificity.missing.length,4);
 assert.match(p.question,/transport arrangement/);
});
test('private and NO_USE facts never enter public outputs or hashes',()=>{
 const a=complete();a.privatephone=f('UNIQUE_PRIVATE_TEST_TOKEN','PRIVATE');a.secret=f('ANOTHER_PRIVATE_TOKEN','NO_USE');
 const p=compile({town:town(),needId:'bread',facts:a});
 assert.doesNotMatch(JSON.stringify(p)+formatCard(p),/UNIQUE_PRIVATE_TEST_TOKEN|ANOTHER_PRIVATE_TOKEN/);
 assert.deepEqual(p,compile({town:town(),needId:'bread',facts:complete()}));
});
test('changing town-specific evidence changes work and creative bytes',()=>{
 const a=complete(),b=complete();b.handoff=f('Second location');
 const x=compile({town:town(),needId:'bread',facts:a}),y=compile({town:town(),needId:'bread',facts:b});
 assert.notEqual(x.digest,y.digest);assert.notEqual(x.action.title,y.action.title);assert.notDeepEqual(x.score,y.score);
});
test('completed need does not solicit another delivery',()=>{
 const t=town();const {town:pending,reportId}=report(t,{need:'bread',quantity:2,actor:'fictional-reporter'});
 const ended=confirm(pending,{reportId,witness:'fictional-witness',accepted:true});
 const p=compile({town:ended,needId:'bread',facts:complete()});
 assert.equal(p.status,'NO_OPEN_NEED'); assert.match(p.invitation,/Do not send/);
});
test('rejects missing source and visibility labels',()=>{
 assert.throws(()=>validateFacts({contact:{value:'hey',evidence:'REPORTED'}}));
 assert.throws(()=>compile({town:town(),needId:'missing',facts:{}}));
});
test('escapes malicious source text in offline HTML',()=>{
 const f2=complete();f2.source=f('<img src=x onerror=alert(1)>');
 const p=compile({town:town(),needId:'bread',facts:f2});
 assert.doesNotMatch(formatCard(p),/<img src=x/);
 assert.match(formatCard(p),/&lt;img/);
});
test('offline demo reproducible byte for byte with a manifest',()=>{
 const a=mkdtempSync(join(tmpdir(),'gt2a-')),b=mkdtempSync(join(tmpdir(),'gt2b-'));
 const x=demo(a),y=demo(b);assert.deepEqual(x,y);
 for(const file of readdirSync(a))assert.deepEqual(readFileSync(join(a,file)),readFileSync(join(b,file)));
});