/**
 * CANNON / CANON FIELD 001 — owner-pinned, non-exclusive canon selections.
 *
 * This is a standalone signing and cold-verification specimen, NOT a reLATTE
 * normative implementation, a Git checkout mutator, a deployment controller,
 * or source/CI authentication. No network and no Git writes.
 */
import {
  createHash, createPrivateKey, createPublicKey,
  generateKeyPairSync, sign as edSign, verify as edVerify,
} from "node:crypto";

export const EVENT_SCHEMA = "cannon.canon-event/v1";
export const BUNDLE_SCHEMA = "cannon.canon-bundle/v1";
export const PINS_SCHEMA = "cannon.owner-trust-pins/v1";
export const TRACKS = ["historical", "experimental", "operational"];
const ACTIONS = ["ADMIT", "WITHDRAW"];
const STRING = /^[A-Za-z0-9][A-Za-z0-9._:\/-]{1,127}$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SHA = /^[a-f0-9]{40}$/;
const HASH = /^sha256:[0-9a-f]{64}$/;
const LIMIT_OWNERS = 128;
const LIMIT_EVENTS = 4096;

function fail(ok, message) { if (!ok) throw new Error(message); }
function exact(o, keys) {
  return o && typeof o === "object" && !Array.isArray(o) &&
    Object.keys(o).length === keys.length && keys.every(k => Object.hasOwn(o, k));
}
export function canonical(o) {
  if (o === null || typeof o === "string" || typeof o === "boolean") return JSON.stringify(o);
  if (typeof o === "number") {
    fail(Number.isFinite(o) && Number.isSafeInteger(o), "INVALID_NUMBER");
    return JSON.stringify(o);
  }
  if (Array.isArray(o)) return "[" + o.map(canonical).join(",") + "]";
  fail(o && typeof o === "object" && Object.getPrototypeOf(o) === Object.prototype,
    "NON_JSON_VALUE");
  const keys = Object.keys(o).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + canonical(o[k])).join(",") + "}";
}
export function digest(value) {
  return "sha256:" + createHash("sha256").update(canonical(value)).digest("hex");
}
export function newOwner() {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return {
    public_key: publicKey.export({ format:"pem", type:"spki" }).toString(),
    private_key: privateKey.export({ format:"pem", type:"pkcs8" }).toString(),
  };
}
export function signEvent(body, privatePem) {
  fail(exact(body, ["schema","owner_id","seq","previous","occurred_at",
      "scope","track","action","target","replaces","authority","public_key"]),
    "EVENT_FIELDS_NOT_EXACT");
  const key = createPrivateKey(privatePem);
  const publicPem = createPublicKey(key).export({ format:"pem", type:"spki" }).toString();
  fail(body.public_key === publicPem, "SIGNER_PUBLIC_KEY_MISMATCH");
  validateBody(body);
  return {...body, signature:edSign(null, Buffer.from(canonical(body)),
    key).toString("base64")};
}
function validateBody(b) {
  fail(b.schema === EVENT_SCHEMA && typeof b.owner_id === "string" && STRING.test(b.owner_id) &&
       Number.isSafeInteger(b.seq) && b.seq >= 0 &&
       (b.previous === null || typeof b.previous === "string" && HASH.test(b.previous)) &&
       typeof b.occurred_at === "string" &&
       /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(b.occurred_at) &&
       !Number.isNaN(Date.parse(b.occurred_at)) &&
       new Date(b.occurred_at).toISOString() === b.occurred_at &&
       typeof b.scope === "string" && STRING.test(b.scope) &&
       TRACKS.includes(b.track) && ACTIONS.includes(b.action) &&
       b.authority === "CANON_SELECTION_ONLY" &&
       typeof b.public_key === "string" && b.public_key.startsWith("-----BEGIN PUBLIC KEY-----\n"),
       "INVALID_CANON_EVENT");
  if (b.action === "ADMIT") {
    fail(exact(b.target, ["repository","commit","ref_hint","evidence"]) &&
         typeof b.target.repository === "string" && REPO.test(b.target.repository) &&
         typeof b.target.commit === "string" && SHA.test(b.target.commit) &&
         (b.target.ref_hint === null || typeof b.target.ref_hint === "string" &&
          b.target.ref_hint.length <= 200 && !/[\x00-\x1f\x7f]/.test(b.target.ref_hint)) &&
         Array.isArray(b.target.evidence) && b.target.evidence.length <= 24 &&
         b.target.evidence.every(x => typeof x === "string" && x.length > 0 && x.length <= 320),
         "INVALID_COMMIT_OR_CLAIMED_EVIDENCE");
  } else fail(b.target === null, "WITHDRAW_CANNOT_ADMIT_COMMIT");
  fail(b.replaces === null || typeof b.replaces === "string" && HASH.test(b.replaces),
       "INVALID_PREDECESSOR_REFERENCE");
}
function trustedOwners(pins) {
  fail(exact(pins, ["schema","owners"]) && pins.schema === PINS_SCHEMA &&
       Array.isArray(pins.owners) && pins.owners.length <= LIMIT_OWNERS,
       "EXTERNALLY_SELECTED_TRUST_PINS_REQUIRED");
  const m = new Map();
  for (const owner of pins.owners) {
    fail(exact(owner, ["owner_id","public_key"]) && typeof owner.owner_id === "string" &&
         STRING.test(owner.owner_id) && typeof owner.public_key === "string" &&
         owner.public_key.startsWith("-----BEGIN PUBLIC KEY-----\n") &&
         !m.has(owner.owner_id), "DUPLICATE_OR_INVALID_EXTERNAL_OWNER");
    // Only externally supplied owner/public-key bindings establish signer identity.
    createPublicKey(owner.public_key);
    m.set(owner.owner_id, owner.public_key);
  }
  return m;
}
function validateCheckpoint(checkpoint) {
  fail(exact(checkpoint, ["schema","frontiers"]) &&
       checkpoint.schema === "cannon.observer-checkpoint/v1" &&
       Array.isArray(checkpoint.frontiers), "INVALID_OBSERVER_CHECKPOINT");
  const fronts = new Map();
  for (const f of checkpoint.frontiers) {
    fail(exact(f, ["owner_id","count","head"]) &&
         typeof f.owner_id === "string" && STRING.test(f.owner_id) &&
         Number.isSafeInteger(f.count) && f.count >= 1 && f.count <= LIMIT_EVENTS &&
         typeof f.head === "string" && HASH.test(f.head) &&
         !fronts.has(f.owner_id), "INVALID_CHECKPOINT_FRONTIER");
    fronts.set(f.owner_id, f);
  }
  return fronts;
}
function proveEvent(event, expectedPublicPem) {
  fail(exact(event, ["schema","owner_id","seq","previous","occurred_at",
       "scope","track","action","target","replaces","authority","public_key","signature"]),
       "SIGNED_EVENT_FIELDS_NOT_EXACT");
  const {signature,...body} = event;
  validateBody(body);
  fail(body.public_key === expectedPublicPem, "OWNER_KEY_NOT_EXTERNALLY_TRUSTED");
  fail(typeof signature === "string" &&
       /^[A-Za-z0-9+/]{86}==$/.test(signature) &&
       edVerify(null, Buffer.from(canonical(body)), createPublicKey(expectedPublicPem),
         Buffer.from(signature,"base64")), "INVALID_OWNER_SIGNATURE");
}
/** Cold verification, no branch inference, network, shell, git modification or hidden authority. */
export function project(bundle, externalPins, checkpoint = {
  schema:"cannon.observer-checkpoint/v1", frontiers:[]
}) {
  const known = trustedOwners(externalPins);
  const old = validateCheckpoint(checkpoint);
  fail(exact(bundle, ["schema","histories"]) && bundle.schema === BUNDLE_SCHEMA &&
       Array.isArray(bundle.histories) && bundle.histories.length <= LIMIT_OWNERS,
       "INVALID_SELECTION_BUNDLE");
  const seen = new Set(), frontiers = [], selected = [], history = [];
  const slots = new Map();
  for (const events of bundle.histories) {
    fail(Array.isArray(events) && events.length > 0 &&
         events.length <= LIMIT_EVENTS, "EMPTY_OR_UNBOUNDED_HISTORY");
    const id = events[0]?.owner_id;
    fail(typeof id === "string" && known.has(id) && !seen.has(id),
      "UNTRUSTED_OR_DUPLICATED_OWNER_HISTORY");
    seen.add(id);
    let prev = null, when = -1;
    const perOwner = new Map();
    for (let seq=0; seq<events.length; seq++) {
      const event=events[seq], name=event.scope+"|"+event.track;
      proveEvent(event, known.get(id));
      fail(event.owner_id===id && event.seq===seq && event.previous===prev,
        "SEQUENCE_REPLAY_OR_FORK");
      const at=Date.parse(event.occurred_at);
      fail(at>=when, "OWNER_CLOCK_REGRESSION");
      when=at;
      const active=perOwner.get(name);
      if (event.action==="ADMIT") {
        fail(event.replaces === (active?.hash??null),
          "ADMISSION_MUST_EXPLICITLY_SUPERSEDE_ACTIVE_SELECTION");
        perOwner.set(name,{hash:digest(event),event});
      } else {
        fail(Boolean(active) && event.replaces===active.hash,
          "WITHDRAWAL_DOES_NOT_REFERENCE_CURRENT_ACTIVE_SELECTION");
        perOwner.delete(name);
      }
      history.push({
        owner_id:id, seq, hash:digest(event), scope:event.scope,
        track:event.track, action:event.action, target:event.target,
        replaces:event.replaces, valid_signed_history:true,
      });
      prev=digest(event);
    }
    const expected=old.get(id);
    if (expected) fail(events.length>=expected.count &&
        digest(events[expected.count-1])===expected.head,
        "OBSERVER_FRONTIER_ROLLBACK_OR_EQUIVOCATION");
    frontiers.push({owner_id:id,count:events.length,head:prev});
    for (const current of perOwner.values()) {
      const e=current.event;
      selected.push({
        owner_id:id, scope:e.scope, track:e.track, repository:e.target.repository,
        commit:e.target.commit, ref_hint:e.target.ref_hint,
        evidence_claims:e.target.evidence, selection_event_hash:current.hash,
        authority:"CANON_SELECTION_ONLY", git_object_verified:false,
        test_results_verified:false, physical_or_deployment_permission:false
      });
      const slot=e.scope+"|"+e.track;
      if (!slots.has(slot)) slots.set(slot,[]);
      slots.get(slot).push(id);
    }
  }
  for (const id of old.keys()) fail(seen.has(id),"CHECKPOINT_OWNER_HISTORY_OMITTED");
  const conflicts=[...slots].filter(([,ids])=>ids.length>1).map(([slot,owner_ids])=>({
    scope_and_track:slot,owner_ids:owner_ids.sort(),resolution:"UNRESOLVED_NO_AUTOMATIC_WINNER"
  }));
  return {
    schema:"cannon.canon-projection/v1",status:"SELECTED_OWNER_HISTORIES_ONLY",
    frontiers:frontiers.sort((a,b)=>a.owner_id.localeCompare(b.owner_id)),
    active:selected.sort((a,b)=>[a.scope,a.track,a.owner_id].join("|").localeCompare(
       [b.scope,b.track,b.owner_id].join("|"))),
    historical_events:history,
    conflicts,automatic_merges:0,main_privilege:0,
    deployment_grants:0,physical_execution_grants:0,
    limitations:"Selection history verified against externally supplied pins; branch tips, Git commit bytes, CI claims, signer ownership and latest global head are not verified."
  };
}
