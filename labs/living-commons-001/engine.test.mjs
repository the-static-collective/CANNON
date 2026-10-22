import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { inspect, makeArtifact } from "./engine.mjs";

const fixtureUrl = new URL("./fictional-case.json", import.meta.url);
const registryUrl = new URL("./source-registry.json", import.meta.url);
const original = JSON.parse(readFileSync(fixtureUrl, "utf8"));
const sources = JSON.parse(readFileSync(registryUrl, "utf8"));
const clone = () => structuredClone(original);
const eventsWithout = (file, ...ids) => { file.events = file.events.filter(e => !ids.includes(e.id)); return file; };
const refused = (file, registry = sources) => assert.throws(() => inspect(file, registry), /LIVING_COMMONS_REFUSED/);

test("fictional case composes independent care and culture, never publishes", () => {
  const result = makeArtifact(original, sources);
  assert.equal(result.projection.care.status, "CONFIRMED_FIXTURE");
  assert.equal(result.projection.culture.status, "EDITORIAL_REVIEW_ELIGIBLE_FIXTURE");
  assert.equal(result.projection.stack82.candidates, 64);
  assert.equal(result.projection.stack82.cells.length, 64);
  assert.ok(result.projection.stack82.cells.every(x => x.status === "UNTESTED_INTERFACE_CANDIDATE"));
  assert.equal(result.projection.publicCard.url, null);
  assert.equal(result.projection.publicCard.publicationAuthority, "NONE");
  assert.equal(result.projection.physicalEffect, "NONE");
  assert.equal(result.projection.externalAuthority, "NONE");
  assert.match(result.projectionDigest, /^[a-f0-9]{64}$/);
});

test("report without recipient confirmation stays unconfirmed even when music was approved", () => {
  const x = eventsWithout(clone(), "fixture:confirm-1");
  const projection = inspect(x, sources);
  assert.equal(projection.care.status, "REPORTED_UNCONFIRMED_FIXTURE");
  assert.equal(projection.care.confirmed, false);
  assert.equal(projection.culture.status, "EDITORIAL_REVIEW_ELIGIBLE_FIXTURE");
});

test("missing artist consent makes editorial approval illegal", () => {
  refused(eventsWithout(clone(), "fixture:consent-b-1"));
});

test("creative withdrawal preserves independently confirmed care and blocks story", () => {
  const x = clone();
  x.events.push({ id: "fixture:withdraw-1", lane: "culture", type: "release.withdrawn", actor: "fixture:artist-b", subject: x.scenarioId, ref: "fixture:contribution-1" });
  const projection = inspect(x, sources);
  assert.equal(projection.care.status, "CONFIRMED_FIXTURE");
  assert.equal(projection.culture.status, "WITHDRAWN_FIXTURE");
  assert.equal(projection.culture.fullConsent, false);
  assert.equal(projection.publicCard.url, null);
});

test("recipient dispute does not erase independent creative editorial review", () => {
  const x = clone();
  x.events.push({ id: "fixture:dispute-1", lane: "care", type: "fulfillment.disputed", actor: "fixture:recipient", subject: x.scenarioId, ref: "fixture:report-1" });
  const projection = inspect(x, sources);
  assert.equal(projection.care.status, "DISPUTED_FIXTURE");
  assert.equal(projection.care.confirmed, false);
  assert.equal(projection.culture.status, "EDITORIAL_REVIEW_ELIGIBLE_FIXTURE");
});

test("a helper cannot self-confirm fulfillment", () => {
  const x = clone();
  x.events.at(-1).actor = "fixture:helper";
  refused(x);
});

test("wrong actor cannot report another's accepted offer", () => {
  const x = clone();
  x.events.find(e => e.id === "fixture:report-1").actor = "fixture:steward";
  refused(x);
});

test("cross-current evidence reference cannot satisfy a care transition", () => {
  const x = clone();
  x.events.find(e => e.id === "fixture:offer-accept-1").ref = "fixture:seed-1";
  refused(x);
});

