import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { SOURCES, verifySources, runWarmThread } from "./native.mjs";

const roots={
  ghot:process.env.CRATER_GHOT,
  full:process.env.CRATER_FULL,
  band:process.env.CRATER_BAND,
  garden:process.env.CRATER_GARDEN
};
function requireNative(){
  assert.ok(Object.values(roots).every(v=>typeof v==="string"&&v.startsWith("/")),
    "Four original Git checkouts are REQUIRED; no synthetic fallback or skip");
}

test("GHoT, Full Measure, Band and Garden original Git objects are exact",()=>{
  requireNative();
  const checked=verifySources(roots);
  assert.equal(checked.length,4);
  assert.deepEqual(checked.map(x=>x.repo),SOURCES.map(s=>s.repo));
  assert.ok(checked.every(x=>x.originalGitObjectsMatch===true));
  assert.ok(checked.every(x=>x.files.every(f=>/^[0-9a-f]{64}$/.test(f.sha256))));
});

test("four original sources execute real code with fictional source data, honest refusal and residue",async()=>{
  requireNative();
  const {body}=await runWarmThread(roots);
  assert.equal(body.classification,"FOUR_ORIGINAL_DONOR_OFFLINE_FICTIONAL_PREVIEW_ONLY");
  assert.equal(body.ghot.sourceAuthority,"proposal-only");
  assert.equal(body.ghot.replacementIsOnlyCandidate,true);
  assert.equal(body.ghot.releasedFutureAuthority,false);
  assert.deepEqual(body.fullMeasure.completedStepIds,["release-tree","cut-tree"]);
  assert.equal(body.fullMeasure.preservedFirewoodState,"cut-at-source");
  assert.equal(body.fullMeasure.remainingNeedStatus,"open");
  assert.equal(body.fullMeasure.unresolvedRelation,"haul-firewood");
  assert.equal(body.fullMeasure.humanWorthJudgment,null);
  assert.equal(body.fullMeasure.sharedWorldChanged,false);
  assert.equal(body.garden.carrierArrivals,2);
  assert.equal(body.garden.distinctDemands,1);
  assert.equal(body.garden.sharedNeedsCreated,0);
  assert.equal(body.garden.outstandingLoad,1);
  assert.equal(body.band.confirmedUnits,0);
  assert.equal(body.band.residualUnits,1);
  assert.equal(body.band.reportType,"case.note_recorded");
  assert.equal(body.reconciliation.return,"CANNON_REVIEW_ONLY_NOT_GARDEN_WRITEBACK");
  assert.equal(body.reconciliation.nativeFMResidueIsNotBandRecipientProof,true);
  assert.equal(body.publicCard.url,null);
  assert.equal(body.physicalEffects,"NONE");
  assert.equal(body.actualDelivery,false);
  assert.equal(body.actualPeople,false);
});

test("original checkout substitution, added roots and lost pins are rejected",()=>{
  requireNative();
  assert.throws(()=>verifySources({...roots,unauthorized:"/tmp/other"}),/CRATER_027_REFUSED/);
  assert.throws(()=>verifySources({...roots,full:roots.ghot}),/CRATER_027_REFUSED/);
  assert.throws(()=>verifySources({...roots,band:"relative/branch"}),/CRATER_027_REFUSED/);
});

test("create-only native receipt, cold rerun, overwrite refusal and tamper refusal",()=>{
  requireNative();
  const dir=mkdtempSync(join(tmpdir(),"cannon-warm-thread-027-"));
  const rootsFile=join(dir,"roots.json"),receiptFile=join(dir,"receipt.json");
  const runner=fileURLToPath(new URL("./native.mjs",import.meta.url));
  const tsx=process.env.CRATER_TSX_CLI;
  assert.ok(typeof tsx==="string" && tsx.length>0);
  writeFileSync(rootsFile,JSON.stringify(roots),{mode:0o600});
  const run=[tsx,runner,"run",rootsFile,receiptFile];
  try{
    assert.match(execFileSync(process.execPath,run,{encoding:"utf8"}),/FOUR_DONOR_LOCAL_PREVIEW_ONLY/);
    assert.throws(()=>execFileSync(process.execPath,run,{stdio:"pipe"}),/Command failed/);
    assert.match(execFileSync(process.execPath,[tsx,runner,"verify",rootsFile,receiptFile],{
      encoding:"utf8"}),/"action":"verify"/);
    const changed=JSON.parse(readFileSync(receiptFile,"utf8"));
    changed.body.band.confirmedUnits=1;
    writeFileSync(receiptFile,JSON.stringify(changed));
    assert.throws(()=>execFileSync(process.execPath,[tsx,runner,"verify",rootsFile,receiptFile],{
      stdio:"pipe"}),/Command failed/);
  } finally {rmSync(dir,{recursive:true,force:true})}
});
