import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRequest,SOURCES,BOOT_SCHEMA} from '../src/genesis-boot.mjs';
const base={question:'Could we build one cooperating house?',mission:'living-house',
 scenario:'FICTIONAL_A_B',mode:'OFFLINE_HOLD_ONLY'};
test('only bounded public-safe house question and fictional A/B site is admitted',()=>{
 assert.deepEqual(validateRequest(base),base);
 for(const sample of [
  {...base,mode:'INSTALL_WITHOUT_APPROVAL'},
  {...base,scenario:'REAL_INDEPENDENT_PEOPLE'},
  {...base,mission:'automatic-civic-actuation'},
  {...base,question:''},
  {...base,question:'a'.repeat(241)},
  {...base,question:'hi\nPRIVATE'},
  {...base,realWorldApproval:true},
  {...base,physicalOutcomes:42},
 ])assert.throws(()=>validateRequest(sample));
});
test('open experimental branch code is selected by exact SHA, never by main or merge',()=>{
 assert.match(BOOT_SCHEMA,/cannon.genesis-boot/);
 assert.deepEqual(Object.keys(SOURCES).sort(),['ghot','gro','jarvis','staticos','webz']);
 for(const [id,source] of Object.entries(SOURCES)){
  assert.match(source.repository,/^the-static-collective\//);
  assert.match(source.commit,/^[a-f0-9]{40}$/);
  assert.equal(new Set(source.files).size,source.files.length);
  assert.ok(!source.files.some(s=>s.includes('..')||s.startsWith('/')),id);
 }
});