test("culture cannot become a care act by relabeling a current", () => {
  const x = clone();
  x.events.find(e => e.id === "fixture:seed-1").lane = "care";
  refused(x);
});

test("unknown privacy-bearing fields and actual identifiers fail closed", () => {
  const x = clone();
  x.events[0].email = "person@example.net";
  refused(x);
  const y = clone();
  y.actors[0].id = "actual:person";
  refused(y);
});

test("duplicate events and unauthorized subject changes fail closed", () => {
  const x = clone();
  x.events.push(structuredClone(x.events[0]));
  refused(x);
  const y = clone();
  y.events[0].subject = "fixture:other-project";
  refused(y);
});

test("reversed approvals cannot silently fabricate a consent chain", () => {
  const x = clone();
  const a = x.events.findIndex(e => e.id === "fixture:consent-b-1");
  const b = x.events.findIndex(e => e.id === "fixture:edit-1");
  [x.events[a], x.events[b]] = [x.events[b], x.events[a]];
  refused(x);
});

test("a withdrawn creator grant cannot be silently reconsented on the same version", () => {
  const x = clone();
  x.events.push({ id: "fixture:withdraw-1", lane: "culture", type: "release.withdrawn", actor: "fixture:artist-a", subject: x.scenarioId, ref: "fixture:contribution-1" });
  x.events.push({ id: "fixture:consent-again", lane: "culture", type: "release.consented", actor: "fixture:artist-a", subject: x.scenarioId, ref: "fixture:contribution-1", consentScope: "public-song" });
  refused(x);
});

test("source pointers are exact-pin metadata, not trust or a donor interface", () => {
  const x = structuredClone(sources);
  x.organs[2].commit = "unverified";
  refused(original, x);
  const y = structuredClone(sources);
  y.organs[2].interface = "RUNTIME_VERIFIED";
  refused(original, y);
  const z = structuredClone(sources);
  z.organs[2].commit = "f".repeat(40);
  const altered = inspect(original, z);
  assert.notEqual(altered.sourceRegistryDigest, inspect(original, sources).sourceRegistryDigest);
  assert.equal(altered.sourceIdentityStatus, "PINNED_METADATA_ONLY_NOT_GIT_REVERIFIED");
});

test("culture events may precede care events without corrupting requester authority", () => {
  const x = clone();
  const seed = x.events.splice(x.events.findIndex(e => e.id === "fixture:seed-1"), 1)[0];
  x.events.unshift(seed);
  assert.equal(inspect(x, sources).care.status, "CONFIRMED_FIXTURE");
});

test("create-only run, cold verify, overwrite refusal and tamper refusal", () => {
  const dir = mkdtempSync(join(tmpdir(), "living-commons-001-"));
  const output = join(dir, "inspection.json");
  const file = fileURLToPath(new URL("./engine.mjs", import.meta.url));
  const args = [file, "run", fileURLToPath(fixtureUrl), fileURLToPath(registryUrl), output];
  try {
    const run = execFileSync(process.execPath, args, { encoding: "utf8" });
    assert.match(run, /PASS_SYNTHETIC_ONLY/);
    assert.throws(() => execFileSync(process.execPath, args, { stdio: "pipe" }));
    const verify = execFileSync(process.execPath, [file, "verify", fileURLToPath(fixtureUrl), fileURLToPath(registryUrl), output], { encoding: "utf8" });
    assert.match(verify, /PASS_SYNTHETIC_ONLY/);
    const tampered = JSON.parse(readFileSync(output, "utf8"));
    tampered.projection.publicCard.status = "PUBLISHED";
    writeFileSync(output, JSON.stringify(tampered));
    assert.throws(() => execFileSync(process.execPath, [file, "verify", fileURLToPath(fixtureUrl), fileURLToPath(registryUrl), output], { stdio: "pipe" }));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
