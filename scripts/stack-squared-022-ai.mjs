#!/usr/bin/env node
/**
 * CANNON STACK² 022: independent cold witness of native GHoT Thinking Workbench.
 * Does not run model inference, select work, grant ACT, or perform reLATTE R3 HOLD.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve, join} from 'node:path';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const canonical = value => JSON.stringify(value, Object.keys(value).sort());
const REQUIRED_FILES = [
  'ghot/ai_recomposition.py',
  'ghot/instrument_rack.py',
  'ghot/reference_node.py',
  'ghot/relatte_identity.py',
  'ghot/executor_pantry.py',
  'ghot/external_adapters.py',
  'integrations/ai-recomposition-001/adapter-manifest.json'
];
const ACCEPTED_CAPS = ['analysis.text.profile', 'ai.text.infer.local'];

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], {encoding: 'utf8', timeout: 15000}).trim();
}
function guard(condition, code) {
  if (!condition) throw Error(code);
}
function read(path) { return JSON.parse(readFileSync(path, 'utf8')); }

export function inspect(plan, root, reportPath) {
  guard(plan?.schema === 'cannon.stack-squared-ai-witness-plan/v0', 'INVALID_PLAN');
  guard(plan.mode === 'NATIVE_GHOT_EVIDENCE_ONLY', 'EXECUTION_POLICY_REFUSED');
  guard(/^([a-f0-9]{40})$/.test(plan.ghot_commit), 'INVALID_GHOT_COMMIT');
  guard(plan.native_verify_entrypoint === 'ghot/ai_recomposition.py', 'UNSUPPORTED_ENTRYPOINT');
  guard(JSON.stringify(plan.source_files) === JSON.stringify(REQUIRED_FILES), 'UNPINNED_SOURCE_FILES');
  guard(plan.receiver_disposition === 'NO_R3_RECEIVER_HOLD', 'INVALID_RECEIVER_DISPOSITION');
  guard(plan.auto_execution === false && plan.owner_act === false, 'AUTONOMOUS_EXECUTION_REFUSED');
  root = resolve(root);
  reportPath = resolve(reportPath);
  guard(git(root, 'rev-parse', 'HEAD') === plan.ghot_commit, 'SOURCE_HEAD_MISMATCH');
  // A source checkout at the correct commit may still contain local edits.
  guard(git(root, 'diff', '--name-only', plan.ghot_commit) === '', 'SOURCE_WORKTREE_MODIFIED');
  for (const name of REQUIRED_FILES) {
    const actual = readFileSync(join(root, name));
    const committed = execFileSync('git', ['-C', root, 'show', plan.ghot_commit + ':' + name],
                                   {timeout: 15000, maxBuffer: 1024 * 1024 * 4});
    guard(sha(actual) === sha(committed), 'SOURCE_FILE_MODIFIED:' + name);
  }
  const reportBytes = readFileSync(reportPath);
  const report = JSON.parse(reportBytes.toString('utf8'));
  guard(report.schema === 'ghot.ai-recomposition-report/v0', 'INVALID_GHOT_REPORT');
  guard(report.admission === false && report.native_receiver_hold === false &&
        report.publication === false && report.quality_assessment === 'NOT_PERFORMED',
        'SEMANTIC_PROMOTION_REFUSED');
  guard(Array.isArray(report.attempts) && report.attempts.length >= 1 &&
        report.attempts.length <= 2, 'INVALID_ATTEMPTS');
  guard(report.attempts.every((attempt, i) =>
      attempt.capability === ACCEPTED_CAPS[i] &&
      attempt.signed_receipt?.schema === 'relatte.receipt/v0'),
      'UNEXPECTED_INSTRUMENT');
  // Calls the exact pinned GHoT native verifier; no model call or instrument dispatch.
  const stdout = execFileSync('python3', [
    join(root, 'ghot/ai_recomposition.py'), 'verify', '--report-file', reportPath
  ], {cwd: root, encoding: 'utf8', timeout: 45000, env: {...process.env,
        PYTHONDONTWRITEBYTECODE: '1'}, maxBuffer: 1024 * 1024});
  const native = JSON.parse(stdout);
  guard(native.verified === true && native.report_id === report.report_id &&
        native.kind === 'LOCAL_INSTRUMENT_EVIDENCE_ONLY', 'NATIVE_VERIFIER_REFUSED');
  const body = {
    schema: 'cannon.stack-squared-ai-witness/v0',
    source: {repository: 'the-static-collective/GHoT', commit: plan.ghot_commit,
             verified_files: REQUIRED_FILES},
    native_report_sha256: sha(reportBytes),
    native_report_id: report.report_id,
    input_sha256: report.input_sha256,
    capabilities: report.attempts.map(a => a.capability),
    results: report.attempts.map(a => ({
      capability: a.capability, status: a.status,
      signed_receipt_id: a.signed_receipt.receipt_id,
      portable_packet_id: a.packet?.packet_id ?? null
    })),
    status: 'HOLD_EVIDENCE_NOT_ADMITTED',
    witness_class: 'UNSIGNED_CANNON_LOCAL_INSPECTION',
    donor_execution_in_this_stage: false,
    native_receiver_signed_hold: false,
    owner_act: false,
    publication: false
  };
  const id = 'cannon-stack2-ai-witness-v0:' + sha(Buffer.from(JSON.stringify(body)));
  return {...body, witness_id: id};
}

function main() {
  const [op, planFile, root, reportPath, witnessFile] = process.argv.slice(2);
  guard((op === 'inspect' || op === 'verify') && planFile && root &&
        reportPath && witnessFile && process.argv.length === 7,
        'Usage: inspect|verify PLAN GHOT_CHECKOUT GHOT_REPORT WITNESS_JSON');
  const expected = inspect(read(planFile), root, reportPath);
  if (op === 'inspect') {
    guard(!existsSync(witnessFile), 'REFUSE_TO_OVERWRITE_EVIDENCE');
    mkdirSync(resolve(witnessFile, '..'), {recursive: true});
    writeFileSync(witnessFile, JSON.stringify(expected, null, 2) + '\n', {flag: 'wx', mode: 0o600});
  } else {
    guard(JSON.stringify(read(witnessFile)) === JSON.stringify(expected),
          'COLD_WITNESS_DISAGREEMENT');
  }
  console.log(JSON.stringify({status: expected.status, witness_id: expected.witness_id,
                              native_signed_packets_verified: true,
                              receiver_hold: false}, null, 2));
}
if (process.argv[1]?.endsWith('stack-squared-022-ai.mjs')) {
  try { main(); } catch (error) {
    console.error('HOLD:', String(error.message).slice(0, 320));
    process.exitCode = 1;
  }
}
