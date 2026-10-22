// CANNON STACK² 024 / LIVING-COMMONS-001
// No network, people, institutional claims, or donor execution. Synthetic-only.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const organNames = ["notice", "gather", "relate", "offer", "create", "act", "witness", "return"];
const careOrder = [
  "need.proposed",
  "need.reviewed",
  "offer.proposed",
  "offer.accepted",
  "fulfillment.reported",
  "fulfillment.confirmed"
];
const expectedRole = {
  "need.proposed": "requester",
  "need.reviewed": "steward",
  "offer.proposed": "helper",
  "offer.accepted": "steward",
  "fulfillment.reported": "helper",
  "fulfillment.confirmed": "recipient",
  "fulfillment.disputed": "recipient",
  "seed.proposed": "artist",
  "contribution.proposed": "artist",
  "release.consented": "artist",
  "release.withdrawn": "artist",
  "editorial.approved": "editor"
};

function requireThat(ok, reason) {
  if (!ok) throw new Error("LIVING_COMMONS_REFUSED: " + reason);
}

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value, required, optional = []) {
  requireThat(plainObject(value), "expected a plain object");
  const actual = Object.keys(value);
  for (const name of required) requireThat(Object.hasOwn(value, name), "missing " + name);
  for (const name of actual) requireThat(required.includes(name) || optional.includes(name), "unsafe or unknown field: " + name);
}

function fixtureId(id) {
  requireThat(typeof id === "string" && /^fixture:[a-z][a-z0-9-]{0,63}$/.test(id), "not a fixture identifier");
}

