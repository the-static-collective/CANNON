import {createHash} from 'node:crypto';

// SEASON-001 deliberately records claims; it does not authenticate people,
// verify external evidence, authorize fieldwork, or move money.
export const SCHEMA = 'cannon.season-witness/v1';
const HEX = /^sha256:[0-9a-f]{64}$/;
const ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,63}$/;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const LEVELS = Object.freeze([
  'IDEA_ONLY',
  'SOFTWARE_EVIDENCE_RECORDED',
  'INDEPENDENT_REPLAY_REPORTED',
  'FIELD_GATE_DOCUMENTED',
  'FIELD_TRIAL_REPORTED',
  'HUMAN_OUTCOME_REPORTED'
]);
const REASONS = new Set(['SAFETY', 'PRIVACY', 'CONSENT', 'RIGHTS', 'EVIDENCE', 'PERMISSION', 'MONEY', 'OTHER']);
const FIELDS = Object.freeze({
  SOFTWARE: ['resultDigest', 'artifactDigest'],
  REPLAY: ['softwareId', 'resultDigest', 'methodDigest'],
  TRIAL_GATE: ['replayId', 'scopeDigest', 'safetyDigest', 'venueDigest', 'consentPolicyDigest', 'stewardId'],
  FIELD: ['gateId', 'consentDigest', 'reportDigest'],
  OUTCOME: ['fieldId', 'participantConfirmationDigest', 'reportDigest'],
  HOLD: ['reason', 'detailDigest'],
  RELEASE: ['holdId', 'resolutionDigest'],
  REFUSE: ['reason', 'detailDigest'],
  WITHDRAW: ['reason', 'detailDigest']
});

function hold(code) { throw new Error('HOLD_' + code); }
function keysExactly(obj, expected, label) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) ||
    Object.keys(obj).sort().join('|') !== [...expected].sort().join('|')) hold(label + '_SHAPE');
}
function id(value, field) { if (typeof value !== 'string' || !ID.test(value)) hold(field + '_OPAQUE_ID_REQUIRED'); }
function digest(value, field) { if (typeof value !== 'string' || !HEX.test(value)) hold(field + '_SHA256_REQUIRED'); }
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  }
  return value;
}
export function hash(value) {
  return 'sha256:' + createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}
