import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validatePrivateExport,publicCodeIndex,prepare,verify,roundtripRequest} from '../src/tranchnode-dual-015.mjs';
const base=JSON.parse(readFileSync(new URL('../fixtures/synthetic-legacy-autodisco-015.json',import.meta.url),'utf8'));
const roots=process.env.CANNON_015_ROOTS?JSON.parse(readFileSync(process.env.CANNON_015_ROOTS,'utf8')):null;
const clone=()=>structuredClone(base);
test('only explicitly private manually supplied structures are received',()=>{
 assert.equal(validatePrivateExport(clone()).privacy,'PRIVATE');
 const bad=clone();bad.privacy='PUBLIC';
 assert.throws(()=>validatePrivateExport(bad),/NOT_EXPLICIT_PRIVATE_LOCAL_EXPORT/);
 const badSong=clone();badSong.songs[0].privacy='PUBLIC';
 assert.throws(()=>validatePrivateExport(badSong),/SONG_PRIVATE_OR_SHAPE_INVALID/);
 const unknown=clone();unknown.annotations[0].song_id='untracked';
 assert.throws(()=>validatePrivateExport(unknown),/ANNOTATION_UNKNOWN_SONG/);
 const duplicate=clone();duplicate.annotations[1].id=duplicate.annotations[0].id;
 assert.throws(()=>validatePrivateExport(duplicate),/DUPLICATE_ANNOTATION/);
 const forged=clone();forged.foreign_seeds[0].hop=4;
 assert.throws(()=>validatePrivateExport(forged),/FOREIGN_SEED_INVALID/);
 const bonus=clone();bonus.owner_email='user@example.com';
 assert.throws(()=>validatePrivateExport(bonus),/PRIVATE_EXPORT_FIELDS/);
});
test('public WebZ capability index exposes public code only, no private collection facts',()=>{
 const pub=publicCodeIndex();
 assert.equal(pub.schema,'webz.tranchnode-lineage-source-index/v0');
 assert.equal(pub.publicReleaseAuthorized,false);
 assert.equal(pub.privateBytesIncluded,false);
 assert.equal(pub.privateContentHashesIncluded,false);
 assert.equal(pub.personalArchiveAccess,false);
 assert.equal(pub.actualCollectionSize,'withheld');
 assert.equal(pub.sources.length,3);
 const encoded=JSON.stringify(pub);
 assert.equal(encoded.includes(base.songs[0].lyrics),false);
 assert.equal(encoded.includes(base.foreign_seeds[0].payload.observed),false);
});
test('source contracts are read from two original TranchNodes, not guessed',async t=>{
 if(!roots){t.skip('requires source-pinned checkout, original Project0 build');return}
 const src=readFileSync(new URL('../fixtures/synthetic-legacy-autodisco-015.json',import.meta.url));
 const result=await prepare(roots,src);
 assert.equal(result.historical_application_commit,'c1ab651e55f85d9f13551c89c1de39097d6b16a4');
 assert.equal(result.original_source_witnesses.length,4);
 assert.equal(result.owner_identity_authenticated,false);
 assert.equal(result.public_release_authorized,false);
 assert.equal(result.original_app_or_server_executed,false);
 assert.equal(result.project0_continuity.alive.authority.portableEffect,'none');
 assert.equal(result.project0_continuity.alive.authority.externalAdmissionRequired,true);
 assert.ok(result.project0_continuity.alive.unresolved.some(x=>x.lane==='identity'));
 assert.ok(result.project0_continuity.alive.unresolved.some(x=>x.lane==='authority'));
 assert.equal(result.public_manifest.privateBytesIncluded,false);
 assert.equal(result.public_manifest.actualCollectionSize,'withheld');
 const request=roundtripRequest(result,'/tmp/private-015');
 assert.equal(request.disposition,'HOLD');
 assert.equal(request.spec.donor_claims.source_bytes_not_embedded,true);
 assert.throws(()=>roundtripRequest({...result,public_release_authorized:true},'/tmp/private-015'),/PUBLIC_OR_AUTHORITY_ESCALATION/);
});
test('native TranchNode immutable store, idempotency, Project0 continuity, private R14 HOLD and public non-leak',async t=>{
 if(!roots||!process.env.CANNON_015_OUTPUT){t.skip('requires CI private sandbox');return}
 const x=await verify(roots,new URL('../fixtures/synthetic-legacy-autodisco-015.json',import.meta.url).pathname,process.env.CANNON_015_OUTPUT);
 assert.equal(x.status,'DUAL_TRANCHNODE_PRIVATE_SOURCE_CUSTODY_PROJECT0_CONTINUITY_R14_HOLD_VERIFIED');
 assert.equal(x.privacy,'PRIVATE');
 assert.equal(x.content_deduplicated,true);
 assert.equal(x.public_release_authorized,false);
 assert.equal(x.native_relatte_objects_verified,3);
});
