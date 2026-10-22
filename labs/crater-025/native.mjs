// CANNON STACK² 025 — FIRST CONTACT CRATER.
// Independently source-pin and run THREE ORIGINAL native donor modules.
// Their proposals and "reports" are LOCAL FICTIONAL PREVIEWS; no real-world consequence.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { inspect } from "../living-commons-001/engine.mjs";

export const SOURCES = Object.freeze([
  {
    name: "static-field",
    repository: "the-static-collective/static-field",
    commit: "80b08f7a45f6957239582091536ea9528df7a1b7",
    pr: 12,
    files: [
      "experiments/postemahhn-living-deck-001/composer.mjs",
      "experiments/postemahhn-living-deck-001/source-design.mjs",
      "experiments/postemahhn-living-deck-001/browser-handoff.mjs"
    ]
  },
  {
    name: "full-measure",
    repository: "the-static-collective/full-measure-world-layer",
    commit: "60cf0fc697b8b83d89e364d7dbbfe6001f560f6d",
    pr: 48,
    files: ["experiments/living-deck-quest-001/quest.mjs"]
  },
  {
    name: "roroomom",
    repository: "the-static-collective/ROroomOM",
    commit: "f7372b6b5dd18bbce8a850100742521495b0a814",
    pr: 3,
    files: ["experiments/living-deck-room-001/room.mjs"]
  }
]);

export const hash = data => createHash("sha256").update(
  typeof data === "string" ? data : JSON.stringify(data)
).digest("hex");

function fail(msg) { throw new Error("CRATER_025_REFUSED: " + msg); }
function requireTrue(value, msg) { if (!value) fail(msg); }
const jsonClone = x => JSON.parse(JSON.stringify(x));

export function verifySources(roots) {
  requireTrue(roots !== null && typeof roots === "object" && !Array.isArray(roots), "roots must be object");
  const names = SOURCES.map(s => s.name);
  requireTrue(Object.keys(roots).length === names.length && Object.keys(roots).every(k => names.includes(k)), "exactly three independent donor checkout paths required");
  return SOURCES.map(s => {
    const input = roots[s.name];
    requireTrue(typeof input === "string" && isAbsolute(input), "source root must be absolute path");
    const root = realpathSync(input);
    const observed = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    requireTrue(observed === s.commit, "source commit mismatch " + s.name);
    const files = s.files.map(file => {
      const abs = realpathSync(join(root, file));
      requireTrue(abs.startsWith(root + sep), "source file escapes checkout");
      const bytes = readFileSync(abs);
      const original = execFileSync("git", ["-C", root, "show", s.commit + ":" + file], { maxBuffer: 12 * 1024 * 1024 });
      requireTrue(bytes.equals(original), "source file differs from pinned Git object: " + s.name + "/" + file);
      return { path: file, sha256: hash(bytes.toString("utf8")) };
    });
    return { repository: s.repository, commit: observed, pr: s.pr, originalObjectsMatched: true, files };
  });
}

function mustBeLocal(candidate, name) {
  assert.equal(candidate.ok, true, name + ": " + JSON.stringify(candidate));
  assert.equal(candidate.sharedWorldChanged, false);
}

