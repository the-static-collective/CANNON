import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {inspectMid,requestFor,verify,MID_SOURCES} from '../src/chronomid-seam-011.mjs';
const roots=process.env.CANNON_011_ROOTS?JSON.parse(readFileSync(process.env.CANNON_011_ROOTS,'utf8')):null;
test('real chronological center is two old source commits, not invented active branches',()=>{
 assert.equal(MID_SOURCES.length,4);
 assert.deepEqual([...new Set(MID_SOURCES.map(s=>s.chronological_position))],[49,50]);
 assert.equal(MID_SOURCES[0].repository,'the-static-collective/SEAMforge');
 assert.equal(MID_SOURCES[2].repository,'the-static-collective/toaster-oracle');
});
test('missing origins HOLD before any receiver effects',()=>{
 assert.throws(()=>inspectMid({}),/MISSING_REPO_ROOT/);
});
test('source-verified claims remain proposals; synthetic admission cannot cross',async t=>{
 if(!roots){t.skip('requires independent exact original Git checkouts');return}
 const d=inspectMid(roots);
 assert.equal(d.source_count,4);
 assert.equal(d.seam_candidate.epistemic_class,'PROPOSAL');
 assert.equal(d.admission,'NONE');
 assert.equal(d.execution.oracle_validator_run,false);
 assert.equal(d.ghot_030_readiness,'HOLD_MAIN_ONLY_SOURCE_HINT');
 assert.equal(d.seam_candidate.authority_not_transferred.includes('Oracle simulated admission'),true);
 assert.match(d.dossier_sha256,/^sha256:[a-f0-9]{64}$/);
 const req=requestFor(d,'/tmp/chronomid-011-dossier');
 assert.equal(req.disposition,'HOLD');
 assert.equal(req.spec.donor_claims.dossier.dossier_sha256,d.dossier_sha256);
 assert.equal(req.spec.donor_claims.external_owner_authenticated,false);
 assert.equal(req.spec.requested_effect.execution_authorized,false);
 assert.throws(()=>requestFor({...d,admission:'ADMITTED'},'/tmp/chronomid-011-dossier'),/DOSSIER_SCOPE_INVALID/);
});
test('cold signed reLATTE HOLD, bounded source and original donor claims',async t=>{
 if(!roots||!process.env.CANNON_011_OUTPUT){t.skip('needs completed native R14 crossing');return}
 const result=await verify(roots,process.env.CANNON_011_OUTPUT);
 assert.equal(result.status,'CHRONOMID_ORIGINAL_SOURCE_TO_SIGNED_RELATTE_HOLD_COLD_VERIFIED');
 assert.equal(result.summary.receiver_disposition,'HOLD');
 assert.equal(result.summary.source_git_commits[0],MID_SOURCES[0].commit);
 assert.equal(result.summary.source_git_commits[1],MID_SOURCES[2].commit);
 assert.equal(result.summary.oracle_runtime_admission,false);
 assert.equal(result.applications_executed,0);
});
