import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {BUDGET,FIELDS,GRANT,composeApplication,validateFields,verifyConstellationEvidence} from '../src/voqal-self-application.mjs';
const H=x=>'sha256:'+createHash('sha256').update(x).digest('hex');
function fixture(){
 const manifest={schema:'constellation.manifest/v1',authority:'LOCAL_FICTIONAL_SOFTWARE_ONLY'};
 const mb=Buffer.from(JSON.stringify(manifest)+'\n'),brief=Buffer.from('<!doctype html><html></html>');
 const receipt={schema:'constellation.receipt/v1',status:'ORIGINAL_SOURCE_SOFTWARE_EXECUTED',
  receiptId:'sha256:'+'a'.repeat(64),sourceRepositories:9,donorCheckouts:10,
  fieldVerified:false,physicalActs:0,externalContacts:0,humanDeeds:0,
  ownerCanonSelected:false,manifestSha256:H(mb),
  coreFiles:{'manifest.json':H(mb)}};
 return {manifest,mb,brief,receipt};
}
test('the official 750-character description and all field limits stay bounded',()=>{
 assert.equal(validateFields(),true);
 assert.ok(FIELDS.overview.text.length<=750);
 assert.ok(FIELDS.title.text.length<=200);
 assert.equal(BUDGET.reduce((sum,row)=>sum+row[1],0),30000);
 assert.equal(GRANT.closes,'2026-10-31T22:59:00-05:00');
});
test('one executed source receipt yields deterministic actual copy-ready documents without private narrative',()=>{
 const f=fixture();
 const a=composeApplication(f.receipt,f.manifest,f.brief.toString('utf8'),f.mb,f.brief);
 const b=composeApplication(f.receipt,f.manifest,f.brief.toString('utf8'),f.mb,f.brief);
 assert.deepEqual(a.outputs,b.outputs);
 assert.ok(a.outputs['application-review.html'].includes('The machine applies for the people it cannot replace.'));
 assert.ok(a.outputs['application-review.md'].includes('APPLICANT PRIVATE REVIEW REQUIRED'));
 assert.equal(a.form.authority.submission,false);
 assert.equal(a.form.authority.survivorIntake,false);
 assert.equal(Object.keys(a.outputs).length,5);
});
test('false original source, field authority and invalid brief bytes all refuse',()=>{
 const f=fixture();
 for(const change of [
  x=>x.receipt.fieldVerified=true,
  x=>x.receipt.humanDeeds=1,
  x=>x.receipt.sourceRepositories=89,
  x=>x.receipt.manifestSha256='sha256:'+'b'.repeat(64),
  x=>x.receipt.status='GRANT_SUBMITTED',
  x=>x.manifest.authority='CANON_SELECTED'
 ]){const sample=fixture();change(sample);
  assert.throws(()=>verifyConstellationEvidence(sample.receipt,sample.manifest,sample.brief.toString('utf8'),sample.mb,sample.brief));
 }
 const z=fixture();assert.throws(()=>verifyConstellationEvidence(z.receipt,z.manifest,'IMPOSTER',z.mb,z.brief));
});
test('a too-long applicant field is refused rather than truncated',()=>{
 const f=structuredClone(FIELDS);
 f.overview.text+=' EXCEED'.repeat(100);
 assert.throws(()=>validateFields(f),/CHARACTER_LIMIT_overview/);
});
