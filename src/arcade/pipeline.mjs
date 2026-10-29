import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {hash,json,requireThat} from '../constellation/sources.mjs';
import {validateChallenge,executeDag} from './contracts.mjs';
import {NATIVE} from './sources.mjs';
import {NOW,graphInput,makeVoyage,closeProjection} from './native.mjs';
const SCHEMA=Object.fromEntries(['catalog','material','graph','disclosure','support','world','effects','silence','perspectives','stage','deck','timeline','voyage','closure'].map(id=>[id,'arcade.'+id+'-result/v1']));
SCHEMA.catalog='arcade.source-catalog/v1';SCHEMA.material='arcade.inherited-material/v1';
const title={mit:'MIT Living Suitcase',voqal:'Voqal First Circle',garden:'Waseca Garden and a fictional second locality',jubilee:'Jubilee Culture and Invitation',commons:'Commons Machine'};
export async function composeScene(native,catalog,research,inherited,request,parentScene=null,secondaryScene=null){
 validateChallenge(request);
 const refusing=request.receiver==='REFUSE'||request.action==='refuse';
 const sourceIndex=(mission,offset=0)=>{
  const ranking=research.missions.find(m=>m.id===mission).selected;
  const entry=ranking[(request.variant==='B'?1:0)+offset]??ranking[0];
  const index=catalog.records.findIndex(r=>r.repository===entry.repository);requireThat(index>=0,'RESEARCH_TO_CORPUS_MAPPING');return index;
 };
 const firstIndex=sourceIndex(request.mission),secondIndex=sourceIndex(request.secondary,1);
 const firstSource=catalog.records[firstIndex],secondSource=catalog.records[secondIndex];
 const functions={};const nodes=[];
 function add(id,owner,parents,run,fieldMap){
  const inputs=parents.map(from=>({from,schema:SCHEMA[from]}));nodes.push({id,owner,parents,out:SCHEMA[id],inputs,fieldMap});functions[id]=async inputs=>{
   const value=await run(inputs);
   const checks={
    catalog:()=>value.schema==='arcade.source-catalog/v1'&&value.records.length>=50&&value.allReturnsVerified===true,
    material:()=>value.schema==='arcade.inherited-material/v1'&&typeof value.receiptId==='string',
    graph:()=>value.packet.schema==='free-graph.packet/v0'&&Array.isArray(value.view.nodes),
    disclosure:()=>['admitted','refused','indeterminate'].includes(value.admitted.admission.status)&&value.admitted.epistemicDisposition==='unknown',
    support:()=>['ACCEPT','REFUSE','INSUFFICIENT_TO_TEST'].includes(value.result.evaluation.disposition),
    world:()=>value.world.schemaVersion==='0.1'&&!!value.neighborhood.focus,
    effects:()=>value.result.schema==='loadout.compile/v0'&&value.result.effective_effects.every(e=>e.status==='refused'),
    silence:()=>value.result.disposition==='boundary_refused'&&value.result.receipt.payload.semanticEffect==='none',
    perspectives:()=>Array.isArray(value.result.perspectives)&&value.result.provenance.carrierCount===0,
    stage:()=>value.result.version==='static-live.stage-projection/v0.1'&&typeof value.result.playable==='boolean',
    deck:()=>value.result.schemaVersion==='0.1'&&Array.isArray(value.result.events),
    timeline:()=>/^[a-f0-9]{64}$/.test(value.result.timelineHash)&&Number.isSafeInteger(value.result.durationTicks),
    voyage:()=>value.packet.schema==='storyship/packet/v0'&&value.replay.currentness!==undefined,
    closure:()=>value.target.value.kind==='projection_receipt'&&value.closure.length>=50
   };
   requireThat(checks[id]&&checks[id](),'NATIVE_FIELD_CONTRACT_MISMATCH:'+id);
   return {...value,schema:SCHEMA[id]};
  };
 }
 add('catalog','corpus',[],()=>catalog,{source:'64 exact README bytes',native:'Corpus OS createIntakeSelector/verifiedReturn',target:'records[].selector'});
 add('material','cannon',[],()=>({schema:SCHEMA.material,receiptId:inherited.receipt.receiptId,houseA:JSON.parse(inherited.files['genesis/house-A.json']),houseB:JSON.parse(inherited.files['genesis/house-B.json']),ghot:JSON.parse(inherited.files['genesis/ghot-simulation.json']),culture:JSON.parse(inherited.files['genesis/culture-receipt.json']),receiver:JSON.parse(inherited.files['receiver-exercise.json']),returnCandidate:JSON.parse(inherited.files['planz-return.json']),plans:JSON.parse(inherited.files['planz-attention.json']),practice:JSON.parse(inherited.files['still-here-exercise.json']),graftCardSha256:hash(inherited.files['graft-review-cards.html'])}),{source:'unmodified original #45 packet',target:'native source-owned output fields'});
 add('graph','freegraph',['catalog'],({catalog})=>{
  const input={...graphInput(catalog,request.mission),focusIndex:firstIndex};const a=native.python('freegraph','graph',input);
  if(request.action==='recombine'){
   const b=native.python('freegraph','graph',{...graphInput(catalog,request.secondary),focusIndex:secondIndex});
   a.recombined=native.python('freegraph','graph-union',{packets:[a.view,b.view]});
  }
  return {input,...a};
 },{source:'catalog.records[].selector / selectionSha256',native:'rehash_packet → neighbors → merge_packets',target:'graph packet sources, nodes and bounded views'});
 add('disclosure','project0',['catalog','material'],({catalog,material})=>{
  const input={authority:{status:refusing?'refused':'permitted',reasonCodes:refusing?['DISCLOSURE_NOT_PERMITTED']:[],grantRef:'local-fictional-grant',remainingInvocations:1},provenance:{status:catalog.allReturnsVerified?'valid':'invalid',reasonCodes:catalog.allReturnsVerified?[]:['PROVENANCE_UNRESOLVED']},disclosureAllowed:!refusing};
  const admitted=native.project0.evaluateMaterial({admissionInput:input,epistemicDisposition:'unknown'});
  const refusal=native.project0.evaluatePipelineAdmission({...input,disclosureAllowed:false});
  requireThat(refusal.status==='refused','PROJECT0_REFUSAL_FAILED');
  return {input,admitted,refusal,scope:'FICTIONAL_LOCAL_SOFTWARE_ONLY',inheritedReceipt:material.receiptId};
 },{source:'catalog.allReturnsVerified + receiver choice + inherited receipt',native:'evaluateMaterial/evaluatePipelineAdmission',target:'admission status; epistemic uncertainty preserved'});
 add('support','alex',['catalog','graph'],({catalog,graph})=>{
  const witness=catalog.records[firstIndex].selectionSha256;
  const input={operation_type:'relation_derivation',rule_profile:'alex.runtime/derivation-m0',given:{records:[{id:'E1',kind:'evidence'},{id:'C1',kind:'candidate_claim'}],evidence_paths:[{id:'EP1',source_id:'E1',claim_id:'C1',basis_ids:['E1'],witness_ids:[witness],status:'ATTRIBUTABLE'}]},attempt:{relation_proposal:{id:'RP1',subject_id:'E1',predicate:'SUPPORTS',object_id:'C1',scope:'candidate_claim:C1',basis_ids:['E1','EP1']},evaluation_id:'EV1',execution_step_id:'STEP1',conclusion_assertion_id:'AS1'},input_digest:hash(json({witness,graph:graph.packet.packet_id}))};
  return {claim:'Only the explicitly selected public source bytes exist and returned exactly; no semantic compatibility or field claim.',input,result:native.python('alex','alex',input)};
 },{source:'Corpus selection hash + native Free Graph packet identity',native:'evaluate_relation_case',target:'attributable SUPPORTS evaluation for byte-selection claim only'});
 add('world','worldseed',['graph','disclosure','material'],({graph,disclosure,material})=>{
  const world=native.world.createWorld(title[request.mission],{id:'world-'+request.mission,now:NOW});
  const selected=graph.recombined?.nodes??graph.view.nodes;
  const references=selected.slice(0,6).map(n=>'[['+n.label.split('/')[1]+']]').join(' ');
  const house=request.variant==='B'?material.houseB:material.houseA;
  const focus=native.world.captureNode(world,{title:request.mission+'-'+request.requestId,body:references+'\nHouse plan '+house.plan_sha256+'; permission '+disclosure.admitted.admission.status,kind:'software-proposal',epistemic:'unverified',now:NOW});
  for(const n of selected.slice(0,6))native.world.addSource(world,{nodeId:focus.id,label:n.label,url:'https://github.com/'+n.label,note:'Pinned provenance is retained in source catalog; link is not permission.',now:NOW});
  const neighborhood=native.world.getNeighborhood(world,focus.id);
  return {world,neighborhood,housePlanSha256:house.plan_sha256};
 },{source:'native graph view nodes + source-owned House A/B plan + Project0 admission',native:'captureNode/addSource/getNeighborhood',target:'wikilink graph, retained source doors and actual unknown stubs'});
 add('effects','loadout',['graph','disclosure','support','material'],({graph,disclosure,support,material})=>{
  const noPower=request.variant==='NO_POWER',noProvider=request.variant==='NO_PROVIDER';
  const capabilities=[{capability:'local.preview',reachable_effects:[],parameters:{graph_ref:graph.packet.packet_id,support_ref:support.result.evaluation.evaluation_id}},{capability:'external.contact',reachable_effects:['external.contact'],parameters:{source_ref:material.returnCandidate.candidateId}},{capability:'physical.assemble',reachable_effects:['physical.actuate'],parameters:{power:'UNKNOWN',house_ref:material.houseB.plan_sha256}}];
  const domain={
   mit:[{capability:'house.assembly',reachable_effects:['physical.house.assemble'],parameters:{modules:material.houseB.modules.map(m=>({id:m.id,state:m.state,holds:m.holds})),blueprint:material.houseB.plan_sha256}}],
   voqal:[{capability:'first-circle.contact',reachable_effects:['external.first-contact'],parameters:{candidate:material.returnCandidate.candidateId,receiverCases:material.receiver.cases.map(c=>c.first),practice:material.practice.summary,realPeople:0}}],
   garden:[{capability:'garden.distribute',reachable_effects:['physical.food.distribute'],parameters:{materialDispute:material.culture.nativeResults.gro.discrepancy,inventoryChange:material.culture.effects.realInventoryChange,sourceOwnedGate:material.plans.matches[0],localities:['fictional-A','fictional-B']}}],
   jubilee:[{capability:'culture.publish',reachable_effects:['external.culture.publish'],parameters:{comic:material.culture.outputs['comic.html'],questionCards:material.graftCardSha256,sourceOwnedGate:material.plans.matches.find(p=>p.id==='TRAVELING-JUBILEE-001')}}],
   commons:material.ghot.decisions.filter(d=>['HOLD','REFUSE'].includes(d.decision)).map(d=>({capability:d.requested_capability??d.edge_id,reachable_effects:['physical.or-provider.'+d.edge_id],parameters:{ghotSourceDecision:d,hardwarePower:'UNKNOWN'}}))
  }[request.mission];capabilities.push(...domain);
  if(noProvider)capabilities.push({capability:'provider.available',reachable_effects:['provider.unavailable'],parameters:{availability:'ABSENT'}});
  if(noPower)capabilities.push({capability:'power.available',reachable_effects:['power.unverified'],parameters:{power:'UNAVAILABLE'}});
  const input={...(secondaryScene?{parent_compile_id:secondaryScene.execution.results.effects.result.compile_id}:{}),compile_id:'compile:'+request.mission+':'+request.requestId,issued_at:NOW,expires_at:'2026-10-30T00:00:00.000Z',world_cut_ref:graph.packet.packet_id,context_pack_ref:hash(json(disclosure)),compile_trace:{id:'trace:'+request.mission,upstream_support:support.result.evaluation,source_graph:graph.packet.packet_id,hardwarePower:noPower?'UNAVAILABLE':'UNKNOWN',provider:noProvider?'ABSENT':'NOT_INVOKED'},capabilities,effect_fence:[],effect_fence_ref:'fence:local-files-only',owner_evidence_digest:hash(json(material.receiver)),egress_policy_ref:'egress:none'};
  const result=native.python('loadout','loadout',input);requireThat(result.effective_effects.every(e=>e.status==='refused'),'EXTERNAL_OR_PHYSICAL_EFFECT_ADMITTED');return {input,result};
 },{source:'native graph ID + Project0 disclosure + ALEX evaluation + native House and receiver results',native:'compile_loadout',target:'available local preview; external/physical/provider effects explicitly refused'});
 add('silence','band',['effects','disclosure'],({effects,disclosure})=>{
  const id='session-'+request.mission,target=effects.result.compile_digest;
  const history=[{id:'e1',type:'session.opened',timestamp:1,sessionId:id,payload:{sessionId:id}},{id:'e2',type:'participant.joined',timestamp:2,sessionId:id,payload:{participantId:'fictional-operator',role:'synthetic'}},{id:'e3',type:'protected_silence.declared',timestamp:3,sessionId:id,payload:{silenceId:'withheld-target',participantId:'fictional-operator',artifactRef:target,contentHash:hash(json(disclosure)),causalCutId:'e2'}}];
  const attempt={id:'attempt-'+request.requestId,timestamp:4,sessionId:id,actorId:'fictional-operator',actorLocalSequence:1,causalCutId:'e3',targetArtifactRef:target,attemptedEffect:'artifact.write',payloadHash:hash(json(effects.result.effective_effects))};
  const policy={ref:'policy:local-withheld-only',version:'1',inputHash:hash(json(history)),evaluatorVersion:'pinned-band-admission',refusalAudience:['local-auditor']};
  const result=native.band.decideArtifactWriteAdmission(history,attempt,policy);requireThat(result.disposition==='boundary_refused','BAND_WITHHELD_TARGET_ESCAPED');return {history,attempt,policy,result};
 },{source:'LOADOUT compile digest + Project0 disclosure digest',native:'decideArtifactWriteAdmission',target:'protected local artifact write refusal; no general speech/contact authority claim'});
 add('perspectives','trust',['world','effects','silence'],({world,effects,silence})=>{
  const input={protocol_version:'0.1.0',moment_id:'fictional-'+request.requestId,title:title[request.mission],event_window:{start:NOW,end:NOW},occurrence_status:'unknown',capture_mode:'retrospective',carriers:[],accounts:[{account_id:'fictional-a',author_ref:'fictional-locality-a',account_kind:'interpretation',recorded_at:NOW,text:'Local software preview is '+effects.result.capability_bindings[0].status+'.',source_refs:[],audiences:['scrapbook'],adult_conflict:false,memory_eligible:true,assertions:[{key:'real_world_capacity',value:'proposed'},{key:'local_software',value:effects.result.capability_bindings[0].status}]},{account_id:'fictional-b',author_ref:'fictional-locality-b',account_kind:'interpretation',recorded_at:NOW,text:'Independent physical capacity remains unknown; local withheld target '+silence.result.disposition,source_refs:[],audiences:['private_archive'],adult_conflict:false,memory_eligible:false,assertions:[{key:'real_world_capacity',value:'unknown'}]}],direct_statements:[],privacy_policy:{child_future_access:'withheld_pending_review',default_audience:'private_archive'},audience_policy:{allowed:['private_archive','scrapbook']}};
  const view=native.memory.toMomentViewModel(input);if(view.provenance.capturedAt===undefined)delete view.provenance.capturedAt;
  return {scope:'VIEW_MODEL_STRUCTURAL_INPUT_NOT_AUTHENTICATED_MOMENT',normalization:'Optional undefined capturedAt omitted because there are no measured carriers.',input,result:view};
 },{source:'native effect availability + protected-target refusal + original house hash',native:'toMomentViewModel',target:'filtered memory lines and preserved attributed divergent perspectives, zero measured carriers'});
 add('stage','staticlive',['effects','world'],({effects,world})=>{
  const missing=request.variant==='NO_PROVIDER',noPower=request.variant==='NO_POWER';
  const input={song:{id:request.mission+'-fictional-score'},tempo:{bpm:120,meter:'4/4'},landmarks:['verse','chorus','outro'],requiredCapabilities:['local-preview','question-card'],stems:noPower||missing?[]:[{id:'preview-bed',kind:'always'},{id:'review-question-card',kind:'fallback',coversCapability:'question-card'}],cues:{source:world.housePlanSha256}};
  const configuration={id:'fictional-local-software',label:'No human performers claimed',performers:[{id:'local-software',label:'Local process',capabilities:effects.result.capability_bindings.filter(c=>c.status==='available').map(()=> 'local-preview')}]};
  return {input,configuration,result:native.stage.compileStageProjection(input,configuration)};
 },{source:'LOADOUT available capabilities + WORLDSEED/House source reference',native:'compileStageProjection',target:'actual coverage/fallback selection; unavailable provider/power removes fallback and makes plan unplayable'});
 add('deck','playdeck',['world','graph','stage','perspectives'],({world,graph,stage,perspectives})=>{
  const swapped=request.action==='swap';
  const worldNodes=[world.neighborhood.focus,...world.neighborhood.connections.map(c=>c.node)];
  const field=swapped?(graph.recombined?.nodes??graph.view.nodes).map(n=>({id:n.id,label:n.label,stub:true})):worldNodes;
  const cards=field.slice(0,8).map((n,i)=>({id:n.id,source:'sha256:'+hash(json(n)).slice(7),traits:i===0?['opening','witness']:['door','room'],permissions:{flip:true,portal:i>0}}));
  const input={deck:{schemaVersion:'0.1',id:'deck-'+request.mission,cards,...(parentScene?{metadata:{continuity:{assembledAs:parentScene.execution.results.deck.result.finalState.assembledAs},parentSoftwarePlan:hash(json(parentScene.execution.results.deck.result)),...(secondaryScene?{studioBranchRelation:{sourcePlans:[hash(json(parentScene.execution.results.deck.result)),hash(json(secondaryScene.execution.results.deck.result))],interpretation:'EXPLICIT_LOCAL_SOFTWARE_RECOMBINATION_NOT_FIELD_HISTORY'}}:{}),fieldWitness:false}}:{})},track:{schemaVersion:'0.1',id:'track-'+request.mission,source:'fixture://declared-local-software-gates',duration:stage.result.playable?20:24,gates:[{id:'verse',at:5,kind:'verse'},{id:'chorus',at:10,kind:'chorus'},{id:'outro',at:15,kind:'outro'}]},worldRule:{schemaVersion:'0.1',id:'software-review',physical:'paper',surface:perspectives.result.perspectives.some(p=>p.status==='divergent')?'preserve-divergence':'single-view'},options:{id:'composition-'+request.requestId,fps:30,width:960,height:540}};
  const result=native.deck.composeDeck(input);native.deck.assertValidCompositionPlan(result,input.deck);
  return {selectedNativeFieldDonor:swapped?'freegraph':'worldseed',input,result};
 },{source:'WORLDSEED neighborhood (or explicit Free Graph donor swap) + actual Static Live capability result + Trust divergence',native:'composeDeck/assertValidCompositionPlan',target:'selected timed cards/gates/residue; original owner fields remain in input'});
 add('timeline','toaster',['deck','stage'],({deck,stage})=>{
  const energyByKind={intro:.2,verse:.35,chorus:.8,outro:.25};const plan=deck.result;
  const analysis={schema:'haunted-toaster/audio-analysis-fixture/v1',durationSeconds:plan.duration,sections:plan.gates.map((g,i)=>({startSeconds:g.at,endSeconds:plan.gates[i+1]?.at??plan.duration,energy:stage.result.playable?(energyByKind[g.kind]??.5):.1,label:g.id})),phrases:[],transients:[]};
  const score=native.toaster.createVisualScore({seed:hash(request.requestId+request.variant).slice(7,23),constraints:native.toaster.constraints,overrides:{temporalDensity:'section'}});
  const result=native.toaster.resolve(analysis,score.score,native.toaster.constraints,native.toaster.profile);
  return {scope:'DECLARED_FIXTURE_ANALYSIS_NOT_MEASURED_AUDIO_OR_RENDER',analysis,score,result,endState:native.toaster.stateAtTick(result,result.durationTicks)};
 },{source:'Playdeck returned gate times/kinds/duration + Static Live playable coverage',native:'createVisualScore/resolve/stateAtTick using explicit legacy v1 profile',target:'canonical deterministic timeline patches and final visual state; no render or KEEP receipt claimed'});
 add('voyage','storyship',['deck','timeline','catalog'],({deck,timeline,catalog})=>makeVoyage(native,request,secondaryScene?hash(json(parentScene.execution.results.deck.result)):hash(json(deck.result)),secondaryScene?hash(json(secondaryScene.execution.results.deck.result)):hash(json(timeline.result)),catalog.records[firstIndex].sourceWitness),{source:'actual deck/timeline artifact hashes and exact original source witness',native:'appendStoryshipEvent/replayStoryship/sealTransferPacket',target:'real software branch DAG; fork stays unresolved; recombination retains both parents'});
 add('closure','tranch',['catalog','deck','timeline','voyage','silence'],({catalog,deck,timeline,voyage,silence})=>closeProjection(native,[...new Set([...catalog.records.map(r=>r.sourceSha256),...(parentScene?[hash(json(parentScene.execution.results.deck.result))]:[]),...(secondaryScene?[hash(json(secondaryScene.execution.results.deck.result))]:[])])],[hash(json(deck)),hash(json(timeline)),voyage.packet.packet_id,hash(json(silence.result))],request.mission+':'+request.action),{source:'all verified source artifact roots + native composition/timeline/branch/refusal output hashes',native:'addressProjectionReceipt/verifyProjectionClosure',target:'verified ancestry fan-in with all original source roots retained'});
 const execution=await executeDag({schema:'arcade.dag/v1',nodes},functions);
 let status=refusing?'REFUSE_RECEIVER':request.variant==='NO_POWER'?'HOLD_UNAVAILABLE_POWER':request.variant==='NO_PROVIDER'?'HOLD_PROVIDER_ABSENT':request.action==='fork'?'HOLD_BRANCH_SELECTION_REQUIRED':'LOCAL_SOFTWARE_COMPLETE';
 let challengeProof=request.action==='why'?{kind:'EXECUTED_DEPENDENCY_EXPLANATION',edges:execution.stages.flatMap(s=>s.inputs.map(i=>({from:i.from,to:s.id,inputHash:i.sha256,sourceMapping:execution.plan.nodes.find(n=>n.id===s.id).fieldMap}))),refusedEffects:execution.results.effects.result.effective_effects}:request.action==='inspect'?{nativeOwner:'corpus',kind:'EXACT_SOURCE_RETURN',repository:firstSource.repository,sourceSha256:firstSource.sourceSha256,selector:firstSource.selector,selectedByteSha256:firstSource.selectionSha256,result:firstSource.returnCode}:null;
 if(request.action==='break'){
  const c=execution.results.closure;const graph={projections:new Map([...c.projections,c.target].map(x=>[x.hash,x])),admissions:new Map(c.admissions.map(x=>[x.hash,x]))};
  const forged={...c.target,value:{...c.target.value,fieldRoots:[]}};
  try{native.tranch.verifyProjectionClosure(forged,graph);throw Error('COUNTERFEIT_PROJECTION_ACCEPTED')}
  catch(error){requireThat(error.code==='RECEIPT_IDENTITY_MISMATCH','UNEXPECTED_TAMPER_FAILURE');challengeProof={nativeOwner:'tranch',result:'REFUSE',code:error.code,originalProjection:c.target.hash,mutatedBodySha256:hash(json(forged.value))}}
  status='REFUSE_TAMPER';
 }
 return {schema:'arcade.scene/v1',request,status,title:title[request.mission],parentSoftwarePlan:parentScene?hash(json(parentScene.execution.results.deck.result)):null,selectedSources:[firstSource.repository,...(request.action==='recombine'?[secondSource.repository]:[])],execution,challengeProof,outputs:{compositionSha256:hash(json(execution.results.deck.result)),timelineHash:execution.results.timeline.result.timelineHash??hash(json(execution.results.timeline.result)),voyagePacket:execution.results.voyage.packet.packet_id,rootClosure:execution.results.closure.target.hash},evidence:{nativeOwnersInvoked:[...new Set(nodes.filter(n=>!['cannon'].includes(n.owner)).map(n=>n.owner))],sourceCount:catalog.sourceCount,physicalActs:0,externalContacts:0,humanWitnesses:0,fieldVerified:false,hardwarePower:'UNKNOWN',ownerCanonSelected:false}};
}