function header(ledger) {
  return {schema:ledger.schema, caseId:ledger.caseId, ownerId:ledger.ownerId,
    purpose:ledger.purpose, privacy:ledger.privacy};
}
function validateHeader(ledger) {
  keysExactly(ledger, ['schema', 'caseId', 'ownerId', 'purpose', 'privacy', 'events'], 'LEDGER');
  if (ledger.schema !== SCHEMA || ledger.privacy !== 'DIGESTS_AND_OPAQUE_IDS_ONLY') hold('SCHEMA_OR_PRIVACY');
  id(ledger.caseId, 'CASE'); id(ledger.ownerId, 'OWNER');
  if (typeof ledger.purpose !== 'string' || ledger.purpose.length < 8 || ledger.purpose.length > 160 ||
      /[\x00-\x1f@]/.test(ledger.purpose)) hold('PURPOSE_MINIMAL_NONIDENTIFYING_TEXT');
  if (!Array.isArray(ledger.events) || ledger.events.length > 500) hold('EVENT_LIMIT');
}
function validateEvent(event, committed) {
  const kind = event?.kind;
  if (!Object.hasOwn(FIELDS, kind)) hold('UNKNOWN_KIND');
  const dataKeys = ['id', 'kind', 'actor', 'at', ...FIELDS[kind]];
  keysExactly(event, committed ? [...dataKeys, 'prev', 'hash'] : dataKeys, 'EVENT');
  id(event.id, 'EVENT'); id(event.actor, 'ACTOR');
  if (typeof event.at !== 'string' || !UTC.test(event.at) ||
      !Number.isFinite(Date.parse(event.at))) hold('UTC_TIMESTAMP');
  for (const field of FIELDS[kind]) {
    if (field.toLowerCase().endsWith('digest')) digest(event[field], field.toUpperCase());
    else if (field === 'reason') {
      if (!REASONS.has(event.reason)) hold('REASON_ENUM');
    } else id(event[field], field.toUpperCase());
  }
  if (committed) { digest(event.prev, 'PREVIOUS'); digest(event.hash, 'RECEIPT'); }
}
export function createLedger({caseId, ownerId, purpose}) {
  const ledger = {schema:SCHEMA, caseId, ownerId, purpose,
    privacy:'DIGESTS_AND_OPAQUE_IDS_ONLY', events:[]};
  inspectLedger(ledger);
  return ledger;
}
export function inspectLedger(ledger) {
  validateHeader(ledger);
  let prev = hash(header(ledger));
  let clock = '';
  let level = 0;
  let terminal = null;
  const byId = new Map();
  const holds = new Map();
  let software = null, replay = null, gate = null, field = null;
  for (const event of ledger.events) {
    validateEvent(event, true);
    if (byId.has(event.id)) hold('DUPLICATE_EVENT');
    if (event.prev !== prev) hold('BROKEN_CHAIN');
    const {hash:receipt, ...payload} = event;
    if (hash(payload) !== receipt) hold('RECEIPT_MISMATCH');
    if (event.at < clock) hold('TIME_ORDER');
    if (terminal) hold('TERMINAL_IMMUTABLE');
    if (holds.size && !['HOLD', 'RELEASE', 'REFUSE', 'WITHDRAW'].includes(event.kind)) hold('UNRESOLVED_HUMAN_HOLD');
    switch (event.kind) {
      case 'SOFTWARE':
        if (level !== 0) hold('SOFTWARE_STAGE');
        software = event; level = 1; break;
      case 'REPLAY':
        if (level !== 1 || event.softwareId !== software.id) hold('REPLAY_REQUIRES_SOFTWARE');
        if (event.actor === software.actor) hold('INDEPENDENT_REPLAYER_REQUIRED');
        if (event.resultDigest !== software.resultDigest) hold('REPLAY_OUTPUT_DISAGREEMENT');
        replay = event; level = 2; break;
      case 'TRIAL_GATE':
        if (level !== 2 || event.replayId !== replay.id) hold('GATE_REQUIRES_REPLAY');
        if ([software.actor, replay.actor, event.stewardId].includes(event.actor)) hold('INDEPENDENT_GATE_REVIEWER_REQUIRED');
        gate = event; level = 3; break;
      case 'FIELD':
        if (level !== 3 || event.gateId !== gate.id || event.actor !== gate.stewardId) hold('FIELD_REQUIRES_STEWARD_AND_GATE');
        field = event; level = 4; break;
      case 'OUTCOME':
        if (level !== 4 || event.fieldId !== field.id) hold('OUTCOME_REQUIRES_FIELD');
        if ([software.actor, field.actor].includes(event.actor)) hold('INDEPENDENT_OUTCOME_OBSERVER_REQUIRED');
        level = 5; break;
      case 'HOLD':
        holds.set(event.id, event); break;
      case 'RELEASE': {
        const target = holds.get(event.holdId);
        if (!target || target.actor !== event.actor) hold('HOLD_OWNER_RELEASE_REQUIRED');
        holds.delete(event.holdId); break;
      }
      case 'REFUSE': terminal = 'REFUSED'; break;
      case 'WITHDRAW': terminal = 'WITHDRAWN'; break;
    }
    clock = event.at;
    prev = event.hash;
    byId.set(event.id, event);
  }
  return {
    schema:'cannon.season-witness-inspection/v1',
    caseId:ledger.caseId,
    receipt:prev,
    eventCount:ledger.events.length,
    stage:LEVELS[level],
    evidenceMeaning:'RECORDED_REPORTS_NOT_INDEPENDENTLY_AUTHENTICATED_FACTS',
    unresolvedHolds:[...holds.keys()],
    disposition:terminal || (holds.size ? 'HOLD' : 'OPEN'),
    publishableHumanSuccess:false,
    authorizedRealWorldActions:false,
    authorizedMoneyMovements:false,
    participantDataStored:false
  };
}
export function appendEvent(ledger, event) {
  inspectLedger(ledger);
  validateEvent(event, false);
  if (ledger.events.length >= 500) hold('EVENT_LIMIT');
  const previous = ledger.events.at(-1)?.hash || hash(header(ledger));
  const payload = {...event, prev:previous};
  const next = {...ledger, events:[...ledger.events, {...payload, hash:hash(payload)}]};
  inspectLedger(next);
  return next;
}
