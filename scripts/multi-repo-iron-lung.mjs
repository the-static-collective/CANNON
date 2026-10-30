#!/usr/bin/env node
/** INSPAND-013-B: speculative original Iron Lung answers to original NT
 * questions from the five-owner field. Never calls model text an adapter.
 * The original Iron Lung synthetic braid is only a transfer fixture; it does
 * not constitute ancestry of the separately inspected software owners.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,renameSync,rmSync,existsSync,lstatSync,realpathSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const LOCK=JSON.parse(readFileSync(join(ROOT,'registry/iron-lung-investigation-source-lock-v1.json'),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const j=x=>JSON.stringify(x,null,2)+'\n';
function hold(x,why){if(!x)throw Error('HOLD_MULTI_LUNG_'+why);}
function directory(x){
 const p=resolve(x);hold(existsSync(p)&&lstatSync(p).isDirectory()&&!lstatSync(p).isSymbolicLink(),'DIRECTORY');
 return realpathSync(p);
}
function exec(bin,args,opts={}){
 try{return execFileSync(bin,args,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],
  timeout:600000,maxBuffer:12*1024*1024,...opts}).trim();}
 catch(e){throw Error('HOLD_MULTI_LUNG_ORIGINAL_'+String(e.stderr||e.message).slice(0,500));}
}
function git(root,...args){return exec('git',['--no-replace-objects','-C',root,...args]);}
function original(root){
 const path=directory(root);
 hold(git(path,'rev-parse','HEAD')===LOCK.commit
  &&git(path,'remote','get-url','origin').replace(/\.git$/,'')==='https://github.com/'+LOCK.owner,'OWNER');
 hold(git(path,'status','--porcelain','--untracked-files=normal').split('\n')
   .filter(Boolean).every(x=>x==='?? node_modules/'),'ORIGINAL_DIRTY');
 for(const [file,blob] of Object.entries(LOCK.files)){
  const data=readFileSync(join(path,file));
  hold(realpathSync(join(path,file))===join(path,file)
   &&git(path,'rev-parse','HEAD:'+file)===blob
   &&createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex')===blob,
   'ORIGINAL_BLOB_'+file);
 }
 return path;
}
const FOCUS=['PLAYDECK_TO_TOASTER','TOASTER_TO_LEMONPRESS'];
function parse(args){
 const [mode,...flags]=args;
 hold(['build','verify'].includes(mode)&&flags.length%2===0,'USAGE');
 const o={};for(let k=0;k<flags.length;k+=2){
  const a=flags[k],v=flags[k+1];
  hold(['--lung','--field','--out','--provider','--authorize'].includes(a)
    &&v&&!Object.hasOwn(o,a),'FLAGS');o[a]=v;
 }
 for(const key of ['--lung','--field','--out','--provider'])hold(o[key],'REQUIRED_'+key);
 hold(['fixture','flan'].includes(o['--provider']),'MODEL');
 hold(mode==='build'?o['--authorize']==='SYNTHETIC_TEST_ONLY':!o['--authorize'],'AUTHORIZE');
 return {mode,o};
}
function seeds(field,provider,lung){
 const records=field.entries;
 hold(field.schema==='cannon.interface-question-field/v1'&&records?.length===6,'FIELD');
 const chosen=provider==='flan'?records.filter(e=>FOCUS.includes(e.id)):records;
 hold(chosen.length===(provider==='flan'?2:6),'CHOICES');
 const originalFixture=JSON.parse(readFileSync(join(lung,'fixtures/triple-transfer-input-v1.json')));
 hold(originalFixture.schema==='iron-lung/triple-transfer-input/v1','ORIGINAL_FIXTURE');
 return chosen.map(entry=>{
  const expected=sha(JSON.stringify(entry.question));
  hold(expected===entry.questionSha256&&entry.status==='UNANSWERED_HELD'
   &&entry.question.aperture.id===(entry.knownNative?'chronology':'source-object')
   &&!Object.hasOwn(entry.question,'answer'),'QUESTION_ONLY');
  const source={
   schema:'iron-lung/triple-transfer-input/v1',braid:originalFixture.braid,
   rawText:'Original National Treasure asks: '+entry.question.question+
    '\nSource statuses: '+entry.sourceCase+'; '+entry.kind+
    '. Explore possible tests only. Nothing is approved.',
   sourceRefs:['national-treasure:sha256:'+entry.questionSha256,
    'cannon:interface-field:'+entry.id,'synthetic-iron-lung-braid-not-owner-ancestry']
  };
  return {edgeId:entry.id,questionSha256:entry.questionSha256,source,
   sourceSha256:sha(j(source))};
 });
}
export function inspectModelField(field){
 hold(field?.schema==='iron-lung/triple-transfer-field/v1'
  &&field.depth===3&&field.steps?.length===9
  &&field.authority==='NONE'&&field.admittedCandidateId===null
  &&field.descendantBraidId===null&&field.status==='LUNG_POSSIBILITY_ONLY','NO_PROMOTION');
 hold(field.steps.every(s=>s.status==='PROPOSAL_UNVERIFIED'
  &&s.actualAuthority==='NONE'&&!s.heartBeat&&!s.evidenceMinted
  &&!s.lineageRewritten&&!s.humanKeep),'STEP_NO_AUTHORITY');
 return true;
}
export function run(argv){
 const {mode,o}=parse(argv),lung=original(o['--lung']);
 const records=JSON.parse(readFileSync(resolve(o['--field']),'utf8'));
 const items=seeds(records,o['--provider'],lung);
 const out=resolve(o['--out']),parent=directory(dirname(out));
 hold(join(parent,basename(out))===out,'OUT_PATH');
 hold(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUT_STATE');
 const temp=mkdtempSync(join(parent,'.model-field-'));
 try{
  const result=items.map((item)=>{
   const path=join(temp,item.edgeId+'.json');
   writeFileSync(path,j(item.source),{flag:'wx'});
   const content=exec('npm',['run','--silent','triple-transfer','--','--provider',
     o['--provider'],'--source',path,'--depth','3'],{cwd:lung});
   const model=JSON.parse(content);
   inspectModelField(model);
   const modelFile=join(temp,item.edgeId+'-model.json');
   writeFileSync(modelFile,j(model),{flag:'wx'});
   const checked=JSON.parse(exec('npm',['run','--silent','triple-transfer','--',
    '--verify',modelFile],{cwd:lung}));
   hold(checked.status==='TRIPLE_COLD_PACKET_VERIFIED'
    &&checked.fieldSha256===model.fieldSha256,'OWNER_MODEL_CHECK');
   return {edgeId:item.edgeId,questionSha256:item.questionSha256,
    inputSha256:item.sourceSha256,model,
    modelSha256:sha(j(model)),humanKeep:false,authority:'NONE'};
  });
  const core={schema:'cannon.multi-interface-model-lab/v1',
   mode:o['--provider'],originalOwner:LOCK.owner,originalCommit:LOCK.commit,
   speculativeBraid:'ORIGINAL_IRON_LUNG_SYNTHETIC_FIXTURE_NOT_REAL_OWNER_ANCESTRY',
   selectedEdges:result.map(x=>x.edgeId),
   modelCalls:result.length*9,
   sourceQuestionDigests:result.map(x=>x.questionSha256),
   results:result,
   evidenceAdmitted:0,adapterSourceAdded:0,modelChosenExecution:false,
   automaticallyAdvancedQuestions:false,realWorldActions:0};
  const report={...core,reportSha256:sha(j(core))};
  const dest=mode==='build'?join(temp,'packet'):out;
  if(mode==='build')mkdirSync(dest);
  const bytes=j(report);
  if(mode==='build')writeFileSync(join(dest,'model-field.json'),bytes,{flag:'wx'});
  else hold(readFileSync(join(dest,'model-field.json'),'utf8')===bytes,'COLD_REPLAY');
  if(mode==='build')renameSync(dest,out);
  return {status:mode==='build'?'HELD_MULTI_OWNER_MODEL_EXPLORATION':'MULTI_OWNER_MODEL_REPLAY',
    model:o['--provider'],edges:result.length,calls:result.length*9,
    newExecutableAdapters:0,reportSha256:report.reportSha256};
 }finally{rmSync(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(j(run(process.argv.slice(2))))}
 catch(e){console.error(String(e.message||e).slice(0,1100));process.exitCode=2;}
}
