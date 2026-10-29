#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,realpathSync,readdirSync,mkdirSync,lstatSync,renameSync,rmSync,mkdtempSync} from 'node:fs';
import {join,resolve,relative,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const BASE=resolve(import.meta.dirname,'..');
const SELECTION=JSON.parse(readFileSync(join(BASE,'creative/phono-live-selection.json')));
const hold=(ok,name)=>{if(!ok)throw Error('HOLD / REFUSE: '+name)};
const sha=buf=>'sha256:'+createHash('sha256').update(buf).digest('hex');
const json=x=>JSON.stringify(x,null,2)+'\n';
const exec=(bin,args,opts={})=>execFileSync(bin,args,{encoding:'utf8',timeout:120000,stdio:['ignore','pipe','pipe'],...opts}).trim();
function sourceRoot(name,where){
 const spec=SELECTION.owners[name];hold(where&&existsSync(where),'MISSING_SOURCE_'+name);
 const root=realpathSync(where);
 hold(exec('git',['-C',root,'rev-parse','HEAD'])===spec.commit,'WRONG_SHA_'+name);
 const remote=exec('git',['-C',root,'remote','get-url','origin']);
 hold(remote.endsWith('/'+spec.repository+'.git')||remote.endsWith('/'+spec.repository)||remote.endsWith(':'+spec.repository+'.git'),'WRONG_ORIGIN_'+name);
 hold(exec('git',['-C',root,'status','--porcelain','--untracked-files=all'])==='','SOURCE_NOT_CLEAN_'+name);
 return root;
}
const load=async(root,path)=>import(pathToFileURL(join(root,path)).href);
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
async function compose(roots,tmp){
 const phono=sourceRoot('phonograph',roots.phonograph),live=sourceRoot('staticlive',roots.staticlive);
 const src=await load(phono,'src/source.mjs'),obs=await load(phono,'src/observations.mjs'),
 scoreMod=await load(phono,'src/score.mjs'),mutation=await load(phono,'src/mutation.mjs'),
 performanceMod=await load(phono,'src/performance.mjs'),hashMod=await load(phono,'src/provenance.mjs'),
 specimen=await load(phono,'src/run-specimen.mjs'),intake=await load(live,'src/phonograph-intake.js'),
 stageMod=await load(live,'src/compiler.js'),stageRender=await load(live,'src/render-stage-aids.js');
 const fixture='test/fixtures/specimen-001',seed='seed-001';
 const source=await src.identifySource(join(phono,fixture+'.wav'));
 const observations=obs.admitObservations({source,declaration:readJson(join(phono,fixture+'.observations.json'))});
 const score=scoreMod.buildScore({source,observations});
 const mutationResult=mutation.mutateScore({score,seed});
 const performance=performanceMod.resolvePerformance({score,observations,mutationResult});
 const result=await specimen.runSpecimen({sourcePath:join(phono,fixture+'.wav'),observationsPath:join(phono,fixture+'.observations.json'),outputStem:join(tmp,'native-phonograph'),seed});
 hold(result.receipt?.schema==='haunted-phonograph/receipt/v1'&&result.receipt.status==='completed','PHONOGRAPH_NATIVE');
 hold(hashMod.hashCanonical(performance)===result.receipt.resolvedPerformanceHash,'PHONOGRAPH_PERFORMANCE_ANCESTRY');
 const midi=readFileSync(result.midiPath);
 hold(sha(midi)===result.receipt.midi.sha256,'MIDI_NATIVE_BYTES_MISMATCH');
 const liveIntent=readJson(join(live,'fixtures/phono-live-001/live-intent.json'));
 const brokenIntent=readJson(join(live,'fixtures/phono-live-001/live-intent-broken.json'));
 const original=intake.intakePhonographPerformance({performance,phonographReceipt:result.receipt,liveIntent});
 const broken=intake.intakePhonographPerformance({performance,phonographReceipt:result.receipt,liveIntent:brokenIntent});
 const projections={},aids={};
 for(const id of ['pl2','pl0','broken']){
  const config=readJson(join(live,'fixtures/phono-live-001/configurations/'+id+'.json'));
  const crossing=id==='broken'?broken:original;
  const projection=stageMod.compileStageProjection(crossing.packet,config);
  projections[id]=projection;
  aids['stage/'+id+'/setlist.md']=stageRender.renderSetlist(projection);
  aids['stage/'+id+'/routing.md']=stageRender.renderRouting(projection);
 }
 hold(projections.pl2.playable===true&&projections.pl0.playable===true,'LIVE_FALLBACK_COVERAGE');
 hold(projections.broken.playable===false&&projections.broken.unresolvedCapabilities.length>0,'MISSING_HUMAN_FAIL_CLOSED');
 const nativeFiles={
  'phonograph/receipt.json':json(result.receipt),'phonograph/resolved-performance.json':json(performance),
  'phonograph/midi.base64.txt':midi.toString('base64')+'\n',
  'static-live/crossing-receipt.json':json(original.crossingReceipt),
  'static-live/performance-packet.json':json(original.packet),
  ...Object.fromEntries(Object.entries(projections).map(([k,v])=>['static-live/'+k+'-projection.json',json(v)])),
  ...aids,
  'selection.json':json(SELECTION)
 };
 const body={schema:'cannon.phono-live-receipt/v1',sourceOwners:SELECTION.owners,sourceOnlyFixtures:true,originalNativeOwners:2,originalCrossing:true,pl2Playable:true,pl0FallbackPlayable:true,brokenRefused:true,realPerformers:0,realMediaTransferred:false,humanRightsVerified:false,networkContacts:0,sourceCanonSelected:false,files:Object.fromEntries(Object.entries(nativeFiles).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,sha(Buffer.from(v))]))};
 const receipt={...body,receiptId:sha(Buffer.from(json(body)))};
 nativeFiles['receipt.json']=json(receipt);
 return {nativeFiles,receipt};
}
function byteTree(dir,prefix=''){
 let out={};
 for(const d of readdirSync(dir,{withFileTypes:true})){
  const p=join(dir,d.name),n=prefix+d.name;
  hold(!d.isSymbolicLink(),'PACKET_SYMLINK');
  if(d.isDirectory())Object.assign(out,byteTree(p,n+'/'));
  else{hold(d.isFile(),'PACKET_TYPE');out[n]=readFileSync(p)}
 }return out;
}
function verifyBytes(expected,actual){
 hold(Object.keys(expected).sort().join('|')===Object.keys(actual).sort().join('|'),'PACKET_FILE_SET');
 for(const [path,value] of Object.entries(expected))hold(Buffer.from(value).equals(actual[path]),'PACKET_TAMPER_'+path);
}
async function main(){
 const [cmd,...a]=process.argv.slice(2);hold(['build','verify'].includes(cmd)&&a.length%2===0,'USAGE');
 const o={};for(let i=0;i<a.length;i+=2){hold(['--roots','--out','--authorize'].includes(a[i])&&!Object.hasOwn(o,a[i])&&a[i+1],'FLAGS');o[a[i]]=a[i+1]}
 hold(o['--roots']&&o['--out'],'INPUTS_REQUIRED');
 hold(cmd==='build'?o['--authorize']==='LOCAL_FICTIONAL_ONLY':!o['--authorize'],'AUTHORIZATION_REQUIRED');
 const roots=readJson(resolve(o['--roots']));hold(Object.keys(roots).sort().join(',')==='phonograph,staticlive','ROOTS_ALLOWLIST');
 const out=resolve(o['--out']),parent=realpathSync(dirname(out));
 hold(join(parent,out.split('/').at(-1))===out,'SYMLINK_PARENT');
 for(const p of Object.values(roots)){const r=relative(realpathSync(p),out);hold(r!==''&&(r==='..'||r.startsWith('../')),'OUTPUT_INSIDE_DONOR')}
 hold(cmd==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()&&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 const tmp=mkdtempSync(join(parent,'.phono-live-'));
 try{
  const {nativeFiles,receipt}=await compose(roots,tmp);
  if(cmd==='verify')verifyBytes(nativeFiles,byteTree(out));
  else{
   for(const [p,v] of Object.entries(nativeFiles)){const target=join(tmp,'packet',p);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,v,{flag:'wx'})}
   renameSync(join(tmp,'packet'),out);
  }
  console.log(json({status:cmd==='build'?'ORIGINAL_PHONOGRAPH_TO_STATIC_LIVE_EXECUTED':'COLD_NATIVE_RECOMPUTED',receiptId:receipt.receiptId,brokenRefused:true,fieldVerified:false}));
 }finally{rmSync(tmp,{recursive:true,force:true})}
}
try{await main()}catch(e){console.error('HOLD / REFUSE:',String(e.stderr||e.message).slice(0,700));process.exitCode=2}
