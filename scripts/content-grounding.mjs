#!/usr/bin/env node
// CANNON INSPAND-009: original real contract -> headerless content-bearing
// original Iron Lung. Hard facts from actual source; ideas never approvals.
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync,mkdirSync,mkdtempSync,rmSync,renameSync,existsSync,lstatSync,realpathSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractActualContract} from './real-contract-compass.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const LOCK=JSON.parse(readFileSync(join(ROOT,'registry/content-compass-lock-v1.json'),'utf8'));
const h=s=>createHash('sha256').update(s).digest('hex');
const fmt=x=>JSON.stringify(x,null,2)+'\n';
const need=(x,why)=>{if(!x)throw Error('HOLD_CONTENT_CANNON_'+why);};
const safe=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function exec(cmd,args,cwd){
 try{return execFileSync(cmd,args,{cwd,encoding:'utf8',timeout:900000,maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});}
 catch(e){throw Error('HOLD_CONTENT_CANNON_CHILD_'+String(e.stderr||e.message).slice(0,700));}
}
function dir(path){
 const x=resolve(path);need(existsSync(x)&&lstatSync(x).isDirectory()&&!lstatSync(x).isSymbolicLink(),'DIRECTORY');
 return realpathSync(x);
}
function git(cwd,...args){return exec('git',['--no-replace-objects','-C',cwd,...args],ROOT).trim();}
export function inspectContentOwner(path){
 const root=dir(path);
 need(LOCK?.schema==='cannon.content-bearing-compass-lock/v1'
  &&LOCK.repository==='the-static-collective/iron-lung'
  &&LOCK.policy==='NO_LABEL_HEADINGS_SOURCE_ONLY'&&LOCK.maxCalls===72
  &&LOCK.noNativeExecution===true,'SOURCE_LOCK');
 need(git(root,'rev-parse','HEAD')===LOCK.commit,'OWNER_SHA');
 need(git(root,'remote','get-url','origin').replace(/\.git$/,'')==='https://github.com/'+LOCK.repository,'OWNER_REMOTE');
 need(git(root,'status','--porcelain','--untracked-files=normal').split('\n').filter(Boolean)
   .every(x=>x==='?? node_modules/'),'OWNER_DIRTY');
 for(const [path,blob] of Object.entries(LOCK.files)){
  need(git(root,'rev-parse','HEAD:'+path)===blob,'OWNER_BLOB_'+path);
  const bytes=readFileSync(join(root,path));
  const live=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  need(live===blob&&realpathSync(join(root,path))===join(root,path),'OWNER_WORKTREE_'+path);
 }
 return {schema:'cannon.content-owner/v1',original:LOCK.repository,
  commit:LOCK.commit,model:LOCK.model,verifiedOriginalSource:true,authority:'NONE'};
}
function countWords(line){return line.trim().split(/\s+/).length;}
function echoedReply(response,card){
 const toks=s=>s.toLowerCase().match(/[a-z0-9_.\/-]+/g)||[];
 const a=toks(response),b=toks(card);
 if(a.length<3)return false;
 const three=new Set();
 for(let k=0;k<=b.length-3;k++)three.add(b.slice(k,k+3).join('|'));
 for(let k=0;k<=a.length-3;k++)if(three.has(a.slice(k,k+3).join('|')))return true;
 return false;
}
export function analyze(packet,canonical){
 need(packet?.schema==='iron-lung/content-triangulation/v1'
  &&packet.callCount===72&&packet.equalCallsPerArm===9
  &&packet.noAutoDecision===true&&packet.humanAuthorization===false
  &&packet.sourceChanged===false,'NO_GRANTED_ACTIONS');
 const {receiptSha256,...body}=packet;
 need(receiptSha256===h(JSON.stringify(body)),'OWNER_PACKET_HASH');
 need(JSON.stringify(packet.task)===JSON.stringify(canonical.task),'EXACT_REAL_SOURCE');
 need(packet.provider?.kind==='flan-t5'
   ?packet.provider.model===LOCK.model.name&&packet.provider.revision===LOCK.model.revision
   :packet.provider?.kind==='deterministic-fixture','MODEL_IDENTITY');
 need(packet.results?.length===8&&packet.steps?.length===72,'EIGHT_ARMS');
 const expectedArms=['DYAD_NEUTRAL','DYAD_YOU','FOCUSED_NEUTRAL','FOCUSED_YOU'];
 const measures=[];
 for(const scenario of ['ADAPTED','DIRECT_ONLY'])for(const arm of expectedArms){
  const rows=packet.steps.filter(s=>s.scenario===scenario&&s.arm===arm);
  const scores=packet.results.find(r=>r.scenario===scenario&&r.arm===arm);
  need(rows.length===9&&scores?.calls===9,'MISSING_ARM');
  const eachLine=rows.every(r=>r.card.split('\n').every(line=>countWords(line)>=2&&countWords(line)<=3));
  need(eachLine&&rows.every(r=>r.card.split('\n').every(line=>
    !/^(FACT|IDEA|RELATION|SOURCE|ADAPTER|ASK)\s/.test(line)),'LABEL_FREE');
  const exact=rows.filter(r=>r.response.toLowerCase().replace(/[.\s]+$/,'')===
    r.expected.toLowerCase()).length;
  need(exact===scores.exactCorrect,'METRICS');
  measures.push({scenario,arm,questions:9,exactSourceOrScenarioAnswers:exact,
    echoedThreeWordFragments:rows.filter(r=>echoedReply(r.response,r.card)).length,
    responsesContainingYou:rows.filter(r=>/\byou\b/i.test(r.response)).length,
    responseDistinct:new Set(rows.map(r=>r.response.toLowerCase())).size,
    labelsInModelInput:0,headerlessLinesVerified:true});
 }
 const core={schema:'cannon.content-grounded-evaluation/v1',ownerCommit:LOCK.commit,
  model:packet.provider,originalRunReceipt:packet.receiptSha256,
  realProducer:canonical.task.producer.capability,
  realConsumer:canonical.task.consumer.capability,
  actualSourceAdapter:canonical.task.edge.adapter,
  counterfactual:'DIRECT_ONLY = the actual known adapter disabled in a SYNTHETIC test; not a factual source state',
  requestsPerArm:9,measurements:measures,totalModelCalls:72,
  semanticReasoningProven:false,modelInventedCapability:false,
  noAutoWinner:true,noHumanPermissions:true,noNativeExecution:true,
  interpretExactAsSourceRetrievalNotInnovation:true,
  status:'MODEL_OUTPUTS_HELD_FOR_REVIEW'};
 return {...core,reportSha256:h(fmt(core))};
}
export function htmlReview(packet,report){
 const headings=['DYAD_NEUTRAL','DYAD_YOU','FOCUSED_NEUTRAL','FOCUSED_YOU'];
 const tables=['ADAPTED','DIRECT_ONLY'].map(scenario=>{
  let html='<h2>'+safe(scenario)+'</h2><table border="1"><tr><th>Question</th><th>Expected</th>'+
   headings.map(x=>'<th>'+x+'</th>').join('')+'</tr>';
  const groups=headings.map(arm=>packet.steps.filter(s=>s.scenario===scenario&&s.arm===arm));
  for(let i=0;i<9;i++){
   const cells=groups.map(group=>'<td><pre>'+safe(group[i].card)+'</pre><pre>'+
     safe(group[i].response)+'</pre></td>').join('');
   html+='<tr><td>'+i+'</td><td>'+safe(groups[0][i].expected)+'</td>'+cells+'</tr>';
  }
  return html+'</table>';
 });
 return '<!doctype html><html lang="en"><meta charset="utf-8"><title>INSPAND-009 actuals and meaningful compass</title>'+
 '<h1>Facts, possible bridges, real relationships</h1><p>No role headers; only source-grounded two-to-three word statements. Nothing generated is permission.</p>'+
 '<p>Exact source-backed receipt: '+safe(report.reportSha256)+'</p>'+tables.join('')+'</html>\n';
}
function options(argv){
 const [mode,...tail]=argv;need(['inspect','build','verify'].includes(mode)&&tail.length%2===0,'USAGE');
 const args={};for(let i=0;i<tail.length;i+=2){
  const key=tail[i],value=tail[i+1];need(['--lung','--provider','--out','--authorize'].includes(key)
    &&value&&!Object.hasOwn(args,key),'FLAG');args[key]=value;
 }
 if(mode==='inspect')need(Object.keys(args).length===0,'INSPECT_ONLY');
 else{
  for(const key of ['--lung','--provider','--out'])need(args[key],'REQUIRED_'+key);
  need(['fixture','flan'].includes(args['--provider']),'PROVIDER');
  need(mode==='build'?args['--authorize']==='SYNTHETIC_TEST_ONLY':!args['--authorize'],'AUTHORIZE');
 }
 return {mode,args};
}
export function run(argv){
 const {mode,args}=options(argv),canonical=extractActualContract();
 if(mode==='inspect')return {task:canonical.task,mode:'READ_ONLY',permission:false};
 const observed=inspectContentOwner(args['--lung']),root=dir(args['--lung']);
 const out=resolve(args['--out']),parent=dir(dirname(out));
 need(join(parent,basename(out))===out,'OUT_PATH');
 need(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUT_STATE');
 const tmp=mkdtempSync(join(parent,'.content-grounding-'));
 try{
  const destination=mode==='build'?join(tmp,'packet'):out;
  if(mode==='build')mkdirSync(destination);
  const source=join(tmp,'canonical.json');
  writeFileSync(source,fmt(canonical.task),{flag:'wx'});
  const packet=JSON.parse(exec('npm',['run','--silent','content-compass','--',
    'run','--provider',args['--provider'],'--task',source],root));
  const packetPath=join(tmp,'model.json');
  writeFileSync(packetPath,fmt(packet),{flag:'wx'});
  const owner=JSON.parse(exec('npm',['run','--silent','content-compass','--',
    'verify','--file',packetPath],root));
  need(owner.status==='CONTENT_SOURCE_VALIDATED'&&owner.receiptSha256===packet.receiptSha256,'NATIVE_VERIFY');
  const report=analyze(packet,canonical),html=htmlReview(packet,report);
  const files={'actual-task.json':canonical.task,'canonical-source.json':canonical.source,
    'original-owner.json':observed,'model-steps.json':packet,
    'evaluation.json':report,'review.html':html};
  for(const [name,value] of Object.entries(files)){
   const bytes=typeof value==='string'?value:fmt(value);
   if(mode==='build')writeFileSync(join(destination,name),bytes,{flag:'wx'});
   else need(readFileSync(join(destination,name),'utf8')===bytes,'REPLAY_TAMPER_'+name);
  }
  if(mode==='verify')need(readdirSync(destination).sort().join('|')===
   Object.keys(files).sort().join('|'),'EXTRA_FILES');
  if(mode==='build')renameSync(destination,out);
  return {status:mode==='build'?'HEADERLESS_COMPASS_HELD':'HEADERLESS_COMPASS_COLD_REPLAY',
   calls:72,realSource:true,model:args['--provider'],
   exactByArm:report.measurements.map(v=>({scenario:v.scenario,arm:v.arm,correct:v.exactSourceOrScenarioAnswers})),
   reportSha256:report.reportSha256,executedCapabilities:0};
 }finally{rmSync(tmp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(fmt(run(process.argv.slice(2))))}
 catch(e){console.error(String(e.message||e).slice(0,1400));process.exitCode=2;}
}
