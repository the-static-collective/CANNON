import test from 'node:test';
import assert from 'node:assert/strict';
import {gate,run} from '../scripts/playdeck-toaster-native-checkpoint.mjs';
const sample={playdeckStillSha256:'a'.repeat(64),playdeckPhase:'checkpoint',
 playdeckFullPerformance:false,toasterIssuedReceipt:true,originalDogramAccepted:true,
 outputHashVerified:true,imageHashVerified:true,authorizedOnlyForSynthetic:true,
 noPublication:true,toasterVideoSha256:'b'.repeat(64)};
test('genuine checkpoint renderer is not misrepresented as a full PlayDeck performance',()=>{
 const x=gate(sample);
 assert.equal(x.status,'ORIGINAL_NATIVE_CHECKPOINT_TO_GENUINE_TOASTER_RENDER');
 assert.equal(x.playdeckFullPerformance,false);
 assert.equal(x.newFullPerformanceReceipt,false);
 assert.equal(x.originalToasterGeneratedVideo,true);
 assert.equal(x.originalDogramAccepted,true);
 assert.equal(x.published,false);
 assert.equal(x.rightsTransferred,false);
});
test('no fabricated source bytes, scores, native receipts, hashes or approvals pass',()=>{
 for(const k of ['playdeckStillSha256','toasterIssuedReceipt','originalDogramAccepted',
  'outputHashVerified','imageHashVerified','authorizedOnlyForSynthetic','noPublication']){
  const d={...sample,[k]:false};
  assert.throws(()=>gate(d),/HOLD_PLAYDECK_TOASTER_NATIVE/);
 }
 assert.throws(()=>gate({...sample,playdeckPhase:'rendered'}),/DO_NOT_FAKE_RENDERED_PERFORMANCE/);
 assert.throws(()=>gate({...sample,playdeckFullPerformance:true}),/DO_NOT_FAKE_RENDERED_PERFORMANCE/);
});
test('read-only inspect and explicit operator gate',async()=>{
 const x=await run(['inspect']);
 assert.equal(x.adapter,'PLAYDECK_STILL_TO_ORIGINAL_TOASTER_IMAGE_INPUT_V1');
 await assert.rejects(run(['inspect','--authorize','SYNTHETIC_TEST_ONLY']),/INSPECT_ONLY/);
 await assert.rejects(run(['build','--playdeck','/tmp']),/REQUIRED_/);
 await assert.rejects(run(['build','--playdeck','/tmp','--toaster','/tmp','--out','/tmp/x']),/AUTHORIZATION/);
});
