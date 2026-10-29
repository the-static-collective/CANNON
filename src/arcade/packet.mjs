import {readFileSync,writeFileSync,readdirSync,mkdirSync,existsSync,lstatSync,realpathSync,rmSync} from 'node:fs';
import {join,resolve,dirname,relative,isAbsolute,sep} from 'node:path';
import {ROOT,SELECTION,hash,json,requireThat} from '../constellation/sources.mjs';
import {composePacket as inheritedPacket,GATES} from '../constellation/packet.mjs';
import {makePacket as researchPacket} from '../../scripts/stranger-source-lab.mjs';
import {ATLAS,NATIVE,verifyInputs} from './sources.mjs';
import {nativeModules,sourceCatalog} from './native.mjs';
import {composeScene} from './pipeline.mjs';
import {challenge,validateChallenge,MISSIONS} from './contracts.mjs';
import {renderDesk,renderPassport,renderScene,renderMap} from './view.mjs';
export async function prepare(config){
 const witnesses=verifyInputs(config);const native=await nativeModules(config);
 const [catalog,inherited]=await Promise.all([sourceCatalog(witnesses.documents,native),inheritedPacket(config.inheritedRoots)]);
 const researchFiles=researchPacket(ATLAS,witnesses.roots),research=JSON.parse(researchFiles['stations.json']);
 requireThat(inherited.receipt.sourceRepositories===9,'NINE_INHERITED_NATIVE_OWNERS_REQUIRED');
 return {witnesses,native,catalog,inherited,researchFiles,research};
}
function addScenes(files,scene,prefix){
 files[prefix+'.json']=json(scene);files[prefix+'.html']=renderScene(scene);
 for(const [id,value] of Object.entries(scene.execution.results))files[prefix+'-stages/'+id+'.json']=json(value);
}
export async function composeMachine(config){
 const p=await prepare(config),scenes={};
 // Genuine fan-out: all five branches share exact native source intake and
 // original nine-owner material; each branch executes native transforms.
 await Promise.all(MISSIONS.map(async mission=>{scenes[mission]=await composeScene(p.native,p.catalog,p.research,p.inherited,challenge(mission))}));
 const ordered=Object.fromEntries(MISSIONS.map(m=>[m,scenes[m]]));
 const witnesses=p.witnesses;
 const nativeSources={...Object.fromEntries(Object.entries(SELECTION.sources).map(([k,v])=>['inherited-'+k,v])),...NATIVE.sources};
 const owners=[...new Set(Object.values(nativeSources).map(s=>s.repository))].sort();
 const executedIds=[...new Set(Object.values(ordered).flatMap(s=>s.evidence.nativeOwnersInvoked))].sort();
 requireThat(executedIds.join()===Object.keys(NATIVE.sources).sort().join(),'NATIVE_EXECUTION_COVERAGE_MISMATCH');
 const implementationPaths=[...readdirSync(join(ROOT,'src/arcade')).filter(p=>/\.(mjs|py)$/.test(p)).map(p=>'src/arcade/'+p),'scripts/arcade-machine.mjs','constellation/native-002.json','constellation/arcade-packages.json'].sort();
 const implementation={files:Object.fromEntries(implementationPaths.map(p=>[p,hash(readFileSync(join(ROOT,p)))]))};implementation.digest=hash(json(implementation.files));
 const manifest={schema:'arcade.manifest/v1',implementation,baseHead:NATIVE.baseHead,ancestry:[{pr:47,commit:NATIVE.baseHead},{pr:45,commit:'32979819f5bf7e35dcb19d30fc8ffdeb8c81ccb1'},...SELECTION.ancestry],coverage:{verifiedSourceRepositories:p.catalog.records.length,executingNativeDonorRepositories:owners.length,nativeCheckouts:Object.keys(nativeSources).length,cannonAdditional:true,totalParticipatingDistinctPublicRepositories:new Set([...owners,...p.catalog.records.map(x=>x.repository)]).size,fieldWitnesses:0},nativeSources,sourceWitnesses:{inherited:witnesses.inherited,native:witnesses.native},runtimePackages:witnesses.packages,documentPins:p.catalog.records.map(r=>({repository:r.repository,commit:r.commit,tree:r.tree,path:r.path,sha256:r.sourceSha256,blob:r.sourceWitness.blob})),boundaries:{authority:'LOCAL_FICTIONAL_SOFTWARE_ONLY',fieldVerified:false,externalContacts:0,physicalActs:0,privateSourcesExported:0}};
 const files={};
 for(const [name,bytes] of Object.entries(p.inherited.files))files['native-001/'+name]=bytes;
 for(const [name,bytes] of Object.entries(p.researchFiles))files['research/'+name]=bytes;
 files['source-catalog.json']=json(p.catalog);files['manifest.json']=json(manifest);
 for(const [mission,scene] of Object.entries(ordered))addScenes(files,scene,'scenes/'+mission);
 const report={schema:'arcade.proof-report/v1',nativeOwners:owners,documentaryOwners:p.catalog.records.map(x=>x.repository),sourceEvidenceNotRuntimeCount:p.catalog.records.length,executedNativeDonorOwners:owners.length,oldNativeReceipt:p.inherited.receipt.receiptId,stagesPerScene:Object.fromEntries(Object.entries(ordered).map(([k,s])=>[k,s.execution.stages.length])),runtimeMethod:'Exact original sources imported via byte-checked pinned TS toolchain or fixed Python bridge; no pasted donor implementations.',replay:'Every retained byte is recomputed from exact source cuts; reports are not trusted inputs.',independentHumanVerified:false,fieldVerified:false,retainedCrossPartySignatures:false,limitations:['All institutional, locality, consent and physical scenarios are fictional software exercises.','Source citation links are declared graph edges, not inferred historical ancestry or owner compatibility.','The native Trust call produces a view model from typed structural fixture input, not authenticated human testimony.','The Toaster legacy v1 score/timeline is generated; no production preview/render, KEEP or measured audio is claimed.','Git origins are checked as local configuration; no remote owner/human identity is authenticated.','Unknown power and absent providers remain HOLD/refused; no unlimited/free compute or hardware actuation.']};
 files['proof-report.json']=json(report);files['repository-integration-map.md']=renderMap(manifest,ordered);files['next-human-gates.json']=json(GATES);files['NEXT-HUMAN-GATES.md']='# Next human gates\n\n'+GATES.gates.map(g=>'- **'+g.id+'** / '+g.owner+': '+g.requires).join('\n')+'\n';
 const body={schema:'arcade.receipt/v1',status:'ORIGINAL_NATIVE_SOFTWARE_MACHINE_EXECUTED',baseHead:NATIVE.baseHead,coverage:manifest.coverage,manifestSha256:hash(files['manifest.json']),inheritedReceipt:p.inherited.receipt.receiptId,sceneOutputHashes:Object.fromEntries(Object.entries(ordered).map(([k,v])=>[k,hash(json(v))])),coreFiles:Object.fromEntries(Object.entries(files).map(([k,v])=>[k,hash(v)])),fieldVerified:false,externalContacts:0,physicalActs:0,ownerCanonSelected:false};
 const receipt={...body,receiptId:hash(json(body))};files['receipt.json']=json(receipt);
 const model={manifest,receipt,report,scenes:Object.fromEntries(Object.entries(ordered).map(([id,s])=>[id,sceneSummary(s)])),gates:GATES};
 files['first-boot.html']=renderDesk(model);files['evidence-passport.html']=renderPassport(model);
 return {files,receipt,manifest,scenes:ordered,prepared:p};
}
export function sceneSummary(s){return {request:s.request,title:s.title,status:s.status,parentSoftwarePlan:s.parentSoftwarePlan,outputs:s.outputs,evidence:s.evidence,selectedSources:s.selectedSources,selectedNativeFieldDonor:s.execution.results.deck.selectedNativeFieldDonor,stages:s.execution.stages,fieldMap:s.execution.plan.nodes.map(n=>({id:n.id,owner:n.owner,map:n.fieldMap})),composition:s.execution.results.deck.result,timeline:s.execution.results.timeline.result,refusals:{source:s.execution.results.disclosure.refusal,effects:s.execution.results.effects.result.effective_effects,withheld:s.execution.results.silence.result,receiver:s.request.receiver},branchHeads:s.execution.results.voyage.packet.branch_heads,challengeProof:s.challengeProof};}
export async function composeChallenge(config,request){
 validateChallenge(request);const base=await composeMachine(config);
 const scene=await composeScene(base.prepared.native,base.prepared.catalog,base.prepared.research,base.prepared.inherited,request,base.scenes[request.mission],request.action==='recombine'?base.scenes[request.secondary]:null);
 const files={'request.json':json(request),'result.json':json(scene),'result.html':renderScene(scene),'manifest.json':json(base.manifest)};
 for(const [id,output] of Object.entries(scene.execution.results))files['stages/'+id+'.json']=json(output);
 const body={schema:'arcade.challenge-receipt/v1',requestSha256:hash(json(request)),parentMachineReceipt:base.receipt.receiptId,resultSha256:hash(files['result.json']),files:Object.fromEntries(Object.entries(files).map(([k,v])=>[k,hash(v)])),status:scene.status,fieldVerified:false,physicalActs:0,externalContacts:0};
 const receipt={...body,receiptId:hash(json(body))};files['receipt.json']=json(receipt);return {files,receipt,scene,summary:sceneSummary(scene)};
}
function outsideSources(config,out){
 const target=resolve(out),parent=realpathSync(dirname(target));requireThat(join(parent,target.slice(dirname(target).length+1))===target,'OUTPUT_PARENT_SYMLINK');
 for(const root of [...Object.values(config.inheritedRoots),...Object.values(config.nativeRoots),config.toolchain,ROOT,...JSON.parse(readFileSync(config.documentRoots)).entries.map(e=>e.root)]){
  const rel=relative(realpathSync(root),target);requireThat(rel!==''&&(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel)),'OUTPUT_INSIDE_SOURCE_REFUSED');
 }
 return target;
}
export function writeFiles(config,out,files){
 requireThat(!existsSync(out),'OUTPUT_EXISTS');const target=outsideSources(config,out);let created=false;
 try{mkdirSync(target,{mode:0o700});created=true;
  for(const [name,bytes] of Object.entries(files)){requireThat(!name.startsWith('/')&&!name.split('/').includes('..'),'GENERATED_PATH_INVALID');mkdirSync(dirname(join(target,name)),{recursive:true,mode:0o700});writeFileSync(join(target,name),bytes,{flag:'wx',mode:0o600})}
 }catch(e){if(created)rmSync(target,{recursive:true,force:true});throw e}
}
export function compareFiles(out,files){
 requireThat(lstatSync(out).isDirectory()&&realpathSync(resolve(out))===resolve(out),'OUTPUT_SYMLINK');
 const expectedFiles=Object.keys(files).sort(),actual=[],expectedDirs=new Set();
 for(const name of expectedFiles){let p=dirname(name);while(p!=='.'){expectedDirs.add(p);p=dirname(p)}}
 function scan(dir,prefix=''){for(const e of readdirSync(dir,{withFileTypes:true})){const name=prefix+e.name,path=join(dir,e.name);requireThat(!e.isSymbolicLink()&&realpathSync(path)===path,'OUTPUT_SYMLINK');if(e.isDirectory()){requireThat(expectedDirs.has(name),'PACKET_FILE_SET_EXTRA_DIRECTORY');scan(path,name+'/')}else{requireThat(e.isFile(),'OUTPUT_NONREGULAR');actual.push(name)}}}
 scan(out);requireThat(actual.sort().join()===expectedFiles.join(),'PACKET_FILE_SET');
 for(const [name,bytes] of Object.entries(files))requireThat(readFileSync(join(out,name)).equals(Buffer.from(bytes)),'PACKET_BYTES:'+name);
}
export async function verifyOutput(config,out){
 const requestFile=join(out,'request.json');const expected=existsSync(requestFile)?await composeChallenge(config,JSON.parse(readFileSync(requestFile))):await composeMachine(config);
 compareFiles(out,expected.files);return {status:'FRESH_PROCESS_NATIVE_COLD_REPLAY_VERIFIED',receiptId:expected.receipt.receiptId,coverage:expected.manifest?.coverage??null,fieldVerified:false,independentHumanVerified:false};
}
