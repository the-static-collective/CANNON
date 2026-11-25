import {readSource} from '../../src/present-use.mjs';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const specs=[
  {
    "id": "garden",
    "repository": "the-static-collective/BananaSpork",
    "commit": "ccbe2a4731444f4ff3aed744050e208bad55ec7b",
    "path": "public/possibility/engine.mjs",
    "blob": "3c2ef0e0755577e49c7191bc0af7c5d1facd5f47"
  },
  {
    "id": "keyhole",
    "repository": "the-static-collective/Jubilee-treasury",
    "commit": "bbe39a8dc7c8b0064be8c258cfe9b1fe43b7cdd6",
    "path": "labs/mooncrater-001/keyhole.mjs",
    "blob": "c942f1a22330a2a36e038b4a7da4fddf30dcc687"
  },
  {
    "id": "concord",
    "repository": "the-static-collective/Jubilee-treasury",
    "commit": "b54971c77cc4a721a952783044f3b27abc1a81ec",
    "path": "labs/penny-puddle-014/composer.mjs",
    "blob": "61dafee54a5a0b615e7969ff768a01fba140f577"
  },
  {
    "id": "relay",
    "repository": "the-static-collective/Jubilee-treasury",
    "commit": "5e304f4f19f466fb9985346ea3faa7d57ae86e38",
    "path": "labs/penny-puddle-010/relay.mjs",
    "blob": "f86c88a0a1a51adfceaa10e778b1486604fd0587"
  }
];
const readerPin={id:'cannon-reader',repository:'the-static-collective/CANNON',commit:'92a73324ec6918765cbd15b7a12cb83878b403eb',path:'src/present-use.mjs',media_type:'text/javascript',tags:[]};
const roots=JSON.parse(readFileSync(process.argv[2],'utf8')),out=resolve(process.argv[3]);
const reader=readSource(readerPin,{[readerPin.repository]:resolve(roots.cannon)});
assert.equal(reader.witness.blob,'648c42621735efb0eef92d25b30a7f161e249a8e');
assert.equal(reader.content,readFileSync(new URL('../../src/present-use.mjs',import.meta.url),'utf8'));
const sources=specs.map(s=>{const x=readSource({...s,media_type:'text/javascript',tags:[]},{[s.repository]:resolve(roots[s.id])});assert.equal(x.witness.blob,s.blob);return {...s,content:x.content,witness:x.witness}});
const m={};for(const x of sources)m[x.id]=await import('data:text/javascript;base64,'+Buffer.from(x.content).toString('base64'));
const w=m.garden.example(),g=m.garden.compose(w);assert.equal(g.status,'HOLD');assert.equal(g.potentialCovered.length,4);const refused=structuredClone(w);refused.gates[0].state='refused';assert.equal(m.garden.compose(refused).status,'REFUSED_GATE');const withdrawn=structuredClone(w);withdrawn.offers[0].state='withdrawn';assert.equal(m.garden.compose(withdrawn).potentialCovered.length,0);
const facts=[{id:'need',state:'reported'},{id:'host',state:'verified',evidenceRef:'fictional'}],actions=[{id:'review',requires:['need','host']}],k=m.keyhole.keyhole(facts,actions);assert.equal(k.actions[0].status,'HOLD');assert.equal(k.candidates[0].id,'need');assert.equal(k.actions[0].authorized,false);const checks=m.keyhole.tests();assert(checks>=13);
const c=m.concord.synthesizeAgreements();assert(c.numberOfDistinctConditionalStructures>0);assert.equal(c.legalMoneyOrWorkAuthorized,false);
const r=m.relay.createRelayLab(m.relay.makeRelayFixture()).publicPreview();assert(r.pathsAvailable>0);assert.equal(r.trueRealWorldPeopleContacted,0);
const template=readFileSync(new URL('./template.html',import.meta.url),'utf8');
const payload=JSON.stringify(sources.map(({witness,...rest})=>rest)).replaceAll('<','\\u003c');
const section='<section class="panel" id="native-panel" style="max-width:1060px;margin:1rem auto"><h2>Source-native CANNON crossing / اصل ماخذ</h2><p>Four original modules verified by Git blob hash in this browser. Explicitly enable to run the current fictional resource and evidence case. CONCORD and RELAY use independent original fictional examples. No actual authority.</p><button id="native-enable">Enable original engines / اصل انجن چلائیں</button> <button id="native-disable">Use browser adaptation</button> <button id="native-export" disabled>Export native result</button><p id="native-state" role="status">OFFLINE BROWSER ADAPTATION · original modules not yet executed.</p><pre id="native-output" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre><a id="native-download" download="jubilee-pentecost-native.html" hidden>Download this offline edition</a></section>';
const bridge="const b=document.getElementById('native-enable'),s=document.getElementById('native-state'),o=document.getElementById('native-output'),e=document.getElementById('native-export');\nconst oldCompose=compose,oldKeyhole=keyhole;let mods=null,last=null;\nconst dl=document.getElementById('native-download');if(/^https?:$/.test(location.protocol)){dl.href=location.pathname;dl.hidden=false}\nasync function load(){const m={};for(const x of donorSources){const bytes=new TextEncoder().encode(x.content),head=new TextEncoder().encode('blob '+bytes.length+'\\0'),all=new Uint8Array(head.length+bytes.length);all.set(head);all.set(bytes,head.length);const got=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1',all)),n=>n.toString(16).padStart(2,'0')).join('');if(got!==x.blob)throw Error('Git blob mismatch '+x.id);const url=URL.createObjectURL(new Blob([x.content],{type:'text/javascript'}));try{m[x.id]=await import(url)}finally{URL.revokeObjectURL(url)}}return m}\nfunction world(w){return{schema:mods.garden.SCHEMA,title:'Fictional learning supplies case',requirements:structuredClone(w.requirements),offers:structuredClone(w.offers),gates:structuredClone(w.gates),events:[]}}\nfunction nCompose(w){const c=mods.garden.compose(world(w));return{status:c.status,potential:c.potentialCovered.length,available:c.readyCovered.length,total:w.requirements.length,selected:c.selectedOfferIds.map(id=>w.offers.find(x=>x.id===id).label),missing:c.missingRequirementIds.map(id=>w.requirements.find(x=>x.id===id).label),next:c.nextQuestion,evaluatedSubsets:c.evaluatedSubsets,authority:'NONE'}}\nfunction nKeyhole(f,a){const k=mods.keyhole.keyhole(f,a);return{rows:k.actions.map(x=>({...x,label:a.find(y=>y.id===x.id).label})),candidates:k.candidates.map(x=>({...x,label:f.find(y=>y.id===x.id).label})),authority:'NONE'}}\nfunction snapshot(){const g=mods.garden.compose(world(state)),k=mods.keyhole.keyhole(state.facts,state.actions),c=mods.concord.synthesizeAgreements(),r=mods.relay.createRelayLab(mods.relay.makeRelayFixture()).publicPreview();last={schema:'cannon.ministry-browser-result/v1',classification:'FICTIONAL_ONLY',authority:'NONE',verification:'BROWSER_GIT_BLOB_HASH_NOT_GIT_CHECKOUT_PROOF',sources:donorSources.map(({id,repository,commit,path,blob})=>({id,repository,commit,path,blob})),garden:g,keyhole:k,concordFixture:c,relayFixture:r};o.textContent='Current snapshot: '+g.status+' · '+g.readyCovered.length+'/'+state.requirements.length+' available\\n'+g.nextQuestion+'\\nEvidence holds: '+k.actions.filter(x=>x.status==='HOLD').length+'\\nIndependent CONCORD fixture: '+c.numberOfDistinctConditionalStructures+' structures\\nIndependent RELAY fixture: '+r.pathsAvailable+' candidate routes\\nNo field witness or authority. Click enable again to refresh this snapshot.';e.disabled=false}\nfunction fallback(){compose=oldCompose;keyhole=oldKeyhole;last=null;e.disabled=true;o.textContent='';s.textContent='Browser adaptation active.';render()}\nb.addEventListener('click',async()=>{b.disabled=true;try{mods=mods||await load();compose=nCompose;keyhole=nKeyhole;render();snapshot();s.textContent='SOURCE-NATIVE · Garden and KEYHOLE now drive the working case. Other original modules run separate fictional examples.'}catch(err){fallback();s.textContent='HOLD · original execution unavailable: '+String(err.message).slice(0,140)}finally{b.disabled=false}});\ndocument.getElementById('native-disable').addEventListener('click',fallback);\ne.addEventListener('click',()=>{if(compose!==nCompose)return;try{snapshot();const url=URL.createObjectURL(new Blob([JSON.stringify(last,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='jubilee-native-fictional-result.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(err){s.textContent='HOLD · result unavailable'}});\n";
const html=template.replace("script-src 'unsafe-inline'","script-src 'unsafe-inline' blob:").replace('<title>Jubilee | Pentecost Edition</title>','<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Jubilee | Pentecost Native Edition</title>').replace(/<\/body><\/html>\s*$/,()=>section+'<script type="module">const donorSources='+payload+';\n'+bridge+'\n</script></body></html>');
assert(html.includes('id="native-enable"'));assert(html.includes("connect-src 'none'"));
const receipt={schema:'cannon.ministry-suitcase-native/v1',classification:'FICTIONAL_ONLY',authority:'NONE',reader:reader.witness,sources:sources.map(x=>x.witness),checks:{keyhole:checks,garden:'HOLD_REFUSAL_WITHDRAWAL',concord:'ORIGINAL_SYNTHETIC_FIXTURE',relay:'ORIGINAL_SYNTHETIC_FIXTURE'},result:{garden:g,keyhole:k,concord:c,relay:r},html_sha256:createHash('sha256').update(html).digest('hex'),canon_selection:false,external_actions:0,field_witness:false};
mkdirSync(out);writeFileSync(join(out,'index.html'),html,{flag:'wx'});writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log('SOURCE_NATIVE_RUN_OK',receipt.html_sha256);
