#!/usr/bin/env node
// CONVERSATION COLLIDER 001: offline typed suggestions, never authority.
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const INVENTORY = 'cannon.conversation-collider.inventory/v1';
const OUTPUT = 'cannon.conversation-collider.candidates/v1';
const ID = /^[a-z][a-z0-9-]{1,60}$/;
const CONTRACT = /^[a-z][a-z0-9.-]{2,80}$/;
const VERSION = /^v[1-9][0-9]{0,4}$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SHA = /^[0-9a-f]{40}$/;
const PATH = /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/;
function strict(o, keys, where) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) throw Error(where + ': OBJECT_REQUIRED');
  for (const k of Object.keys(o)) if (!keys.includes(k)) throw Error(where + ': UNSUPPORTED_FIELD_' + k);
}
function checked(s, regex, field) {
  if (typeof s !== 'string' || !regex.test(s) ||
      (field === 'PATH' && s.split('/').some(p => p === '.' || p === '..'))) throw Error(field + ': INVALID');
  return s;
}
function list(v, max, field) {
  if (!Array.isArray(v) || v.length > max) throw Error(field + ': INVALID_LIST');
  return v;
}
function distinct(items, field) {
  if (new Set(items).size !== items.length) throw Error(field + ': DUPLICATE');
}
const canon = v => Array.isArray(v)
  ? '[' + v.map(canon).join(',') + ']'
  : v && typeof v === 'object'
  ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}'
  : JSON.stringify(v);
const sha256 = v => createHash('sha256').update(canon(v)).digest('hex');
const order = (a, b) => canon(a).localeCompare(canon(b), 'en');

