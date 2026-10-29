import{readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync,realpathSync,readdirSync,lstatSync,rmSync,renameSync}from'node:fs';
import{resolve,join,dirname,relative,basename}from'node:path';
import{createHash}from'node:crypto';
import{execFileSync}from'node:child_process';
const ROOT=resolve(import.meta.dirname,'..');
const src=JSON.parse(readFileSync(join(ROOT,'creative/film-press-sources.json')));
const track=JSON.parse(readFileSync(join(ROOT,'creative/film-press-synthetic-track.json')));
const world=JSON.parse(readFileSync(join(ROOT,'creative/film-press-synthetic-world.json')));
const j=x=>JSON.stringify(x,null,2)+'\n';
const hash=x=>createHash('sha256').update(x).digest('hex');
function need(ok,msg){if(!ok)throw Error('HOLD_FILM_PRESS_'+msg)}
function cmd(bin,args,options={}){try{return execFileSync(bin,args,{encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024,stdio:['ignore','pipe','pipe'],...options}).trim()}catch(e){throw Error(String(e.stderr||e.message||'EXECUTION_FAILED').slice(0,1800))}}
function owner(name,dir){
 const wanted=src.owners[name];const path=realpathSync(dir);
 need(cmd('git',['-C',path,'rev-parse','HEAD'])===wanted.commit,'SHA_'+name);
 const url=cmd('git',['-C',path,'remote','get-url','origin']);
 need(url.endsWith('/'+wanted.repo)||url.endsWith('/'+wanted.repo+'.git')||url.endsWith(':'+wanted.repo+'.git'),'REMOTE_'+name);
 const status=cmd('git',['-C',path,'status','--porcelain','--untracked-files=all']).split('\n').filter(Boolean);
 need(status.every(x=>x.startsWith('?? node_modules/')||x.startsWith('?? out/')),'DIRTY_'+name+':'+status.join(';').slice(0,450));
 return path;
}
function filesOf(dir,prefix=''){let result={};for(const e of readdirSync(dir,{withFileTypes:true})){const abs=join(dir,e.name),name=prefix+e.name;need(!e.isSymbolicLink(),'SYMLINK');if(e.isDirectory())Object.assign(result,filesOf(abs,name+'/'));else{need(e.isFile(),'NONFILE');result[name]=readFileSync(abs)}}return result}
function compare(a,b){need(Object.keys(a).sort().join('|')===Object.keys(b).sort().join('|'),'FILE_SET');for(const [k,v]of Object.entries(a))need(v.equals(b[k]),'TAMPER_'+k)}
function readBinding(file){
 if(!file)return null;
 const b=JSON.parse(readFileSync(resolve(file),'utf8'));
 need(b?.schema==='cannon.inspand-plan-binding/v1','BINDING_SCHEMA');
 const {digest,...core}=b;
 need(digest===hash(Buffer.from(j(core))),'BINDING_DIGEST');
 need(/^plan-[a-f0-9]{24}$/.test(b.planId),'BINDING_PLAN');
 need(['RHYTHM-MUTANT','ORCHARD-CINEMA'].includes(b.chamber),'BINDING_CHAMBER');
 need(b.toasterSeed==='INSPAND_002_'+digest.slice(0,40),'BINDING_SEED');
 need(Array.isArray(b.cuts)&&b.cuts.length===4&&new Set(b.cuts).size===4,'BINDING_CUTS');
 need(b.mediaAuthority==='SYNTHETIC_ONLY'&&b.ownerPermissions==='NONE','BINDING_AUTHORITY');
 return b;
}
function build(roots,temp,binding){
 const p=Object.fromEntries(Object.entries(roots).map(([k,v])=>[k,owner(k,v)]));
 const scratch=join(temp,'scratch');mkdirSync(scratch);
 const toasterFile=join(scratch,'toaster.json');
 const tCode=[
 "const fs=require('fs'),path=require('path');",
 "const base=path.join(process.cwd(),'src/full-measure/src/generation');",
 "const{createFreeSigilExpression}=require(path.join(base,'sigil-topology-expression.cjs'));",
 "const{generateSigilUtteranceFamily,replaySigilUtteranceFamily}=require(path.join(base,'sigil-utterance-family.cjs'));",
 "const parent=createFreeSigilExpression({primitives:['P8','PA']});",
 "const fam=generateSigilUtteranceFamily({parentExpression:parent,rootSeed:process.env.CANNON_SIGIL_SEED||'FILM_PRESS_001_FICTIONAL',count:6});",
 "if(!replaySigilUtteranceFamily(fam,{parentExpression:parent}).ok||fam.utterances.length!==6)throw Error('TOASTER_REFUSED');",
 "const result={schema:fam.schema,familyHash:fam.familyHash,sourceKind:fam.sourceKind,seed:fam.rootSeed,producedCount:fam.producedCount,utterances:fam.utterances.map(x=>({role:x.role,planHash:x.planHash,expressionHash:x.expressionHash,operation:x.operation}))};",
 "fs.writeFileSync(process.env.CANNON_OUTPUT,JSON.stringify(result,null,2)+'\\n');"
 ].join('\n');
 cmd(process.execPath,['-e',tCode],{cwd:p.toaster,env:{...process.env,CANNON_OUTPUT:toasterFile,CANNON_SIGIL_SEED:binding?.toasterSeed||''}});
 const family=JSON.parse(readFileSync(toasterFile));
 need(family.utterances.length===6&&new Set(family.utterances.map(x=>x.planHash)).size===6,'SIX_SIGILS');
 const deck={schemaVersion:'0.1',id:'cannon-synthetic-six-sigils',title:'SILENT synthetic six-up, not song video',cards:family.utterances.map((x,i)=>({
   id:'sigil-'+(i+1),source:'sigil://'+x.planHash,traits:[x.role,i===0?'center':'answering'],temperament:['proposal'],
   permissions:{flip:true,fold:true,fracture:true,portal:false,awaken:false}
 })),order:family.utterances.map((_,i)=>'sigil-'+(i+1)),
 metadata:{sourceFamilyHash:family.familyHash,assetBinding:'logical-only-no-actual-pixels'}};
 if(binding)deck.metadata.planBinding={planId:binding.planId,seedDigest:binding.digest,chamber:binding.chamber};
 const deckFile=join(scratch,'deck.json');writeFileSync(deckFile,j(deck));
 const planFile=join(scratch,'plan.json');
 const playCode=[
 "import fs from 'node:fs';",
 "import{composeDeck,assertValidCompositionPlan}from'./packages/composer/src/index.ts';",
 "const deck=JSON.parse(fs.readFileSync(process.env.CANNON_DECK));",
 "const track=JSON.parse(fs.readFileSync(process.env.CANNON_TRACK));",
 "const world=JSON.parse(fs.readFileSync(process.env.CANNON_WORLD));",
 "const plan=composeDeck({deck,track,worldRule:world,options:{id:'synthetic-six-up',fps:24,width:96,height:64}});",
 "assertValidCompositionPlan(plan,deck);",
 "fs.writeFileSync(process.env.CANNON_OUTPUT,JSON.stringify(plan,null,2)+'\\n');"
 ].join('\n');
 const trackFile=join(ROOT,'creative/film-press-synthetic-track.json'),worldFile=join(ROOT,'creative/film-press-synthetic-world.json');
 cmd(process.execPath,['--import','tsx','--input-type=module','-e',playCode],{cwd:p.playdeck,env:{...process.env,CANNON_DECK:deckFile,CANNON_TRACK:trackFile,CANNON_WORLD:worldFile,CANNON_OUTPUT:planFile}});
 const plan=JSON.parse(readFileSync(planFile));
 need(plan.id&&plan.events?.length>0&&plan.gates?.length===track.gates.length,'PLAYDECK_NOT_COMPOSED');
 need(JSON.stringify(plan).includes(deck.cards[0].id),'PLAYDECK_LOST_SIGIL');
 const filmDir=join(scratch,'film');mkdirSync(filmDir);
 cmd('python3',[join(ROOT,'scripts/film-press-blender.py'),trackFile,join(ROOT,'creative/film-press-synthetic-lyrics.json'),toasterFile,planFile,filmDir],{cwd:p.blender,env:{...process.env,PYTHONPATH:p.blender}});
 const film=JSON.parse(readFileSync(join(filmDir,'study.json')));
 need(film.toasterFamilyHash===family.familyHash&&film.playdeckPlanId===plan.id&&film.masterAudioPresent===false&&!film.realMusicVideo&&!film.distributionAuthorized,'FILM_AUTHORITY');
 need(hash(readFileSync(join(filmDir,'silent.mp4')))===film.sourceOwnedVideoSha256,'SILENT_VIDEO_HASH');
 const roomRootsFile=join(scratch,'room-roots.json');
 writeFileSync(roomRootsFile,j({band:p.band,lemonpress:p.lemonpress}));
 const roomOut=join(scratch,'room');
 cmd(process.execPath,[join(ROOT,'scripts/room-vinyl-crossing.mjs'),'build','--roots',roomRootsFile,'--out',roomOut,'--authorize','LOCAL_FICTIONAL_ONLY'],{cwd:ROOT});
 const vinyl=JSON.parse(readFileSync(join(roomOut,'lemonpress/proof.json')));
 need(vinyl.state==='HOLD_NOT_ORDERABLE'&&!vinyl.safety.audioBytesPresent&&!vinyl.safety.orderPlaced,'PHYSICAL_PRESS_HOLD');
 const notes={schema:'cannon.film-press-liner/v1',parentEdition:vinyl.parentEdition,
  sourceSongLink:vinyl.sides.A[0].source_url,originalRecording:'NO_MASTER_AUDIO',creditsVerified:false,
  toaster:{familyHash:family.familyHash,sixRoles:family.utterances.map(x=>x.role)},
  playdeck:{planId:plan.id,events:plan.events.length,renderedFilm:false},
  blender:{videoSha256:film.sourceOwnedVideoSha256,actualHumanKeep:false,soundtrackSynchronized:false},
  lemonpress:{status:vinyl.state,manufacturingApproved:false,artistCopiesSent:0,unitCost:null},
  missing:['Master, true length, sound synchronization','Artist/producer permissions and artwork approval','Human creative KEEP and editor decisions','Liner credits and archival attribution','Vendor-ready plates, quote, final side sequencing','lemonPRESS house admission and artist copy count']
 };
 const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const liner='<!doctype html><html lang="en"><meta charset="utf-8"><title>The First Spark | Print Test</title><style>body{max-width:46rem;margin:auto;padding:3rem;background:#e3d2ab;color:#23312c;font:18px/1.5 Georgia}h1{font-size:3rem}strong{color:#8b2e24}</style><small>FICTIONAL SILENT STUDY · lemonPRESS</small><h1>THE FIRST SPARK</h1><strong>NOT FOR MANUFACTURE. NO AUDIO MASTER. NO ARTIST PERMISSION.</strong><p>Six original deterministic Toaster sigil proposals became six PlayDeck logical cards. Native PlayDeck arranged these into a composition plan. Native Blender created a silent, low-resolution cutout study using a scripted fixture KEEP, not a real human creative decision.</p><h2>Proposals</h2><ol>'+family.utterances.map(x=>'<li>'+esc(x.role)+' '+esc(x.planHash.slice(0,12))+'</li>').join('')+'</ol><h2>Remaining authorizations</h2><ul>'+notes.missing.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></html>\n';
 const jacket='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#21332e"/><circle cx="300" cy="278" r="215" fill="#cbb38c"/>'+family.utterances.map((x,i)=>'<circle cx="'+(187+(i%3)*110)+'" cy="'+(207+Math.floor(i/3)*140)+'" r="37" fill="#233a34" stroke="#ac4939" stroke-width="5"/>').join('')+'<g fill="#f9e9ca" text-anchor="middle" font-family="Georgia"><text x="300" y="538" font-size="36">THE FIRST SPARK</text><text x="300" y="569" font-size="18">STUDY · NOT FOR MANUFACTURE</text></g></svg>\n';
 const files={
  'owners/toaster-family.json':readFileSync(toasterFile),
  'owners/playdeck-deck.json':readFileSync(deckFile),
  'owners/playdeck-plan.json':readFileSync(planFile),
  'owners/blender-timing.json':readFileSync(join(filmDir,'timing.json')),
  'owners/blender-study.json':readFileSync(join(filmDir,'study.json')),
  'owners/blender-silent-study.mp4':readFileSync(join(filmDir,'silent.mp4')),
  'print/liner.json':Buffer.from(j(notes)),
  'print/liner-draft.html':Buffer.from(liner),
  'print/jacket-draft.svg':Buffer.from(jacket),
  'inputs/sources.json':Buffer.from(j(src)),
  'inputs/track.json':Buffer.from(j(track)),
  'inputs/world.json':Buffer.from(j(world))
 };
 if(binding)files['inputs/plan-binding.json']=Buffer.from(j(binding));
 for(const[k,v]of Object.entries(filesOf(roomOut)))files['prior-room-vinyl/'+k]=v;
 const core={schema:'cannon.film-press-execution/v1',authority:'SILENT_SYNTHETIC_HOLD',
  ownerCommits:Object.fromEntries(Object.entries(src.owners).map(([k,v])=>[k,v.commit])),
  realSongMaster:false,realKeepDecisions:0,actualPlaydeckVideo:false,
  blenderRenderedSilentVideo:true,songSynchronized:false,roomMembersContacted:0,
  publicReleases:0,vinylRecordsPressed:0,artistCopiesSent:0,
  ...(binding?{planBinding:{id:binding.planId,digest:binding.digest,kind:'DETERMINISTIC_SYNTHETIC_SEED_NOT_SEMANTIC_APPROVAL'}}:{}),
  files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,hash(v)]))};
 const receipt={...core,receiptId:hash(Buffer.from(j(core)))};
 files['receipt.json']=Buffer.from(j(receipt));
 return {files,receipt};
}
try{
 const[mode,...args]=process.argv.slice(2);need(['build','verify'].includes(mode)&&args.length%2===0,'USAGE');
 const a={};for(let i=0;i<args.length;i+=2){need(['--roots','--out','--authorize','--plan-binding'].includes(args[i])&&!Object.hasOwn(a,args[i])&&args[i+1],'ARGUMENTS');a[args[i]]=args[i+1]}
 need(a['--roots']&&a['--out'],'REQUIRED');
 need(mode==='build'?a['--authorize']==='SYNTHETIC_TEST_ONLY':!a['--authorize'],'AUTHORITY');
 const roots=JSON.parse(readFileSync(resolve(a['--roots'])));
 const binding=readBinding(a['--plan-binding']);
 need(Object.keys(roots).sort().join('|')===Object.keys(src.owners).sort().join('|'),'ROOTS');
 const out=resolve(a['--out']),parent=realpathSync(dirname(out));
 need(join(parent,basename(out))===out,'OUTPUT_PATH');
 need(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()&&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 for(const root of Object.values(roots)){const rel=relative(realpathSync(root),out);need(rel!==''&&(rel==='..'||rel.startsWith('../')||rel.startsWith('..\\')),'INSIDE_OWNER')}
 const temp=mkdtempSync(join(parent,'.film-press-'));
 try{
  const {files,receipt}=build(roots,temp,binding);
  if(mode==='verify')compare(files,filesOf(out));
  else{const dir=join(temp,'packet');for(const[k,v]of Object.entries(files)){const path=join(dir,k);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,v,{flag:'wx'})}renameSync(dir,out)}
  console.log(j({status:mode==='build'?'FIVE_OWNER_SYNTHETIC_EXECUTION':'FULL_NATIVE_COLD_REPLAY',receiptId:receipt.receiptId,vinylPressed:0,actualMusicVideo:false}));
 }finally{rmSync(temp,{recursive:true,force:true})}
}catch(e){console.error(String(e.message||e).slice(0,2400));process.exitCode=2}
