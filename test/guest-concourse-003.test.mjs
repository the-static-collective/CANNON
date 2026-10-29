import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateRegistry,makeGuestConcourse,verifyConcourse} from '../src/concourse/guest-dealer.mjs';
const registry=JSON.parse(readFileSync(new URL('../constellation/guests-003.json',import.meta.url),'utf8'));
test('twenty-two new source owners are distinct from original native constellation',()=>{
 assert.equal(validateRegistry(registry),registry);
 const old=new Set(['static-os','GHoT','webZ','GrO','JAR-VIS','planZ','reLATTE','Full-Measure','GRAFT','corpus-os','project0','free-graph','ALEX.2','LOADOUT','WORLDSEED','band-runtime','trust','static-live','playdeck','the-haunted-toaster','STORYSHIP','tranchnode']);
 assert.equal(registry.guests.length,22);
 assert.equal(registry.guests.filter(g=>old.has(g.repository.split('/')[1])).length,0);
 assert.equal(registry.parent.inheritedDistinctNativeOwnerCount,22);
});
test('registry cannot inflate native execution, human proof or source ownership',()=>{
 for(const mutation of [
  r=>{r.guests[0].nativeExecuted=true},
  r=>{r.guests[0].fieldWitness=true},
  r=>{r.guests[0].externalAction=true},
  r=>{r.guests[0].rights='GRANTED'},
  r=>{r.guests[0].commit='main'},
  r=>{r.guests[0].repository='outside/repo'},
  r=>{r.guests[1].guestId=r.guests[0].guestId},
  r=>{r.guests.pop()},
  r=>{r.newGuestCount=44}
 ]){
  const r=structuredClone(registry);mutation(r);
  assert.throws(()=>validateRegistry(r),/HOLD_/);
 }
});
test('source acquisition fails closed when roots are missing, extra or fake',()=>{
 assert.throws(()=>makeGuestConcourse({registry,roots:{}}),/HOLD_EXACT_22_SOURCE_ROOTS_REQUIRED/);
 const roots=Object.fromEntries(registry.guests.map(g=>[g.guestId,'/missing']));
 assert.throws(()=>makeGuestConcourse({registry,roots}),/ENOENT|HOLD_/);
 const extra={...roots,fake:'/other'};
 assert.throws(()=>makeGuestConcourse({registry,roots:extra}),/HOLD_/);
});
test('held guest cards never imply human, native, financial or dispatch authorization',()=>{
 for(const g of registry.guests){
  assert.equal(g.nativeExecuted,false);
  assert.equal(g.externalAction,false);
  assert.equal(g.rights,'NOT_VERIFIED');
  assert.ok(g.offer.length>20);
 }
 assert.equal(registry.guests.filter(g=>g.admission==='NATIVE_TEST').length,6);
});
