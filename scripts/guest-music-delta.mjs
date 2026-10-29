#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const hash=v=>'sha256:'+createHash('sha256').update(v).digest('hex');
async function main(){
 const a=process.argv.slice(2);
 if(a.length!==4||a[0]!=='--sources'||a[2]!=='--out')throw Error('HOLD_FLAGS');
 const roots=JSON.parse(readFileSync(resolve(a[1]),'utf8')),out=resolve(a[3]);
 if(Object.keys(roots).length!==22||existsSync(out))throw Error('HOLD_SOURCE_OR_OUTPUT');
 mkdirSync(out);
 const phonograph=resolve(roots['guest-07']),dogram=resolve(roots['guest-03']);
 const originalAudio=join(phonograph,'test/fixtures/specimen-001.wav');
 const observed=join(phonograph,'test/fixtures/specimen-001.observations.json');
 const receipts=[];
 for(const [name,seed] of [['cowboy','maddclown-cowboy-003'],['ghost','maddclown-ghost-003']]){
  const stem=join(out,name);
  const args=[join(phonograph,'scripts/run-specimen-001.mjs'),originalAudio,observed,stem,seed];
  execFileSync(process.execPath,args,{cwd:phonograph,timeout:120000});
  const receipt=JSON.parse(readFileSync(stem+'.receipt.json','utf8'));
  if(receipt.schema!=='haunted-phonograph/receipt/v1'||receipt.status!=='completed')throw Error('HOLD_PHONOGRAPH_RECEIPT');
  receipts.push(receipt);
 }
 const {buildDogramDeltaSpecimen}=await import(pathToFileURL(join(phonograph,'src/dogram-trace.mjs')).href);
 const specimen=buildDogramDeltaSpecimen({
  specimenId:'maddclown-two-music-paths-003',leftReceipt:receipts[0],rightReceipt:receipts[1]
 });
 const specimenPath=join(out,'music-delta.specimen.json');
 writeFileSync(specimenPath,JSON.stringify(specimen,null,2)+'\n');
 const output=execFileSync('python3',['-m','dogram.cli',specimenPath],
  {cwd:dogram,encoding:'utf8',timeout:120000});
 const dogramReceipt=JSON.parse(output);
 if(dogramReceipt.schema!=='dogram.receipt/v0'||dogramReceipt.status!=='OK')
  throw Error('HOLD_NATIVE_DOGRAM_CALCULATION');
 writeFileSync(join(out,'dogram.receipt.json'),output);
 const body={
  schema:'cannon.music-delta-crossing/v1',
  phonographCommit:'038b7101ecff781ee2ae17a22a1323ca28740d06',
  dogramCommit:'551b5f9df18f17ec69b452ddcdff01718e0ff771',
  originalAudioFixtureDigest:hash(readFileSync(originalAudio)),
  midiVariants:['cowboy.mid','ghost.mid'].map(file=>({file,digest:hash(readFileSync(join(out,file)))})),
  dogramInputDigest:hash(readFileSync(specimenPath)),
  dogramReceiptDigest:hash(output),
  status:'TWO_NATIVE_SOURCE_OWNERS_EXECUTED',
  interpretation:'MATHEMATICAL_DELTA_ONLY_NO_ARTISTIC_TRUTH',
  publicationAuthorized:false,independentHumanWitness:false,
  externalDispatch:false
 };
 writeFileSync(join(out,'crossing.json'),JSON.stringify({...body,receiptDigest:hash(JSON.stringify(body))},null,2)+'\n');
 return {status:body.status,outputs:body.midiVariants,dogramStatus:dogramReceipt.status};
}
main().then(x=>console.log(JSON.stringify(x))).catch(e=>{console.error('HOLD',String(e.message));process.exitCode=2});
