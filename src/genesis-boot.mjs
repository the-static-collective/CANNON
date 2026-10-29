/** CANNON GENESIS BOOT 001 — real, source-pinned cross-branch execution.
 *
 * Runs original STATIC OS HOUSE-SEED Python, original JAR;VIS Harmony candidate,
 * original GHoT Commons Machine Python, and existing CANNON native WebZ x GrO
 * Culture Forge. No donor code is vendored, simulated as a substitute, or
 * silently promoted from an open PR to canon.
 *
 * Demonstration A/B: two fictional house inventories, NOT two independent people.
 * Only output files in a new local directory; no direct external effects.
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,readdirSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readSource} from './present-use.mjs';
import {composeNative,SOURCES as FORGE_SOURCES} from './culture-forge.mjs';

export const BOOT_SCHEMA='cannon.genesis-boot-cross-branch/v1';
export const SOURCES={
  staticos:{repository:'the-static-collective/static-os',commit:'b02b5016cbd5bf2f73d758d5ed1416246b789157',
    files:['scripts/suitcase.py','suitcase/plan.py','suitcase/house.py','suitcase/render.py','suitcase/__init__.py']},
  ghot:{repository:'the-static-collective/GHoT',commit:'6f0cc9e93e2544cd2fc67a0aa43a06198825a654',
    files:['ghot/commons_machine.py','experiments/commons-machine-001.json']},
  jarvis:{repository:'the-static-collective/JAR-VIS',commit:'c9b8341f2eff16105f58dcd5bb9031245bcb0558',
    files:['src/harmony-public.mjs']},
  webz:{repository:FORGE_SOURCES.webz.repository,commit:FORGE_SOURCES.webz.commit,
    files:['bridge/harmony/manifest-v1.json']},
  gro:{repository:FORGE_SOURCES.gro.repository,commit:FORGE_SOURCES.gro.commit,files:[]}
};
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const json=x=>JSON.stringify(x,null,2)+'\n';
const fail=(cond,code)=>{if(!cond)throw Error(code);};
const isObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const exact=(v,keys)=>isObject(v)&&Object.keys(v).sort().join()===keys.slice().sort().join();
const html=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const inventory=()=>({
 schema:'static-os.hardware-observation/v0',architecture:'amd64',ram_mib:4096,
 workspace_free_mib:16000,links_observed:['wifi'],power_observation:'unknown'
});
const site=()=>{
 const spaces=['utility','roof_or_window','entry_floor','wall_hall','kitchen_garden','living_room','independent_peer'];
 const parts=['computer','approved_usb_power','solar_module','solar_controller','pressure_sensor',
  'optical_tx_rx','environment_sensor','peer_device'];
 return {schema:'static-os.house-site-survey/v0',building_type:'SINGLE_HOUSE_MODEL',
  spaces:Object.fromEntries(spaces.map(s=>[s,'UNOBSERVED'])),
  parts:Object.fromEntries(parts.map(p=>[p,'UNOBSERVED'])),
  site_permission:'NOT_VERIFIED',information_scope:'PUBLIC_SAFE_ONLY'};
};
export function validateRequest(request){
 fail(exact(request,['question','mission','scenario','mode']),'BOOT_REQUEST_SHAPE');
 fail(request.mission==='living-house'&&request.scenario==='FICTIONAL_A_B'&&
      request.mode==='OFFLINE_HOLD_ONLY','BOOT_SCOPE_REFUSED');
 fail(typeof request.question==='string'&&request.question.trim().length>0&&request.question.length<=240&&
      !/[\u0000-\u001f]/.test(request.question),'BOOT_QUESTION_INVALID');
 return request;
}
function sourceCheck(source,root){
 const base=realpathSync(resolve(root));
 return source.files.map(rel=>{
  const witness=readSource({id:'genesis-source',repository:source.repository,commit:source.commit,
    path:rel,media_type:'application/octet-stream',tags:[]},
    {[source.repository]:base}).witness;
  const live=join(base,rel);
  fail(realpathSync(live)===live,'SOURCE_SYMLINK_REFUSED');
  fail(sha(readFileSync(live))===witness.blob_sha256,'SOURCE_WORKTREE_DIFFERS_FROM_PIN');
  return witness;
 });
}
function command(file,args,options={}){
 return execFileSync(file,args,{encoding:'utf8',timeout:20000,maxBuffer:1024*1024,
  stdio:['ignore','pipe','pipe'],...options});
}
function houseResult(root,dir,id,fixture,profile){
 const inv=join(dir,'inventory-'+id+'.json'),survey=join(dir,'survey-'+id+'.json');
 const plan=join(dir,'plan-'+id+'.json');
 writeFileSync(inv,json(inventory()),{flag:'wx',mode:0o600});
 writeFileSync(survey,json(fixture),{flag:'wx',mode:0o600});
 const cli=join(resolve(root),'scripts/suitcase.py');
 const raw=command('python3',[cli,'house-compose','--inventory',inv,'--site',survey,
  '--profile',profile,'--media','grow','--privacy','private']);
 writeFileSync(plan,raw,{flag:'wx',mode:0o600});
 const verified=command('python3',[cli,'house-verify',plan]).trim();
 fail(verified==='VALID HOUSE PROPOSAL; NO BUILD, INSTALLATION OR AUTHORITY','HOUSE_VERIFICATION_FAILED');
 const printable=command('python3',[cli,'house-render',plan]);
 const parsed=JSON.parse(raw);
 fail(parsed.schema==='static-os.living-house-seed/v0'&&
  parsed.status==='HOLD_FOR_SITE_POWER_SAFETY_AND_HUMAN_REVIEW'&&
  parsed.outputs.real_home==='NOT_BUILT'&&parsed.outputs.os_image==='NOT_BUILT'&&
  Object.values(parsed.hardware_effects).every(v=>v===false),'HOUSE_FALSE_EFFECT');
 return {plan:parsed,html:printable};
}
function firstBootHtml(question,jarvis,ghot,A,B,culture){
 return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none';style-src 'unsafe-inline';base-uri 'none';form-action 'none'">
<meta name="referrer" content="no-referrer"><title>CANNON / GENESIS BOOT 001</title>
<style>body{max-width:970px;margin:0 auto;padding:24px;background:#0e1d19;color:#e5f2df;font:17px/1.55 system-ui,sans-serif}
a{color:#adefc5}h1{font:clamp(2.3rem,6vw,4.5rem)/1.05 Georgia,serif;margin:.1em 0 1rem}
h2{font-size:1.35rem;margin-top:1.6rem}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.card{border:1px solid #568873;background:#19372f;padding:18px;border-radius:4px}
.tag{font-size:.74rem;letter-spacing:.13em;color:#bacf96;font-weight:800}.status{color:#ffcd98}
code{overflow-wrap:anywhere}strong{color:#f7ecd2}footer{border-top:1px solid #568873;margin-top:2rem;padding-top:1rem}
@media print{body{background:white;color:black}.card{background:white;color:black;border-color:black}a,.tag,.status{color:black}}</style></head><body>
<p class="tag">CANNON / SOURCE-PINNED OPEN PR EXECUTION / NO CANON SELECTION</p>
<h1>HELLO, WORLD.<br>What shall we build together?</h1>
<p><strong>Human's public-safe question:</strong> ${html(question)}</p>
<p>JAR;VIS reviewed the original HARMONY catalog through its actual candidate parser. Its entry: <strong>${html(jarvis.title)}</strong>.</p>
<h2>Two possible houses, no fake field proof</h2><div class="grid">
<div class="card"><p class="tag">A / UNKNOWN INVENTORY</p><h2>Suitcase starts with questions</h2><p>${A.modules.filter(x=>x.state==='HOLD_FOR_SITE_SURVEY').length} modules remain held for observations.</p>
<a href="house-A.html">Inspect printable A work cards</a> · <a href="house-A.json">View exact plan</a></div>
<div class="card"><p class="tag">B / SYNTHETIC SOLAR CANDIDATE</p><h2>A second hypothetical site</h2><p>${B.modules.filter(x=>x.id==='solar_budget')[0].holds.map(html).join(', ')}</p>
<a href="house-B.html">Inspect printable B work cards</a> · <a href="house-B.json">View exact plan</a></div></div>
<h2>What can change in the physical world?</h2>
<p>GHoT ran its original Commons Machine proposal graph: ${ghot.decisions.length} synthetic decisions, including
 <strong>${ghot.decisions.filter(x=>x.decision==='REFUSE').length} REFUSE</strong> and
 ${ghot.decisions.filter(x=>x.decision==='HOLD').length} HOLD. No actuators or sensors ran.</p>
<h2>What can become culture?</h2><p>Original WebZ and GrO code ran through CANNON's existing Culture Forge:
 <a href="comic.html">an actual printable six-panel artifact</a> and
 <a href="field-card.md">its field card</a>. Material dispute remained held and human Deeds were not manufactured.</p>
<h2>Shall we continue building?</h2>
<p class="status">HOLD: both A and B are simulated inventories, not two verified human stewards.
Human-selected work, original evidence, independently witnessed results, physical safety, signed crossing and actual field installation still remain unproven.</p>
<p><a href="boot-receipt.json">Inspect cross-repo execution receipt</a> ·
<a href="jarvis-candidate.json">Inspect JAR;VIS candidate</a> ·
<a href="ghot-simulation.json">Inspect GHoT simulated field graph</a></p>
<footer>EXPERIMENT_BRANCH != CANON · CANDIDATE != CONSENT · CI_EXECUTION != PHYSICAL_WITNESS<br>
All source roles are preserved. Neither git branches nor source owners were changed by this run.</footer>
</body></html>\n`;
}
export async function composeGenesisBoot(roots,request){
 validateRequest(request);
 fail(exact(roots,['staticos','webz','gro','ghot','jarvis']),'FIVE_ORIGINAL_REPO_ROOTS_REQUIRED');
 for(const k of Object.keys(roots))fail(typeof roots[k]==='string','ROOT_MUST_BE_PATH');
 const witnesses={};
 for(const [id,source] of Object.entries(SOURCES))witnesses[id]=sourceCheck(source,roots[id]);
 // Original WebZ + GrO execution AND its ten-object source witness is provided by CANNON's
 // existing native Culture Forge, not a substitute implementation.
 const cultural=await composeNative({webz:roots.webz,gro:roots.gro},request.question);
 witnesses.cultureForge=cultural.receipt.sources;
 const jarRoot=resolve(roots.jarvis),webRoot=resolve(roots.webz),ghotRoot=resolve(roots.ghot);
 const jar=await import(pathToFileURL(join(jarRoot,'src/harmony-public.mjs')).href);
 const catalogBytes=readFileSync(join(webRoot,'bridge/harmony/manifest-v1.json'));
 const selected=jar.validateHarmonyCatalog(JSON.parse(catalogBytes.toString('utf8')));
 const observation={schema:'jarvis.harmony-observation/v1',source:jar.HARMONY_SOURCE,
  contentSha256:sha(catalogBytes).slice(7),observedAt:selected.catalogDate+'T00:00:00.000Z',
  access:'pinned-offline-source',admission:'none',runtimeConnected:false,authority:'INDEX_ONLY',
  ...selected};
 const candidate=jar.composeHarmonyCandidate(observation,'founder');
 fail(candidate.executionAllowed===false&&candidate.transmitted===false&&
  candidate.disposition==='HOLD_FOR_OPERATOR_REVIEW','JARVIS_AUTHORITY_ESCALATED');
 const sandbox=mkdtempSync(join(tmpdir(),'cannon-genesis-'));
 let A,B;
 try{
  A=houseResult(roots.staticos,sandbox,'A',site(),'foundry');
  const b=site();
  b.spaces.roof_or_window='PRESENT_UNVERIFIED';
  b.parts.solar_module='PRESENT_UNVERIFIED';
  B=houseResult(roots.staticos,sandbox,'B',b,'resilience');
 }finally{rmSync(sandbox,{recursive:true,force:true});}
 fail(A.plan.plan_sha256!==B.plan.plan_sha256,'A_B_PLANS_INDISTINGUISHABLE');
 const simulated=JSON.parse(command('python3',
  [join(ghotRoot,'ghot/commons_machine.py'),join(ghotRoot,'experiments/commons-machine-001.json')]));
 fail(simulated.kind==='ghot.commons.simulation/v0'&&simulated.no_physical_observations_made===true&&
  simulated.no_tasks_executed===true&&simulated.no_dispatch===true&&
  simulated.decisions.some(x=>x.decision==='REFUSE')&&
  simulated.decisions.some(x=>x.decision==='HOLD')&&
  simulated.decisions.every(x=>x.executed===false),'GHOT_UNSAFE_OR_INVALID_RESULT');
 const files={
  'house-A.json':json(A.plan),'house-A.html':A.html,
  'house-B.json':json(B.plan),'house-B.html':B.html,
  'jarvis-candidate.json':json(candidate),
  'ghot-simulation.json':json(simulated),
  'comic.html':cultural.files['comic.html'],
  'field-card.md':cultural.files['field-card.md'],
  'culture-receipt.json':json(cultural.receipt),
  'first-boot.html':firstBootHtml(request.question,candidate,simulated,A.plan,B.plan,cultural.receipt),
  'request.json':json(request)
 };
 const body={schema:BOOT_SCHEMA,disposition:'EXECUTED_ORIGINAL_SOURCE_CODE_HOLD_ONLY',
  sourceSelection:'EXACT_OPEN_PR_SHA_NOT_OWNER_CANON',sourcePins:Object.fromEntries(
   Object.entries(SOURCES).map(([id,v])=>[id,{repository:v.repository,commit:v.commit}])),
  sourceWitnesses:witnesses,
  executing:['JARVIS.validateHarmonyCatalog','JARVIS.composeHarmonyCandidate',
   'STATIC_OS.house-compose[scenario_A]','STATIC_OS.house-verify[scenario_A]','STATIC_OS.house-render[scenario_A]',
   'STATIC_OS.house-compose[scenario_B]','STATIC_OS.house-verify[scenario_B]','STATIC_OS.house-render[scenario_B]',
   'GHoT.commons_machine.simulate','CANNON.composeNative[WebZ_GrO]'],
  sampleType:'FICTIONAL_SITES_A_B_NOT_INDEPENDENT_HUMANS',
  results:{A:{status:A.plan.status,planSha256:A.plan.plan_sha256},
   B:{status:B.plan.status,planSha256:B.plan.plan_sha256},
   jarvis:candidate.disposition,ghot:{simulated:true,decisions:simulated.decisions.length},
   culture:cultural.receipt.receiptSha256},
  evidence:{originalSourceCodeInvoked:true,generatedOfflineHTML:true,generatedHousePlans:2,
   independentHumanStewards:0,physicalTestsCompleted:0,realWitnessConfirmed:false,
   installedOS:false,liveRelatteCrossings:0,automaticActuation:false,ownerCanonSelected:false},
  files:Object.fromEntries(Object.entries(files).map(([name,content])=>[name,sha(Buffer.from(content))])),
  boundary:'SOURCE_EXECUTION_IS_NOT_PERMISSION_TO_ACT_OR_A_FIELD_OUTCOME'};
 const receipt={...body,receiptSha256:sha(Buffer.from(JSON.stringify(body)))};
 return {files:{...files,'boot-receipt.json':json(receipt)},receipt};
}
export async function buildGenesisBoot(roots,out,request){
 // Revalidate original Git objects and compute everything before creating output.
 const result=await composeGenesisBoot(roots,request);
 fail(!existsSync(out),'OUTPUT_EXISTS_NO_REPLACEMENT');
 mkdirSync(out,{recursive:false,mode:0o700});
 for(const [name,content] of Object.entries(result.files))
  writeFileSync(join(out,name),content,{flag:'wx',mode:0o600});
 return result.receipt;
}
export async function coldVerifyGenesisBoot(roots,out){
 const request=JSON.parse(readFileSync(join(out,'request.json'),'utf8'));
 const expected=await composeGenesisBoot(roots,request);
 const expectedNames=Object.keys(expected.files).sort(),actualNames=readdirSync(out).sort();
 fail(JSON.stringify(actualNames)===JSON.stringify(expectedNames),'EXTRA_MISSING_OR_CHANGED_OUTPUT_FILE');
 for(const [name,content] of Object.entries(expected.files))
  fail(readFileSync(join(out,name)).equals(Buffer.from(content)),'BOOT_COLD_VERIFY_MISMATCH_'+name);
 return {status:'CROSS_BRANCH_NATIVE_COLD_REPLAY_VERIFIED',
  sourceRepos:5,housePlans:2,cultureArtifacts:2,
  noPhysicalActs:true,ownerCanonSelected:false,receiptSha256:expected.receipt.receiptSha256};
}
