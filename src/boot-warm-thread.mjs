/** Optional source-owned Warm Thread native experiment.
 * Never reimplements participant logic. Executes CANNON STACK² 027 original
 * runner + GHoT/Full Measure/Band/Garden original functions at exact PR SHAs.
 * The result is a FICTIONAL preview, never real assistance or a Human Deed.
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,realpathSync,statSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {readSource} from './present-use.mjs';

const ROOT='the-static-collective/CANNON';
const ORIGINAL_COMMIT='ee461d7be29795907384c791be88c18e030e0222';
const ORIGINAL_SCRIPT='labs/crater-027/native.mjs';
const WARM_PINS={
 ghotWarm:{repo:'the-static-collective/GHoT',commit:'3c8be40cbaef2f9c786e5424abf15d4b138d2966'},
 full:{repo:'the-static-collective/full-measure-world-layer',commit:'553e97401a8483a0ee3c369fed9d3fb8f1c9058d'},
 band:{repo:'the-static-collective/band-runtime',commit:'f2c889df90905eda533fe6d978cd1a52c788a33e'},
 garden:{repo:'the-static-collective/BananaSpork',commit:'6738230a8557060dd59aabc19caf21826806d16f'}
};
export const BOOT_WARM_SCHEMA='cannon.genesis-warm-thread/v1';
export const WARM_ROOT_KEYS=['cannonWarm','ghotWarm','full','band','garden'];
const fail=(yes,code)=>{if(!yes)throw Error(code)};
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const serialized=x=>JSON.stringify(x,null,2)+'\n';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const git=(root,...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',
 timeout:12000,maxBuffer:1024*1024}).trim();

function originalRoots(roots){
 fail(roots&&typeof roots==='object'&&!Array.isArray(roots)&&
   Object.keys(roots).sort().join()===WARM_ROOT_KEYS.slice().sort().join(),
  'FIVE_WARM_THREAD_SOURCE_ROOTS_REQUIRED');
 const abs={};
 for(const name of WARM_ROOT_KEYS){
  fail(typeof roots[name]==='string'&&statSync(roots[name]).isDirectory(),'MISSING_WARM_THREAD_ROOT_'+name);
  abs[name]=realpathSync(resolve(roots[name]));
 }
 fail(new Set(Object.values(abs)).size===WARM_ROOT_KEYS.length,'DISTINCT_ORIGINAL_SOURCE_ROOTS_REQUIRED');
 fail(git(abs.cannonWarm,'rev-parse','HEAD')===ORIGINAL_COMMIT,'CANNON_WARM_BRANCH_SHA_MISMATCH');
 const c=readSource({id:'warm-thread',repository:ROOT,commit:ORIGINAL_COMMIT,
    path:ORIGINAL_SCRIPT,media_type:'text/javascript',tags:[]},{[ROOT]:abs.cannonWarm});
 const live=join(abs.cannonWarm,ORIGINAL_SCRIPT);
 fail(realpathSync(live)===live&&sha(readFileSync(live))===c.witness.blob_sha256,
   'WARM_SCRIPT_BYTES_MISMATCH');
 for(const [name,pin] of Object.entries(WARM_PINS))
  fail(git(abs[name],'rev-parse','HEAD')===pin.commit,'WARM_DONOR_SHA_MISMATCH_'+name);
 const tsx=join(abs.garden,'node_modules/tsx/dist/cli.mjs');
 fail(existsSync(tsx)&&realpathSync(tsx)===tsx,'GARDEN_TSX_RUNTIME_NOT_INSTALLED');
 return {abs,originalScript:live,tsx,sourceWitness:c.witness};
}
function executeWarm(original,verifyAgainst=null){
 const scratch=mkdtempSync(join(tmpdir(),'cannon-warm-first-boot-'));
 try{
  const rootsFile=join(scratch,'roots.json'),receipt=join(scratch,'receipt.json');
  writeFileSync(rootsFile,serialized({
   ghot:original.abs.ghotWarm,full:original.abs.full,band:original.abs.band,garden:original.abs.garden
  }),{flag:'wx',mode:0o600});
  if(verifyAgainst!==null)
   writeFileSync(receipt,serialized(verifyAgainst),{flag:'wx',mode:0o600});
  const cmd=verifyAgainst===null?'run':'verify';
  const output=JSON.parse(execFileSync(process.execPath,
   [original.tsx,original.originalScript,cmd,rootsFile,receipt],
   {encoding:'utf8',maxBuffer:256*1024,timeout:30000}));
  fail(output.status==='FOUR_DONOR_LOCAL_PREVIEW_ONLY'&&output.candidateAuthorized===false,
   'ORIGINAL_WARM_THREAD_OVERCLAIMED');
  const data=JSON.parse(readFileSync(receipt,'utf8'));
  fail(data.body?.classification==='FOUR_ORIGINAL_DONOR_OFFLINE_FICTIONAL_PREVIEW_ONLY'&&
   data.body?.physicalEffects==='NONE'&&data.body?.actualDelivery===false&&
   data.body?.actualPeople===false&&
   data.body?.band?.confirmedUnits===0&&data.body?.band?.residualUnits===1&&
   data.body?.fullMeasure?.unresolvedRelation==='haul-firewood'&&
   data.body?.ghot?.replacementIsOnlyCandidate===true,'WARM_NATIVE_FIELDS_NOT_HONEST');
  return data;
 }finally{rmSync(scratch,{recursive:true,force:true});}
}
function renderWarm(data){
 const b=data.original.body;
 return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none';style-src 'unsafe-inline';base-uri 'none';form-action 'none'">
<title>Warm Thread / Original Native Crossing</title><style>
body{max-width:820px;margin:5vh auto;padding:24px;background:#13251d;color:#e7f5da;font:18px/1.6 system-ui}
h1{font:clamp(2rem,6vw,4rem)/1 Georgia,serif;color:#d8ef96}
section{border:1px solid #7fb494;margin:20px 0;padding:20px}strong{color:#f5d7a8}
small{color:#ccddce}code{overflow-wrap:anywhere}@media print{body{background:white;color:black}}
</style></head><body><p>CANNON / STACK² 027 / EXACT SOURCE-NATIVE PREVIEW</p>
<h1>Someone can say no.<br>The world can still remember.</h1>
<section><h2>What happened in the fictional experiment?</h2>
<p>Original GHoT proposed help. Original Full Measure independently authorized simulated Alice and Bob actions. Cara refused simulated hauling. The earlier simulated work remained; the unmet transport need was preserved.</p>
<p><strong>Remaining need:</strong> ${b.band.residualUnits} load. <strong>Real recipient-confirmed delivery:</strong> ${b.band.confirmedUnits}.</p>
<p>GHoT proposed another helper, but that person was not assigned. Garden held one duplicate-safe request, Band recorded only a note.</p></section>
<section><h2>Where does authority stay?</h2>
<p>Human approval belongs to each human. This simulation has <strong>zero actual human participants, zero confirmed physical effects, zero payments</strong>.</p>
<p>Original source commit: <code>${escape(data.runnerCommit)}</code></p>
<p>Original native receipt SHA: <code>${escape(data.original.sha256)}</code></p></section>
<p><small>This is a locally generated printable fictional demonstration of existing independently owned code. It is not an MIT field result or human witness.</small></p></body></html>\n`;
}
function composeWarm(roots){
 const original=originalRoots(roots);
 const native=executeWarm(original);
 const data={
  schema:BOOT_WARM_SCHEMA,disposition:'EXECUTED_SOURCE_PINNED_FICTIONAL_HOLD_ONLY',
  runnerCommit:ORIGINAL_COMMIT,runnerWitness:original.sourceWitness,
  donorPins:WARM_PINS,original:native,
  physicalOutcome:'NOT_OBSERVED',humanStewards:'NONE',
  sourceOwnersChanged:false,canonSelected:false,
  actualTransportCompleted:false,publicContactMade:false,
  status:'HELP_THREAD_OPEN_NOT_DELIVERED'
 };
 const receipt={...data,receiptSha256:sha(Buffer.from(JSON.stringify(data)))};
 return {receipt,html:renderWarm(receipt)};
}
export function runWarmFirstBoot(roots,out){
 const result=composeWarm(roots);
 fail(!existsSync(out),'WARM_OUTPUT_ALREADY_EXISTS');
 mkdirSync(out,{recursive:false,mode:0o700});
 writeFileSync(join(out,'warm-thread-receipt.json'),serialized(result.receipt),{flag:'wx',mode:0o600});
 writeFileSync(join(out,'warm-thread.html'),result.html,{flag:'wx',mode:0o600});
 return result.receipt;
}
export function verifyWarmFirstBoot(roots,out){
 const expected=composeWarm(roots);
 const receipt=readFileSync(join(out,'warm-thread-receipt.json'));
 const html=readFileSync(join(out,'warm-thread.html'));
 fail(receipt.equals(Buffer.from(serialized(expected.receipt))),'WARM_RECEIPT_COLD_MISMATCH');
 fail(html.equals(Buffer.from(expected.html)),'WARM_HTML_COLD_MISMATCH');
 // Original native CANNON source-owned fresh-process replay must independently pass too.
 const original=originalRoots(roots);
 executeWarm(original,expected.receipt.original);
 return {status:'WARM_SOURCE_NATIVE_COLD_REPLAY_VERIFIED',
  originalDonorRepos:4,originalSource:'CANNON_STACK2_027_OPEN_BRANCH',
  personConfirmedDelivery:0,remainingFictionalLoad:1,physicalActs:0,
  canonSelected:false,receiptSha256:expected.receipt.receiptSha256};
}
