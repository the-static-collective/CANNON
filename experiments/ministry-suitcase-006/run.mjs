import {readSource} from '../../src/present-use.mjs';
import {readFileSync,writeFileSync,mkdirSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash,webcrypto} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const pins={
  "fellowship": {
    "repo": "the-static-collective/fellowSHIP",
    "sha": "e6e088febcb9dc324092e80bd76c4adf2d6e7044",
    "files": {
      "db/schema.sql": "fb6ef8e3037e346fa8dc543b14723e7dc6d2ee3a"
    }
  },
  "campfire": {
    "repo": "the-static-collective/Jubilee-Campfire",
    "sha": "ad7a5cbef03a1e68058a964d5f50ef6ed93ea274",
    "files": {
      "server.ts": "27c27809d9a44de80790bfa8d3487161434a2f9a",
      "src/lib/initialData.ts": "ca38ea8ae65e92a50f647ebbb5e3e7afba9085ba",
      "src/types.ts": "6fcac63efc34955abec2a974b5c5048d636f97f5"
    }
  },
  "common": {
    "repo": "the-static-collective/Jubilee-treasury",
    "sha": "88453937380fdfa68670cc8521662dddc61c0068",
    "files": {
      "ops/steward-desk-004/common-assets.mjs": "966e421ed68833a0ea1274c26f39c896b01036f8"
    }
  },
  "concord": {
    "repo": "the-static-collective/Jubilee-treasury",
    "sha": "b54971c77cc4a721a952783044f3b27abc1a81ec",
    "files": {
      "labs/penny-puddle-014/composer.mjs": "61dafee54a5a0b615e7969ff768a01fba140f577"
    }
  },
  "full": {
    "repo": "the-static-collective/full-measure-world-layer",
    "sha": "c9206d5055ad574a23acb2eceb5f8785a4ad64fe",
    "files": {
      "src/lib/pledgeAuthority.ts": "f7af2434bfc6854932a70db1e598304110b48279",
      "src/lib/fullMeasure.ts": "dc5efb057ca131d5f892bd70413e6675c678bfa8",
      "src/types.ts": "6fcac63efc34955abec2a974b5c5048d636f97f5"
    }
  }
};
const parent=resolve(process.argv[2]),out=resolve(process.argv[3]);
const sha=x=>createHash('sha256').update(x).digest('hex');
const parentHtml=readFileSync(join(parent,'index.html'),'utf8'),parentReceipt=JSON.parse(readFileSync(join(parent,'receipt.json'),'utf8'));
assert.equal(sha(parentHtml),parentReceipt.html_sha256);
const witnesses=[],src={};
for(const [id,p] of Object.entries(pins)){src[id]={};const root=realpathSync(resolve(id));for(const [file,blob] of Object.entries(p.files)){const x=readSource({id,repository:p.repo,commit:p.sha,path:file,media_type:'text/plain',tags:[]},{[p.repo]:root});assert.equal(x.witness.blob,blob);assert.equal(realpathSync(join(root,file)),join(root,file));assert.equal(x.witness.blob_sha256,'sha256:'+sha(readFileSync(join(root,file))));src[id][file]=x.content;witnesses.push(x.witness)}}
const compiler=process.env.CANNON_TSC;assert(compiler);
const ts=createRequire(import.meta.url)(resolve(compiler,'../../lib/typescript.js'));assert.equal(ts.version,'5.8.3');
const js=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const moduleFrom=async s=>import('data:text/javascript;base64,'+Buffer.from(s).toString('base64'));
const concord=await moduleFrom(src.concord['labs/penny-puddle-014/composer.mjs']);
const authority=await moduleFrom(js(src.full['src/lib/pledgeAuthority.ts']));
const sheet=await moduleFrom(js(src.full['src/lib/fullMeasure.ts']));
const A='user_lu',B='user_grace',C='user_michael';
const goal='fictional-learning-kits-delivered',purpose='fictional-community-supplies';
const card=(id,actor,requires,produces,question)=>({id,actor,requires,produces,question,status:'unknown',purpose,declaredByActorInFixture:true,expiresDay:40,priorYesBps:5000,directQuestionBurden:1,exclusiveClaims:[],risks:[]});
const fixture={day:30,purpose,goal,originActor:A,beneficiaryActor:A,creditorActor:A,rentNeedCents:1,actors:[A,B,C],initialFacts:['need-declared'],offers:[card('kits',B,['need-declared'],'kits-ready','Can B supply learning kits?'),card('delivery',C,['kits-ready'],goal,'Can C transport the kits?')]};
const initial=concord.synthesizeAgreements(fixture);assert.equal(initial.numberOfDistinctConditionalStructures,1);assert.equal(initial.readyToDiscussInFixture,0);
assert.throws(()=>concord.applyFirstPersonOfferAnswer(fixture,'kits',C,'yes'));
const declined=concord.applyFirstPersonOfferAnswer(fixture,'delivery',C,'no');assert.equal(concord.synthesizeAgreements(declined).numberOfDistinctConditionalStructures,0);
const afterB=concord.applyFirstPersonOfferAnswer(fixture,'kits',B,'yes'),afterC=concord.applyFirstPersonOfferAnswer(afterB,'delivery',C,'yes');
const composed=concord.synthesizeAgreements(afterC);assert.equal(composed.readyToDiscussInFixture,1);assert.equal(composed.legalMoneyOrWorkAuthorized,false);
assert.deepEqual([...composed.plans[0].generatedOperatorIds].sort(),['delivery','kits']);
const uuid=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const ids={a:uuid(1),b:uuid(2),c:uuid(3),outsider:uuid(4),community:uuid(5),room:uuid(6),task:uuid(7)};
const actor=(id)=>"set role authenticated; set request.jwt.claim.sub = '"+id+"';\n";
function sql(db,s){assert(/^cannon_church_[ab]$|^postgres$/.test(db));return execFileSync('psql',['-X','-qAt','-v','ON_ERROR_STOP=1','-h','127.0.0.1','-p','5432','-U','postgres','-d',db],{input:s,encoding:'utf8',env:{...process.env,PGPASSWORD:'cannon-fixture-only'},timeout:20000}).trim()}
const db='cannon_church_'+(out.endsWith('church-a')?'a':'b');assert(process.env.CANNON_EPHEMERAL_POSTGRES==='yes');
sql('postgres',"do $$ begin if not exists(select from pg_roles where rolname='authenticated') then create role authenticated; end if; if not exists(select from pg_roles where rolname='anon') then create role anon; end if; end $$;\ncreate database "+db+";\n");
try{
const seed="create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; insert into auth.users values "+[ids.a,ids.b,ids.c,ids.outsider].map(x=>"('"+x+"')").join(',')+";\n";
sql(db,seed+src.fellowship['db/schema.sql']);
const q=x=>"'"+x+"'";
const roomSetup=actor(ids.a)+"insert into public.communities(id,name,created_by) values ("+[ids.community,'Fictional congregation A',ids.a].map(q).join(',')+"); insert into public.rooms(id,community_id,name,created_by) values ("+[ids.room,ids.community,'Fictional learning kits',ids.a].map(q).join(',')+"); insert into public.room_members(room_id,user_id,role) values ("+[ids.room,ids.b,'editor'].map(q).join(',')+"),("+[ids.room,ids.c,'viewer'].map(q).join(',')+"); insert into public.tasks(id,room_id,title,created_by) values ("+[ids.task,ids.room,'Coordinate learning kits',ids.a].map(q).join(',')+");";
sql(db,roomSetup);
assert.equal(sql(db,actor(ids.outsider)+"select count(*) from public.tasks;"),'0');
assert.equal(sql(db,actor(ids.c)+"select count(*) from public.tasks;"),'1');
assert.equal(sql(db,actor(ids.c)+"with r as (update public.tasks set status='done' where id="+q(ids.task)+" returning id) select count(*) from r;"),'0');
assert.equal(sql(db,actor(ids.b)+"with r as (update public.tasks set status='doing' where id="+q(ids.task)+" returning id) select count(*) from r;"),'1');
const room={readAllowed:true,outsiderHidden:true,viewerWriteRefused:true,editorUpdateAllowed:true};
async function campfire(){
 const handlers=new Map(),files=new Map(),app={use(){},listen(){},get(p,f){handlers.set('GET '+p,f)},post(p,f){handlers.set('POST '+p,f)},patch(p,f){handlers.set('PATCH '+p,f)}};
 const express=Object.assign(()=>app,{json:()=>()=>{},static:()=>()=>{}});
 const fs={existsSync:p=>files.has(p),mkdirSync:p=>files.set(p,''),readFileSync:p=>files.get(p),writeFileSync:(p,v)=>files.set(p,v)};
 const context=vm.createContext({console:{log(){},error(){throw Error('CAMPFIRE_SOURCE_ERROR')}},process:{cwd:()=>'/fictional',env:{NODE_ENV:'production'}}});
 const mock=(name,values)=>new vm.SyntheticModule(Object.keys(values),function(){for(const [k,v] of Object.entries(values))this.setExport(k,v)},{context,identifier:name});
 const seedMod=new vm.SourceTextModule(js(src.campfire['src/lib/initialData.ts']),{context,identifier:'fixture:seed'});
 const mods={'express':mock('express',{default:express}),'path':mock('path',{default:path}),'fs':mock('fs',{default:fs}),'url':mock('url',{fileURLToPath}),'vite':mock('vite',{createServer:()=>{throw Error('NO_VITE')}}),'./src/lib/initialData.js':seedMod};
 const server=new vm.SourceTextModule(js(src.campfire['server.ts']),{context,identifier:'fixture:server',initializeImportMeta(meta){meta.url='file:///fictional/server.ts'}});
 await server.link(spec=>{assert(Object.hasOwn(mods,spec),'Unexpected source import '+spec);return mods[spec]});await server.evaluate();
 function call(method,route,who,body={},params={}){assert([A,B,C].includes(who));let code=200,result;const handler=handlers.get(method+' '+route);assert(handler,'Native handler missing');const res={status(n){code=n;return this},json(x){result=JSON.parse(JSON.stringify(x));return this}};handler({headers:{'x-user-id':who},body,params},res);return {code,result}}
 return {call};
}
const {call}=await campfire();
const open=call('POST','/api/projects',A,{title:'Fictional learning kits',story:'A requests kits and transport',needs:[{title:'Kits',quantity:1,unit:'lot'},{title:'Transport',quantity:1,unit:'trip'}]});assert.equal(open.code,201);
const projectId=open.result.id;
function pledge(who,i,description){const x=call('POST','/api/pledges',who,{projectId,needId:open.result.needs[i].id,description,quantity:1,unit:i?'trip':'lot'});assert.equal(x.code,201);return x.result}
function transition(p,who,action,guard=true){if(guard){const decision=authority.authorizePledgeTransition({action,currentStatus:p.status,isOpenerOrSteward:who===A,isPledgeAuthor:who===p.pledgedBy});if(!decision.ok)return {code:decision.status,blocked:true}}return call('PATCH','/api/pledges/:id/transition',who,{action},{id:p.id})}
const raw=pledge(B,0,'Negative-control early confirmation');const ra=transition(raw,A,'accept',false);assert.equal(ra.code,200);const rb=transition(ra.result,A,'confirm',false);assert.equal(rb.code,200);
const selfRaw=pledge(A,0,'Negative-control self confirmation');const sa=transition(selfRaw,A,'accept',false);assert.equal(sa.code,200);assert.equal(transition(sa.result,A,'confirm',false).code,200);
// Use a fresh isolated instance for the guarded lifecycle. Negative controls never feed it.
const safe=await campfire(),invoke=safe.call;
const safeOpen=invoke('POST','/api/projects',A,{title:'Fictional learning kits',story:'A requests kits and transport',needs:[{title:'Kits',quantity:1,unit:'lot'},{title:'Transport',quantity:1,unit:'trip'}]});assert.equal(safeOpen.code,201);
const pid=safeOpen.result.id,history=[{stage:'need-declared',actor:'A',detail:'Learning kits and transport'},{stage:'conditional-plan',actor:'A/B/C',detail:'CONCORD composes kits then delivery; candidate only'}];
const role={ [A]:'A',[B]:'B',[C]:'C' };
function step(p,who,action){const d=authority.authorizePledgeTransition({action,currentStatus:p.status,isOpenerOrSteward:who===A,isPledgeAuthor:who===p.pledgedBy});if(!d.ok)return {code:d.status,blocked:true};const x=invoke('PATCH','/api/pledges/:id/transition',who,{action},{id:p.id});assert.equal(x.code,200);history.push({stage:action,actor:role[who],detail:p.description});return x}
function projected(p){return sheet.buildFullMeasureSheet({userId:p.pledgedBy,offers:[],projects:[{id:pid,openedBy:A,status:'active',pledges:[p]}],events:[],receipts:[],capacities:[]}).measures.find(x=>x.key==='deed').value}
const controls={rawEarlyConfirmationAccepted:true,rawSelfConfirmationAccepted:true,guardedEarlyConfirmationRefused:false,guardedSelfConfirmationRefused:false};
for(const [i,operator] of ['kits','delivery'].entries()){
 const o=afterC.offers.find(x=>x.id===operator),who=o.actor;
 assert(composed.plans[0].generatedOperatorIds.includes(o.id));
 let p=invoke('POST','/api/pledges',who,{projectId:pid,needId:safeOpen.result.needs[i].id,description:operator,quantity:1,unit:i?'trip':'lot'}).result;
 assert.equal(p.status,'proposed');history.push({stage:'pledge-proposed',actor:role[who],detail:operator});p=step(p,A,'accept').result;
 assert.equal(projected(p),0);assert.equal(step(p,A,'confirm').blocked,true);controls.guardedEarlyConfirmationRefused=true;
 p=step(p,who,'report_complete').result;assert.equal(projected(p),0);assert.equal(authority.authorizePledgeTransition({action:'confirm',currentStatus:p.status,isOpenerOrSteward:true,isPledgeAuthor:true}).ok,false);controls.guardedSelfConfirmationRefused=true;
 assert.equal(step(p,who,'confirm').blocked,true);p=step(p,A,'confirm').result;assert.equal(projected(p),1);
}
const before=invoke('GET','/api/projects/:id',A,{}, {id:pid}).result;assert.equal(before.pledges.length,2);assert(before.pledges.every(p=>p.status==='confirmed'));assert(before.needs.every(n=>n.status==='met'));
const completion=invoke('POST','/api/projects/:id/complete',A,{summary:'Synthetic completion after both distinct confirmations',outcome:'Fictional supplies and transport',newCapacityTitle:'Fictional repeatable coordination',newCapacityDescription:'Training only'},{id:pid});assert.equal(completion.code,200);assert.equal(completion.result.project.status,'completed');assert(completion.result.receipt);
history.push({stage:'receipt-created',actor:'A',detail:'Both fictional pledges confirmed'});
// Complete the exact fellowSHIP task only after both original Campfire pledges pass the stricter gate.
assert.equal(sql(db,actor(ids.b)+"with r as (update public.tasks set status='done' where id="+q(ids.task)+" returning id) select count(*) from r;"),'1');
assert.equal(sql(db,actor(ids.c)+"select status from public.tasks where id="+q(ids.task)+";"),'done');
const activity=sql(db,actor(ids.a)+"select action||':'||(details->>'status') from public.activity where task_id="+q(ids.task)+" order by id;").split('\n');
assert.deepEqual(activity,['task_created:todo','task_updated:doing','task_updated:done']);room.activity=activity;
history.push({stage:'room-task-done',actor:'B',detail:'fellowSHIP task audit confirms final workflow state'});
// Recover the same normalized causal sequence using original EXODUS local casebook core.
const assets=await moduleFrom(src.common['ops/steward-desk-004/common-assets.mjs']);
const end='return {blank,append,projection,totals,seal,unseal,statuses};\n})();';
const stop=assets.SCRIPT.indexOf(end);assert(stop>=0);
const core=assets.SCRIPT.slice(0,stop+end.length);
const ctx=vm.createContext({crypto:webcrypto,TextEncoder,TextDecoder,historyJson:JSON.stringify(history)});
vm.runInContext(core,ctx);
const recovery=await vm.runInContext("(async()=>{const rows=JSON.parse(historyJson),book=Casework.blank(),id='00000000000000000000000000000001';book.events.push({id,caseId:id,at:'2026-11-25T00:00:00.000Z',kind:'case',data:{title:'Fictional learning kits'}});for(let i=0;i<rows.length;i++){book.events.push({id:(i+2).toString(16).padStart(32,'0'),caseId:id,at:new Date(Date.UTC(2026,10,25,0,0,i+1)).toISOString(),kind:'source',data:{text:rows[i].stage+' | '+rows[i].actor+' | '+rows[i].detail,ref:'fixture-stage-'+(i+1)}})}const pass='fictional-demo-passphrase-only',sealed=await Casework.seal(book,pass),opened=await Casework.unseal(sealed,pass);if(JSON.stringify(opened)!==JSON.stringify(book))throw Error('RECOVERY_CHANGED');let refused=false;try{await Casework.unseal({...sealed,ciphertext:(sealed.ciphertext[0]==='0'?'1':'0')+sealed.ciphertext.slice(1)},pass)}catch{refused=true}if(!refused)throw Error('TAMPER_NOT_REFUSED');return {recordCount:Casework.projection(opened).get(id).records.length,encryptedRoundtrip:true,tamperedCiphertextRefused:refused,book:opened}})()",ctx);
assert.equal(recovery.recordCount,history.length);
const result={schema:'cannon.living-church/v1',classification:'FICTIONAL_ONLY',authority:'NONE',parent_receipt_sha256:sha(readFileSync(join(parent,'receipt.json'))),witnesses,room,concord:{candidateCount:initial.numberOfDistinctConditionalStructures,afterDecline:0,afterConsent:composed.readyToDiscussInFixture,operators:composed.plans[0].generatedOperatorIds},campfire:{transport:'IN_PROCESS_ORIGINAL_HANDLERS_MOCK_HTTP_AND_FILESYSTEM',controls,confirmedFixturePledges:2,reportedDeedsBeforeConfirmation:0,confirmedFixtureDeeds:2,authenticatedHumanDeeds:0},history,recovery:{recordCount:recovery.recordCount,encryptedRoundtrip:recovery.encryptedRoundtrip,tamperedCiphertextRefused:recovery.tamperedCiphertextRefused,book:recovery.book},fieldWitness:false,actualAid:0,externalActions:0,canonSelection:false};
const payload=JSON.stringify(result).replaceAll('<','\\u003c');
const panel='<section class="panel" style="max-width:1060px;margin:1rem auto"><h2>Living Church 006 / مشترکہ خدمت</h2><p>One fictional need, three congregation roles. Inspect the original-source rehearsal; advance through the observed steps. No real enrollment, payment, contact or fulfillment.</p><button id="church-next">Next step</button> <button id="church-reset">Restart</button> <button id="church-export">Export fictional proof</button><p id="church-progress" role="status"></p><ol id="church-trace"></ol><details><summary>Original Campfire authority defects and guarded results</summary><pre id="church-controls"></pre></details></section>';
const client="const p=churchProof;let i=0;const list=document.getElementById('church-trace'),prog=document.getElementById('church-progress');function draw(){list.replaceChildren();for(const row of p.history.slice(0,i)){const li=document.createElement('li');li.textContent=row.stage+' · '+row.actor+' · '+row.detail;list.append(li)}prog.textContent=i+' / '+p.history.length+' fictional stages';document.getElementById('church-next').disabled=i>=p.history.length}document.getElementById('church-next').onclick=()=>{i=Math.min(i+1,p.history.length);draw()};document.getElementById('church-reset').onclick=()=>{i=0;draw()};document.getElementById('church-controls').textContent=JSON.stringify(p.campfire.controls,null,2);document.getElementById('church-export').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(p,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='living-church-fictional-proof.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};draw();";
const html=parentHtml.replace(/<\/body><\/html>\s*$/,()=>panel+'<script type="module">const churchProof='+payload+';\n'+client+'\n</script></body></html>');assert(html.includes('church-next')&&html.includes("connect-src 'none'"));
mkdirSync(out);writeFileSync(join(out,'index.html'),html,{flag:'wx'});writeFileSync(join(out,'receipt.json'),JSON.stringify({...result,html_sha256:sha(html)},null,2)+'\n',{flag:'wx'});console.log('LIVING_CHURCH_006_OK',sha(html));
}finally{sql('postgres','drop database '+db+';')}
