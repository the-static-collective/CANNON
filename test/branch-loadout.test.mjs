import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {inspect,validate,verify} from '../src/branch-loadout.mjs';
const data=()=>JSON.parse(readFileSync(new URL('../examples/branch-loadout-008.plan.json',import.meta.url),'utf8'));
test('loadout rejects authority laundering and malicious source declarations',()=>{
 const edit=fn=>{const p=data();fn(p);assert.throws(()=>validate(p));};
 edit(p=>p.entries[0].path='../escape');
 edit(p=>p.entries[0].commit='main');
 edit(p=>p.entries[0].argv=['; rm -rf /']);
 edit(p=>p.entries[0].authorization='yes');
 edit(p=>p.entries[0].gates=[]);
 edit(p=>p.entries.push(p.entries[0]));
 edit(p=>p.entries[0].evidenceUrl='https://attacker.invalid/pass');
 assert.throws(()=>inspect(data(),{}),/MISSING_REPO_ROOT/);
});
test('verified source bytes can be cold replayed without executing code',()=>{
 const rootsFile=process.env.BRANCH_LOADOUT_ROOTS;
 if(!rootsFile)return;
 const roots=JSON.parse(readFileSync(rootsFile,'utf8'));
 const report=inspect(data(),roots);
 assert.equal(report.entries.length,2);
 assert.equal(report.donor_executions,0);
 assert(report.entries.every(e=>e.source_status==='ORIGINAL_GIT_OBJECT_VERIFIED_LOCAL'&&!e.execution_authorized));
 assert.equal(verify(data(),roots,report).status,'COLD_REPLAY_VERIFIED');
 report.entries[0].execution_authorized=true;
 assert.throws(()=>verify(data(),roots,report),/REPLAY_OR_SOURCE_MISMATCH/);
});
