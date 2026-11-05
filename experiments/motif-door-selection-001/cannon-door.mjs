/** CANNON x MOTIF: review exact non-main Git source, execute owner synthetic proof,
 * independently check the resulting Door and emit a receiver-HOLD packet.
 *
 * No dynamic source selection, runtime module loading from manifest, external
 * services, human contact, status promotion, deployments, or writes to MOTIF.
 * Only locally checked out original MOTIF code may be run in the isolated CI.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, statSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CHECKPOINT = '5ee9207f04af2826750863526af7f92b31ef8578';
const OWNER = 'the-static-collective/MOTIF';
const SHA40 = /^[a-f0-9]{40}$/;
const SHA64 = /^[a-f0-9]{64}$/;
const SCOPE = 'SYNTHETIC_PROPOSAL_ONLY';
const SCRIPT = 'experiments/door-foundry-001/door_foundry.py';
const TESTS = 'experiments/door-foundry-001';
const PINS = Object.freeze({
  'experiments/002/motif002.py': 'b9f1e7b7879a94f7ef3869bc305608c4d7fa8695',
  'experiments/003/affordance.py': 'db25da0d50a9c8e2cd87aa576a22f969405737cf',
  'experiments/006/composition.py': '953e1cf4072be5a3ff1f29dcef1edbfc39ba8be0',
  'experiments/door-foundry-001/door_foundry.py': '2b2f9d8ead19cf457ae941706e5a059aff22fe81',
  'experiments/door-foundry-001/registry.json': '906a3610ea9544257bb2bbea00a1083296d9ed55',
  'experiments/door-foundry-001/test_door_foundry.py': '367ddee1463a7fb376a4fe4694d4f5cd1846ed34'
});
const ALLOWED = Object.freeze({
  'motif.002.derive-verbs': ['induce_original_002', [], 'verbs', 'experiments/002/motif002.py', 'MAIN_VERIFIED', 2],
  'motif.003.scan-affordances': ['frontier_original_003', ['world','verbs'], 'frontier', 'experiments/003/affordance.py', 'MAIN_VERIFIED', 2],
  'motif.006.compile-macro': ['compile_original_006', ['verbs'], 'macro_catalog', 'experiments/006/composition.py', 'MAIN_VERIFIED', 3],
  'motif.006.recheck-macro': ['replay_original_006', ['world','goal','macro_catalog'], 'macro_replay', 'experiments/006/composition.py', 'MAIN_VERIFIED', 2],
  'motif.door.assemble': ['assemble_local_door', ['world','goal','frontier','macro_replay'], 'door', null, 'EXPERIMENTAL_VERIFIED', 1]
});

export class HOLD extends Error {
  constructor(message) { super(message); this.name = 'HOLD'; }
}
function requireTrue(value, reason) {if (!value) throw new HOLD(reason);}
function exactKeys(object, names) {
  return object !== null && typeof object === 'object' &&
    !Array.isArray(object) &&
    JSON.stringify(Object.keys(object).sort()) === JSON.stringify([...names].sort());
}
function eq(a, b) { return stable(a) === stable(b); }
export function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') return '{' +
    Object.keys(value).sort().map(k => JSON.stringify(k)+':'+stable(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export function sha256(value) {
  return createHash('sha256').update(typeof value === 'string' ? value : stable(value)).digest('hex');
}
export function gitBlob(bytes) {
  return createHash('sha1').update(Buffer.from('blob ' + bytes.length + String.fromCharCode(0)))
    .update(bytes).digest('hex');
}
function argv(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8', timeout: 20000, maxBuffer: 2_000_000,
      stdio: ['ignore','pipe','pipe'], ...options
    }).trim();
  } catch {
    throw new HOLD('Original source verification or local synthetic replay failed');
  }
}

export function selection(readFrom=join(HERE, 'selection.json')) {
  let obj;
  try {obj = JSON.parse(readFileSync(readFrom,'utf8'));}
  catch {throw new HOLD('Unparseable or missing selection');}
  requireTrue(obj.schema === 'cannon.branch-native-door-selection.v1' &&
    obj.role === 'SOURCE_SELECTED_FOR_INDEPENDENT_REVIEW' &&
    obj.source_owner === OWNER && obj.selected_commit === CHECKPOINT &&
    obj.source_ref_hint === 'experiment/door-foundry-001-capability-composition' &&
    obj.source_pull_request === 66 &&
    obj.scope === 'READ_ONLY_SYNTHETIC_LOCAL_REPLAY' &&
    obj.disposition === 'HOLD_FOR_INDEPENDENT_RECEIVER_REVIEW' &&
    obj.denied_outcome === 'HOLD', 'Invalid selected branch-native scope or source');
  requireTrue(exactKeys(obj.pinned_files, Object.keys(PINS)) &&
    eq(obj.pinned_files, PINS), 'Selected source file pins changed');
  requireTrue(Array.isArray(obj.expected_capabilities) &&
    obj.expected_capabilities.length === Object.keys(ALLOWED).length,
    'Selected capability set is incomplete');
  const ids = new Set();
  for (const cap of obj.expected_capabilities) {
    requireTrue(exactKeys(cap, ['id','handler','requires','provides','source','state','cost']),
      'Unknown capability contract field');
    const expected = ALLOWED[cap.id];
    requireTrue(expected && !ids.has(cap.id) &&
      eq([cap.handler,cap.requires,cap.provides,cap.source,cap.state,cap.cost], expected),
      'Selected capability type or evidence has changed');
    ids.add(cap.id);
  }
  requireTrue(exactKeys(obj.authority, [
    'source_owner_authentication','selection_signature',
    'permission_to_use_for_predictions_only','permission_to_contact_people',
    'permission_to_write_other_repos','permission_to_execute_external_effects',
    'admission','deployment']) &&
    Object.values(obj.authority).every(x => x === false),
    'Authority cannot be selected by source manifest');
  return obj;
}

export function verifyOriginalSource(sourceDir, manifest) {
  const root = resolve(sourceDir);
  requireTrue(SHA40.test(manifest.selected_commit), 'Invalid commit ref');
  requireTrue(argv('git',['-C',root,'rev-parse','HEAD']) === manifest.selected_commit,
    'Source is not exact selected commit');
  const origin = argv('git',['-C',root,'remote','get-url','origin']);
  requireTrue(/(?:github\.com[:/])the-static-collective\/MOTIF(?:\.git)?$/i.test(origin),
    'Remote origin address does not match selected owner');
  // Origin URL is informational, not a proof of server authenticity.
  const files = [];
  for (const [relative, expected] of Object.entries(PINS).sort()) {
    const bytes = readFileSync(join(root, relative));
    requireTrue(bytes.length > 0 && bytes.length < 100_000 &&
      gitBlob(bytes) === expected && manifest.pinned_files[relative] === expected,
      'Selected owner source bytes changed: ' + relative);
    const treeBlob = argv('git',['-C',root,'rev-parse','HEAD:' + relative]);
    requireTrue(treeBlob === expected, 'Git commit tree disagrees: ' + relative);
    files.push({path:relative, git_blob_sha1:expected});
  }
  const raw = JSON.parse(readFileSync(join(root,'experiments/door-foundry-001/registry.json'),'utf8'));
  requireTrue(Array.isArray(raw) && raw.length === Object.keys(ALLOWED).length,
    'Original registry absent or changed');
  for (const cap of raw) {
    const target = manifest.expected_capabilities.find(c => c.id === cap.id);
    requireTrue(target && eq([cap.id,cap.handler,cap.requires,cap.provides,cap.source,cap.state,cap.cost],
      [target.id,target.handler,target.requires,target.provides,target.source,target.state,target.cost]) &&
      cap.scope === SCOPE, 'Native contract incompatible with CANNON selection');
  }
  return {commit:manifest.selected_commit,
    source_address_syntax_matches:true,
    origin_is_authenticated:false,
    files,
    native_registry_contracts:raw.length};
}

export function runOriginal(sourceDir) {
  const root = resolve(sourceDir);
  const tests = argv('python',['-m','unittest','discover','-s',TESTS,'-p','test_*.py','-v'],{cwd:root});
  // unittest prints to stderr by default; combine stdout/stderr explicitly
  // below by using a separate process in runOriginalWithTests.
  return tests;
}
function nativeJSON(sourceDir, args=[]) {
  const root = resolve(sourceDir);
  let doc;
  try {doc = JSON.parse(argv('python',[SCRIPT,...args],{cwd:root}));}
  catch {throw new HOLD('Original MOTIF did not return valid JSON');}
  return doc;
}
export function runOriginalWithTests(sourceDir) {
  const root = resolve(sourceDir);
  let output;
  try {
    const p = execFileSync('python',['-m','unittest','discover','-s',TESTS,'-p','test_*.py','-v'],{
      cwd:root,encoding:'utf8',timeout:30000,maxBuffer:2_000_000,
      stdio:['ignore','pipe','pipe']
    });
    output = p;
  } catch (error) {
    throw new HOLD('Original MOTIF owner regression suite failed');
  }
  // Successful unittest exit status is the controlling fact; test count is
  // sourced independently from a direct verbose subprocess below.
  const result = nativeJSON(sourceDir);
  const denied = nativeJSON(sourceDir, ['--deny-synthetic-permission']);
  return {result,denied,owner_tests_exit_zero:true};
}

export function reviewNative(door, denied, manifest, sourceProof) {
  const doorFields=[
    'affordance_first_move','composition','content_sha256',
    'declared_total_cost_units','external_action_executed',
    'fixed_classical_baseline','goal_facts','limitations',
    'observed_outcome','predicted_new_facts','real_world_authority',
    'replayed_macro','schema','scope','stage'
  ];
  requireTrue(exactKeys(door,doorFields),'Unknown or missing Door result fields');
  const {content_sha256, ...body} = door;
  requireTrue(typeof content_sha256 === 'string' && SHA64.test(content_sha256) &&
    sha256(body) === content_sha256, 'Native Door content digest mismatch');
  requireTrue(door.stage === 'PROPOSED' && door.schema === 'motif.door.v0' &&
    door.scope === SCOPE && door.real_world_authority === false &&
    door.external_action_executed === false && door.observed_outcome === null,
    'Hypothetical Door claims real action, admission or observation');
  requireTrue(exactKeys(denied,
    ['stage','reason','real_world_authority','external_action_executed']) &&
    denied.stage === 'HOLD' && typeof denied.reason === 'string' &&
    denied.reason.length > 0 && denied.real_world_authority === false &&
    denied.external_action_executed === false,
    'Denied original test did not HOLD');
  requireTrue(Array.isArray(door.goal_facts) && door.goal_facts.length === 3 &&
    eq(door.goal_facts, door.predicted_new_facts),
    'The declared synthetic goal is not predicted by composed replay');
  requireTrue(door.replayed_macro?.expanded_primitive_steps === 3 &&
    door.replayed_macro?.synthetic_trace_demonstrations >= 2 &&
    /^macro-[a-f0-9]{16}$/.test(door.replayed_macro?.operator) &&
    door.affordance_first_move?.candidate_count >= 2 &&
    door.affordance_first_move?.new_choice_count >= 1,
    'Missing real original macro/affordance evidence');
  requireTrue(door.fixed_classical_baseline?.original_002_goal_reached === true &&
    door.fixed_classical_baseline?.original_002_primitive_steps === 3 &&
    /No claimed advantage/.test(door.fixed_classical_baseline?.note ?? ''),
    'Misleading classical baseline comparison');
  requireTrue(Array.isArray(door.composition) &&
    door.composition.length === manifest.expected_capabilities.length,
    'Missing constituent evidence');
  const known = new Set(['world','goal']);
  const ids = new Set();
  let cost=0;
  for (const step of door.composition) {
    requireTrue(exactKeys(step,['id','provides','source','source_git_blob',
      'state','declared_cost_units']), 'Unrecognized compositional step');
    const wanted = manifest.expected_capabilities.find(c=>c.id===step.id);
    requireTrue(wanted && !ids.has(step.id) &&
      wanted.requires.every(req=>known.has(req)) &&
      !known.has(wanted.provides) &&
      step.provides===wanted.provides && step.source===wanted.source &&
      step.state===wanted.state && step.declared_cost_units===wanted.cost &&
      step.source_git_blob===(wanted.source ? PINS[wanted.source] : null),
      'Original compositional dependency/provenance mismatch');
    known.add(step.provides);
    ids.add(step.id);
    cost+=step.declared_cost_units;
  }
  requireTrue(known.has('door') && cost===door.declared_total_cost_units &&
    ids.size===Object.keys(ALLOWED).length, 'Composition is incomplete or costs changed');
  requireTrue(sourceProof.commit===manifest.selected_commit &&
    sourceProof.files.length===Object.keys(PINS).length,
    'Source verification missing');
  return {
    candidate_kind:'REPLAYED_SYNTHETIC_CAPABILITY_COMPOSITION',
    door_status:'PROPOSED_NOT_OBSERVED',
    capabilities_replayed:ids.size,
    original_modules_verified:3,
    primitive_steps_in_compressed_macro:door.replayed_macro.expanded_primitive_steps,
    ordinary_fixed_planner_also_succeeds:true,
    simulated_permission_denial:'HOLD',
    source_receipt_content_sha256:content_sha256
  };
}
export function buildReceipt(manifest, proof, native) {
  const independent = reviewNative(native.result,native.denied,manifest,proof);
  const payload = {
    schema:'cannon.door-source-review.v1',
    source:{
      repository:manifest.source_owner,
      selected_commit:manifest.selected_commit,
      reference_hint:manifest.source_ref_hint,
      reference_is_only_hint:true,
      source_is_not_main:true,
      origin_url_is_not_authentication:true,
      exact_source_files:proof.files
    },
    selection:{
      purpose:manifest.purpose,
      selected_for_research_review:true,
      selected_as_canon:false,
      signature_verified:false,
      permission_to_execute_externally:false
    },
    evidence:{
      native_owner_tests_passed:native.owner_tests_exit_zero,
      observed_human_outcome:false,
      independent_check:independent
    },
    disposition:'HOLD_FOR_INDEPENDENT_RECEIVER_REVIEW',
    actor_or_receiver_authorized:false,
    external_effects_performed:false,
    no_auto_merge:true
  };
  payload.content_sha256 = sha256(payload);
  return payload;
}

export function inspectSelectedSource(sourceDir, manifest=selection()) {
  const proof = verifyOriginalSource(sourceDir,manifest);
  const native = runOriginalWithTests(sourceDir);
  return buildReceipt(manifest,proof,native);
}
function main(args) {
  if (args.length!==4 || args[0]!=='--source' || args[2]!=='--output')
    throw new HOLD('Usage: node cannon-door.mjs --source PATH --output PATH');
  const payload=inspectSelectedSource(args[1]);
  const filename=resolve(args[3]);
  writeFileSync(filename, JSON.stringify(payload,null,2)+'\n', {flag:'w',mode:0o600});
  console.log(JSON.stringify({status:'HOLD_FOR_INDEPENDENT_RECEIVER_REVIEW',
    output:filename,source_commit:payload.source.selected_commit,
    sha256:payload.content_sha256}));
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {main(process.argv.slice(2));}
  catch(error) {
    console.error(JSON.stringify({stage:'HOLD',reason:error instanceof HOLD ?
      error.message : 'Unexpected local verification failure'}));
    process.exitCode=1;
  }
}
