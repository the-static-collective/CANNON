import test from 'node:test';
import assert from 'node:assert/strict';
import {DONORS,fixture,verifyFixture} from '../src/culture-use-003.mjs';
const input=()=>({candidate:{decision:'HELD_FOR_EDITOR',license:'NOT_GRANTED',
 workAdmission:'NONE',published:false,works:[{path:'comic.html',sha256:'sha256:'+'a'.repeat(64)}]},
 holdReceipt:{disposition:'HELD_FOR_EDITOR',receiptId:'sha256:'+'b'.repeat(64)}});
const auth=({action,currentStatus,isOpenerOrSteward,isPledgeAuthor})=>({ok:
 action==='accept'?currentStatus==='proposed'&&isOpenerOrSteward:
 action==='report_complete'?currentStatus==='accepted'&&isPledgeAuthor:
 action==='confirm'?currentStatus==='reported_complete'&&isOpenerOrSteward&&!isPledgeAuthor:false});
test('donor commits are exact and independent',()=>{
 assert.equal(DONORS.fm.sha,'c9206d5055ad574a23acb2eceb5f8785a4ad64fe');
 assert.equal(DONORS.penny.sha,'a36777cb87bcfb6b7706b910ba18c4c4b24c73a3');
});
test('different local reviewers required, source identified by held SHA',()=>{
 assert.equal(verifyFixture(fixture(input()),auth),true);
 assert.equal(verifyFixture(fixture(input(),'reported'),auth),true);
 for(const variant of ['self-confirmed','foreign-confirmed'])
  assert.throws(()=>verifyFixture(fixture(input(),variant),auth));
});
test('mutated source, actor, timestamp and simulated authorization refuse',()=>{
 const a=fixture(input());a.events[2].payload.sourceComicSha256='sha256:'+'f'.repeat(64);
 assert.throws(()=>verifyFixture(a,auth));
 const b=fixture(input());b.events[3].createdAt=b.events[2].createdAt;
 assert.throws(()=>verifyFixture(b,auth));
 const c=input();c.candidate.published=true;
 assert.throws(()=>fixture(c));
 const d=fixture(input());d.events[2].eventType='pledge.withdrawn';
 assert.throws(()=>verifyFixture(d,auth));
});