export function normalize(input) {
  strict(input, ['schema', 'artifacts'], 'INVENTORY');
  if (input.schema !== INVENTORY) throw Error('INVALID_SCHEMA');
  const artifacts = list(input.artifacts, 100, 'ARTIFACTS').map((a, i) => {
    strict(a, ['id', 'title', 'source', 'offers', 'needs', 'tags'], 'ARTIFACT_' + i);
    const id = checked(a.id, ID, 'ID');
    if (typeof a.title !== 'string' || a.title.length < 2 || a.title.length > 100) throw Error('INVALID_TITLE');
    strict(a.source, ['kind', 'label', 'repo', 'commit', 'path'], id + '_SOURCE');
    let source;
    if (a.source.kind === 'LAB_FIXTURE') {
      strict(a.source, ['kind', 'label'], id + '_LAB_SOURCE');
      source = {kind:'LAB_FIXTURE', label:checked(a.source.label, ID, 'SOURCE_LABEL')};
    } else if (a.source.kind === 'GIT_PIN_CLAIM') {
      strict(a.source, ['kind', 'repo', 'commit', 'path'], id + '_GIT_SOURCE');
      source = {kind:'GIT_PIN_CLAIM', repo:checked(a.source.repo, REPO, 'REPO'),
        commit:checked(a.source.commit, SHA, 'COMMIT'), path:checked(a.source.path, PATH, 'PATH')};
    } else throw Error('UNKNOWN_SOURCE_KIND');
    const typed = (values, field) => {
      const entries = list(values, 30, id + '_' + field).map((t, j) => {
        strict(t, ['contract', 'version'], id + '_' + field + '_' + j);
        return {contract:checked(t.contract, CONTRACT, 'CONTRACT'), version:checked(t.version, VERSION, 'VERSION')};
      });
      distinct(entries.map(t => t.contract + '@' + t.version), id + '_' + field);
      return entries.sort(order);
    };
    const tags = list(a.tags ?? [], 10, id + '_TAGS').map(t => checked(t, ID, 'TAG'));
    distinct(tags, id + '_TAGS');
    return {id, title:a.title, source, offers:typed(a.offers, 'OFFERS'), needs:typed(a.needs, 'NEEDS'), tags:tags.sort()};
  });
  distinct(artifacts.map(a => a.id), 'ARTIFACT_IDS');
  return {schema:INVENTORY, artifacts:artifacts.sort((a,b) => a.id.localeCompare(b.id, 'en'))};
}
export function scan(input) {
  const n = normalize(input);
  const candidates = [];
  for (const consumer of n.artifacts) for (const producer of n.artifacts) {
    if (consumer.id === producer.id) continue;
    for (const need of consumer.needs) for (const offer of producer.offers) {
      if (need.contract !== offer.contract) continue;
      const fitsNameAndVersion = need.version === offer.version;
      candidates.push({
        producer: producer.id, consumer: consumer.id, contract:need.contract,
        offered_version:offer.version, required_version:need.version,
        status:fitsNameAndVersion ? 'TYPED_TEST_CANDIDATE' : 'VERSION_MISMATCH_HOLD',
        evidence:{
          producer_source:producer.source, consumer_source:consumer.source,
          integrity:producer.source.kind === 'LAB_FIXTURE' && consumer.source.kind === 'LAB_FIXTURE'
            ? 'SYNTHETIC_ONLY' : 'PIN_CLAIMS_NOT_INDEPENDENTLY_VERIFIED'
        },
        gates:fitsNameAndVersion
          ? ['INDEPENDENT_SOURCE_OBJECT_VERIFY', 'ACTUAL_SCHEMA_FIT_CHECK',
             'APPLICATION_SEMANTICS_CHECK', 'RIGHTS_AND_OWNER_SELECTION', 'RECEIVER_LOCAL_DECISION']
          : ['VERSIONED_ADAPTER_OR_REFUSAL', 'PRESERVE_ORIGINAL_DATA',
             'NEW_SIGNATURE_IF_TRANSFORMED', 'RIGHTS_AND_OWNER_SELECTION', 'RECEIVER_LOCAL_DECISION']
      });
    }
  }
  candidates.sort((a,b) => order(
    [a.producer,a.consumer,a.contract,a.offered_version,a.required_version],
    [b.producer,b.consumer,b.contract,b.offered_version,b.required_version]));
  const linked = new Set(candidates.flatMap(c => [c.producer, c.consumer]));
  const body = {
    schema:OUTPUT, inventory_sha256:sha256(n), candidates,
    unmatched:n.artifacts.filter(a => !linked.has(a.id)).map(a => a.id),
    authority:'PROPOSAL_ONLY_NO_CROSSING_NO_ADMISSION_NO_EXECUTION',
    limitations:[
      'Manifest assertions are not verified Git objects or repo ownership.',
      'Typed name/version matches do not establish executable semantics.',
      'Tags are preserved but never used to infer compatibility.',
      'Conversation bodies and private account data are not ingested.'
    ]
  };
  return {...body, receipt_sha256:sha256(body)};
}
export function verify(input, output) {
  strict(output, ['schema','inventory_sha256','candidates','unmatched','authority','limitations','receipt_sha256'], 'OUTPUT');
  if (canon(scan(input)) !== canon(output)) throw Error('COLD_REPLAY_MISMATCH');
  return {verified:true, receipt_sha256:output.receipt_sha256};
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [cmd, inputPath, outPath] = process.argv.slice(2);
    if (!['scan', 'verify'].includes(cmd) || !inputPath || (cmd === 'verify' && !outPath))
      throw Error('USAGE: scan INVENTORY [NEW_OUTPUT] | verify INVENTORY OUTPUT');
    const input = JSON.parse(readFileSync(inputPath, 'utf8'));
    if (cmd === 'scan') {
      const result = scan(input);
      if (outPath) writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n', {flag:'wx', mode:0o600});
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify(verify(input, JSON.parse(readFileSync(outPath, 'utf8'))), null, 2));
    }
  } catch (e) { console.error('HOLD: ' + e.message); process.exitCode = 2; }
}
