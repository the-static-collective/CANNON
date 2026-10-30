import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {planRoute,inspectPlan,run} from "../scripts/creative-route-switchyard.mjs";

test("three genuinely previous CI-proven native routes are discoverable but not selected",()=>{
 const response=run(["list"]);
 assert.equal(response.schema,"cannon.creative-route-catalog/v1");
 assert.equal(response.stages,4);
 assert.deepEqual(response.routes.map(r=>r.id),[
  "CHECKPOINT_STILL","MOVING_EXCERPT","FULL_PERFORMANCE"]);
 assert.equal(response.executed,false);
 assert.ok(response.routes.every(r=>r.sourceEvidence.includes("/actions/runs/")));
});
test("three source-locked typed graphs distinguish still, 4s excerpt, and full owner-sealed performance",()=>{
 const plans=["CHECKPOINT_STILL","MOVING_EXCERPT","FULL_PERFORMANCE"].map(planRoute);
 for(const p of plans){
  assert.equal(p.stages.length,4);assert.equal(p.edges.length,3);
  assert.equal(p.stages[2].outputPort,"dogram.trace-source/v0");
  assert.equal(p.edges[0].automaticCast,false);
  assert.equal(p.operatorAuthorization,null);
  assert.equal(p.rightsApproved,false);
  assert.equal(p.published,false);
  assert.equal(p.downstreamHeld.length,4);
  assert.equal(inspectPlan(p).planSha256,p.planSha256);
 }
 assert.equal(plans[0].originalAudio,false);
 assert.equal(plans[0].originalMotion,false);
 assert.equal(plans[1].originalAudio,true);
 assert.equal(plans[1].originalPlaydeckFullPerformance,false);
 assert.equal(plans[2].originalPlaydeckFullPerformance,true);
 assert.equal(plans[2].stages[0].fullSourceOwnerSeal,true);
 assert.notEqual(plans[0].source.owners[1].commit,plans[1].source.owners[1].commit);
 assert.notEqual(plans[1].source.owners[0].commit,plans[2].source.owners[0].commit);
});
test("a forged plan cannot promote source rights, model selection, output grade, owner commits or interfaces",()=>{
 const p=planRoute("FULL_PERFORMANCE");
 const edit=[
  {rightsApproved:true},{published:true},{operatorAuthorization:"OTHER"},
  {originalPlaydeckFullPerformance:false},
  {planSha256:"0".repeat(64)},
  {edges:[{from:"PLAYDECK_SOURCE",to:"DOGRAM",automaticCast:true}]},
  {source:{...p.source,owners:[{id:"made-up",commit:"123"}]}},
  {downstreamHeld:[]}
 ];
 for(const x of edit)assert.throws(()=>inspectPlan({...p,...x}),/HOLD_SWITCHYARD_/);
 assert.throws(()=>planRoute("ARBITRARY_REPO_ADAPTER"),/UNREGISTERED_ROUTE/);
});
test("planning an exact route writes an unexecuted immutable source-owned artifact",()=>{
 const dir=mkdtempSync(join(tmpdir(),"switchyard-unit-"));
 try{
  const file=join(dir,"full.json");
  const result=run(["plan","--route","FULL_PERFORMANCE","--out",file]);
  assert.equal(result.status,"PINNED_UNEXECUTED_PLAN");
  const p=JSON.parse(readFileSync(file,"utf8"));
  assert.equal(inspectPlan(p).planSha256,result.planSha256);
  assert.throws(()=>run(["plan","--route","FULL_PERFORMANCE","--out",file]),/PLAN_PATH/);
  const tampered={...p,published:true};
  const fake=join(dir,"fake.json");
  writeFileSync(fake,JSON.stringify(tampered));
  assert.throws(()=>run(["verify","--plan",fake,"--playdeck",dir,"--toaster",dir,
   "--out",dir]),/PLAN_TAMPER/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test("no silent execution or unsupported CLI authority",()=>{
 assert.throws(()=>run(["run","--plan","/tmp/nonexistent","--playdeck","/tmp",
  "--toaster","/tmp","--out","/tmp/anything"]),/REQUIRED_AND_AUTHORITY/);
 assert.throws(()=>run(["verify","--plan","/tmp/nonexistent","--playdeck","/tmp",
  "--toaster","/tmp","--out","/tmp/anything","--authorize","SYNTHETIC_TEST_ONLY"]),
  /REQUIRED_AND_AUTHORITY/);
 assert.throws(()=>run(["list","--authorize","SYNTHETIC_TEST_ONLY"]),/REQUIRED_AND_AUTHORITY/);
});
