import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {validateCompositionRegistry,handoffFromProof,run} from '../scripts/reflex-composer.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const encode=x=>JSON.stringify(x,null,2)+'\n';
const original=JSON.parse(readFileSync(new URL('../registry/reflex-compositions-v1.json',import.meta.url)));
function upstream(){
 const planId='plan-'+'a'.repeat(24);
 const choice={schema:'cannon.reflex-choice/v1',capabilityId:'film-press-synthetic-selection/v1',
 planId,humanKeep:false,publication:false,receiverAdmission:false};
 const core={schema:'cannon.reflex-memory/v1',status:'SOURCE_VERIFIED_EXECUTION_HELD',
 publication:false,adoption:false,realWorldWitnesses:0,humanTimeSavedSeconds:null,
 choiceSha256:hash(encode(choice)),reusableRecipe:{capabilityId:choice.capabilityId,
 planId,requiresExplicitNewAuthorization:true,ownerRunner:'scripts/inspand-reflex.mjs'}};
 return {planId,choice,memory:{...core,memorySha256:hash(encode(core))}};
}
test('registry pins concrete compatible typed edges rather than arbitrary scripts',()=>{
 const r=validateCompositionRegistry(original);
 assert.equal(r.stages.length,2);
 assert.equal(r.edges[0].adapter,'VERIFIED_RECEIPT_PLAN_ID_V1');
 assert.equal(r.constraints.autonomy,false);
 const bad=structuredClone(original);bad.recipes[0].edges[0].field='receipt.executableCode';
 assert.throws(()=>validateCompositionRegistry(bad),/UNVERIFIED_EDGE/);
 const broad=structuredClone(original);broad.recipes[0].stages.push(broad.recipes[0].stages[0]);
 assert.throws(()=>validateCompositionRegistry(broad),/STAGE_PORT/);
});
test('a verifiable upstream memory supplies downstream plan identity',()=>{
 const {planId,choice,memory}=upstream();
 const handoff=handoffFromProof(memory,choice,planId);
 assert.equal(handoff.boundPlanId,planId);
 assert.equal(handoff.consumer.inputPort,'planz.generated-plan/v1');
 assert.equal(handoff.authority,'LOCAL_SYNTHETIC_ONLY');
 assert.match(handoff.handoffSha256,/^[0-9a-f]{64}$/);
 assert.deepEqual(handoff,handoffFromProof(memory,choice,planId));
});
test('tampering, changing identity, publication and invented consent all HOLD',()=>{
 const {planId,choice,memory}=upstream();
 assert.throws(()=>handoffFromProof(memory,choice,'plan-'+'b'.repeat(24)),/PROOF_CHOICE/);
 const altered=structuredClone(memory);altered.reusableRecipe.planId='plan-'+'b'.repeat(24);
 assert.throws(()=>handoffFromProof(altered,choice,planId),/PROOF_RECIPE/);
 const approved=structuredClone(choice);approved.humanKeep=true;
 assert.throws(()=>handoffFromProof(memory,approved,planId),/PROOF_CHOICE/);
 const published=structuredClone(memory);published.publication=true;
 assert.throws(()=>handoffFromProof(published,choice,planId),/PROOF_AUTHORITY/);
 const stale=structuredClone(memory);stale.memorySha256='0'.repeat(64);
 assert.throws(()=>handoffFromProof(stale,choice,planId),/PROOF_HASH/);
});
test('read-only listing and explicit synthetic authorization for composition',()=>{
 const listed=run(['list']);
 assert.equal(listed.authority,'NONE');
 assert.equal(listed.recipes.length,1);
 assert.throws(()=>run(['list','--authorize','SYNTHETIC_TEST_ONLY']),/LIST_MUST_BE_READ_ONLY/);
 assert.throws(()=>run(['build','--recipe','plan-proof-to-pixels-and-print/v1',
 '--plan','plan-'+'a'.repeat(24),'--planz','x','--roots','y','--out','z']),/AUTHORIZATION/);
 assert.throws(()=>run(['build','--recipe','arbitrary/v1',
 '--plan','plan-'+'a'.repeat(24),'--planz','x','--roots','y','--out','z',
 '--authorize','SYNTHETIC_TEST_ONLY']),/UNKNOWN_RECIPE/);
});
