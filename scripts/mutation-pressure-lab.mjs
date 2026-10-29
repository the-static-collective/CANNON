#!/usr/bin/env node
// INSPAND-006: comparative seven-strategy, three-nested Iron Lung transfer lab.
// All candidates remain proposals. Measures inspectable proxies, not creativity.
// Calls the ORIGINAL pinned Iron Lung CLI; never simulates a pretrained model.
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,renameSync,rmSync,mkdtempSync,readdirSync,existsSync,lstatSync,realpathSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectOriginalLung,inspectLungField,derivePressure} from './lung-reflex-crossing.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const REG=join(ROOT,'registry/mutation-pressure-v1.json');
const sha=x=>createHash('sha256').update(x).digest('hex');
const pretty=x=>JSON.stringify(x,null,2)+'\n';
function hold(x,why){if(!x)throw Error('HOLD_MUTATION_LAB_'+why);}
const tokenSet=x=>new Set((x.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g)||[]).filter(w=>w.length>3));
function runOwner(root,args){
 try{return JSON.parse(execFileSync('npm',['run','--silent','triple-transfer','--',...args],{cwd:root,encoding:'utf8',timeout:480000,maxBuffer:12*1024*1024,stdio:['ignore','pipe','pipe']}));}
 catch(e){throw Error('HOLD_MUTATION_LAB_OWNER_'+String(e.stderr||e.message).slice(0,650));}
}
export function registryCheck(raw=JSON.parse(readFileSync(REG,'utf8'))){
 hold(raw?.schema==='cannon.mutation-pressure-registry/v1'&&raw.owner==='CANNON'
  &&raw.sourceOwner==='the-static-collective/iron-lung'&&raw.authority==='LOCAL_SYNTHETIC_ONLY'
  &&raw.baseline==='BASELINE'&&raw.strategyCount===7&&raw.totalRuns===8
  &&raw.stageCountPerRun===9&&raw.maxModelRequests===72,'REGISTRY');
 const ids=['DA_VINCI','DARWIN','BACH','ESCHER','OCTOPUS','COMBINATRIX','IRON_LUNG'];
 hold(Array.isArray(raw.methods)&&raw.methods.length===7
  &&raw.methods.every((x,i)=>x.id===ids[i]
   &&typeof x.prompt==='string'&&x.prompt.length>25&&x.prompt.length<350
   &&typeof x.criteria==='string'&&x.criteria.length>4),'STRATEGIES');
 const p=raw.boundaries;
 hold(p?.generatedTextCanExecute===false&&p.generatedTextCanApprove===false
  &&p.generatedTextCanChooseRecipe===false&&p.scoresAreNotSemanticQuality===true
  &&p.promoteAutomatically===false&&p.discloseNoImprovement===true
  &&p.measureExecutionCost===true&&p.totalNativeExecutions===0
  &&p.sourceBraidMayNotBeEdited===true,'NO_AUTHORITY');
 return raw;
}
export function branchInput(original,method){
 hold(original?.schema==='iron-lung/triple-transfer-input/v1'
  &&typeof original.rawText==='string'&&original.rawText.length>0
  &&Array.isArray(original.sourceRefs)&&original.sourceRefs.length>0
  &&original.braid?.schema==='iron-lung/braid/v0.1','SOURCE_INPUT');
 const input=structuredClone(original);
 if(method){
  hold(typeof method.id==='string'&&typeof method.prompt==='string','PRESSURE');
  input.rawText=original.rawText.trim()+'\nCANNON proposal pressure '+method.id+
   ': '+method.prompt+'\nThis is a question for exploration, never evidence or permission.';
  input.sourceRefs=[...new Set([...original.sourceRefs,'cannon:mutation-pressure-v1:'+method.id])].sort();
 }else input.sourceRefs=[...new Set(original.sourceRefs)].sort();
 hold(input.rawText.length<=2500&&input.sourceRefs.length<=12,'SOURCE_SIZE');
 hold(JSON.stringify(input.braid)===JSON.stringify(original.braid),'ANCESTOR_UNCHANGED');
 return input;
}
const overlap=(a,b)=>{
 const x=tokenSet(a),y=tokenSet(b);
 if(!x.size)return 0;
 let n=0;for(const t of x)if(y.has(t))n++;
 return Number((n/x.size).toFixed(4));
};
export function proxies(field,sourceText,pressure){
 inspectLungField(field);
 const strings=field.steps.map(s=>s.candidateText.trim());
 const unique=new Set(strings.map(s=>s.toLowerCase()));
 const suspicious=strings.filter(s=>/\b(i (grant|approve|authorize)|permission is (granted|given)|approved by everyone)\b/i.test(s)).length;
 const sourceEchoCount=strings.filter(s=>overlap(s,sourceText)>.7).length;
 const shortCount=strings.filter(s=>tokenSet(s).size<4).length;
 const t={
  schema:'cannon.mutation-proxies/v1',totalSteps:9,
  distinctTextCount:unique.size,exactRepeatCount:9-unique.size,
  sourceEchoCount,lowInformationCount:shortCount,
  approvalLikeTextCount:suspicious,
  literalCapabilityMatches:pressure.matchedItems,
  averageSourceWordCoverage:Number((strings.reduce((n,s)=>n+overlap(s,sourceText),0)/9).toFixed(4)),
  allSignalsAreHeuristics:true,semanticNoveltyVerified:false,
  modelMadeExecutableCompositions:0,humanEvaluated:false
 };
 return t;
}
export function summarize(registryDigest,observed,branchRecords){
 hold(branchRecords.length===8&&branchRecords[0].id==='BASELINE','EIGHT_BRANCHES');
 const baseline=branchRecords[0].proxies;
 const rows=branchRecords.map(r=>({
  id:r.id,fieldSha256:r.fieldSha256,sourceSha256:r.sourceSha256,
  mode:r.mode,distinct:r.proxies.distinctTextCount,repeats:r.proxies.exactRepeatCount,
  echo:r.proxies.sourceEchoCount,short:r.proxies.lowInformationCount,
  literalMatches:r.proxies.literalCapabilityMatches,
  differencesVsBaseline:{distinct:r.proxies.distinctTextCount-baseline.distinctTextCount,
   echo:r.proxies.sourceEchoCount-baseline.sourceEchoCount,
   short:r.proxies.lowInformationCount-baseline.lowInformationCount,
   literalMatches:r.proxies.literalCapabilityMatches-baseline.literalCapabilityMatches}
 }));
 const improve=rows.slice(1).filter(x=>x.differencesVsBaseline.distinct>0||x.differencesVsBaseline.echo<0);
 const body={schema:'cannon.mutation-lab-report/v1',status:'REVIEW_ONLY',
  registrySha256:registryDigest,ironLungOriginalCommit:observed.commit,
  provider:branchRecords[0].provider,baselineId:'BASELINE',
  totalBranches:8,totalNestedTransfers:72,
  totalNativeExecutions:0,modelAddedCapabilities:0,
  improvesAnyLexicalProxyCount:improve.length,
  noSemanticQualityClaim:true,noAutoWinner:true,noAutoExecution:true,
  noOwnerRightsGranted:true,modelsDoNotSelect:true,operatorReviewRequired:true,
  rows};
 return {...body,reportSha256:sha(pretty(body))};
}
function parse(args){
 const [mode,...rest]=args;hold(['list','build','verify'].includes(mode)&&rest.length%2===0,'USAGE');
 const o={};
 for(let i=0;i<rest.length;i+=2){
  const k=rest[i],v=rest[i+1];
  hold(['--lung','--provider','--source','--out','--authorize'].includes(k)&&v&&!Object.hasOwn(o,k),'FLAG');o[k]=v;
 }
 if(mode==='list')hold(Object.keys(o).length===0,'LIST_READ_ONLY');
 else{
  for(const k of ['--lung','--provider','--source','--out'])hold(o[k],'REQUIRED_'+k);
  hold(['fixture','flan'].includes(o['--provider']),'PROVIDER');
  hold(mode==='build'?o['--authorize']==='SYNTHETIC_TEST_ONLY':!o['--authorize'],'AUTHORIZATION');
 }
 return {mode,o};
}
function safeDir(path){
 const abs=resolve(path);hold(existsSync(abs)&&lstatSync(abs).isDirectory()&&!lstatSync(abs).isSymbolicLink(),'DIRECTORY');
 return realpathSync(abs);
}
export function run(args){
 const {mode,o}=parse(args);
 const registry=registryCheck();
 const registryDigest=sha(readFileSync(REG));
 if(mode==='list')return {schema:'cannon.mutation-list/v1',
  modes:['baseline',...registry.methods.map(x=>x.id)],totalNestedTransfers:72,
  modelSource:'ORIGINAL_IRON_LUNG',buildAuthorization:'SYNTHETIC_TEST_ONLY',
  authority:'NONE'};
 const observed=inspectOriginalLung(o['--lung']);
 const lung=safeDir(o['--lung']);
 const sourcePath=resolve(o['--source']);
 hold(existsSync(sourcePath)&&lstatSync(sourcePath).isFile()&&!lstatSync(sourcePath).isSymbolicLink(),'INPUT_FILE');
 const original=JSON.parse(readFileSync(sourcePath,'utf8'));
 const out=resolve(o['--out']),parent=safeDir(dirname(out));
 hold(out===join(parent,basename(out)),'OUT');
 hold(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUT_STATE');
 const tmp=mkdtempSync(join(parent,'.mutation-lab-'));
 try{
  const destination=mode==='build'?join(tmp,'packet'):out;
  if(mode==='build')mkdirSync(destination);
  const branches=[{id:'BASELINE',prompt:null},...registry.methods.map(x=>({id:x.id,prompt:x}))];
  const records=[];
  for(const branch of branches){
   const input=branchInput(original,branch.prompt);
   const folder=join(destination,'runs',branch.id);
   if(mode==='build')mkdirSync(folder,{recursive:true});
   const inputPath=join(tmp,'input-'+branch.id+'.json');
   writeFileSync(inputPath,pretty(input),{flag:'wx'});
   const field=runOwner(lung,['--provider',o['--provider'],'--source',inputPath,'--depth','3']);
   inspectLungField(field);
   const ownerFile=join(tmp,'field-'+branch.id+'.json');
   writeFileSync(ownerFile,pretty(field),{flag:'wx'});
   const originalVerdict=runOwner(lung,['--verify',ownerFile]);
   hold(originalVerdict.fieldSha256===field.fieldSha256&&originalVerdict.steps===9,'OWNER_VERIFY');
   const pressure=derivePressure(field);
   const signals=proxies(field,input.rawText,pressure);
   const record={schema:'cannon.mutation-branch/v1',id:branch.id,mode:branch.prompt?.criteria||'unmodified baseline',
    provider:field.provider,sourceSha256:field.source.rawTextSha256,fieldSha256:field.fieldSha256,
    pressureSha256:pressure.pressureSha256,proxies:signals,
    authority:'NONE',promoted:false};
   records.push(record);
   const files={'input.json':input,'field.json':field,'pressure.json':pressure,'metrics.json':record};
   if(mode==='verify')hold(readdirSync(folder).sort().join('|')===
    Object.keys(files).sort().join('|'),'RUN_EXTRA_FILES');
   for(const [name,obj] of Object.entries(files)){
    if(mode==='build')writeFileSync(join(folder,name),pretty(obj),{flag:'wx'});
    else hold(readFileSync(join(folder,name),'utf8')===pretty(obj),'TAMPER_'+branch.id+'_'+name);
   }
  }
  const report=summarize(registryDigest,observed,records);
  const metadata={schema:'cannon.mutation-lab-metadata/v1',registry,originalSource:observed,
   reportSha256:report.reportSha256,operatorAuthorization:'SYNTHETIC_TEST_ONLY',
   originalInputSha256:sha(pretty(original)),modelOutputDoesNotAuthorize:true,
   nativeCapabilityAdded:false};
  if(mode==='verify')hold(readdirSync(destination).sort().join('|')===
   ['runs','report.json','metadata.json'].sort().join('|'),'ROOT_EXTRA_FILES');
  for(const [name,obj] of Object.entries({'report.json':report,'metadata.json':metadata})){
   if(mode==='build')writeFileSync(join(destination,name),pretty(obj),{flag:'wx'});
   else hold(readFileSync(join(destination,name),'utf8')===pretty(obj),'TAMPER_'+name);
  }
  if(mode==='verify')hold(readdirSync(join(destination,'runs')).sort().join('|')===
    branches.map(b=>b.id).sort().join('|'),'EXTRA_STRATEGY');
  if(mode==='build')renameSync(destination,out);
  return {status:mode==='build'?'EIGHT_BRANCHES_EXECUTED_HELD':'COLD_REPLAY_VERIFIED',
   provider:o['--provider'],sourceCommit:observed.commit,branches:8,nestedCalls:72,
   lexicalProxyImprovements:report.improvesAnyLexicalProxyCount,
   reportSha256:report.reportSha256,realWorldActions:0};
 }finally{rmSync(tmp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(pretty(run(process.argv.slice(2))))}
 catch(e){console.error(String(e.message||e).slice(0,1600));process.exitCode=2}
}
