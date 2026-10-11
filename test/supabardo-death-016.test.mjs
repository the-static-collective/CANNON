import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {FILENAMES,manifestValid,verify,sourceWitnesses,SB,TRANCH} from '../src/supabardo-death-016.mjs';
const roots=process.env.CANNON_016_ROOTS?JSON.parse(readFileSync(process.env.CANNON_016_ROOTS,'utf8')):null;
const output=process.env.CANNON_016_OUTPUT;
test('strict public fixture allowlist rejects path traversals, changed identity and private flags',()=>{
 const valid={schema:'cannon.supabardo-stored-fixtures/v0',source_commit:SB,store_commit:TRANCH,
  private_data_included:false,entries:FILENAMES.map(name=>({name,address:'sha256:'+'a'.repeat(64),byteLength:200}))};
 assert.equal(manifestValid(structuredClone(valid)).entries.length,22);
 for(const alteration of [
   x=>{x.entries[0].name='../secrets.json'},
   x=>{x.entries[1].address='abc'},
   x=>{x.entries[2].byteLength=0},
   x=>{x.entries.pop()},
   x=>{x.source_commit='0'.repeat(40)},
   x=>{x.private_data_included=true}
 ]){const x=structuredClone(valid);alteration(x);assert.throws(()=>manifestValid(x),/INVALID_MANIFEST/)}
});
test('missing original source cannot be imagined',()=>{assert.throws(()=>sourceWitnesses({}),/MISSING_PINNED_ROOT/)});
test('SupaBardo independently signed archive outlives local stage and retains local receiver authority',async t=>{
 if(!roots||!output){t.skip('requires CI native frozen source and TranchNode root');return}
 const x=await verify(roots,output);
 assert.equal(x.status,'BARD0_DEATH_TRANCHNODE_PROJECT0_INDEPENDENTLY_VERIFIED');
 assert.deepEqual(x.dispositions,['ADMIT','HOLD','FRESH_LOCAL_ADMIT']);
 assert.equal(x.archived_bytes_recursively_verified,true);
 assert.equal(x.files,22);
 assert.equal(x.stage_destroyed,true);
 assert.equal(x.live_supabase_contacted,false);
 assert.equal(x.new_destination_admission,false);
 const report=JSON.parse(readFileSync(join(output,'public-report.json')));
 assert.equal(report.continuity.alive.authority.portableEffect,'none');
 assert.equal(report.continuity.alive.authority.externalAdmissionRequired,true);
 assert.equal(report.current_user_archive_copied,false);
 assert.equal(report.creative_keep_authorized,false);
 assert.equal(report.live_supabase_schema_destroyed,false);
});
