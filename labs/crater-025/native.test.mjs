import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hash, SOURCES, verifySources, runNativeCrater } from "./native.mjs";
import { inspect } from "../living-commons-001/engine.mjs";

const roots = {
  "static-field": process.env.CRATER_STATIC_FIELD,
  "full-measure": process.env.CRATER_FULL_MEASURE,
  roroomom: process.env.CRATER_ROROOMOM
};
function requireRoots() {
  assert.ok(Object.values(roots).every(x => typeof x === "string" && x.startsWith("/")),
    "Native crater CI requires all THREE original donor checkout paths; no synthetic skip permitted");
}
const clone = x => structuredClone(x);
const own = new URL("./native.mjs", import.meta.url);

test("exact native donor source pins and Git bytes, not branch-name folklore", () => {
  requireRoots();
  const result = verifySources(roots);
  assert.equal(result.length, 3);
  assert.deepEqual(result.map(x => x.repository), SOURCES.map(x => x.repository));
  for (const source of result) {
    assert.equal(source.originalObjectsMatched, true);
    assert.ok(source.files.length >= 1);
    assert.ok(source.files.every(x => /^[a-f0-9]{64}$/.test(x.sha256)));
  }
});

test("actually execute original native 3-repository route and preserve HOLD", async () => {
  requireRoots();
  const artifact = await runNativeCrater(roots);
  const b = artifact.body;
  assert.equal(b.classification, "NATIVE_THREE_DONOR_LOCAL_PREVIEW_ONLY");
  assert.equal(b.donorChecks.length, 3);
  assert.equal(b.nativeRoute.sourceCompositionId, "pc001:cicada:echo:radio");
  assert.equal(b.nativeRoute.questPhase, "reported-unconfirmed");
  assert.equal(b.nativeRoute.questPledgeConfirmed, false);
  assert.deepEqual(b.nativeRoute.roomHistory, ["INSPECT", "ATTEMPT", "LEAVE", "RETURN"]);
  assert.equal(b.nativeRoute.destinationDisposition, "held");
  assert.equal(b.nativeRoute.physicalEffects, "NONE");
  assert.equal(b.nativeRoute.publication, "NONE");
  assert.equal(b.returnCard.publicUrl, null);
  assert.equal(b.separateCannonFixture.nativeQuestEvidenceIsNotCareConfirmation, true);
  assert.equal(b.separateCannonFixture.creativePreviewIsNotMusicRights, true);
  assert.match(artifact.bodySha256, /^[a-f0-9]{64}$/);
  assert.equal(artifact.bodySha256, hash(artifact.body));
});

test("independent two-current fixture can withdraw/dispute without native story promotion", () => {
  const orig = JSON.parse(readFileSync(new URL("../living-commons-001/fictional-case.json", import.meta.url)));
  const registry = JSON.parse(readFileSync(new URL("../living-commons-001/source-registry.json", import.meta.url)));
  const songWithdrawn = clone(orig);
  songWithdrawn.events.push({
    id: "fixture:withdraw-second-artist", lane: "culture", type: "release.withdrawn",
    actor: "fixture:artist-b", subject: orig.scenarioId, ref: "fixture:contribution-1"
  });
  const afterSongWithdrawal = inspect(songWithdrawn, registry);
  assert.equal(afterSongWithdrawal.care.status, "CONFIRMED_FIXTURE");
  assert.equal(afterSongWithdrawal.culture.status, "WITHDRAWN_FIXTURE");
  const careDispute = clone(orig);
  careDispute.events.push({
    id: "fixture:care-dispute", lane: "care", type: "fulfillment.disputed",
    actor: "fixture:recipient", subject: orig.scenarioId, ref: "fixture:report-1"
  });
  const afterDispute = inspect(careDispute, registry);
  assert.equal(afterDispute.care.status, "DISPUTED_FIXTURE");
  assert.equal(afterDispute.culture.status, "EDITORIAL_REVIEW_ELIGIBLE_FIXTURE");
  assert.equal(afterDispute.publicCard.publicationAuthority, "NONE");
});

test("source replacement or registry extras fail closed", () => {
  requireRoots();
  assert.throws(() => verifySources({ ...roots, "unreviewed-source": "/tmp/not-a-repo" }), /CRATER_025_REFUSED/);
  assert.throws(() => verifySources({ ...roots, roroomom: roots["static-field"] }), /CRATER_025_REFUSED/);
});

test("native cold re-execution verifies held bytes, refuses overwrite and tampering", () => {
  requireRoots();
  const dir = mkdtempSync(join(tmpdir(), "cannon-crater-025-"));
  const rootsFile = join(dir, "roots.json");
  const receiptFile = join(dir, "receipt.json");
  writeFileSync(rootsFile, JSON.stringify(roots), { mode: 0o600 });
  const runner = fileURLToPath(own);
  const run = [runner, "run", rootsFile, receiptFile];
  try {
    const returned = execFileSync(process.execPath, run, { encoding: "utf8" });
    assert.match(returned, /NATIVE_THREE_DONOR_LOCAL_PREVIEW_ONLY/);
    assert.throws(() => execFileSync(process.execPath, run, { stdio: "pipe" }), /Command failed/);
    const replayed = execFileSync(process.execPath, [runner, "verify", rootsFile, receiptFile], { encoding: "utf8" });
    assert.match(replayed, /"room":"held"/);
    const tampered = JSON.parse(readFileSync(receiptFile, "utf8"));
    tampered.body.nativeRoute.questPledgeConfirmed = true;
    writeFileSync(receiptFile, JSON.stringify(tampered));
    assert.throws(() => execFileSync(process.execPath, [runner, "verify", rootsFile, receiptFile], { stdio: "pipe" }), /Command failed/);
  } finally {
    rmSync(dir, { force: true, recursive: true });
  }
});
