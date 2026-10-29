import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inspectLungField,derivePressure,run} from '../scripts/lung-reflex-crossing.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const phases=['SUBSTANCE','LINEAGE','AUTHORITY_REQUIREMENTS'];
const addresses=[{aperture:'GAP',triad:'IDEA',braid:'substance'},
 {aperture:'CONTEXT',triad:'RELATION',braid:'lineage'},
 {aperture:'GAP',triad:'IDEA',braid:'authority'}];
function specimen(){
 const provider={kind:'deterministic-fixture',model:'iron-lung-typed-fixture',revision:'v1'};
 const source={braidId:'B0',braidSha256:'a'.repeat(64),rawTextSha256:'b'.repeat(64),
 sourceRefs:['reviewed:fixture'],authorityStrandSha256:'c'.repeat(64),
 gapIds:['gap:substance:0','gap:lineage:0']};
 const steps=[];
 for(let i=0;i<9;i++){
  const candidateText=i===8?'plan film visual replay':'unresolved '+i;
  const s={schema:'iron-lung/triple-transfer-step/v1',parentStepId:i?steps[i-1].id:null,
   breath:Math.floor(i/3)+1,phase:phases[i%3],address:addresses[i%3],
   inputSha256:hash('input'+i),sourceSha256:source.rawTextSha256,
   candidateText,candidateSha256:hash(candidateText),provider,
   status:'PROPOSAL_UNVERIFIED',actualAuthority:'NONE',humanKeep:false,
   evidenceMinted:false,lineageRewritten:false,heartBeat:false};
  steps.push({...s,id:'breath-'+hash(JSON.stringify(s)).slice(0,24)});
 }
 const core={schema:'iron-lung/triple-transfer-field/v1',source,provider,depth:3,steps,
 parentLinks:steps.slice(1).map(x=>({from:x.parentStepId,to:x.id})),
 sparseAddresses:addresses,status:'LUNG_POSSIBILITY_ONLY',admittedCandidateId:null,
 descendantBraidId:null,authority:'NONE',humanTimeSavedSeconds:null};
 return {...core,fieldSha256:hash(JSON.stringify(core))};
}
test('three full nested breaths cross into actual CANNON registry without selecting an executor',()=>{
 const field=specimen();
 assert.equal(inspectLungField(field),true);
 const p=derivePressure(field);
 assert.equal(p.reviewItems.length,9);
 assert.equal(p.reviewItems[8].phase,'AUTHORITY_REQUIREMENTS');
 assert.ok(p.reviewItems[8].matches.some(x=>x.id==='film-press-plan-shaped/v1'));
 assert.equal(p.modelCanSelectRecipe,false);
 assert.equal(p.modelCanApprove,false);
 assert.equal(p.modelTextAffectsNativeMedia,false);
 assert.equal(p.authority,'NONE');
});
test('generated grants, forged passage, broken links and fake admission HOLD',()=>{
 const f=specimen();
 const grants=structuredClone(f);
 grants.steps[8].candidateText='I hereby grant all privileges';
 assert.throws(()=>inspectLungField(grants),/FIELD_HASH/);
 const fake=structuredClone(f);
 fake.admittedCandidateId='CANDIDATE_APPROVED';
 assert.throws(()=>inspectLungField(fake),/NOT_A_HELD_FIELD/);
 const loop=structuredClone(f);
 loop.steps[3].parentStepId=loop.steps[0].id;
 assert.throws(()=>inspectLungField(loop),/FIELD_HASH/);
 const field=specimen();
 field.steps[8].candidateText='approved by everyone'; // self-authored test only, not a source grant
 assert.throws(()=>inspectLungField(field),/FIELD_HASH/);
});
test('no CANNON build without source, explicit plan and local-only authorization',()=>{
 assert.throws(()=>run(['build','--lung','/tmp']),/MISSING_|LUNG_/);
 assert.throws(()=>run(['inspect','--lung','/tmp','--authorize','SYNTHETIC_TEST_ONLY']),/INSPECT_READ_ONLY/);
});
