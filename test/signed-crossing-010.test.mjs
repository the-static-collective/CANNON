import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {jcs,verifySignedWorkerEvidence} from '../src/ghot-signed-030.mjs';
import {verify,GHOT_030_SHA,RELATTE_R14_SHA} from '../src/branch-signed-crossing-010.mjs';

const fresh=x=>structuredClone(x);
const dir=process.env.CANNON_010_EVIDENCE_DIR;
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const rootsFile=process.env.CANNON_010_ROOTS;
const plan=read(new URL('../examples/branch-loadout-008.plan.json',import.meta.url));
test('bounded JSON canonicalization rejects values not accepted by signer',()=>{
 assert.equal(jcs({z:2,a:{two:true,one:'1'}}),'{"a":{"one":"1","two":true},"z":2}');
 assert.throws(()=>jcs({rate:1.5}),/JCS_UNSAFE_NUMBER/);
 assert.throws(()=>jcs({'ñ':1}),/JCS_NONASCII_KEY/);
});
test('real GHoT signatures validate; hostile authority laundering fails closed',async t=>{
 if(!dir){t.skip('needs generated GHoT 030 activation');return}
 const original=read(join(dir,'signed-ghot-evidence.json')),expected=original.context;
 const actual=await verifySignedWorkerEvidence(original,expected);
 assert.equal(actual.ticket_signature_verified,true);
 assert.equal(actual.execution_receipt_signature_verified,true);
 assert.equal(actual.owner_identity_authenticated,false);
 assert.equal(actual.operation,'hash-exact-source');
 assert.equal(original.ticket.one_operation,true);
 assert.equal(original.receipt.ticket_spent,true);
 assert.equal(original.job.donor_code_executed,false);
 const reject=async (mutate,code)=>{
   const x=fresh(original);mutate(x);
   await assert.rejects(()=>verifySignedWorkerEvidence(x,expected),code);
 };
 await reject(x=>{x.receipt.success=false},/SIGNED_RECEIPT_IDENTITY_MISMATCH/);
 await reject(x=>{x.receipt.signing.signature='A'.repeat(86)},/NONCANONICAL_BASE64URL|GHOT_SIGNATURE_INVALID|INVALID_BASE64URL/);
 await reject(x=>{x.ticket.ttl_seconds=1000},/SIGNED_TICKET_IDENTITY_MISMATCH|TTL_OUT_OF_BOUNDS/);
 await reject(x=>{x.receipt.ticket_id='ghot-activation-ticket-v0:'+'0'.repeat(64)},/SIGNED_RECEIPT_IDENTITY_MISMATCH/);
 await reject(x=>{x.receipt.proposal_address='sha256:'+'0'.repeat(64)},/SIGNED_RECEIPT_IDENTITY_MISMATCH/);
 await reject(x=>{x.ticket.descriptor.destination.operation='run-shell'},/SIGNED_TICKET_IDENTITY_MISMATCH/);
 await reject(x=>{x.job.remote_effects=1},/UNDECLARED_EFFECT|SIGNED_JOB_RESULT_ADDRESS_MISMATCH/);
 await reject(x=>{x.job.blob_sha256='0'.repeat(64)},/JOB_SOURCE_CHANGED/);
 await reject(x=>{x.context.sha256='0'.repeat(64)},/ORIGINAL_GIT_SOURCE_NOT_BOUND/);
 await reject(x=>{x.ticket.owner_human_verified=true},/SIGNED_TICKET_FIELDS_CHANGED/);
 await reject(x=>{x.receipt.owner_human_verified=true},/SIGNED_RECEIPT_FIELDS_CHANGED/);
 await reject(x=>{x.receipt.signing.public_key.x=x.ticket.signing.public_key.y},/GHOT_SIGNATURE_INVALID|BODY_PARTICULAR_MISMATCH|Invalid/);
});
test('native reLATTE crossing cold verifies embedded signed source and receiver journal',async t=>{
 if(!dir||!rootsFile){t.skip('needs complete pinned Git checkouts');return}
 const result=await verify(plan,read(rootsFile),dir);
 assert.equal(result.status,'SIGNED_GHOT_TO_RELATTE_HOLD_COLD_VERIFIED');
 assert.equal(result.ghotSignedObjectsVerified,2);
 assert.equal(result.relatteSignedObjectsVerified,3);
 assert.equal(result.summary.receiver_disposition,'HOLD');
 assert.equal(result.summary.exact_ghot_commit,GHOT_030_SHA);
 assert.equal(result.summary.exact_relatte_commit,RELATTE_R14_SHA);
 assert.equal(result.externalEffects,0);
});
