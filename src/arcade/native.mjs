import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {ROOT,hash,json,requireThat} from '../constellation/sources.mjs';
import {NATIVE} from './sources.mjs';
export const NOW='2026-10-29T00:00:00.000Z';
export async function nativeModules(config){
 const mod=(id,p)=>import(pathToFileURL(join(config.nativeRoots[id],p)).href);
 const require=createRequire(import.meta.url);
 const [corpus,project0,tranch,world,deck,stage,memory,band,storyContract,storyLedger,storyReplay,storyPacket]=await Promise.all([
  mod('corpus','lib/intake.ts'),mod('project0','src/reference-kernel/admission.ts'),mod('tranch','src/projection.ts'),mod('worldseed','src/world.js'),mod('playdeck','packages/composer/src/index.ts'),mod('staticlive','src/compiler.js'),mod('trust','apps/mobile/src/momentViewModel.ts'),mod('band','src/admission.ts'),mod('storyship','src/contract.mjs'),mod('storyship','src/ledger.mjs'),mod('storyship','src/replay.mjs'),mod('storyship','src/packet.mjs')
 ]);
 const toasterBase=join(config.nativeRoots.toaster,'src/full-measure');
 const toaster={...require(join(toasterBase,'src/generation/operations.cjs')),...require(join(toasterBase,'src/generation/resolver.cjs')),constraints:JSON.parse(readFileSync(join(toasterBase,'constraints/porchlight.v1.json'))),profile:JSON.parse(readFileSync(join(toasterBase,'profiles/toaster-raster-1.json')))};
 const python=(owner,operation,input)=>JSON.parse(execFileSync('python3',[join(ROOT,'src/arcade/owner-python.py')],{input:json({root:config.nativeRoots[owner],operation,input}),encoding:'utf8',timeout:25000,maxBuffer:8*1024*1024,stdio:['pipe','pipe','pipe']}));
 return {corpus,project0,tranch,world,deck,stage,memory,band,story:{...storyContract,...storyLedger,...storyReplay,...storyPacket},toaster,python};
}
export async function sourceCatalog(documents,native){
 const records=[];
 for(const d of documents){
  const bytes=new Uint8Array(d.bytes),text=native.corpus.decodeFatalUtf8(bytes);requireThat(text!==null,'DOCUMENT_INVALID_UTF8');
  const artifact=await native.corpus.createIngestedArtifact(bytes,{mediaType:'text/markdown',originalName:d.repository+'/README.md'});
  requireThat(artifact.identity===d.sha256,'CORPUS_ARTIFACT_MAPPING');
  // Explicit first nonempty source line, retained as a hash-bound selector.
  // Byte/UTF-16 conversion and exact return verification belong to Corpus OS.
  const start=text.search(/\S/),end=Math.min(text.indexOf('\n',start)<0?text.length:text.indexOf('\n',start),start+140);
  requireThat(start>=0&&end>start,'EMPTY_DOCUMENT');
  const selector=await native.corpus.createIntakeSelector(artifact,text,start,end),returned=await native.corpus.verifiedReturn(bytes,selector);
  requireThat(returned.valid===true,'CORPUS_EXACT_RETURN_FAILED');
  records.push({repository:d.repository,commit:d.commit,tree:d.tree,path:d.path,sourceSha256:d.sha256,artifact,selector,returnCode:returned.code,selectionSha256:hash(returned.extractedBytes),sourceHeading:Buffer.from(returned.extractedBytes).toString('utf8'),sourceWitness:d.witness,authority:'SOURCE_BYTES_ONLY',fieldVerified:false});
 }
 return {schema:'arcade.source-catalog/v1',owner:NATIVE.sources.corpus,records,sourceCount:records.length,allReturnsVerified:true,fieldEvidence:false};
}
export function graphInput(catalog,mission){
 const sources=catalog.records.map((r,i)=>({id:'s'+i,source_class:'project-source',locator:{system:'git',container:r.repository,coordinate:'README.md#bytes='+r.selector.byteStart+'-'+r.selector.byteEnd,revision:r.commit,resolution:'exact'},observed_at:NOW,acquisition:'pinned-readonly-corpus-selector',excerpt:r.sourceHeading,digest:r.selectionSha256,access:'public',export:'portable',authority:'source-local'}));
 const nodes=catalog.records.map((r,i)=>({id:'n'+i,kind:'artifact',label:r.repository,status:'observed',source_ids:['s'+i]}));
 const links=nodes.slice(1).map((n,i)=>({id:'l'+i,from:'n'+i,to:n.id,verb:'connects',qualifier:'declared-citation-sequence',authority:'none',status:'proposed',source_ids:['s'+i,'s'+(i+1)],note:'Explicit software citation traversal; no historical ancestry or compatibility is inferred.'}));
 return {packet:{schema:'free-graph.packet/v0',purpose:'Corpus-selected public source evidence for '+mission,modes:['seed'],scope:{task:mission,worlds:['fictional-'+mission]},task_world_cut:{status:'sufficient',selected_ids:[...sources,...nodes,...links].map(x=>x.id),owner_head_source_ids:[],omitted:[],rationale:'Sufficient only for bounded source citation and native software projection; no field authorization.'},sources,nodes,links,residual_fog:['source-discovery-is-not-native-interface-or-authority'],non_imports:['private-records','field-claims','external-effects']},depth:1};
}
export function makeVoyage(native,request,artifactA,artifactB,sourceWitness){
 const s=native.story;
 const constitution=s.createConstitutionReceipt({owner_repository:sourceWitness.repository,owner_head_sha:sourceWitness.commit,ordered_constitutive_paths:['README.md'],blob_sha_for_each_path:{'README.md':sourceWitness.blob}});
 const cut=s.admitSourceCut({owning_world:sourceWitness.repository,stable_locator:'git:'+sourceWitness.repository+'/README.md',revision_or_provider_identity:sourceWitness.commit,content_digest_when_available:sourceWitness.blob_sha256,acquisition_time:NOW,availability_status:'available',evidence_class:'public-software-source-not-field-witness'});
 const base={schema:'storyship/event/v0',voyage_id:'arcade-'+request.mission+'-'+request.requestId,branch_id:'branch-root',parent_state_ids:[],constitution_id:constitution.constitution_id,source_cut:[cut],actor:{owning_world:'local-fictional-operator',actor_id:'fixture-operator',role:'software-review'},occurred_at_source_raw:null,observed_at:NOW,recorded_at:NOW,reality_effects:[],narrative_interpretations:[],manifest_effects:[],uncertainty:['No field witness or source-owner adoption is established.'],authority:{owning_world:'local-demo',scope:'software-only'},previous_receipt_ids:[]};
 let events=[];
 const append=(event_type,branch_id,payload={})=>{events=s.appendStoryshipEvent(events,{...base,event_seq:events.length+1,event_type,branch_id,payload})};
 append('voyage-created','branch-root');
 for(const [id,artifact] of [['branch-a',artifactA],['branch-b',artifactB]]){
  // These are local software artifacts; generation-observed is not model/audio generation.
  append('branch-composed',id,{artifact_ref:artifact,branch_effects:[{branch_id:id,parent_branch_ids:['branch-root'],status:'live'}]});
 }
 if(request.action==='recombine')append('branch-composed','branch-combined',{parent_artifacts:[artifactA,artifactB],branch_effects:[{branch_id:'branch-combined',parent_branch_ids:['branch-a','branch-b'],status:'live'}]});
 if(request.action!=='fork')append('selection-recorded',request.action==='recombine'?'branch-combined':'branch-a',{mechanism:'explicit-local-software-request',selected_branch_ids:[request.action==='recombine'?'branch-combined':'branch-a'],unselected_branch_ids:request.action==='recombine'?['branch-a','branch-b']:['branch-b']});
 s.verifyStoryshipLedger({constitution,events});const replay=s.replayStoryship({constitution,events,cut:events.length});
 const packet=s.sealTransferPacket({replay,packet_label:'Local '+request.mission+' software branches'});s.validateTransferPacket(packet,replay);
 return {constitution,events,replay,packet};
}
export function closeProjection(native,roots,outputs,purpose){
 const projector={id:'cannon-arcade-software-adapter',version:'v1'},purposeHash=hash(purpose);
 const admissions=roots.map((fieldRoot,i)=>native.tranch.addressFieldRootAdmission({kind:'field_root_admission',fieldRoot,admittedBy:projector,purposeHash,creationOrder:i+1}));
 const projections=roots.map((r,i)=>native.tranch.addressProjectionReceipt({kind:'projection_receipt',projectionKind:'observation',fieldRoots:[r],parentProjectionHashes:[],rootAdmissionReceiptHashes:[admissions[i].hash],projector,questionPurposeHash:purposeHash,contextHashes:[],outputNodeHashes:[outputs[i%outputs.length]],residualHashes:[],uncertainty:'Software source/fixture evidence only; no human/field authority.',creationOrder:roots.length+i+1}));
 const target=native.tranch.addressProjectionReceipt({kind:'projection_receipt',projectionKind:'proposal',fieldRoots:roots,parentProjectionHashes:projections.map(x=>x.hash),rootAdmissionReceiptHashes:[],projector,questionPurposeHash:purposeHash,contextHashes:[],outputNodeHashes:outputs,residualHashes:roots,uncertainty:'Recombination preserves all source roots and local authority boundaries.',creationOrder:roots.length*2+1});
 const graph={projections:new Map([...projections,target].map(x=>[x.hash,x])),admissions:new Map(admissions.map(x=>[x.hash,x]))};
 const closure=[...native.tranch.verifyProjectionClosure(target,graph)].sort();requireThat(closure.length===roots.length,'TRANCH_ROOTS_LOST');
 return {target,projections,admissions,closure};
}