export async function runNativeCrater(roots) {
  const sources = verifySources(roots);
  const producer = await import(pathToFileURL(join(roots["static-field"], "experiments/postemahhn-living-deck-001/browser-handoff.mjs")).href);
  const full = await import(pathToFileURL(join(roots["full-measure"], "experiments/living-deck-quest-001/quest.mjs")).href);
  const room = await import(pathToFileURL(join(roots.roroomom, "experiments/living-deck-room-001/room.mjs")).href);

  requireTrue(typeof producer.buildBrowserHandoff === "function", "original Static Field producer unavailable");
  requireTrue(typeof full.openQuestHandoff === "function" && typeof full.takeQuestAction === "function" &&
    typeof full.createRoomRequest === "function", "original Full Measure quest unavailable");
  requireTrue(typeof room.openLocalRoom === "function" && typeof room.actLocalRoom === "function" &&
    typeof room.exportLocalRoom === "function", "original ROroomOM guest room unavailable");

  // Actual native call 1: source-owned proposal.
  const proposal = producer.buildBrowserHandoff({
    firstId: "cicada", secondId: "radio", stickerId: "echo"
  });
  requireTrue(proposal.format === "static-field.living-deck-portable-proposal", "not the actual source proposal");
  requireTrue(proposal.sourceVerification === "unavailable" && proposal.externalAuthority === "none", "source claims authority");
  requireTrue(proposal.compositionReceipt?.acceptedIntoSharedWorld === false, "source silently admitted");
  const originalProposalDigest = hash(proposal);

  // Actual native call 2: consumer-owned quest reducer and return packet.
  let quest = full.openQuestHandoff(jsonClone(proposal));
  mustBeLocal(quest, "Full Measure opened");
  for (const action of ["INSPECT", "JOIN", "ATTEMPT", "REPORT"]) {
    quest = full.takeQuestAction(quest, action);
    mustBeLocal(quest, "Full Measure " + action);
  }
  requireTrue(quest.phase === "reported-unconfirmed" && quest.pledgeConfirmed === false &&
    quest.projectCreated === false, "a local report cannot mint a project or confirmation");
  const request = full.createRoomRequest(quest);
  requireTrue(request.format === "full-measure.living-deck-room-request" &&
    request.grant === "preview-only" &&
    request.questPreviewReceipt.pledgeConfirmationRef === null, "Full Measure granted authority");

  // Actual native call 3: second consumer independently validates, plays, and returns.
  let guest = room.openLocalRoom(jsonClone(request));
  mustBeLocal(guest, "ROroomOM imported");
  requireTrue(guest.destinationDisposition === "held" && guest.fullMeasurePreview?.pledgeConfirmed === false,
    "ROroomOM cannot convert a local report to a witnessed outcome");
  for (const action of ["INSPECT", "ATTEMPT", "LEAVE", "RETURN"]) {
    guest = room.actLocalRoom(guest, action);
    mustBeLocal(guest, "ROroomOM " + action);
  }
  const guestReceipt = room.exportLocalRoom(guest);
  requireTrue(guestReceipt.format === "roroomom.living-deck-local-preview" &&
    guestReceipt.destinationDisposition === "held" &&
    guestReceipt.sourceVerification === "unverified" &&
    guestReceipt.sharedWorldChanged === false &&
    guestReceipt.externalPublication === false &&
    guestReceipt.authority === "none", "guest room promoted its source");
  assert.deepEqual(guestReceipt.history, ["INSPECT", "ATTEMPT", "LEAVE", "RETURN"]);
  assert.deepEqual(guestReceipt.fullMeasurePreview?.localActions, ["INSPECT", "JOIN", "ATTEMPT", "REPORT"]);
  assert.equal(guestReceipt.fullMeasurePreview?.pledgeConfirmed, false);
  assert.equal(hash(proposal), originalProposalDigest, "source proposal was rewritten");

  // Always exercise ORIGINAL donor refusal functions, not locally rewritten validators.
  const badSource = jsonClone(proposal);
  badSource.sourceCardReceipts = [{ verified: true }];
  requireTrue(full.openQuestHandoff(badSource).ok === false, "Full Measure believed fabricated card authority");
  requireTrue(room.openLocalRoom(badSource).ok === false, "ROroomOM believed fabricated card authority");

  const wrongRelation = producer.buildBrowserHandoff({
    firstId: "radio", secondId: "cicada", stickerId: "echo"
  });
  requireTrue(wrongRelation.disposition === "refused", "Static Field accepted unsupported card orientation");

  const badProject = jsonClone(request);
  badProject.questPreviewReceipt.pledgeConfirmationRef = "fake:confirmed";
  requireTrue(room.openLocalRoom(badProject).ok === false, "ROroomOM accepted fabricated witnessed action");
  const badTrace = jsonClone(request);
  badTrace.questPreviewReceipt.localActions[1] = "REPORT";
  requireTrue(room.openLocalRoom(badTrace).ok === false, "ROroomOM accepted fabricated action order");
  const badGrant = jsonClone(request);
  badGrant.grant = "admit";
  requireTrue(room.openLocalRoom(badGrant).ok === false, "ROroomOM accepted forged destination grant");
  const badSourceCard = jsonClone(request);
  badSourceCard.sourceProposal.selection.firstId = "cup";
  requireTrue(room.openLocalRoom(badSourceCard).ok === false, "ROroomOM accepted tampered source pairing");

  // Reuse the prior CANNON STACK² 024 dual-current contract independently;
  // its fictional CARE receipt is NEVER represented as a donor's quest outcome.
  const storyFixture = JSON.parse(readFileSync(new URL("../living-commons-001/fictional-case.json", import.meta.url)));
  const registry = JSON.parse(readFileSync(new URL("../living-commons-001/source-registry.json", import.meta.url)));
  const story = inspect(storyFixture, registry);
  requireTrue(story.classification === "SYNTHETIC_INSPECTION_ONLY" && story.stack82.candidates === 64,
    "missing original STACK82 fixture boundary");
  requireTrue(story.care.status === "CONFIRMED_FIXTURE" &&
    story.culture.status === "EDITORIAL_REVIEW_ELIGIBLE_FIXTURE",
    "original fixture changed unexpectedly");
  requireTrue(story.publicCard.url === null && story.externalAuthority === "NONE", "STACK82 fixture is not public");

  const body = {
    schema: "cannon.stack2-first-contact-crater/v0",
    classification: "NATIVE_THREE_DONOR_LOCAL_PREVIEW_ONLY",
    experiment: "STACK2-025-FIRST-CONTACT",
    donorChecks: sources,
    nativeRoute: {
      source: "Static Field local fixture: Cicada / ECHO / Porch Radio",
      sourceProposalSha256: originalProposalDigest,
      sourceCompositionId: proposal.compositionReceipt.id,
      questOwner: "Full Measure",
      questSourceRequestSha256: hash(request),
      questPhase: quest.phase,
      questPledgeConfirmed: false,
      recipientOwner: "ROroomOM",
      roomPreviewSha256: hash(guestReceipt),
      roomHistory: [...guestReceipt.history],
      destinationDisposition: guestReceipt.destinationDisposition,
      physicalEffects: "NONE",
      admission: "NONE",
      publication: "NONE"
    },
    separateCannonFixture: {
      sourceFile: "labs/living-commons-001/fictional-case.json",
      fixtureDigest: hash(story),
      careStatus: "CONFIRMED_FIXTURE_ONLY_NOT_NATIVE_CARE",
      cultureStatus: "EDITORIAL_REVIEW_ELIGIBLE_FIXTURE_ONLY_NOT_PUBLISHED",
      nativeQuestEvidenceIsNotCareConfirmation: true,
      creativePreviewIsNotMusicRights: true
    },
    hostile: {
      originalDonorRefusalsExercised: [
        "unsupported-reversed-card", "forged-issued-card", "forged-pledge-confirmation",
        "misordered-quest-history", "destination-grant-escalation", "source-card-mutation"
      ],
      passed: true
    },
    returnCard: {
      disposition: "UNISSUED_PREVIEW_ONLY",
      publicUrl: null,
      participantContacts: "NONE",
      paperPrinted: false,
      physicalCardIssued: false
    },
    interpretation: "One actual source-pinned 3-donor local software chain; no live human, institutional or physical-world inference.",
    externalAuthority: "NONE"
  };
  return { body, bodySha256: hash(body) };
}

function rootsFromFile(file) {
  const raw = JSON.parse(readFileSync(file, "utf8"));
  return raw;
}

async function main(args) {
  requireTrue(args.length === 3, "usage: node native.mjs run|verify roots.json output.json");
  const [command, rootsFile, output] = args;
  requireTrue(command === "run" || command === "verify", "unknown operation");
  const receipt = await runNativeCrater(rootsFromFile(rootsFile));
  if (command === "run") {
    writeFileSync(output, JSON.stringify(receipt, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  } else {
    const observed = JSON.parse(readFileSync(output, "utf8"));
    assert.deepEqual(observed, receipt, "cold source-bound replay differs from the held receipt");
  }
  process.stdout.write(JSON.stringify({
    status: "NATIVE_THREE_DONOR_LOCAL_PREVIEW_ONLY", command,
    sha256: receipt.bodySha256,
    phase: receipt.body.nativeRoute.questPhase,
    room: receipt.body.nativeRoute.destinationDisposition
  }) + "\n");
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(e => {
    process.stderr.write((e?.message || String(e)) + "\n");
    process.exitCode = 1;
  });
}
