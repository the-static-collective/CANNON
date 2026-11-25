import {readSource} from '../../src/present-use.mjs';
import {readFileSync,writeFileSync,mkdirSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
const specs={
  "exodus": {
    "repository": "the-static-collective/Jubilee-treasury",
    "commit": "3ff26a5b82f19973071c4a3066ff9e42c238c4b7",
    "files": {
      "ops/exodus-002/returning-node.mjs": "4d0f9a2ddca5dbc5ad89b85737723bff0e28f13f",
      "ops/exodus-001/exodus.mjs": "9dfe1b518fdb57969410bfffae6ebbf8f5cbd37c",
      "ops/concord-live-003/field.mjs": "2ecdc595a4d64424632024a74fdf7b6d59d7fc4f",
      "ops/exodus-001/vendor/portable-protocol.mjs": "aaac009bb5b8973cc5e6f359674936ce68244bd2",
      "ops/concord-live-002/vendor/composer.mjs": "61dafee54a5a0b615e7969ff768a01fba140f577",
      "ops/concord-live-002/vendor/plenty/index.ts": "0c4c8bd6c62d279cdc21101d067105f341dc9099",
      "ops/concord-live-002/vendor/plenty/types.ts": "e076a13266d518912faeddf53a6f6ec153b0da47"
    }
  },
  "penny": {
    "repository": "the-static-collective/Jubilee-treasury",
    "commit": "bb05d90c12b13f5c7c1c948d85c54cec2dbcd2ce",
    "files": {
      "labs/penny-box-001/src/ledger.mjs": "fecf60db1ad0e63f8d76a75c182d045b5f90993b"
    }
  },
  "puente": {
    "repository": "the-static-collective/PUENTE",
    "commit": "64216f097a0a1269bbf36c17bea65393d4c409d1",
    "files": {
      "protocol-engine.js": "3c3f0929a187b4bc1f23063b5143edf98e44804a",
      "studio-engine.js": "d529ae10cedc0b06aea1e9a38d1b6c38db0e7bac"
    }
  },
  "witness": {
    "repository": "the-static-collective/WITNESS",
    "commit": "22e8fb3c2d8725cf0a5414ce4cfac08f5421eae9",
    "files": {
      "prototype/game.mjs": "cb80a51138bc2e9135c6eba8b33cfa1e976e188f"
    }
  },
  "full": {
    "repository": "the-static-collective/full-measure-world-layer",
    "commit": "c9206d5055ad574a23acb2eceb5f8785a4ad64fe",
    "files": {
      "src/lib/pledgeAuthority.ts": "f7af2434bfc6854932a70db1e598304110b48279",
      "src/lib/fullMeasure.ts": "dc5efb057ca131d5f892bd70413e6675c678bfa8",
      "src/types.ts": "6fcac63efc34955abec2a974b5c5048d636f97f5"
    }
  }
};
const roots=JSON.parse(readFileSync(process.argv[2],'utf8')),parent=resolve(process.argv[3]),out=resolve(process.argv[4]);
const sha=x=>createHash('sha256').update(x).digest('hex');
const parentHtml=readFileSync(join(parent,'index.html'),'utf8'),parentReceipt=JSON.parse(readFileSync(join(parent,'receipt.json'),'utf8'));
assert.equal(sha(parentHtml),parentReceipt.html_sha256);
const sources=[],src={};
for(const [id,s] of Object.entries(specs)){src[id]={};for(const [path,blob] of Object.entries(s.files)){const root=realpathSync(resolve(roots[id])),x=readSource({id,repository:s.repository,commit:s.commit,path,media_type:'text/plain',tags:[]},{[s.repository]:root});assert.equal(x.witness.blob,blob);assert.equal(realpathSync(join(root,path)),join(root,path));assert.equal(x.witness.blob_sha256,'sha256:'+sha(readFileSync(join(root,path))));sources.push(x.witness);src[id][path]=x.content}}
const load=(id,path)=>import(pathToFileURL(join(resolve(roots[id]),path)).href);
const ex=await load('exodus','ops/exodus-002/returning-node.mjs'),mode={mode:ex.MODE};
const events=[{kind:'need'},{kind:'offer',slot:1},{kind:'proposal'},{kind:'admission',decision:'HOLD'}];
const packet=ex.recoveryPacket(events,mode),recovered=ex.restore(packet,mode);assert.equal(recovered.status,'HOLD');assert.equal(recovered.actualMovementMinor,0);assert.throws(()=>ex.restore({...packet,digest:'bad'},mode));assert.throws(()=>ex.replay([...events,{kind:'movement',amountMinor:100000}],mode));
const p=await load('penny','labs/penny-box-001/src/ledger.mjs'),id='00000000-0000-0000-0000-000000000001',offer='00000000-0000-0000-0000-000000000002',obs='00000000-0000-0000-0000-000000000003';
const need={type:'need.opened',need:{id,title:'Fictional supplies',summary:'Training exercise',goal:8,unit:'deliveries',status:'OPEN'}},interest={type:'offer.proposed',offer:{id:offer,needId:id,kind:'transport',status:'CANDIDATE_ONLY'}},observation={type:'observation.recorded',observation:{id:obs,needId:id,quantity:2,unit:'deliveries',basis:'STEWARD_CONFIRMED_DELIVERY',classification:'LOCAL_STEWARD_OBSERVATION_NOT_SETTLEMENT'}};
const interested=p.publicBoard(p.replay([need,interest])),observed=p.publicBoard(p.replay([need,interest,observation]));assert.equal(interested.needs[0].observed,0);assert.equal(observed.needs[0].observed,2);assert.throws(()=>p.replay([need,interest,observation,observation]));
const ctx={};runInNewContext(src.puente['protocol-engine.js'],ctx);runInNewContext(src.puente['studio-engine.js'],ctx);const lesson=ctx.PuenteStudio.forge({language:'en',rank:'starter',minutes:20,scene:'radio',focus:'all'},1001);assert.equal(ctx.PuenteStudio.solution(lesson).length,3);const card=ctx.PuenteStudio.plan(lesson);assert(card.includes('TEACHER KEY'));
const w=await load('witness','prototype/game.mjs'),record={recording_id:'fictional-a',chapter_id:'john.1',verse:1,sha256:sha('synthetic-not-a-recording'),reader_name:'Fixture voice'};const ws=w.summarizeWitnessGame([record,record],[],{chapterId:'john.1',totalVerses:51});assert.equal(ws.totalTakes,1);assert.equal(ws.coverage,1);
// Resolve only the pinned Full Measure TypeScript convention, without changing donor files.
import {registerHooks} from 'node:module';
const fullRoot=resolve(roots.full);
const typeURL=pathToFileURL(join(fullRoot,'src/types.ts')).href;
const fmParents=new Set(['src/lib/pledgeAuthority.ts','src/lib/fullMeasure.ts'].map(p=>pathToFileURL(join(fullRoot,p)).href));
const hook=registerHooks({resolve(specifier,context,nextResolve){if(specifier==='../types.js'&&fmParents.has(context.parentURL))return nextResolve(typeURL,context);return nextResolve(specifier,context)}});
const fm=await load('full','src/lib/pledgeAuthority.ts'),sheet=await load('full','src/lib/fullMeasure.ts');const a=fm.authorizePledgeTransition;assert.equal(a({action:'accept',currentStatus:'proposed',isOpenerOrSteward:true,isPledgeAuthor:false}).ok,true);assert.equal(a({action:'report_complete',currentStatus:'accepted',isOpenerOrSteward:false,isPledgeAuthor:true}).ok,true);const denied=a({action:'confirm',currentStatus:'reported_complete',isOpenerOrSteward:true,isPledgeAuthor:true});assert.equal(denied.ok,false);assert.equal(a({action:'confirm',currentStatus:'reported_complete',isOpenerOrSteward:true,isPledgeAuthor:false}).ok,true);
const view=state=>sheet.buildFullMeasureSheet({userId:'fixture-maker',offers:[],projects:[{id:'fixture-project',status:'active',openedBy:'fixture-steward',pledges:[{id:'fixture-pledge',pledgedBy:'fixture-maker',status:state}]}],events:[],receipts:[],capacities:[]}).measures.find(x=>x.key==='deed').value;assert.equal(view('reported_complete'),0);assert.equal(view('confirmed'),1);
const body={schema:'cannon.living-ministry/v1',classification:'FICTIONAL_ONLY',authority:'NONE',parent_receipt_sha256:sha(readFileSync(join(parent,'receipt.json'))),source_witnesses:sources,result:{exodus:{recovered,packet,tamperRefused:true,unapprovedMovementRefused:true},penny:{interested,observed,duplicateRefused:true},puente:{lesson:card},witness:{fixtureCoverage:ws.coverage,duplicateRefused:true,actualAudioVerified:false},full:{reportedFixtureDeeds:view('reported_complete'),confirmedFixtureDeeds:view('confirmed'),selfConfirmationRefused:!denied.ok,authenticatedHumanDeeds:0}},external_actions:0,canon_selection:false};
const browserSources=[{id:'protocol',path:'protocol-engine.js',blob:specs.puente.files['protocol-engine.js'],content:src.puente['protocol-engine.js']},{id:'studio',path:'studio-engine.js',blob:specs.puente.files['studio-engine.js'],content:src.puente['studio-engine.js']},{id:'witness',path:'prototype/game.mjs',blob:specs.witness.files['prototype/game.mjs'],content:src.witness['prototype/game.mjs']}];
const safe=x=>JSON.stringify(x).replaceAll('<','\\u003c');
const section='<section class="panel" style="max-width:1060px;margin:1rem auto"><h2>Living Ministry Machine 005 / خدمت</h2><p>Original PUENTE and WITNESS run locally. EXODUS, PENNY BOX and Full Measure show independently reproduced Node rehearsals. Fictional only; no funds, identities, assignments or human deeds are authenticated.</p><div class="toolbar"><button data-living="lesson">Generate original lesson</button><button data-living="voice">Inspect local Scripture takes</button><button data-living="exodus">EXODUS recovery proof</button><button data-living="penny">PENNY BOX proof</button><button data-living="full">Full Measure proof</button><button id="living-receipt">Export source receipt</button></div><p id="living-status" role="status">Choose an instrument.</p><pre id="living-out" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre></section>';
const bridge="const status=document.getElementById('living-status'),out=document.getElementById('living-out');let modules;\nconst payload=livingSources;\nasync function loadLiving(){const m={};for(const s of payload){const bytes=new TextEncoder().encode(s.content),prefix=new TextEncoder().encode('blob '+bytes.length+'\\0'),b=new Uint8Array(prefix.length+bytes.length);b.set(prefix);b.set(bytes,prefix.length);const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1',b)),x=>x.toString(16).padStart(2,'0')).join('');if(sha!==s.blob)throw Error('Source mismatch '+s.path);const u=URL.createObjectURL(new Blob([s.content],{type:'text/javascript'}));try{m[s.id]=await import(u)}finally{URL.revokeObjectURL(u)}}return m}\nasync function go(which){const buttons=[...document.querySelectorAll('[data-living]')];buttons.forEach(b=>b.disabled=true);try{modules=modules||await loadLiving();if(which==='lesson'){const studio=globalThis.PuenteStudio;const duration=Number(state.minutes);const pack=studio.forge({language:'en',minutes:[10,20,30].includes(duration)?duration:20,rank:'starter',scene:'radio',focus:'all'},1001);out.textContent=studio.plan(pack);status.textContent='Original PUENTE · English lesson candidate. Teacher review required.'}else if(which==='voice'){const records=[];for(let i=0;i<takes.length;i++){const t=takes[i],match=/^John 1:([1-3])$/.exec(t.passage);if(!match)continue;const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await t.blob.arrayBuffer())),x=>x.toString(16).padStart(2,'0')).join('');records.push({recording_id:'local-'+i+'-'+sha,chapter_id:'john.1',verse:Number(match[1]),sha256:sha,text_edition_id:'engwebp',reader_name:'Local voice',audio_blob:true})}const result=modules.witness.summarizeWitnessGame(records,[],{chapterId:'john.1',totalVerses:51});out.textContent='Local takes: '+result.totalTakes+'\\nCovered passage addresses: '+result.coveredVerses.join(', ')+'\\nThis demo offers only John 1:1–3, not the entire chapter. No spiritual score, identity proof, sharing or publication.';status.textContent='Original WITNESS · live local audio metadata only.'}else{out.textContent=JSON.stringify(livingReceipt.result[which],null,2);status.textContent='Original Node execution receipt · synthetic rehearsal, not live browser engine.'}}catch(e){status.textContent='HOLD · '+String(e.message).slice(0,160)}finally{buttons.forEach(b=>b.disabled=false)}}\nfor(const b of document.querySelectorAll('[data-living]'))b.addEventListener('click',()=>go(b.dataset.living));\ndocument.getElementById('living-receipt').addEventListener('click',()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(livingReceipt,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='living-ministry-receipt.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});\n";
const html=parentHtml.replace(/<\/body><\/html>\s*$/,()=>section+'<script type="module">const livingSources='+safe(browserSources)+';const livingReceipt='+safe(body)+';\n'+bridge+'\n</script></body></html>');
assert(html.includes('data-living="lesson"')&&html.includes('id="native-enable"'));assert(html.includes("connect-src 'none'"));
mkdirSync(out);writeFileSync(join(out,'index.html'),html,{flag:'wx'});writeFileSync(join(out,'receipt.json'),JSON.stringify({...body,html_sha256:sha(html)},null,2)+'\n',{flag:'wx'});console.log('LIVING_MINISTRY_NATIVE_OK',sha(html));
