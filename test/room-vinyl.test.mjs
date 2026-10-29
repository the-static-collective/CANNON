import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const sources=JSON.parse(readFileSync(new URL('../creative/room-vinyl-sources.json',import.meta.url)));
const room=JSON.parse(readFileSync(new URL('../creative/cannon-room-synthetic.json',import.meta.url)));
test('public CANNON never carries or claims private owner code',()=>{
 assert.equal(sources.privateOwner.status,'PRIVATE_OWNER_NATIVE_ONLY_NOT_ACQUIRED_BY_PUBLIC_CANNON');
 assert.equal(sources.nativeOwners.band.repository,'the-static-collective/band-runtime');
 assert.equal(sources.nativeOwners.lemonpress.repository,'the-static-collective/lemonPRESS');
 assert.equal(Object.keys(sources.nativeOwners).length,2);
});
test('fictitious room does not assert delivery, real people or rights',()=>{
 assert.equal(room.origin,'CANNON_LOCAL_SYNTHETIC');assert.equal(room.transmitted,false);
 assert.equal(room.realParticipants,0);assert.equal(room.publicationAuthorized,false);
 assert.equal(room.rights,'SENDER_ASSERTION_NOT_VERIFIED_LICENSE');
});
