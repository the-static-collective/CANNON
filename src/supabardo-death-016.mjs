
import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,rmSync,existsSync,realpathSync,cpSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {readSource} from './present-use.mjs';
export const SB='65294f135260ee48b38829f698598dfe3478b0e7', HUMAN='6c30bae1896db52bdb387d25b9ee577e0542e055',TRANCH='7fbb0c868befd5f6a7478bdd0447477a0e8e075e',P0='08f892eb379ef538cce5b3ca081ecf683b448a4b';
export const FILENAMES=['sb001-static-os-particular.json','sb001-signed-crossing.json','sb001-release-receipt.json','sb001-unresolved-receipt.json','sb001-admit-receipt.json','sb001-exit-receipt.json','sb001-evidence-manifest.json','sb002-toaster-proposal.json','sb002-signed-crossing.json','sb002-release-receipt.json','sb002-unresolved-receipt.json','sb002-hold-receipt.json','sb002-exit-receipt.json','sb002-evidence-manifest.json','sb003-ark.json','sb003-signed-crossing.json','sb003-release-receipt.json','sb003-unresolved-receipt.json','sb003-successor-acceptance-receipt.json','sb003-successor-admit-receipt.json','sb003-exit-receipt.json','sb003-evidence-manifest.json'];
const assert=(x,s)=>{if(!x)throw Error(s)};
const json=x=>JSON.stringify(x,null,2)+'\n',read=p=>JSON.parse(readFileSync(p,'utf8')),write=(p,x)=>writeFileSync(p,json(x),{flag:'wx',mode:0o600}),hash=x=>createHash('sha256').update(x).digest('hex'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function pinned(roots,repo,sha){assert(typeof roots?.[repo]==='string','MISSING_PINNED_ROOT '+repo);const r=realpathSync(resolve(roots[repo]));assert(execFileSync('git',['-C',r,'rev-parse','HEAD'],{encoding:'utf8',timeout:12000}).trim()===sha,'SOURCE_PIN_CHANGED '+repo);return r}
function original(roots,repo,sha,path,id){pinned(roots,repo,sha);const actual=repo==='the-static-collective/reLATTE-supabardo'?'the-static-collective/reLATTE':repo;const mapped=actual===repo?roots:{...roots,[actual]:roots[repo]};return readSource({id,repository:actual,commit:sha,path,media_type:'text/plain',tags:[]},mapped)}
export function sourceWitnesses(roots){const rows=[
 original(roots,'the-static-collective/Human-Witness',HUMAN,'docs/superpowers/specs/2026-08-25-supabardo-crossing-field-design.md','sb-original-architectural-owner'),
 original(roots,'the-static-collective/reLATTE-supabardo',SB,'scripts/supabardo-independent-verify.py','sb-original-independent-verifier'),
 original(roots,'the-static-collective/tranchnode',TRANCH,'src/artifact-store.ts','sb-original-cas'),
 original(roots,'the-static-collective/project0',P0,'src/continuity-profile/inspect.ts','sb-original-continuity')];
 assert(rows[0].content.includes('Store the crossing, not the canon')&&rows[1].content.includes('def verify_sb003')&&rows[2].content.includes('export class FilesystemArtifactStore')&&rows[3].content.includes('export function deriveStillAlive'),'SUPABARDO_ORIGINAL_SURFACE_MISSING');return rows.map(x=>x.witness)}
export function manifestValid(m){assert(m?.schema==='cannon.supabardo-stored-fixtures/v0'&&m.source_commit===SB&&m.store_commit===TRANCH&&m.private_data_included===false&&Array.isArray(m.entries)&&m.entries.length===FILENAMES.length,'INVALID_MANIFEST');assert(m.entries.every((e,i)=>e.name===FILENAMES[i]&&/^sha256:[0-9a-f]{64}$/.test(e.address)&&Number.isSafeInteger(e.byteLength)&&e.byteLength>0),'INVALID_MANIFEST_ENTRY');return m}
function verifyPython(roots,root,expected){
 const code=join(pinned(roots,'the-static-collective/reLATTE-supabardo',SB),'scripts/supabardo-independent-verify.py');
 const r=spawnSync('python3',[code,'--root',root],{encoding:'utf8',timeout:60000,maxBuffer:500000,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
 assert(!r.error,'PYTHON_VERIFIER_SPAWN_FAILED');let x;try{x=JSON.parse(r.stdout.trim())}catch{throw Error('PYTHON_VERIFIER_NO_JSON')}
 if(expected){assert(r.status===0&&x.ok===true&&x.verifier==='python-stdlib-p256/v0'&&x.imports_relattes_typescript===false,'PYTHON_INDEPENDENT_VERIFIER_REFUSED '+(x.error||r.stderr));assert(same(x.results.map(z=>[z.specimen,z.outcome]),[['SB-001','ADMIT'],['SB-002','HOLD'],['SB-003','FRESH_LOCAL_ADMIT']]),'WRONG_BARD0_OUTCOME');assert(same(x.results.map(z=>z.evidence_set_id),[
 'sb001-evidence-v0:cbb5e16c8209e1978d1cc1910c4b5128fa58bdab1bb9bbd7d4112ebd0f6c5174',
 'sb002-evidence-v0:a44ce387493dec11fbd0902a8ca03f090b3d08ee79db89e53084f84195bbd581',
 'sb003-evidence-v0:706d1f95a15e11435c3d770886243b78a225677bde7926f02ed07d49bd6afb27'
 ]),'BARD0_EVIDENCE_ID_CHANGED')}else assert(r.status!==0&&x.ok===false&&/INVALID_RECEIPT_SIGNATURE/.test(x.error),'SIGNED_TAMPER_WAS_NOT_REFUSED');
 return x;
}
function nativeStore(roots,mode,storeFolder,argument){
 const t=pinned(roots,'the-static-collective/tranchnode',TRANCH),helper=join(import.meta.dirname,'../scripts/supabardo-custody-016.mjs');
 const stdout=execFileSync(process.execPath,['--import',join(t,'node_modules/tsx/dist/loader.mjs'),helper,mode,t,storeFolder,argument],{cwd:t,encoding:'utf8',timeout:90000,maxBuffer:350000,stdio:['ignore','pipe','pipe']});
 return JSON.parse(stdout)
}
function nativeContinuity(roots,manifest,results){
 const require=createRequire(import.meta.url),p0=pinned(roots,'the-static-collective/project0',P0),c=require(join(p0,'.build/src/continuity-profile/index.js'));
 const lane=(name,mode,evidence,excludes,uncertainty=[])=>({lane:name,mode,dimensions:[{dimension:'post-stage-archive',evidenceRefs:[evidence]}],transformationRefs:[],residualRefs:[],uncertainty,doesNotEstablish:excludes});
 const claim={schema:'p0.continuity/0.1',purpose:'offline reconstruction of original SupaBardo frozen public proof after disposable staging teardown',subjectRef:'github:the-static-collective/reLATTE@'+SB,ancestorRoots:['github:the-static-collective/reLATTE@'+SB],environment:{decoderRef:'python-stdlib-p256/v0',runtimeRef:'disposable-local-stage',policyRefs:[],contextRefs:['not-a-live-supabase-session','frozen-public-proof-only']},lanes:[
 lane('custody','preserved','sha256:'+hash(json(manifest)),['identity','authority']),
 lane('protocol','preserved','source:python-stdlib-p256-v0',['authority']),
 lane('representation-story','transformed','source:public-evidence-archives',['identity','authority'],['SB-003 independent frozen archive is not an exact copy of an ephemeral runtime occurrence']),
 lane('identity','unresolved','source:public-key-witnesses',['authority'],['No human operator has been authenticated']),
 lane('authority','unresolved','evidence:independent-dispositions',['identity'],['Original signed historical receipts do not authorize present action'])
 ],outputRefs:results.map(x=>x.evidence_set_id),parentContinuityRefs:[],occurrenceClaim:'continuation-only'};
 const ref=c.addressContinuityClaim(claim),alive=c.deriveStillAlive(claim);
 assert(c.verifyContinuityClaim(ref,claim)&&alive.authority.portableEffect==='none'&&alive.authority.externalAdmissionRequired===true,'PROJECT0_AUTHORITY_PROMOTION');return{claim,ref,alive}
}
function report(roots,manifest,results){return{schema:'cannon.supabardo-death-custody-016/v0',sources:{human_witness_spec:HUMAN,relatte_independent_fixtures:SB,tranchnode_store:TRANCH,project0_continuity:P0},specimens:results,immutable_public_files:FILENAMES.length,exact_bytes_restored:true,independent_signatures_verified:true,disposable_staging_destroyed:true,live_supabase_contacted:false,live_supabase_schema_destroyed:false,current_user_archive_copied:false,new_human_act:false,new_receiver_admission:false,creative_keep_authorized:false,persistent_bardo_created:false,continuity:nativeContinuity(roots,manifest,results),claim_limit:'The original fixtures outlive a newly destroyed local staging directory. This run does not recreate prior live Supabase schema destruction, human assent, or SB-003 runtime world death.'}}
export async function run(roots,output){
 assert(!existsSync(output),'OUTPUT_ALREADY_EXISTS');const wit=sourceWitnesses(roots),originalRoot=pinned(roots,'the-static-collective/reLATTE-supabardo',SB);
 const out=resolve(output),stage=join(out,'transient'),fixture=join(stage,'fixtures');mkdirSync(fixture,{recursive:true,mode:0o700});
 for(const name of FILENAMES)writeFileSync(join(fixture,name),readFileSync(join(originalRoot,'fixtures',name)),{flag:'wx'});
 const initial=verifyPython(roots,stage,true),manifest=manifestValid(nativeStore(roots,'seal',join(out,'objects'),fixture));
 write(join(out,'custody-manifest.json'),manifest);
 rmSync(stage,{recursive:true,force:true});assert(!existsSync(stage),'TRANSIENT_STAGE_SURVIVED');
 const restored=nativeStore(roots,'restore',join(out,'objects'),join(out,'custody-manifest.json'));
 assert(restored.verified_entries===FILENAMES.length,'TRANCH_RESTORE_INCOMPLETE');
 const post=verifyPython(roots,join(out,'recovered'),true);
 assert(same(initial.results,post.results),'DISPOSITION_CHANGED_AFTER_STAGE_DEATH');
 const hostile=join(out,'hostile');mkdirSync(hostile);cpSync(join(out,'recovered','fixtures'),join(hostile,'fixtures'),{recursive:true});
 const target=join(hostile,'fixtures','sb003-exit-receipt.json'),x=read(target),sig=x.signing.signature;
 x.signing.signature=(sig[0]==='A'?'B':'A')+sig.slice(1);writeFileSync(target,json(x));
 verifyPython(roots,hostile,false);rmSync(hostile,{recursive:true,force:true});
 write(join(out,'sources.json'),wit);write(join(out,'public-report.json'),report(roots,manifest,post.results));
 return verify(roots,out)
}
export async function verify(roots,output){
 const out=resolve(output),w=sourceWitnesses(roots);assert(same(read(join(out,'sources.json')),w),'ORIGINAL_GIT_SOURCE_CHANGED');
 const m=manifestValid(read(join(out,'custody-manifest.json')));assert(!existsSync(join(out,'transient')),'INTERIOR_SHOULD_NOT_PERSIST');
 assert(nativeStore(roots,'restore',join(out,'objects'),join(out,'custody-manifest.json')).verified_entries===FILENAMES.length,'NATIVE_CAS_RECOVERY_FAILED');
 const x=verifyPython(roots,join(out,'recovered'),true),r=report(roots,m,x.results);
 assert(same(read(join(out,'public-report.json')),r),'COLD_REPLAY_CHANGED');
 return{status:'BARD0_DEATH_TRANCHNODE_PROJECT0_INDEPENDENTLY_VERIFIED',frozen_public_files:FILENAMES.length,files:FILENAMES.length,archived_bytes_recursively_verified:true,dispositions:x.results.map(y=>y.outcome),stage_destroyed:true,membrane_staging_destroyed:true,live_supabase_contacted:false,private_archive_copied:false,authority_transferred:false}
}
