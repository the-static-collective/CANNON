import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {storyboard,run} from "../scripts/minute-mail-native.mjs";
const sha=x=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
function plan(round){
 const body={schema:"planz.minute-mail-round/v1",round,
  stage:round===0?"PROOF_FILM":"REVISED_FILM",targetOwner:"CANNON",
  status:"LOCAL_PROPOSED_NOT_AUTHORIZED",rightsGranted:false,published:false,
  shotSeconds:round===0?6:10,
  subtitleLines:["THE LOST MINUTE","POST OFFICE","A MINUTE IS RETURNED"],
  priorNativeArtifactSha256:round===0?null:"c".repeat(64)};
 return {...body,planSha256:sha(body)};
}
test("new source-owned storyboards differ across first and revised films",()=>{
 const a=storyboard(plan(0)),b=storyboard(plan(1));
 assert.notEqual(a.storyboardSha256,b.storyboardSha256);
 assert.equal(a.genesisFramesUsed,false);
 assert.equal(b.originalVisualSource,true);
 assert.equal(a.seconds,6);
 assert.equal(b.seconds,10);
});
test("no fabricated source plan or rights claim can execute",()=>{
 const p=plan(0);
 assert.throws(()=>storyboard({...p,rightsGranted:true}),/PLAN/);
 assert.throws(()=>storyboard({...p,planSha256:"a".repeat(64)}),/PLAN/);
 assert.throws(()=>storyboard({...p,subtitleLines:["inject\nbad"]}),/PLAN/);
 assert.throws(()=>storyboard({...p,shotSeconds:2}),/PLAN/);
});
test("inspection has no action or model authority",async()=>{
 const x=await run(["inspect"]);
 assert.equal(x.genesisUsed,false);
 assert.equal(x.authorization,false);
 await assert.rejects(run(["inspect","--authorize","SYNTHETIC_TEST_ONLY"]),/INSPECT/);
 await assert.rejects(run(["build","--toaster","/tmp"]),/AUTH/);
});
