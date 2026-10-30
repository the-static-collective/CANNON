import test from "node:test";
import assert from "node:assert/strict";
import {describeBoundary,run} from "../scripts/playdeck-toaster-native-video.mjs";

const real={
 originalPlaydeckExcerpt:true,fullPlaydeckPerformance:false,
 sealedPlaydeckReceipt:false,playdeckVideoSha256:"a".repeat(64),
 toasterInputSha256:"a".repeat(64),nativeVideoAdmitted:true,
 foreignMaterialWasCompiled:true,originalToasterIssuedReceipt:true,
 originalDogramGenerated:true,originalAudioUsed:true,realWorldActions:0,
 published:false,operatorAuthorizedSynthetic:true,
 toasterOutputSha256:"b".repeat(64)
};
test("genuine moving-video input is not mislabeled full original PlayDeck performance",()=>{
 const x=describeBoundary(real);
 assert.equal(x.status,"ORIGINAL_NATIVE_EXCERPT_VIDEO_TO_FOREIGN_MATERIAL_TO_DOGRAM");
 assert.equal(x.fullPlaydeckPerformance,false);
 assert.equal(x.sealedPlaydeckReceipt,false);
 assert.equal(x.nativeToasterReceipt,true);
 assert.equal(x.nativeToasterDogram,true);
 assert.equal(x.externalPublishing,false);
});
test("no invented original video identities, native receipts or rights",()=>{
 const cases=[
 {playdeckVideoSha256:"not-a-hash"},
 {toasterInputSha256:"b".repeat(64)},
 {nativeVideoAdmitted:false},
 {foreignMaterialWasCompiled:false},
 {originalToasterIssuedReceipt:false},
 {originalDogramGenerated:false},
 {originalAudioUsed:false},
 {fullPlaydeckPerformance:true},
 {sealedPlaydeckReceipt:true},
 {published:true},
 {operatorAuthorizedSynthetic:false}
 ];
 for(const change of cases)
  assert.throws(()=>describeBoundary({...real,...change}),/HOLD_NATIVE_VIDEO_CROSSING/);
});
test("inspect is read-only and build requires a separate synthetic authorization",async()=>{
 const x=await run(["inspect"]);
 assert.equal(x.expectedMode,"ORIGINAL_MOVING_VIDEO_EXCERPT");
 assert.equal(x.fullGenesisPerformanceNotClaimed,true);
 await assert.rejects(run(["inspect","--authorize","SYNTHETIC_TEST_ONLY"]),/READONLY/);
 await assert.rejects(run(["build","--playdeck","/tmp"]),/REQUIRED_/);
 await assert.rejects(run(["build","--playdeck","/tmp","--toaster","/tmp","--out","/tmp/out"]),/AUTHORIZATION/);
});
