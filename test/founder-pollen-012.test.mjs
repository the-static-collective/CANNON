import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {discover,verify,selectReviewSources,validateRegistry,roundtripRequest,ANCHOR,DOOR} from '../src/founder-pollen-012.mjs';
const roots=process.env.CANNON_012_ROOTS?JSON.parse(readFileSync(process.env.CANNON_012_ROOTS,'utf8')):null;

test('registry validator refuses fabricated authority and missing graph nodes',()=>{
 const p={version:1,updated:'x',projects:[
   {id:ANCHOR,repository:'the-static-collective/toaster-lab',status:'active',relations:[{type:'PROPOSES_TO',target:DOOR}],owns:[],nonAuthority:[]},
   {id:DOOR,repository:'the-static-collective/the-haunted-toaster',status:'active',relations:[],owns:[],nonAuthority:[]}
 ]};
 const i={version:1,updated:'x',invariants:[{
  id:'proposal-not-authority',owner:ANCHOR,consumers:[DOOR],maturity:'proven',proofRefs:[]
 }]};
 assert.equal(validateRegistry(p,i),true);
 assert.throws(()=>validateRegistry({...p,projects:[...p.projects,p.projects[0]]},i),/DUPLICATE_PROJECT/);
 assert.throws(()=>validateRegistry(p,{...i,invariants:i.invariants.map(x=>({...x,consumers:['unknown']}))}),/INVARIANT_PARTICIPANT_UNKNOWN/);
 assert.throws(()=>validateRegistry({...p,projects:p.projects.map(x=>({...x,relations:[]}))},i),/MISSING_REAL_TYPED_RELATION/);
 assert.throws(()=>validateRegistry(p,{...i,invariants:i.invariants.map(x=>({...x,maturity:'proposal'}))}),/MISSING_RECORDED_PROVEN_INVARIANT/);
});
test('no fabricated Pollen result may become a CANNON source selection',()=>{
 const projects=[{id:ANCHOR,repository:'the-static-collective/toaster-lab'},
                 {id:DOOR,repository:'the-static-collective/the-haunted-toaster'}];
 assert.throws(()=>selectReviewSources({doors:[]},projects),/REQUIRED_EVIDENCED_DOOR_MISSING/);
 assert.throws(()=>selectReviewSources({doors:[{projectId:DOOR,repository:projects[1].repository,status:'active',evidence:[]}]},projects),/TYPED_RELATION_NOT_EVIDENCED/);
 const typed={kind:'typed-relation',relationType:'PROPOSES_TO',direction:'outbound',sourceProjectId:ANCHOR,targetProjectId:DOOR};
 assert.throws(()=>selectReviewSources({doors:[{projectId:DOOR,repository:projects[1].repository,status:'active',evidence:[typed]}]},projects),/SHARED_INVARIANT_NOT_EVIDENCED/);
 assert.throws(()=>selectReviewSources({doors:[{projectId:DOOR,repository:projects[1].repository,status:'active',evidence:[typed,{kind:'shared-invariant',invariantId:'proposal-not-authority',ownerProjectId:ANCHOR}]}]},[{...projects[0],repository:'the-static-collective/evil'},projects[1]]),/CATALOG_PROJECT_REPOSITORY_MISMATCH/);
});
test('actual Founder Node Pollen, two original donor branch sources and descriptor-only handoff',async t=>{
 if(!roots){t.skip('needs pinned local original Git source');return}
 const result=await discover(roots);
 assert.equal(result.schema,'cannon.founder-pollen-bridge/v0');
 assert.equal(result.routed_project,ANCHOR);
 assert.equal(result.related_project_door,DOOR);
 assert.equal(result.corrobation??null,null);
 assert.equal(result.corroboration.original_pollen_function_executed,true);
 assert.equal(result.corroboration.original_ecosystem_projection_executed,true);
 assert.equal(result.corroboration.candidate_modules_imported_or_executed,false);
 const door=result.genuine_pollen_result.doors.find(x=>x.projectId===DOOR);
 assert.ok(door);
 assert.deepEqual(door.evidence.map(x=>x.kind),['typed-relation','shared-invariant']);
 assert.equal(result.founder_workbench_handoff.mode,'descriptor-only');
 assert.equal(result.founder_workbench_handoff.executionAuthorized,false);
 assert.equal(result.founder_workbench_handoff.localReadiness,'unknown');
 assert.equal(result.founder_workbench_handoff.compatibility,'unverified');
 assert.equal(result.verified_source_report.status,'SOURCE_VERIFIED_REVIEW_REQUIRED');
 assert.equal(result.verified_source_report.entries.length,2);
 assert.equal(result.verified_source_report.donor_executions,0);
 assert.equal(result.candidate_plan.entries[0].branchHint,'agent/pr-3-exportable-proposal');
 assert.equal(result.candidate_plan.entries[1].branchHint,'agent/import-toaster-lab-proposal');
 const request=roundtripRequest(result,'/tmp/founder-pollen-012-tmp');
 assert.equal(request.disposition,'HOLD');
 assert.equal(request.spec.donor_claims.dossier.dossier_sha256,result.dossier_sha256);
 assert.equal(request.spec.requested_effect.execution_authorized,false);
 assert.throws(()=>roundtripRequest({...result,executionAuthorized:true},'/tmp/founder-pollen-012-tmp'),/CANNOT_TRANSPORT_AUTHORITY/);
});
test('independent cold replay verifies reLATTE signed HOLD without donor execution',async t=>{
 if(!roots||!process.env.CANNON_012_OUTPUT){t.skip('requires full held R14 specimen');return}
 const x=await verify(roots,process.env.CANNON_012_OUTPUT);
 assert.equal(x.status,'FOUNDER_POLLEN_TO_CANNON_SOURCE_LOADOUT_RELATTE_HOLD_COLD_VERIFIED');
 assert.equal(x.summary.disposition,'HOLD');
 assert.equal(x.summary.source_branch_count,2);
 assert.equal(x.branch_programs_executed,0);
 assert.equal(x.remote_effects,0);
});
