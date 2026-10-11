import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {inspect} from '../scripts/stack-squared-022-ai.mjs';

const root = process.env.GHOT_ROOT;
const reportPath = process.env.GHOT_REPORT;
const pin = resolve('examples/stack-squared-022-ai.plan.json');

test('CANNON sees real signed GHoT evidence without owning the native runtime', () => {
  assert.ok(root && reportPath, 'GHOT_ROOT and GHOT_REPORT required');
  const plan = JSON.parse(readFileSync(pin));
  const r = inspect(plan, root, reportPath);
  assert.equal(r.status, 'HOLD_EVIDENCE_NOT_ADMITTED');
  assert.equal(r.source.commit, plan.ghot_commit);
  assert.equal(r.results[0].capability, 'analysis.text.profile');
  assert.equal(r.results[0].status, 'EXECUTED');
  assert.equal(r.witness_class, 'UNSIGNED_CANNON_LOCAL_INSPECTION');
  assert.equal(r.native_receiver_signed_hold, false);
  assert.equal(r.donor_execution_in_this_stage, false);
});

test('hostile fields and source pin changes fail closed', () => {
  const plan = JSON.parse(readFileSync(pin));
  const temp = mkdtempSync(join(tmpdir(), 'cannon-stack2-ai-'));
  try {
    const original = JSON.parse(readFileSync(reportPath));
    const cases = [
      {...original, quality_assessment: 'VERIFIED'},
      {...original, native_receiver_hold: true},
      {...original, attempts: [{...original.attempts[0], status: 'EXECUTED_BY_CANNON'}]},
    ];
    for (let i=0; i<cases.length; i++) {
      const file = join(temp, i + '.json');
      writeFileSync(file, JSON.stringify(cases[i]));
      assert.throws(() => inspect(plan, root, file));
    }
    assert.throws(() => inspect({...plan, ghot_commit:'0'.repeat(40)}, root, reportPath),
                  /SOURCE_HEAD_MISMATCH/);
    assert.throws(() => inspect({...plan, owner_act:true}, root, reportPath),
                  /AUTONOMOUS_EXECUTION_REFUSED/);
  } finally {
    rmSync(temp, {recursive:true, force:true});
  }
});

test('cold replay checks exact report and refuses changed local witness', () => {
  const temp = mkdtempSync(join(tmpdir(), 'cannon-stack2-cold-'));
  const witness = join(temp, 'witness.json');
  const argv = [resolve('scripts/stack-squared-022-ai.mjs'), 'inspect',
                pin, root, reportPath, witness];
  try {
    execFileSync('node', argv);
    execFileSync('node', [argv[0], 'verify', ...argv.slice(2)]);
    const record = JSON.parse(readFileSync(witness));
    record.native_receiver_signed_hold = true;
    writeFileSync(witness, JSON.stringify(record));
    const fail = spawnSync('node', [argv[0], 'verify', ...argv.slice(2)], {encoding:'utf8'});
    assert.notEqual(fail.status, 0);
    assert.match(fail.stderr, /COLD_WITNESS_DISAGREEMENT/);
  } finally {
    rmSync(temp, {recursive:true, force:true});
  }
});
