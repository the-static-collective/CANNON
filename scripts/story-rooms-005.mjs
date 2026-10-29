#!/usr/bin/env node
// STORY-ROOMS-005 — original JAR;VIS + planZ + WebZ local/native experiment.
// Execution is allowlisted, source-pinned and simulation-only. No third-party media.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
export const PINNED={
  "JARVIS": {
    "repo": "the-static-collective/JAR-VIS",
    "sha": "28d46f26ae373cb20f4fc288c21b891fe97a6f68"
  },
  "PLANZ": {
    "repo": "the-static-collective/planZ",
    "sha": "2507c36c0dc832b49b67d3c8b975544b5a53a84c"
  },
  "WEBZ": {
    "repo": "the-static-collective/webZ",
    "sha": "52b45697508b89e282dad7979666a60ce143457b"
  }
};
const sha=s=>createHash('sha256').update(s).digest('hex');
const fail=x=>{throw Error('STORY_ROOMS_005_HOLD_'+x);};
function cmd(args,cwd){
 return execFileSync(args[0],args.slice(1),{cwd,encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024}).trim();
}
function checkSource(name,root){
 const pin=PINNED[name];if(!pin)fail('UNKNOWN_OWNER');
 const head=cmd(['git','rev-parse','HEAD'],root);
 if(head!==pin.sha)fail(name+'_COMMIT');
 const origin=cmd(['git','remote','get-url','origin'],root).replace(/\.git$/,'').replace(/^git@github.com:/,'https://github.com/');
 if(origin!=='https://github.com/'+pin.repo)fail(name+'_ORIGIN');
 if(cmd(['git','status','--porcelain','--untracked-files=all'],root)!=='')fail(name+'_DIRTY');
 return {owner:pin.repo,commit:pin.sha};
}
function native(root,script,args=[]){return cmd(['node',join(root,script),...args],root);}
function record(output,name){
 const content=readFileSync(join(output,name));
 return {file:name,sha256:sha(content),bytes:content.length};
}
function insist(b,what){if(!b)fail(what);}
function article(type,items){
 return '<section><h2>'+type+'</h2>'+items.map(x=>'<article><h3>'+escape(x.title)+'</h3><p>'+escape(x.text)+'</p></article>').join('')+'</section>';
}
const escape=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function html(story,plan,field){
 const sources=story.payload.sourceReferences.map(x=>({title:x.title+' · '+x.state,text:x.mechanic+' · '+x.boundary}));
 const storyPairs=story.payload.branches.map(x=>({title:x.parentIds.join(' × '),text:x.question}));
 const next=plan.plans.filter(x=>x.generation===1).map(x=>({title:x.id,text:x.nextQuestion}));
 const proof=[{title:'WebZ signed synthetic inheritance',text:field.signedSoftwareReview.signedPacketsVerified+
 ' signed fictional packets; '+field.signedSoftwareReview.verifiedDistinctKeyHolders+
 ' independent generated keys; zero real human circles.'}];
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>THE SECOND TABLE · WORLDSEED CINEMA / HOLD</title>'+
 '<style>:root{color-scheme:dark}body{max-width:1020px;margin:auto;padding:2rem;background:#131f27;color:#f4e5cb;font:17px/1.6 system-ui}h1{font-size:clamp(3rem,8vw,5.4rem);line-height:1;color:#f5c88a}section{border-top:1px solid #9c866e;padding:1rem 0}article{background:#23333d;padding:1rem;margin:1rem 0;border-radius:.7rem}small{color:#eec789}a{color:#f5c88a}</style>'+
 '<header><small>FOUR SOURCE OWNERS · ORIGINAL SOFTWARE EXECUTION · NO FIELD PROOF</small><h1>The Second Table<br>inside a story.</h1>'+
 '<p><a href="./room-game.html">PLAY THE ROOM INSIDE THE ROOM — a tiny fictional door puzzle ↗</a></p><p>Deuce, Renji, the Static Collective Movie and OCTOPUS MADE THIS are fictional thinking rooms, not real people or community endorsements. They propose questions. Original PlanZ revisits them. Original WebZ performs a separate signed synthetic founding/refusal test. None of these acts books a festival or submits a fellowship.</p></header>'+
 article('The narrative entrances',sources)+article('The story encounters',storyPairs)+article('The four-lens PlanZ descendant questions',next)+article('What the signed software actually verified',proof)+
 '<footer><p>Review only. Author-approved fictional canon remains fixed, source rights remain held, and human authority remains local. See the included JSON evidence and original owner repositories.</p></footer></html>';
}
// Playable fictional room-crossing toy, deliberately separate from WebZ's signed proof.
function roomGame(){
 return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <meta name="referrer" content="no-referrer"><title>THE ROOM INSIDE THE ROOM · A tiny fictional crossing</title>
 <style>:root{color-scheme:dark}body{font:18px/1.5 system-ui;background:#111d26;color:#f3dfc2;max-width:850px;margin:auto;padding:1rem}h1{font-size:clamp(2.4rem,7vw,5rem);line-height:1}a{color:#f9d38c}.notes{background:#243741;padding:1rem;border-radius:.5rem}.rooms{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.8rem}button{font:inherit;border:1px solid #d6ba86;border-radius:.5rem;background:#2a3e49;color:#fff;padding:.7rem;margin:.25rem;cursor:pointer}button:disabled{opacity:.35}button:focus-visible{outline:3px solid #ffda9b}button[aria-pressed=true]{background:#71502c}pre{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid #867658;padding:1rem}small{color:#c8d4cd}</style>
 <header><a href="./index.html">← Source gallery</a><p><small>NON-CANON FICTIONAL MICROGAME · OFFLINE · NO PERSONAL DATA</small></p><h1>Who opens the door?</h1>
 <p>Deuce can see the stream. Renji remembers his own study. The rat knows a route nobody else can see. Wrench inherits an underwater mechanism. Choose two perspectives, propose a passage, then see why you cannot order another being to cross.</p></header>
 <main><div class="rooms" id="rooms"></div><section class="notes"><h2>The room does not command its visitors.</h2>
 <p id="narration" role="status">Choose two different entrances. Nothing has crossed.</p>
 <button id="propose" disabled>Propose a fictional passage</button><button id="refuse" disabled>Receiver REFUSE</button><button id="observe" disabled>Show fictional receiver's separate choice</button>
 <button id="reset">New interpretation</button><button id="save" disabled>Save a next-table question</button></section>
 <details><summary>Inspect invented, non-canon local state</summary><pre id="state"></pre></details>
 <p><small>Game mechanics are original synthetic teaching fixtures. They do not extend author-approved CANON 001, prove real animal cognition, transfer ownership, create a human group, or admit a Voqal partnership. The real WebZ signature experiment is a different exhibit.</small></p></main>
 <script>
 const rooms=[
 ['DEUCE','One almost unwatched animal-detective stream. He cannot see the whole room.'],
 ['RENJI','A drawing desk full of passages. He remembers; the player lacks his perspective.'],
 ['RAT','One specific rat remembers a route. The rat is not a controllable token.'],
 ['WRENCH','An octopus explores a room Saint Eight changed. This entire civilization is fictional.']
 ];
 let selected=[],stage='OBSERVE',receiver='NOT_SEEN';
 const $=id=>document.getElementById(id);
 function update(){
  $('propose').disabled=selected.length!==2||stage!=='OBSERVE';
  $('refuse').disabled=stage!=='PROPOSED';
  $('observe').disabled=stage!=='PROPOSED';
  $('save').disabled=stage!=='REFUSED'&&stage!=='FICTIONAL_RECEIVER_CHOICE';
  document.querySelectorAll('[data-room]').forEach(b=>b.setAttribute('aria-pressed',selected.includes(b.dataset.room)?'true':'false'));
  $('state').textContent=JSON.stringify({schema:'fiction.room-puzzle/v1',selected,stage,receiver,
   canonModified:false,peopleRecruited:0,thirdPartyConsent:false,physicalPassage:false,
   VoqalSubmitted:false,source:'local fictional player encounter only'},null,2);
 }
 rooms.forEach(([id,desc])=>{
  const box=document.createElement('article'),name=document.createElement('button'),p=document.createElement('p');
  name.dataset.room=id;name.textContent=id;p.textContent=desc;
  name.addEventListener('click',()=>{
   if(stage!=='OBSERVE')return;
   selected=selected.includes(id)?selected.filter(x=>x!==id):selected.length<2?[...selected,id]:[selected[1],id];
   $('narration').textContent='You inspected '+selected.join(' and ')+'. Nothing beyond these perspectives is established.';
   update();
  });box.append(name,p);$('rooms').append(box);
 });
 $('propose').onclick=()=>{
  stage='PROPOSED';$('narration').textContent='A possible passage is proposed between '+selected.join(' and ')+'. No inhabitant has accepted.';
  update();
 };
 $('refuse').onclick=()=>{
  stage='REFUSED';receiver='REFUSE';$('narration').textContent='The separate fictional receiver refused. The proposed path is left as a story trace. Nothing crossed.';
  update();
 };
 $('observe').onclick=()=>{
  stage='FICTIONAL_RECEIVER_CHOICE';receiver='LOCAL_FIXTURE_HOLD';
  $('narration').textContent='The independently modeled fictional receiver chooses HOLD. A story door may exist without anyone entering. This is not a real signed human decision.';
  update();
 };
 $('reset').onclick=()=>{selected=[];stage='OBSERVE';receiver='NOT_SEEN';$('narration').textContent='Choose two different entrances. Nothing has crossed.';update();};
 $('save').onclick=()=>{
  const card={schema:'fiction.next-table-question/v1',status:'UNAPPROVED_SYNTHETIC_QUESTION',perspectives:selected,
   question:'How could people with these different partial views establish a second table that can refuse its predecessor?',
   requirements:['independent owner choice','no personal testimony','paper-first option','actual host permission'],
   noRealWorkVerified:true,noCanonChange:true};
  const u=URL.createObjectURL(new Blob([JSON.stringify(card,null,2)+'\\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=u;a.download='room-puzzle-next-table-HOLD.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(u),1000);
 };
 update();
 </script></html>`;
}
export function verifyPacket(root,out){
 const roots={};
 for(const name of Object.keys(PINNED))roots[name]=checkSource(name,root[name]);
 const manifest=JSON.parse(readFileSync(join(out,'manifest.json'),'utf8'));
 insist(manifest.schema==='cannon.story-rooms-native-replay/v1','MANIFEST_SCHEMA');
 insist(JSON.stringify(manifest.sources)===JSON.stringify(roots),'SOURCE_LINEAGE');
 insist(manifest.status==='SYNTHETIC_ONLY_NO_EXTERNAL_EFFECTS','STATUS');
 for(const item of manifest.files){
  const current=record(out,item.file);
  insist(JSON.stringify(current)===JSON.stringify(item),'OUTPUT_TAMPER_'+item.file);
 }
 const story=JSON.parse(readFileSync(join(out,'jarvis-story.json'),'utf8'));
 const media=JSON.parse(readFileSync(join(out,'jarvis-media.json'),'utf8'));
 const plan=JSON.parse(readFileSync(join(out,'planz-story.json'),'utf8'));
 const field=JSON.parse(readFileSync(join(out,'webz-second-table.json'),'utf8'));
 insist(story.schema==='jarvis.story-rooms-packet/v1'&&story.payload.newStoryCanonDeclared===false,'STORY_CANON');
 insist(media.schema==='jarvis.thought-food-packet/v1'&&media.payload.rightsToReuseMedia===false,'MEDIA_RIGHTS');
 insist(plan.schema==='static-collective/planz-story-turn/v1'&&plan.sourcePacketDigest===story.digest,'PLANZ_LINEAGE');
 insist(plan.plans.length===story.payload.planCandidates.length*2,'PLANZ_TURNS');
 insist(plan.realHumanOutcomes===0&&plan.externalMediaRenders===0,'PLANZ_NO_REAL_OUTPUT');
 insist(field.schema==='abundent/second-table-synthetic-review-v1'&&field.storyThoughtFood.accepted===true&&
  field.creativeThoughtFood.accepted===true&&field.storyThoughtFood.sourceDigest===story.digest,'WEBZ_NATIVE_ADMISSION');
 insist(field.signedSoftwareReview.signedPacketsVerified===11&&field.signedSoftwareReview.ancestorCannotWithdrawChildOffer===true&&
  field.signedSoftwareReview.middleGenerationCannotWithdrawGrandchildOffer===true,'WEBZ_PROOF');
 insist(field.outcomes.realHumans===0&&field.outcomes.communityGroupsFounded===0&&
  field.outcomes.voqalSubmitted===false&&field.sideEffects.contactsSent===false,'WEBZ_NO_FIELD');
 native(root.JARVIS,'tools/story-rooms.mjs',['verify',join(out,'jarvis-story.json')]);
 native(root.JARVIS,'tools/thought-food.mjs',['verify',join(out,'jarvis-media.json')]);
 native(root.PLANZ,'reactor/story-turns.mjs',['verify',join(out,'jarvis-story.json'),join(out,'planz-story.json')]);
 return {schema:manifest.schema,status:'EXACT_LOCAL_SOURCE_AND_OUTPUT_HASHES_REVIEWED',owners:3,
  sourceReplays:3,actualCommunityFounding:false,actualFilmCreatedHere:false,voqalSubmitted:false};
}
export function run(root,out){
 for(const name of Object.keys(PINNED))checkSource(name,root[name]);
 insist(!existsSync(out),'OUTPUT_MUST_NOT_EXIST');
 mkdirSync(out,{recursive:true});
 native(root.JARVIS,'tools/story-rooms.mjs',['demo',join(out,'jarvis-story.json')]);
 native(root.JARVIS,'tools/thought-food.mjs',['demo',join(out,'jarvis-media.json')]);
 native(root.PLANZ,'reactor/story-turns.mjs',['compile',join(out,'jarvis-story.json'),join(out,'planz-story.json')]);
 const data=native(root.WEBZ,'scripts/second-table-demo.mjs',[join(out,'jarvis-media.json'),join(out,'jarvis-story.json')]);
 writeFileSync(join(out,'webz-second-table.json'),data+'\n',{flag:'wx'});
 const story=JSON.parse(readFileSync(join(out,'jarvis-story.json'),'utf8'));
 const plan=JSON.parse(readFileSync(join(out,'planz-story.json'),'utf8'));
 const field=JSON.parse(data);
 writeFileSync(join(out,'index.html'),html(story,plan,field),{flag:'wx'});
 writeFileSync(join(out,'room-game.html'),roomGame(),{flag:'wx'});
 const files=['jarvis-story.json','jarvis-media.json','planz-story.json','webz-second-table.json','index.html'].map(n=>record(out,n));
 const sources=Object.fromEntries(Object.entries(root).map(([name,path])=>[name,checkSource(name,path)]));
 const manifest={schema:'cannon.story-rooms-native-replay/v1',sources,files,
  status:'SYNTHETIC_ONLY_NO_EXTERNAL_EFFECTS',storySourceCount:story.payload.sourceReferences.length,
  storyCrossings:story.payload.branches.length,planZSourceOwnedCuts:plan.cuts.length,
  signers:field.signedSoftwareReview.verifiedDistinctKeyHolders,realHumanGroupsFounded:0,
  mediaEnginesExecutedByCannon:0,realMediaIncluded:false,externalMessages:0,
  autoSourceOwnerApprovals:0,sourceLineageIsNotLicense:true,voqalSubmitted:false};
 writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
 return verifyPacket(root,out);
}
function options(argv){
 let mode=argv[0];if(!['demo','verify'].includes(mode))fail('MODE');
 const named={};for(let i=1;i<argv.length;i+=2){
  const key=argv[i];if(!['--jarvis','--planz','--webz','--out'].includes(key)||named[key]||!argv[i+1])fail('ARGUMENTS');
  named[key]=resolve(argv[i+1]);
 }
 if(Object.keys(named).length!==4)fail('ARGS_REQUIRED');
 return {mode,root:{JARVIS:named['--jarvis'],PLANZ:named['--planz'],WEBZ:named['--webz']},out:named['--out']};
}
if(process.argv[1]&&new URL('file://'+process.argv[1]).href===import.meta.url){
 try{const {mode,root,out}=options(process.argv.slice(2));process.stdout.write(JSON.stringify(mode==='demo'?run(root,out):verifyPacket(root,out),null,2)+'\n');}
 catch(e){console.error(String(e));process.exitCode=1;}
}
