import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {design,verify,requestFor,P0_SHA,TRANCH_SHA,GHOT_SHA} from '../src/project0-tranch-014.mjs';
const roots=process.env.CANNON_014_ROOTS?JSON.parse(readFileSync(process.env.CANNON_014_ROOTS,'utf8')):null;
test('missing originals fail closed',async()=>{
 await assert.rejects(()=>design({}),/ROOT_UNAVAILABLE/);
});
test('Project0 native 3-branch laws, TranchNode source pin, and no authority promotion',async t=>{
 if(!roots){t.skip('needs original pinned Git repos with compiled Project0');return}
 const d=await design(roots),p0=roots['the-static-collective/project0'];
 assert.equal(d.schema,'cannon.project0-tranchnode-encounter/v0');
 assert.equal(d.original_git_source_witnesses.length,5);
 assert.equal(d.native_project0_world_encounter.disposition.status,'refused');
 assert.equal(d.native_project0_world_encounter.disposition.inspectedObject,false);
 assert.equal(d.native_project0_l_branch.terminal.body.refusedAttemptRefs.includes('attempt-effect'),true);
 assert.deepEqual(d.native_project0_l_branch.terminal.body.authorityRefsUsed,[]);
 assert.equal(d.native_project0_continuity.alive.authority.externalAdmissionRequired,true);
 assert.equal(d.native_project0_continuity.alive.authority.portableEffect,'none');
 assert.ok(d.native_project0_continuity.alive.unresolved.some(x=>x.lane==='authority'));
 assert.equal(d.destination_encounter_admitted,false);
 assert.equal(d.external_effects,0);
 assert.equal(d.tranch_node_proposed_artifact_address,'sha256:'+d.tranch_node_exact_bytes_sha256);
 const req=createRequire(import.meta.url);
 const continuity=req(join(p0,'.build/src/continuity-profile/index.js'));
 const propagation=req(join(p0,'.build/src/l-branch/index.js'));
 const world=req(join(p0,'.build/src/world-encounter/index.js'));
 assert(continuity.verifyContinuityClaim(d.native_project0_continuity.ref,d.native_project0_continuity.claim));
 assert.throws(()=>world.evaluateEncounter(
  {...d.native_project0_world_encounter.envelope,sourceAuthorityRefs:['claimed-shared-source-grant']},
  {destinationNodeRef:'ghot:isolated-local-hash',destinationFrameRef:'ghot:synthetic-review-room-014',
   manifest:{nodeRef:'ghot:isolated-local-hash',protocolVersion:'p0.exchange/0.1',
    accepts:['proposal'],emits:[],capabilities:['inspect_public_address'],
    requiredScopes:['public'],mustNever:['accept_source_authority_as_local']},
   grantedScopes:['public'],destinationAuthorityRefs:['claimed-shared-source-grant']},
  {requiredCapability:'inspect_public_address',requiredScope:'public',
   localDetermination:'admit',evidenceRefs:[]}
 ),/ENCOUNTER_/); // hostile mismatch must not silently become an external grant
 const bad=structuredClone(d.native_project0_l_branch.declaration);
 const badCandidate=structuredClone(d.native_project0_l_branch.candidates);
 badCandidate[1].requiresAuthorityRefs=['grant:never-issued'];
 const refused=propagation.runLBranch(bad,badCandidate);
 assert.ok(refused.terminal.body.refusedAttemptRefs.includes('attempt-effect'));
 const requested=requestFor(d,'/tmp/tranch014');
 assert.equal(requested.disposition,'HOLD');
 assert.equal(requested.spec.requested_effect.execution_authorized,false);
 assert.throws(()=>requestFor({...d,destination_encounter_admitted:true},'/tmp/tranch014'),/ILLEGAL_AUTHORITY_PROJECTION/);
});
test('real immutable TranchNode local byte storage, native GHoT receipt, R14 signatures cold replay',async t=>{
 if(!roots||!process.env.CANNON_014_OUTPUT){t.skip('needs completed four-branch specimen');return}
 const x=await verify(roots,process.env.CANNON_014_OUTPUT);
 assert.equal(x.status,'PROJECT0_THREE_PROTOCOLS_TRANCHNODE_GHOT_RELATTE_COLD_VERIFIED');
 assert.equal(x.immutable_tranch_bytes_verified,true);
 assert.equal(x.ghot_local_hash_only,true);
 assert.equal(x.ghot_signature,false);
 assert.equal(x.signed_relatte_objects_verified,3);
 assert.equal(x.external_effects,0);
});
