import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync,writeFileSync,mkdtempSync,rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SOURCES,verifySources,runCare } from "./native.mjs";

const roots={
 nourish:process.env.CRATER_NOURISH,
 band:process.env.CRATER_BAND,
 garden:process.env.CRATER_GARDEN,
 plenty:process.env.CRATER_PLENTY
};
const ready=()=>assert.ok(Object.values(roots).every(v=>typeof v==="string"&&v.startsWith("/")),
  "Exact native four-donor checks require all originals; cannot skip");
test("exact original commits and Git object bytes are present",()=>{
 ready();
 const verified=verifySources(roots);
 assert.equal(verified.length,4);
 assert.deepEqual(verified.map(x=>x.owner),SOURCES.map(x=>x.repo));
 assert.ok(verified.every(x=>x.sourceObjectsVerified===true));
 assert.ok(verified.every(x=>x.files.every(f=>/^[a-f0-9]{64}$/.test(f.sha256))));
});
test("original Nourish, Garden, Band and Full Measure modules execute without awarding real-world authority",async()=>{
 ready();const {body}=await runCare(roots);
 assert.equal(body.classification,"FOUR_ORIGINAL_DONOR_FIXTURE_ONLY");
 assert.equal(body.care.gardenArrivals,2);
 assert.equal(body.care.gardenHeldCases,1);
 assert.equal(body.care.gardenPublishedNeeds,0);
 assert.equal(body.care.reportedResidual,0.5);
 assert.equal(body.care.simulatedConfirmedRice,0.25);
 assert.equal(body.care.returnedRiceResidual,0.25);
 assert.equal(body.care.returnedBeansResidual,0.5);
 assert.equal(body.care.returnedStatus,"partially_resolved");
 assert.equal(body.care.sourceUnchanged,true);
 assert.equal(body.care.realDeliveryConfirmed,false);
 assert.equal(body.fullMeasure.unknownStatus,"POSSIBILITIES_ONLY");
 assert.equal(body.fullMeasure.unauthorizedViableCount,0);
 assert.equal(body.fullMeasure.correlatedViableCount,2);
 assert.equal(body.fullMeasure.correlatedIndependentCount,1);
 assert.equal(body.fullMeasure.realCapacityProved,false);
 assert.equal(body.publicReturn.url,null);
 assert.equal(body.realWorldEffects,"NONE");
});
test("extra roots and swapped source code cannot be smuggled in",()=>{
 ready();
 assert.throws(()=>verifySources({...roots,rogue:"/tmp/rogue"}),/CRATER026_REFUSED/);
 assert.throws(()=>verifySources({...roots,band:roots.nourish}),/CRATER026_REFUSED/);
});
test("create-only offline receipt cold replays and refuses tampering",()=>{
 ready();const dir=mkdtempSync(join(tmpdir(),"cannon-026-"));
 const rootsFile=join(dir,"roots.json"),receipt=join(dir,"receipt.json");
 const runner=fileURLToPath(new URL("./native.mjs",import.meta.url));
 const bin=process.execPath;
 const tsx=process.env.CRATER_TSX_CLI;
 assert.ok(typeof tsx==="string"&&tsx.length>0,"tsx original runner required");
 writeFileSync(rootsFile,JSON.stringify(roots),{mode:0o600});
 const args=[tsx,runner,"run",rootsFile,receipt];
 try{
  assert.match(execFileSync(bin,args,{encoding:"utf8"}),/FOUR_DONOR_NATIVE_FIXTURE_ONLY/);
  assert.throws(()=>execFileSync(bin,args,{stdio:"pipe"}),/Command failed/);
  assert.match(execFileSync(bin,[tsx,runner,"verify",rootsFile,receipt],{encoding:"utf8"}),/"action":"verify"/);
  const tampered=JSON.parse(readFileSync(receipt,"utf8"));
  tampered.body.care.realDeliveryConfirmed=true;
  writeFileSync(receipt,JSON.stringify(tampered));
  assert.throws(()=>execFileSync(bin,[tsx,runner,"verify",rootsFile,receipt],{stdio:"pipe"}),/Command failed/);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
