#!/usr/bin/env node
import {readFileSync,writeFileSync,existsSync,lstatSync,realpathSync,readdirSync,mkdirSync,mkdtempSync,rmSync,renameSync} from 'node:fs';
import {resolve,join,dirname,relative} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const ROOT=resolve(import.meta.dirname,'..'),SELECTION=JSON.parse(readFileSync(join(ROOT,'creative/room-vinyl-sources.json'),'utf8'));
const FIXTURE=join(ROOT,'creative/cannon-room-synthetic.json');
const json=x=>JSON.stringify(x,null,2)+'\n',hash=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const hold=(ok,code)=>{if(!ok)throw Error('HOLD / REFUSE: '+code)};
const run=(bin,args,opts={})=>execFileSync(bin,args,{encoding:'utf8',timeout:120000,maxBuffer:5*1024*1024,stdio:['ignore','pipe','pipe'],...opts}).trim();
function donor(key,path){
 const s=SELECTION.nativeOwners[key];
 hold(path&&existsSync(path),'MISSING_'+key);
 const real=realpathSync(path);
 hold(run('git',['-C',real,'rev-parse','HEAD'])===s.commit,'COMMIT_CHANGED_'+key);
 const url=run('git',['-C',real,'remote','get-url','origin']);
 hold(url.endsWith('/'+s.repository)||url.endsWith('/'+s.repository+'.git')||url.endsWith(':'+s.repository+'.git'),'OWNER_CHANGED_'+key);
 const dirty=run('git',['-C',real,'status','--porcelain','--untracked-files=all']).split('\n').filter(Boolean);
 hold(dirty.every(x=>x.startsWith('?? node_modules/')),'DIRTY_SOURCE_'+key);
 return real;
}
function readOutput(root,prefix=''){
 const out={};for(const x of readdirSync(root,{withFileTypes:true})){
  const file=join(root,x.name),name=prefix+x.name;
  hold(!x.isSymbolicLink(),'SYMLINK_OUTPUT');
  if(x.isDirectory())Object.assign(out,readOutput(file,name+'/'));
  else{hold(x.isFile(),'INVALID_OUTPUT_TYPE');out[name]=readFileSync(file)}
 }return out;
}
function verifyBytes(expected,actual){
 hold(Object.keys(expected).sort().join('|')===Object.keys(actual).sort().join('|'),'PACKET_FILE_SET');
 for(const [k,v]of Object.entries(expected))hold(Buffer.from(v).equals(actual[k]),'PACKET_TAMPER_'+k);
}
function accumulate(files,dir,prefix){for(const [k,v]of Object.entries(readOutput(dir)))files[prefix+k]=v}
function create(roots,temp){
 const band=donor('band',roots.band),lemon=donor('lemonpress',roots.lemonpress);
 const bandReview=join(temp,'band-review.json');
 run(process.execPath,['-r','ts-node/register','scripts/room-review.ts',FIXTURE,bandReview],{cwd:band});
 const b=JSON.parse(readFileSync(bandReview));
 hold(b.schema==='band-runtime/room-encounter-review/v1'&&b.status==='SYNTHETIC_WITNESS_ONLY'&&b.semanticInputs===0&&b.actualRoomWrites===0&&b.published===false&&b.sourceAuthenticated===false,'BAND_NON_SEMANTIC_GATE');
 const vinylDir=join(temp,'lemon-physical');
 run(process.execPath,[join(lemon,'scripts/vinyl-preflight.mjs'),'build','--edition',join(lemon,'works/other-peoples-fire/press-000/edition.json'),'--room',bandReview,'--out',vinylDir,'--authorize','LOCAL_DRAFT_ONLY'],{cwd:lemon});
 const p=JSON.parse(readFileSync(join(vinylDir,'proof.json')));
 hold(p.state==='HOLD_NOT_ORDERABLE'&&p.safety?.manufactureAuthorized===false&&p.safety?.audioBytesPresent===false,'VINYL_HOLD_REQUIRED');
 const files={'band-review.json':readFileSync(bandReview),'room-input.json':readFileSync(FIXTURE),'source-selection.json':Buffer.from(json(SELECTION))};
 accumulate(files,vinylDir,'lemonpress/');
 const body={schema:'cannon.room-vinyl-receipt/v1',sourceCommits:Object.fromEntries(Object.entries(SELECTION.nativeOwners).map(([k,v])=>[k,v.commit])),
 originalNativeOwners:2,crossing:'BAND_RUNTIME_REVIEW_TO_LEMONPRESS_PREFLIGHT',roomSource:'CANNON_LOCAL_SYNTHETIC_UNVERIFIED',
 privateRoomExecuted:false,roomParticipants:0,rightsVerified:false,artistCopiesSent:0,pressingOrders:0,fieldVerified:false,
 proofStatus:'HOLD_NOT_ORDERABLE',files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,hash(v)]))};
 const receipt={...body,receiptId:hash(json(body))};files['receipt.json']=Buffer.from(json(receipt));
 return {files,receipt};
}
try{
 const [mode,...args]=process.argv.slice(2);
 hold(['build','verify'].includes(mode)&&args.length%2===0,'USAGE');
 const opts={};for(let i=0;i<args.length;i+=2){hold(['--roots','--out','--authorize'].includes(args[i])&&!Object.hasOwn(opts,args[i])&&args[i+1],'FLAGS');opts[args[i]]=args[i+1]}
 hold(opts['--roots']&&opts['--out'],'MISSING_ROOTS_OR_OUTPUT');
 hold(mode==='build'?opts['--authorize']==='LOCAL_FICTIONAL_ONLY':!opts['--authorize'],'AUTHORIZATION');
 const roots=JSON.parse(readFileSync(resolve(opts['--roots']),'utf8'));
 hold(Object.keys(roots).sort().join(',')==='band,lemonpress','ROOT_ALLOWLIST');
 const out=resolve(opts['--out']),parent=realpathSync(dirname(out));
 hold(join(parent,out.split('/').at(-1))===out,'PARENT_SYMLINK');
 for(const p of Object.values(roots)){const rel=relative(realpathSync(p),out);hold(rel!==''&&(rel==='..'||rel.startsWith('../')||rel.startsWith('..\\')),'OUTPUT_INSIDE_DONOR')}
 hold(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()&&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 const tmp=mkdtempSync(join(parent,'.room-vinyl-'));
 try{
  const {files,receipt}=create(roots,tmp);
  if(mode==='verify')verifyBytes(files,readOutput(out));
  else{
   const dest=join(tmp,'packet');
   for(const [name,bytes] of Object.entries(files)){const path=join(dest,name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,bytes,{flag:'wx'})}
   renameSync(dest,out);
  }
  console.log(json({status:mode==='build'?'TWO_NATIVE_SOURCE_OWNERS_EXECUTED':'INDEPENDENT_PROCESS_REPLAY_VERIFIED',receiptId:receipt.receiptId,privateRoomContacted:false,pressingOrders:0,fieldVerified:false}));
 }finally{rmSync(tmp,{recursive:true,force:true})}
}catch(e){console.error(String(e.stderr||e.message).slice(0,2000));process.exitCode=2}
