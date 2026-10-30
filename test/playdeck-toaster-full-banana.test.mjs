import test from "node:test";
import assert from "node:assert/strict";
import {describeBoundary,run} from "../scripts/playdeck-toaster-full-banana.mjs";

const real={
 originalPlaydeckFull:true,fullPlaydeckPerformance:true,sealedPlaydeckReceipt:true,
 sourceFullProofVerified:true,playdeckVideoSha256:"a".repeat(64),
 toasterInputSha256:"a".repeat(64),nativeVideoAdmitted:true,
 foreignMaterialWasCompiled:true,originalToasterIssuedReceipt:true,
 originalDogramGenerated:true,originalAudioUsed:true,realWorldActions:0,
 published:false,operatorAuthorizedSynthetic:true,toasterOutputSha256:"b".repeat(64)
};
test("full original-owner source seal is required before receipt handoff",()=>{
 const x=describeBoundary(real);
 assert.equal(x.fullPlaydeckPerformance,true);
 assert.equal(x.sealedPlaydeckReceipt,true);
 assert.equal(x.nativeToasterDogram,true);
 assert.equal(x.externalPublishing,false);
 assert.equal(x.rightsGranted,false);
});
test("no fictitious full source, seal, media or consumer receipt can qualify",()=>{
 const edits=[
 {originalPlaydeckFull:false},{fullPlaydeckPerformance:false},
 {sealedPlaydeckReceipt:false},{sourceFullProofVerified:false},
 {playdeckVideoSha256:"forged"},{toasterInputSha256:"b".repeat(64)},
 {nativeVideoAdmitted:false},{foreignMaterialWasCompiled:false},
 {originalToasterIssuedReceipt:false},{originalDogramGenerated:false},
 {originalAudioUsed:false},{operatorAuthorizedSynthetic:false},
 {published:true},{realWorldActions:1}
 ];
 for(const item of edits)
  assert.throws(()=>describeBoundary({...real,...item}),/HOLD_NATIVE_VIDEO_CROSSING/);
});
test("read-only inspection and no execution without explicit synthetic authorization",async()=>{
 const x=await run(["inspect"]);
 assert.equal(x.expectedMode,"ORIGINAL_COMPLETE_GENESIS_VIDEO");
 assert.equal(x.originalPlaydeckSealMustBeVerified,true);
 await assert.rejects(run(["inspect","--authorize","SYNTHETIC_TEST_ONLY"]),/READONLY/);
 await assert.rejects(run(["build","--playdeck","/tmp"]),/REQUIRED_/);
 await assert.rejects(run(["build","--playdeck","/tmp","--toaster","/tmp","--out","/tmp/fake"]),/AUTHORIZATION/);
});
