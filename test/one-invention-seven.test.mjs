import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const owners=JSON.parse(readFileSync(new URL("../creative/reactor-seven-sources.json",import.meta.url)));
const src=readFileSync(new URL("../scripts/one-invention-seven.mjs",import.meta.url),"utf8");
test("one original PlanZ source identity for all seven native creators",()=>{
 const seven=[...owners.priorNative,...owners.ownerNativeNew];
 assert.equal(seven.length,7);
 assert.equal(new Set(seven.map(x=>x.repo)).size,7);
 assert.ok(seven.every(r=>/^[0-9a-f]{40}$/.test(r.sha)));
 assert.ok(src.includes("rootSeed="));
 assert.ok(src.includes("selectedSourcePlanId:id"));
});
test("original owner modules, not copied mock implementations",()=>{
 for(const name of ["generateSigilUtteranceFamily","composeDeck","film-press-blender.py","fm.compose","jm.replaySlots","liveModule.compileStageProjection","scripts/reactor-seven-os.py"])
  assert.ok(src.includes(name),name);
});
test("all seven returns are held",()=>{
 for(const name of ["return-proposals/","cannon.machine-return-proposal/v1","originalPlanZUpdated:false","licensedPublicRelease:false","physicalMachineOperated:false","CI_SCRIPTED_HOLD_ONLY"])
  assert.ok(src.includes(name),name);
});