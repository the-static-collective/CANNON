import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {derive,verify,requestFor,PROJECT0_SHA} from '../src/project0-floor-013.mjs';
const roots=process.env.CANNON_013_ROOTS?JSON.parse(readFileSync(process.env.CANNON_013_ROOTS,'utf8')):null;
test('original Project0 floor must be independently present',async()=>{
 await assert.rejects(()=>derive({}),/MISSING_ROOT/);
});
test('Project0 semantic identity, raw bytes and native missing authority refusal are different',async t=>{
 if(!roots){t.skip('requires original pinned six repo checkouts');return}
 const {founder,project0:w}=await derive(roots);
 assert.equal(w.project0_source_commit,PROJECT0_SHA);
 assert.match(w.semantic_node_id,/^node-[1-9A-HJ-NP-Za-km-z]+$/);
 assert.match(w.semantic_request_id,/^reqt-[1-9A-HJ-NP-Za-km-z]+$/);
 assert.match(w.raw_dossier_artifact_sha256,/^[0-9a-f]{64}$/);
 assert.notEqual(w.founder_pollen_dossier_sha256,w.raw_dossier_artifact_sha256);
 assert.equal(w.canonical_node_body.kind,'proposal');
 assert.equal(w.native_project0_authority_check.status,'refused');
 assert.deepEqual(w.native_project0_authority_check.reasonCodes,['AUTHORITY_MISSING']);
 assert.equal(w.native_project0_admission_check.status,'refused');
 assert.equal(w.project0_node_admitted,false);
 const mod=createRequire(import.meta.url)(join(roots['the-static-collective/project0'],'.build/src/canonical-addressing/index.js'));
 assert.equal(mod.computeArtifactAddress(Buffer.from(JSON.stringify(founder,null,2)+'\n')).digestHex,w.raw_dossier_artifact_sha256);
 assert.throws(()=>mod.computeSemanticAddress('Node',{...w.canonical_node_body,createdAt:'2026-10-11T12:00:00+00:00'}),/INVALID_TIMESTAMP/);
 assert.throws(()=>mod.computeSemanticAddress('Node',{...w.canonical_node_body,body:{v:undefined}}),/UNDEFINED_VALUE/);
 assert.throws(()=>mod.computeSemanticAddress('Node',{...w.canonical_node_body,body:{notFinite:NaN}}),/NON_FINITE_NUMBER/);
 assert.throws(()=>mod.parseSemanticAddress('Node',w.semantic_request_id),/Invalid Node address prefix/);
 const diff=mod.computeSemanticAddress('Node',{...w.canonical_node_body,body:{...w.canonical_node_body.body,epistemic_kind:'admitted'}});
 assert.notEqual(diff.textualId,w.semantic_node_id);
 const request=requestFor(w,'/tmp/project0-013');
 assert.equal(request.spec.donor_claims.project0_node_admitted,false);
 assert.equal(request.disposition,'HOLD');
 assert.throws(()=>requestFor({...w,project0_node_admitted:true},'/tmp/project0-013'),/PROJECT0_CANNOT_CARRY_ADMISSION_CLAIM/);
 assert.throws(()=>requestFor({...w,native_project0_admission_check:{status:'admitted',reasonCodes:[]}},'/tmp/project0-013'),/PROJECT0_CANNOT_CARRY_ADMISSION_CLAIM/);
});
test('signed reLATTE crossing and Project0 native identity reproduce cold',async t=>{
 if(!roots||!process.env.CANNON_013_OUTPUT){t.skip('requires completed R14 HOLD specimen');return}
 const result=await verify(roots,process.env.CANNON_013_OUTPUT);
 assert.equal(result.status,'PROJECT0_NATIVE_SEMANTIC_AND_MISSING_AUTHORITY_RELATTE_HOLD_VERIFIED');
 assert.equal(result.project0_authority_permitted,false);
 assert.equal(result.summary.project0_admission,'REFUSED');
 assert.equal(result.summary.receiver_disposition,'HOLD');
 assert.equal(result.signed_relatte_receipts_verified,3);
 assert.equal(result.remote_effects,0);
});
