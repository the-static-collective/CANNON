import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildMediaBinding,selectPlan,validateManifest} from '../scripts/inspand-reflex.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const object=(kind,value)=>({id:kind+'-'+sha(JSON.stringify(value)).slice(0,24),...value});
function manifest(sourceLabel='first source question'){
 const flag={schema:'test',status:'PROPOSED_UNVERIFIED',authority:'NONE',
  executed:false,admitted:false,published:false,sourceDigest:'a'.repeat(64)};
 const roots=Array.from({length:8},(_,i)=>object('src',{
  ...flag,chamberId:i===0?'RHYTHM-MUTANT':i===1?'ORCHARD-CINEMA':'NOT_ROUTED_'+i,
  question:i===0?sourceLabel:'another hypothesis '+i,smallestProof:'synthetic, not human'}));
 const cuts=roots.flatMap(root=>['ABSENCE','TIME','CARRIER','RECEIVER'].map(lens=>
  object('cut',{...flag,parentId:root.id,generation:1,lensId:lens,
    pressureQuestion:'question for '+lens,stopCondition:'stop on '+lens})));
 const proposedPlans=roots.map(root=>object('plan',{...flag,generation:1,
   kind:'LENS_SYNTHESIS',parentIds:[root.id],
   cutIds:cuts.filter(x=>x.parentId===root.id).map(x=>x.id).sort(),
   question:'How to make pixels from this evidence?',
   smallestProof:'new native output digest'}));
 const m={schema:'static-collective/planz-recursive-reactor/v1/manifest',
  source:{evidenceLevel:'LOW/UNKNOWN conversation reconstruction',ancestorOutputSha256:flag.sourceDigest},
  parameters:{depth:1,crossLimit:0},roots,cuts,proposedPlans};
 return {...m,manifestSha256:sha(JSON.stringify(m))};
}
test('two separate original-shaped plans map to independently variable native seeds',()=>{
 const m=manifest();validateManifest(m);
 const r=buildMediaBinding(m,m.proposedPlans[0]);
 const o=buildMediaBinding(m,m.proposedPlans[1]);
 assert.equal(r.schema,'cannon.inspand-plan-binding/v1');
 assert.deepEqual(r.cuts,['ABSENCE','CARRIER','RECEIVER','TIME']);
 assert.match(r.toasterSeed,/^INSPAND_002_[a-f0-9]{40}$/);
 assert.notEqual(r.digest,o.digest);
 assert.notEqual(r.toasterSeed,o.toasterSeed);
 assert.equal(r.mediaAuthority,'SYNTHETIC_ONLY');
 assert.equal(r.ownerPermissions,'NONE');
 assert.equal(r.digest,buildMediaBinding(m,m.proposedPlans[0]).digest);
});
test('changing source question with recomputed ancestry changes actual native seed',()=>{
 const first=manifest('a note about rhythm');
 const second=manifest('a note about garden film');
 const a=buildMediaBinding(first,first.proposedPlans[0]);
 const b=buildMediaBinding(second,second.proposedPlans[0]);
 assert.notEqual(a.toasterSeed,b.toasterSeed);
 assert.notEqual(a.sourceRootId,b.sourceRootId);
 assert.notEqual(a.manifestSha256,b.manifestSha256);
});
test('independent selection and forged plan hold',()=>{
 const m=manifest();
 assert.throws(()=>selectPlan(m,m.proposedPlans[2].id,'film-press-plan-shaped/v1'),/UNPROVEN_PLAN_ROUTE/);
 assert.throws(()=>selectPlan(m,m.proposedPlans[1].id),/UNPROVEN_PLAN_ROUTE/);
 const forged=structuredClone(m);forged.proposedPlans[0].question='injected factual claim';
 assert.throws(()=>buildMediaBinding(forged,forged.proposedPlans[0]),/MANIFEST_DIGEST/);
});
