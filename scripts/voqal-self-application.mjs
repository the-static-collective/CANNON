#!/usr/bin/env node
import {readFileSync,writeFileSync,readdirSync,lstatSync,realpathSync,existsSync,mkdirSync,rmSync} from 'node:fs';
import {resolve,join,relative,isAbsolute,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {composeApplication} from '../src/voqal-self-application.mjs';
const [op,...args]=process.argv.slice(2);
function fail(p,why){if(!p)throw Error('HOLD:'+why)}
function options(argv){
 fail(['build','verify'].includes(op)&&argv.length%2===0,'COMMAND');
 const p={};
 for(let i=0;i<argv.length;i+=2){
  const key=argv[i]?.slice(2);
  fail(['roots','constellation','out','authorize'].includes(key)&&argv[i].startsWith('--')&&!(key in p)&&argv[i+1],'FLAGS');
  p[key]=argv[i+1];
 }
 for(const k of ['roots','constellation','out'])fail(p[k],'MISSING_'+k);
 fail(op==='build'?p.authorize==='LOCAL_DRAFT_ONLY':p.authorize===undefined,'AUTHORIZATION_SCOPE');
 return p;
}
function verifyOriginal(roots,source){
 const actual=execFileSync(process.execPath,[resolve('scripts/constellation.mjs'),'verify','--roots',roots,'--out',source],{
  cwd:resolve(new URL('../',import.meta.url).pathname),encoding:'utf8',timeout:180000,maxBuffer:1024*1024,
  stdio:['ignore','pipe','pipe']});
 const v=JSON.parse(actual);
 fail(v.status==='FRESH_PROCESS_COLD_REPLAY_VERIFIED'&&v.byteReplay==='ALL_PACKET_BYTES_MATCH'&&v.fieldVerified===false,'CONSTELLATION_COLD_VERIFY');
 return v;
}
function sourceFiles(source){
 const path=realpathSync(resolve(source));
 fail(lstatSync(path).isDirectory(),'SOURCE_NOT_DIRECTORY');
 const manifestBytes=readFileSync(join(path,'manifest.json'));
 const briefBytes=readFileSync(join(path,'voqal-brief.html'));
 return {receipt:JSON.parse(readFileSync(join(path,'receipt.json'),'utf8')),
  manifest:JSON.parse(manifestBytes),brief:briefBytes.toString('utf8'),manifestBytes,briefBytes};
}
try{
 const cfg=options(args),out=resolve(cfg.out),source=resolve(cfg.constellation),roots=resolve(cfg.roots);
 const root=realpathSync(resolve(new URL('../',import.meta.url).pathname));
 fail(out!==source&&out!==root,'OUTPUT_MUST_BE_SEPARATE');
 for(const protectedRoot of [root,source]){
  const rel=relative(protectedRoot,out);
  fail(rel==='..'||rel.startsWith('../')||isAbsolute(rel),'OUTPUT_WITHIN_PROTECTED_TREE');
 }
 verifyOriginal(roots,source);
 const obj=sourceFiles(source);
 const built=composeApplication(obj.receipt,obj.manifest,obj.brief,obj.manifestBytes,obj.briefBytes);
 if(op==='build'){
  fail(!existsSync(out),'OUTPUT_ALREADY_EXISTS');
  mkdirSync(out,{mode:0o700});
  try{for(const [name,bytes] of Object.entries(built.outputs))
    writeFileSync(join(out,name),bytes,{flag:'wx',mode:0o600});}
  catch(e){rmSync(out,{recursive:true,force:true});throw e;}
  console.log(JSON.stringify({status:'DRAFT_PREPARED_NOT_SUBMITTED',files:Object.keys(built.outputs),source:obj.receipt.receiptId},null,2));
 }else{
  fail(realpathSync(out)===out&&lstatSync(out).isDirectory(),'OUTPUT_FOLDER_INVALID');
  fail(readdirSync(out).sort().join('|')===Object.keys(built.outputs).sort().join('|'),'OUTPUT_SET_CHANGED');
  for(const [name,bytes] of Object.entries(built.outputs))
   fail(lstatSync(join(out,name)).isFile()&&
    readFileSync(join(out,name)).equals(Buffer.from(bytes)),'OUTPUT_TAMPERED_'+name);
  console.log(JSON.stringify({status:'SELF_APPLICATION_COLD_VERIFIED_NOT_SUBMITTED',files:Object.keys(built.outputs).length,
   source:obj.receipt.receiptId,externalSubmissions:0,applicantApproved:false},null,2));
 }
}catch(e){console.error('HOLD:',String(e.stderr||e.message).slice(0,1000));process.exitCode=2;}