function digest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function inspect(caseFile, registry) {
  exactKeys(caseFile, ["schema", "scenarioId", "fictional", "actors", "events"]);
  requireThat(caseFile.schema === "cannon.living-commons-case/v0" && caseFile.fictional === true, "only declared synthetic fixtures may enter");
  fixtureId(caseFile.scenarioId);
  requireThat(Array.isArray(caseFile.actors) && caseFile.actors.length >= 7, "fixture actors required");
  const roles = new Map();
  for (const actor of caseFile.actors) {
    exactKeys(actor, ["id", "role"]);
    fixtureId(actor.id);
    requireThat(["requester", "steward", "helper", "recipient", "artist", "editor"].includes(actor.role), "invalid actor role");
    requireThat(!roles.has(actor.id), "duplicate actor");
    roles.set(actor.id, actor.role);
  }

  exactKeys(registry, ["schema", "classification", "organs"]);
  requireThat(registry.schema === "cannon.stack82-source-registry/v0" && registry.classification === "SOURCE_POINTERS_NOT_PERMISSION", "unreviewed source registry");
  requireThat(Array.isArray(registry.organs) && registry.organs.length === 8, "exactly eight organs required");
  for (let i = 0; i < 8; i++) {
    const organ = registry.organs[i];
    exactKeys(organ, ["organ", "repository", "commit", "pr", "state", "interface"]);
    requireThat(organ.organ === organNames[i], "organ order is the eight-organ contract");
    requireThat(/^the-static-collective\/[A-Za-z0-9._-]+$/.test(organ.repository), "repository reference malformed");
    requireThat(/^[0-9a-f]{40}$/.test(organ.commit), "missing exact commit pin");
    requireThat(Number.isSafeInteger(organ.pr) && organ.pr > 0, "PR reference missing");
    requireThat(["MERGED_SOURCE_UNDEPLOYED", "EXPERIMENTAL_DRAFT"].includes(organ.state), "no inferred adoption");
    requireThat(organ.interface === "INSPECT_ONLY_UNVERIFIED", "no source-native adapter claim");
  }

  requireThat(Array.isArray(caseFile.events) && caseFile.events.length > 0 && caseFile.events.length <= 64, "bounded ordered events required");
  let careStep = -1;
  let careDecision = "UNVERIFIED";
  let lastCareId = null;
  let needId = null, offerId = null, reportId = null, helper = null;
  let seedId = null, contributionId = null, firstArtist = null, secondArtist = null;
  let editorReviewed = false, withdrawn = false;
  const consents = new Set();
  const seen = new Set();
  const laneCounts = { care: 0, culture: 0 };

  for (const event of caseFile.events) {
    exactKeys(event, ["id", "lane", "type", "actor", "subject"], ["ref", "consentScope"]);
    fixtureId(event.id);
    fixtureId(event.actor);
    fixtureId(event.subject);
    requireThat(!seen.has(event.id), "event replay");
    seen.add(event.id);
    requireThat(event.lane === "care" || event.lane === "culture", "unsupported current");
    requireThat(Object.hasOwn(expectedRole, event.type), "unknown event type");
    requireThat(roles.get(event.actor) === expectedRole[event.type], "actor role not authorized within fixture");
    const isCare = event.type.startsWith("need.") || event.type.startsWith("offer.") || event.type.startsWith("fulfillment.");
    requireThat(isCare === (event.lane === "care"), "cross-current event confusion");
    if (Object.hasOwn(event, "ref")) fixtureId(event.ref);
    if (event.type !== "release.consented") requireThat(!Object.hasOwn(event, "consentScope"), "consent field on nonconsent event");
    laneCounts[event.lane]++;

    if (isCare) {
      requireThat(event.subject === caseFile.scenarioId, "care event subject mismatch");
      if (event.type === "fulfillment.disputed") {
        requireThat(careStep === 4 || careStep === 5, "dispute requires a reported occurrence");
        requireThat(event.ref === reportId, "dispute must name its report");
        requireThat(event.actor !== helper, "helper may not independently dispute own report");
        careDecision = "DISPUTED_FIXTURE";
        careStep = 6;
      } else {
        requireThat(careStep < 5 && event.type === careOrder[careStep + 1], "care order or terminal state violated");
        if (careStep === -1) {
          requireThat(!Object.hasOwn(event, "ref"), "proposal must not inherit authority");
          needId = event.id;
        } else {
          requireThat(event.ref === lastCareId, "care transition does not reference preceding occurrence");
        }
        if (event.type === "need.reviewed") requireThat(event.actor !== caseFile.events[0].actor, "self-review of request");
        if (event.type === "offer.proposed") {
          offerId = event.id;
          helper = event.actor;
        }
        if (event.type === "offer.accepted") requireThat(event.actor !== helper, "offer cannot accept itself");
        if (event.type === "fulfillment.reported") {
          requireThat(event.actor === helper, "reporter must be the accepted helper");
          reportId = event.id;
        }
        if (event.type === "fulfillment.confirmed") {
          requireThat(event.actor !== helper, "helper report is not independent confirmation");
          careDecision = "CONFIRMED_FIXTURE";
        } else if (event.type === "fulfillment.reported") {
          careDecision = "REPORTED_UNCONFIRMED_FIXTURE";
        } else {
          careDecision = "IN_PROGRESS_FIXTURE";
        }
        careStep++;
        lastCareId = event.id;
      }
      continue;
    }

    if (event.type === "seed.proposed") {
      requireThat(seedId === null && !Object.hasOwn(event, "ref"), "one independent seed only");
      requireThat(event.subject === caseFile.scenarioId, "seed belongs to scenario");
      seedId = event.id;
      firstArtist = event.actor;
    } else if (event.type === "contribution.proposed") {
      requireThat(seedId !== null && contributionId === null && event.ref === seedId, "contribution must follow seed");
      requireThat(event.actor !== firstArtist, "independent contributing artist required");
      requireThat(event.subject === caseFile.scenarioId, "contribution belongs to scenario");
      contributionId = event.id;
      secondArtist = event.actor;
    } else {
      requireThat(contributionId !== null && event.ref === contributionId && event.subject === caseFile.scenarioId, "creative permission must bind this exact contribution");
      if (event.type === "release.consented") {
        requireThat(event.consentScope === "public-song", "narrow explicit consent scope required");
        requireThat(!withdrawn && !editorReviewed, "consent cannot be retroactive after editorial decision or withdrawal");
        requireThat([firstArtist, secondArtist].includes(event.actor), "noncreator cannot grant release consent");
        requireThat(!consents.has(event.actor), "duplicate consent");
        consents.add(event.actor);
      } else if (event.type === "editorial.approved") {
        requireThat(!withdrawn && !editorReviewed, "editorial review cannot override withdrawal");
        requireThat(consents.has(firstArtist) && consents.has(secondArtist), "both creators must consent before review");
        requireThat(event.actor !== firstArtist && event.actor !== secondArtist, "no self editorial approval");
        editorReviewed = true;
      } else if (event.type === "release.withdrawn") {
        requireThat([firstArtist, secondArtist].includes(event.actor), "only a contributor can withdraw own grant");
        requireThat(consents.has(event.actor), "no grant to withdraw");
        withdrawn = true;
      }
    }
  }

  const cultureState = withdrawn ? "WITHDRAWN_FIXTURE" :
    editorReviewed ? "EDITORIAL_REVIEW_ELIGIBLE_FIXTURE" :
    consents.size > 0 ? "PARTIAL_CONSENT_FIXTURE" :
    contributionId ? "CREATIVE_HOLD_FIXTURE" : "SEED_ONLY_FIXTURE";
  const cells = organNames.flatMap(from => organNames.map(to => ({
    from, to, status: "UNTESTED_INTERFACE_CANDIDATE"
  })));
  return {
    schema: "cannon.living-commons-projection/v0",
    scenarioId: caseFile.scenarioId,
    classification: "SYNTHETIC_INSPECTION_ONLY",
    sourceRegistryDigest: digest(registry),
    sourceIdentityStatus: "PINNED_METADATA_ONLY_NOT_GIT_REVERIFIED",
    organs: [...organNames],
    stack82: { dimensions: "8x8", candidates: cells.length, candidatesStatus: "ALL_UNTESTED", cells },
    care: { status: careDecision, reportedEventId: reportId, confirmed: careDecision === "CONFIRMED_FIXTURE", sourceNeedEventId: needId, offerEventId: offerId },
    culture: { status: cultureState, editorReviewed, fullConsent: consents.has(firstArtist) && consents.has(secondArtist) && !withdrawn, sourceSeedEventId: seedId },
    currentSeparation: {
      careConfirmationDoesNotLicenseMusic: true,
      creativeApprovalDoesNotProveFulfillment: true,
      noAutomaticPublicConsequences: true
    },
    eventCount: { ...laneCounts },
    publicCard: { status: "UNISSUED_LOCAL_DRAFT", url: null, publicationAuthority: "NONE", containsPrivateNarrative: false },
    physicalEffect: "NONE",
    externalAuthority: "NONE"
  };
}

export function makeArtifact(caseFile, registry) {
  const projection = inspect(caseFile, registry);
  return { projection, projectionDigest: digest(projection) };
}

function main(argv) {
  requireThat(argv.length === 4, "usage: node engine.mjs run|verify fixture.json registry.json output.json");
  const [command, sourcePath, registryPath, outputPath] = argv;
  const fixture = JSON.parse(readFileSync(sourcePath, "utf8"));
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const expected = makeArtifact(fixture, registry);
  if (command === "run") {
    writeFileSync(outputPath, JSON.stringify(expected, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  } else if (command === "verify") {
    const observed = JSON.parse(readFileSync(outputPath, "utf8"));
    requireThat(JSON.stringify(observed) === JSON.stringify(expected), "replay mismatch");
  } else {
    throw new Error("unknown command");
  }
  process.stdout.write(JSON.stringify({
    command, result: "PASS_SYNTHETIC_ONLY", sha256: expected.projectionDigest,
    care: expected.projection.care.status, culture: expected.projection.culture.status
  }) + "\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
