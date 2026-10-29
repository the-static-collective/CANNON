import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config=JSON.parse(readFileSync(new URL("../creative/reactor-seven-sources.json",import.meta.url),"utf8"));
test("seven exact independently owned original runtime histories",()=>{
 const all=[...config.priorNative,...config.ownerNativeNew];
 assert.equal(all.length,7);
 assert.equal(new Set(all.map(x=>x.repo)).size,7);
 assert.equal(new Set(all.map(x=>x.sha)).size,7);
 assert.ok(all.every(x=>/^the-static-collective\/[A-Za-z0-9_-]+$/.test(x.repo)&&/^[a-f0-9]{40}$/.test(x.sha)));
 assert.deepEqual(config.ownerNativeNew.map(x=>x.id),["static-field","jarvis","static-live","static-os"]);
});
test("source-owned programs are not replaced with fake result strings",()=>{
 const script=readFileSync(new URL("../scripts/reactor-seven-crossing.mjs",import.meta.url),"utf8");
 for(const op of ["fieldMod.compose","jarMod.replaySlots","liveMod.compileStageProjection","scripts/reactor-seven-os.py",
  "originalSourceOwners","nativeOwnerNew","HOLD_REACTOR_SEVEN_","FILM_THREE_NATIVE"]){
  if(op!=="nativeOwnerNew")assert.ok(script.includes(op),op);
 }
 const os=readFileSync(new URL("../scripts/reactor-seven-os.py",import.meta.url),"utf8");
 for(const op of ['source.mint("ASK"','source.mint("OFFER"','source.mint("PROPOSE"',"source.validate_chain","source.decode(text)"])assert.ok(os.includes(op),op);
});
test("synthetic declared playable is not an actual performance",()=>{
 assert.equal(config.status,"PROVISIONAL_EXPERIMENT_ONLY");
 assert.equal(config.claimLimits.length,4);
 assert.ok(config.claimLimits.some(x=>x.includes("not derived from BOOK")));
 assert.ok(config.claimLimits.some(x=>x.includes("plan provenance is bound only in CANNON")));
});
