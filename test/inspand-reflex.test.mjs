import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateManifest,selectPlan} from '../scripts/inspand-reflex.mjs';
const sha=v=>createHash('sha256').update(v).digest('hex');
const obj=(p,v)=>({id:p+'-'+sha(JSON.stringify(v)).slice(0,24),...v});
function fixture(){
 const b={authority:'NONE',status:'PROPOSED_UNVERIFIED',executed:false,admitted:false,published:false,sourceDigest:'a'.repeat(64)};
 const roots=Array.from({length:8},(_,i)=>obj('src',{...b,chamberId:i===0?'RHYTHM-MUTANT':'OTHER-'+i}));
 const cuts=roots.flatMap(r=>['ABSENCE','TIME','CARRIER','RECEIVER'].map(l=>obj('cut',{...b,parentId:r.id,generation:1,lensId:l})));
 const plans=roots.map(r=>obj('plan',{...b,parentIds:[r.id],cutIds:cuts.filter(c=>c.parentId===r.id).map(c=>c.id).sort(),generation:1,kind:'LENS_SYNTHESIS'}));
 const m={schema:'static-collective/planz-recursive-reactor/v1/manifest',source:{evidenceLevel:'LOW/UNKNOWN conversation reconstruction',ancestorOutputSha256:'a'.repeat(64)},parameters:{depth:1,crossLimit:0},roots,cuts,proposedPlans:plans};
 return {...m,manifestSha256:sha(JSON.stringify(m))};
}
test('synthetic selected original-addressed plan is explicit and bounded',()=>{
 const m=fixture();
 assert.equal(selectPlan(m,m.proposedPlans[0].id).root.chamberId,'RHYTHM-MUTANT');
 assert.throws(()=>selectPlan(m,m.proposedPlans[1].id),/UNPROVEN_PLAN_ROUTE/);
 assert.throws(()=>selectPlan(m,'plan-'+ '0'.repeat(24)),/UNKNOWN_PLAN/);
 assert.throws(()=>selectPlan(m,undefined),/EXPLICIT_PLAN_ID/);
});
test('tamper, fabricated authority, broken ancestry and unbounded growth fail closed',()=>{
 const x=fixture();validateManifest(x);
 const t=structuredClone(x);t.proposedPlans[0].authority='OWNER';assert.throws(()=>validateManifest(t),/MANIFEST_DIGEST/);
 const v=structuredClone(x);v.proposedPlans[0].parentIds=['made-up'];
 const {manifestSha256,...body}=v;v.manifestSha256=sha(JSON.stringify(body));
 assert.throws(()=>validateManifest(v),/ADDRESS_FORGED/);
 const u=structuredClone(x);u.parameters.depth=9;
 const {manifestSha256:ignore,...core}=u;u.manifestSha256=sha(JSON.stringify(core));
 assert.throws(()=>validateManifest(u),/RECURSION_LIMITS/);
});
