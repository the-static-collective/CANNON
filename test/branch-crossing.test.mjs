import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {verifyGhot,run} from '../src/branch-crossing.mjs';
const dig='b'.repeat(64),sha='c'.repeat(64);
test('no unsigned success, no unbound hash and no implicit permission',()=>{
  const task={kind:'ghot.task',version:'0',capability:'system.hash',input:dig,task_id:'task-1',requester_node_id:'node-1',constraints:{network:'not-required'}};
  const receipt={kind:'ghot.receipt',version:'0',capability:'system.hash',status:'ok',error:null,task_id:'task-1',requester_node_id:'node-1',receipt_id:'receipt-1',output:{sha256:sha},output_sha256:sha};
  assert.throws(()=>verifyGhot(task,receipt,dig),/GHOT_HASH_OUTPUT_MISMATCH/);
  assert.throws(()=>verifyGhot({...task,capability:'system.shell'},receipt,dig),/TASK_NOT_BOUND/);
  assert.throws(()=>verifyGhot({...task,constraints:{network:'required'}},receipt,dig),/NETWORK_POLICY/);
  assert.throws(()=>verifyGhot(task,{...receipt,status:'error'},dig),/GHOT_WORK_FAILED/);
  assert.throws(()=>verifyGhot(task,receipt,'not-a-hash'),/INVALID_SOURCE_COMMITMENT/);
});
test('missing source checkouts HOLD before any GHoT process starts',async()=>{
  const plan=JSON.parse(readFileSync(new URL('../examples/branch-loadout-008.plan.json',import.meta.url),'utf8'));
  await assert.rejects(()=>run(plan,{},'/tmp/cannon009-must-not-create'),/MISSING_REPO_ROOT/);
});
