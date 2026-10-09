import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {scan, verify} from '../scripts/conversation-collider.mjs';
const input = JSON.parse(readFileSync(new URL('../examples/conversation-collider-001.lab.json', import.meta.url), 'utf8'));
const clone = value => structuredClone(value);

test('finds typed matches, preserves mismatch, ignores shared-word only', () => {
  const report = scan(input);
  assert.equal(report.candidates.length, 3);
  assert.deepEqual(report.candidates.map(c => [c.producer, c.consumer, c.status]), [
    ['ghot-router', 'kettle-thermal', 'TYPED_TEST_CANDIDATE'],
    ['kettle-thermal', 'relatte-receipts', 'VERSION_MISMATCH_HOLD'],
    ['relatte-receipts', 'ghot-router', 'TYPED_TEST_CANDIDATE']
  ]);
  assert.deepEqual(report.unmatched, ['photobooth']);
  assert.ok(report.candidates.every(c => c.evidence.integrity === 'SYNTHETIC_ONLY'));
  assert.equal(report.authority, 'PROPOSAL_ONLY_NO_CROSSING_NO_ADMISSION_NO_EXECUTION');
});
test('reordering does not rewrite receipt', () => {
  const reordered = clone(input);
  reordered.artifacts.reverse();
  assert.equal(scan(input).receipt_sha256, scan(reordered).receipt_sha256);
  assert.deepEqual(verify(input, scan(input)), {verified:true, receipt_sha256:scan(input).receipt_sha256});
});
test('mutating candidate output breaks cold replay', () => {
  const report = scan(input);
  report.candidates[0].status = 'AUTHORIZED';
  assert.throws(() => verify(input, report), /COLD_REPLAY_MISMATCH/);
});
test('unknown fields including raw transcripts are refused', () => {
  const payload = clone(input);
  payload.artifacts[0].transcript = 'private content';
  assert.throws(() => scan(payload), /UNSUPPORTED_FIELD_transcript/);
});
test('rejects fake source witnesses', () => {
  const payload = clone(input);
  payload.artifacts[0].source = {kind:'GIT_PIN_CLAIM',repo:'owner/repo',commit:'main',path:'README.md'};
  assert.throws(() => scan(payload), /COMMIT: INVALID/);
});
test('Git pins are claims and not silently verified', () => {
  const payload = clone(input);
  payload.artifacts[0].source = {kind:'GIT_PIN_CLAIM',repo:'owner/repo',commit:'a'.repeat(40),path:'README.md'};
  const result = scan(payload);
  assert.equal(result.candidates[0].evidence.integrity, 'PIN_CLAIMS_NOT_INDEPENDENTLY_VERIFIED');
});
test('missing or nonconforming contracts fail closed', () => {
  const payload = clone(input);
  payload.artifacts[0].offers = [{contract:'heat flow',version:'v1'}];
  assert.throws(() => scan(payload), /CONTRACT: INVALID/);
});
test('distinct same-contract versions never become direct fits', () => {
  const payload = clone(input);
  payload.artifacts[1].offers[0].version = 'v2';
  const result = scan(payload);
  assert.equal(result.candidates.find(c => c.producer === 'ghot-router').status, 'VERSION_MISMATCH_HOLD');
});
test('detects duplicate IDs and declarations', () => {
  const duplicate = clone(input);
  duplicate.artifacts.push(clone(duplicate.artifacts[0]));
  assert.throws(() => scan(duplicate), /ARTIFACT_IDS: DUPLICATE/);
  const declaration = clone(input);
  declaration.artifacts[0].offers.push(clone(declaration.artifacts[0].offers[0]));
  assert.throws(() => scan(declaration), /_OFFERS: DUPLICATE/);
});
test('path traversal and malformed source paths are denied', () => {
  const payload = clone(input);
  payload.artifacts[0].source = {kind:'GIT_PIN_CLAIM',repo:'owner/repo',commit:'a'.repeat(40),path:'../secrets'};
  assert.throws(() => scan(payload), /PATH: INVALID/);
});
