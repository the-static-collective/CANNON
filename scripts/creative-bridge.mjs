#!/usr/bin/env node
// Existing verified machine -> original JAR;VIS dealer -> original Static Live.
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,renameSync,rmSync,readdirSync,lstatSync,realpathSync,existsSync} from 'node:fs';
import {resolve,join,dirname,relative,isAbsolute,sep} from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';
import {loadConfig} from '../src/arcade/sources.mjs';
import {ROOT,hash,json,requireThat as need,checkSource} from '../src/constellation/sources.mjs';
import {compareFiles} from '../src/arcade/packet.mjs';
import {renderCreativeBridge} from '../src/creative-bridge-view.mjs';
const pinFile='constellation/creative-bridge.json';
const pins=JSON.parse(readFileSync(join(ROOT,pinFile)));
function walk(dir,prefix=''){
 const files={};
 need(lstatSync(dir).isDirectory()&&realpathSync(dir)===dir,'NONREGULAR_PACKET_DIRECTORY');
 const entries=readdirSync(dir,{withFileTypes:true});need(entries.length>0,'PARENT_EXTRA_EMPTY_DIRECTORY');
 for(const entry of entries){
  const name=prefix+entry.name,path=join(dir,entry.name);
  need(!entry.isSymbolicLink(),'PACKET_SYMLINK');
  if(entry.isDirectory())Object.assign(files,walk(path,name+'/'));
  else{need(entry.isFile(),'PACKET_NONFILE');files[name]=readFileSync(path)}
 }
 return files;
}
function parse(){
 const [mode,...tail]=process.argv.slice(2),args={};
 need(['build','verify'].includes(mode)&&tail.length%2===0,'USAGE_BUILD_OR_VERIFY');
 for(let i=0;i<tail.length;i+=2){need(['--config','--out','--authorize'].includes(tail[i])&&!Object.hasOwn(args,tail[i])&&tail[i+1],'ARGUMENT');args[tail[i]]=tail[i+1]}
 need(args['--config']&&args['--out'],'CONFIG_AND_OUT_REQUIRED');
 need(mode==='build'?args['--authorize']==='LOCAL_FICTIONAL_ONLY':!args['--authorize'],'EXPLICIT_LOCAL_AUTHORIZATION');
 const config=JSON.parse(readFileSync(resolve(args['--config'])));
 need(config?.schema==='cannon.creative-bridge-config/v1'&&Object.keys(config).sort().join()===['schema','arcadeConfig','parentPacket','jarvisRoot','staticLiveRoot'].sort().join(),'CONFIG_SHAPE');
 for(const key of ['arcadeConfig','parentPacket','jarvisRoot','staticLiveRoot'])need(typeof config[key]==='string'&&isAbsolute(config[key]),'ABSOLUTE_CONFIG_PATH');
 return {mode,config,out:resolve(args['--out'])};
}
async function compose(config){
 // Parent receipts are not trusted declarations: run all original native sources again.
 const parent=walk(realpathSync(config.parentPacket));
 const snapshot=mkdtempSync(join(tmpdir(),'creative-parent-'));
 for(const [p,bytes] of Object.entries(parent)){mkdirSync(dirname(join(snapshot,p)),{recursive:true});writeFileSync(join(snapshot,p),bytes,{flag:'wx'})}
 let verified;
 try{verified=JSON.parse(execFileSync(process.execPath,[join(ROOT,'scripts/arcade-machine.mjs'),'verify','--config',config.arcadeConfig,'--out',snapshot],{encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024,env:{...process.env,GIT_NO_REPLACE_OBJECTS:'1'}}))}
 catch(e){throw Error('PARENT_REPLAY_REFUSED: '+String(e.stderr||e.message).slice(0,1300))}
 finally{rmSync(snapshot,{recursive:true,force:true})}
 const receipt=JSON.parse(parent['receipt.json']);
 need(verified.receiptId===receipt.receiptId,'PARENT_RECEIPT_CHANGED_AFTER_REPLAY');
 const {receiptId,...body}=receipt;need(hash(json(body))===receiptId,'PARENT_RECEIPT_IDENTITY');
 const sourceWitnesses={jarvis:checkSource(pins.jarvis,config.jarvisRoot),staticLive:checkSource(pins.staticLive,config.staticLiveRoot)};
 const jar=await import(pathToFileURL(join(realpathSync(config.jarvisRoot),pins.jarvis.module)).href);
 const live=await import(pathToFileURL(join(realpathSync(config.staticLiveRoot),pins.staticLive.module)).href);
 const aids=await import(pathToFileURL(join(realpathSync(config.staticLiveRoot),'src/render-stage-aids.js')).href);
 const scenes={};
 if(receipt.schema==='arcade.receipt/v1'){
  for(const mission of ['mit','voqal','garden','jubilee','commons']){
   const bytes=parent['scenes/'+mission+'.json'];need(hash(bytes)===receipt.sceneOutputHashes[mission],'PARENT_SCENE_BYTES');scenes[mission]=JSON.parse(bytes);
  }
 }else{
  need(receipt.schema==='arcade.challenge-receipt/v1'&&hash(parent['result.json'])===receipt.resultSha256,'PARENT_CHALLENGE_BYTES');
  const scene=JSON.parse(parent['result.json']);scenes[scene.request.mission]=scene;
 }
 const files=Object.fromEntries(Object.entries(parent).map(([p,b])=>['machine/'+p,b]));
 const model={schema:'cannon.creative-bridge-view/v1',parentReceipt:receiptId,parentSchema:receipt.schema,scenes:{}};
 let projections=0;
 for(const [mission,scene] of Object.entries(scenes)){
  need(scene.status==='LOCAL_SOFTWARE_COMPLETE','PARENT_REFUSAL_OR_UNRESOLVED_BRANCH:'+scene.status);
  const sceneSha256=hash(json(scene));
  const question=`Can ${mission}: ${scene.title} offer a local creative review of ${sceneSha256}?`;
  // CANNON adapter fields, not a JAR factual answer or inferred institutional permission.
  const answer=json({softwareStatus:scene.status,selectedSources:scene.selectedSources,graph:scene.execution.results.graph.packet.packet_id,sceneSha256,effects:scene.execution.results.effects.result.effective_effects,authority:'LOCAL_FICTIONAL_SOFTWARE_ONLY'});
  need(question.length<=500&&answer.length<=6000,'BOUNDED_NATIVE_INPUT');
  model.scenes[mission]={title:scene.title,sceneSha256,rounds:[]};
  for(let scrapes=0;scrapes<=3;scrapes++){
   const intents=Array.from({length:scrapes},()=>({kind:'SCRAPE'}));
   const deck=jar.replaySlots({question,answer,intents});
   const integrity=jar.inspectSlots({question,answer,intents,expectedFamilyDigest:deck.family.familyDigest});
   need(deck.family.creatures.length===6&&deck.keepers.length===0&&!deck.externalDispatch&&!deck.humanOutcomesVerified,'NATIVE_DEAL_SCOPE');
   let forgedKeep;
   try{jar.replaySlots({question,answer,intents:[{kind:'KEEP',candidateId:'0000000000000000'}]})}catch(e){forgedKeep=e.message}
   need(forgedKeep==='HOLD_KEEP_EXACT_CURRENT_CREATURE_REQUIRED','NATIVE_FORGED_KEEP_NOT_REFUSED');
   const first=deck.family.creatures[0];
   const packet={version:'static-live.performance-packet/v0.1',song:{id:mission+'-'+first.id,title:first.title,sourceReceipt:deck.family.familyDigest},tempo:{bpm:92,meter:'6/8'},landmarks:['source-scene','creative-offer','human-hold'],requiredCapabilities:['voice.live','drums.live'],stems:[{id:'fictional-fallback',kind:'fallback',coversCapability:'drums.live',path:'NOT_PRESENT/drums.wav',output:'foh'}],cues:{click:'NOT_PRESENT/click.wav',voice:'NOT_PRESENT/voice.wav'}};
   const rig={id:'fictional-one-role',label:'Unverified local software fixture',performers:[{id:'fictional-voice',label:'No real person',capabilities:['voice.live']}]};
   const stage=live.compileStageProjection(packet,rig),noFallback=live.compileStageProjection({...packet,stems:[]},rig);
   need(stage.playable&&stage.song.sourceReceipt===deck.family.familyDigest&&!noFallback.playable&&noFallback.unresolvedCapabilities.includes('drums.live'),'NATIVE_STAGE_CONTRACT');
   const prefix=mission+'/'+scrapes+'/';
   for(const [name,obj] of Object.entries({'deck.json':deck,'packet.json':packet,'stage.json':stage,'refusal.json':{forgedKeep,noFallback},'integrity.json':integrity}))files[prefix+name]=json(obj);
   files[prefix+'setlist.md']=aids.renderSetlist(stage);files[prefix+'routing.md']=aids.renderRouting(stage);
   model.scenes[mission].rounds.push({deck,stage,negativeControl:noFallback});projections++;
  }
 }
 const graph={schema:'cannon.creative-bridge-edges/v1',edges:[{from:'verified machine native scene',to:'JAR;VIS question/answer',kind:'CANNON_AUTHORED_FIELD_ADAPTER',fields:['scene SHA-256','native graph packet id','native effect refusals','selected public sources']},{from:'JAR;VIS original six-up',to:'Static Live original stage compiler',kind:'CANNON_AUTHORED_FIELD_ADAPTER',fields:['familyDigest -> song.sourceReceipt','first creature title -> song.title']}],sourceWitnesses,limits:{nativeRepositoryCountAdded:0,physicalPerformance:false,mediaRendered:false,humanKeep:false,fieldWitness:false}};
 files['integration-map.json']=json(graph);
 files['first-boot.html']=renderCreativeBridge(model);
 files['NEXT-HUMAN-GATES.md']='# Human verification gates\n\n- Independently acquire the pinned sources and rerun both parent and bridge. Retained HTML is inspection of already executed states.\n- Review the CANNON-authored mapping: a scene becomes a creative question, not a factual JAR answer.\n- Preview exact native JAR media in the owner app before a human KEEP; scripted SCRAPE samples are not human verdicts.\n- Static Live checks declared capabilities. Audio paths are absent; no concert, render, musician, venue or rights verification is demonstrated.\n- Keep all source PRs open for independent owner review. No publication or institutional authority is inherited.\n';
 const implementation=Object.fromEntries(['scripts/creative-bridge.mjs','src/creative-bridge-view.mjs',pinFile].map(p=>[p,hash(readFileSync(join(ROOT,p)))]));
 const result={schema:'cannon.creative-bridge-receipt/v1',status:'ORIGINAL_NATIVE_SOFTWARE_CREATIVE_BRIDGE_EXECUTED',parentReceipt:receiptId,parentCoverage:JSON.parse(parent['manifest.json']).coverage,sourceWitnesses,implementation,projections,nativeRepositoryCountAdded:0,humanKeepCount:0,fieldVerified:false,externalContacts:0,physicalActs:0,scriptedScrapes:true,files:Object.fromEntries(Object.entries(files).map(([p,b])=>[p,hash(b)]))};
 files['receipt.json']=json({...result,receiptId:hash(json(result))});return files;
}
try{
 const {mode,config,out}=parse();
 const arc=loadConfig(config.arcadeConfig);
 const documentRoots=JSON.parse(readFileSync(arc.documentRoots)).entries.map(e=>e.root);
 for(const source of [ROOT,config.parentPacket,config.jarvisRoot,config.staticLiveRoot,...Object.values(arc.inheritedRoots),...Object.values(arc.nativeRoots),arc.toolchain,...documentRoots]){
  const rel=relative(realpathSync(source),out);need(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel),'OUTPUT_INSIDE_SOURCE');
 }
 need(mode==='verify'||!existsSync(out),'OUTPUT_EXISTS');
 const files=await compose(config);
 if(mode==='verify')compareFiles(out,files);
 else{
  need(realpathSync(dirname(out))===dirname(out),'OUTPUT_PARENT_SYMLINK');
  const tmp=mkdtempSync(join(dirname(out),'.creative-bridge-'));
  try{
   const stage=join(tmp,'packet');mkdirSync(stage,{mode:0o700});
   for(const [p,bytes] of Object.entries(files)){mkdirSync(dirname(join(stage,p)),{recursive:true,mode:0o700});writeFileSync(join(stage,p),bytes,{flag:'wx',mode:0o600})}
   renameSync(stage,out);
  }finally{rmSync(tmp,{recursive:true,force:true})}
 }
 const receipt=JSON.parse(files['receipt.json']);console.log(json({status:mode==='verify'?'FRESH_PROCESS_CREATIVE_BRIDGE_REPLAY_VERIFIED':receipt.status,receiptId:receipt.receiptId,projections:receipt.projections,humanKeepCount:0,nativeRepositoryCountAdded:0}));
}catch(e){console.error('HOLD / REFUSE:',String(e.stack||e.message).slice(0,3500));process.exitCode=2}
