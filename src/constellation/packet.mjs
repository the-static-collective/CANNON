import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync,rmSync,realpathSync,lstatSync} from 'node:fs';
import {resolve,join,relative,isAbsolute,dirname} from 'node:path';
import {composeGenesisBoot} from '../genesis-boot.mjs';
import {ROOT,SELECTION,checkSources,checkRuntimeDependency,hash,json,requireThat} from './sources.mjs';
import {composeCrossings,crossing} from './crossings.mjs';
import {firstBoot,brief} from './view.mjs';
export const GATES={schema:'constellation.human-gates/v1',fieldEvidence:'NONE',gates:[
 {id:'REPLAY',owner:'Independent human reviewer',requires:'Clone exact CANNON PR head and donor pins; acquire runtime dependency; cold-verify in a separate clean checkout. A second process alone is not an independent human witness.'},
 {id:'RIGHTS',owner:'Each source owner',requires:'Review source licenses, exact adapter scope, attribution and permission before adoption. No owner canon is selected by these tests.'},
 {id:'FIRST_CIRCLE',owner:'Qualified independent safeguarding and privacy reviewers',requires:'Review the fictional zero-contact flow with survivor-informed expertise; establish opt-in, withdrawal, minimum disclosure and device-risk handling before any real contact. No recruitment or sensitive intake authorized.'},
 {id:'HOUSE_BENCH',owner:'Site steward and qualified safety reviewer',requires:'Separately authorize a bounded low-voltage physical bench, inventory and power measurements; establish independent custody and inspection. No physical operations authorized here.'},
 {id:'INSTITUTION',owner:'Human sender and willing institution',requires:'Decide whether and what public evidence to share; obtain review permission. No application, message, partnership or funding is implied or sent.'},
 {id:'ADAPTERS',owner:'Each remaining source owner',requires:'Supply a pinned bounded offline interface, fixtures, original tests and explicit receiver policy. Atlas suggestions are unsent issue templates, not opened requests.'}
]};
function integrationMap(atlas){
 return '# Repository integration map\n\n```mermaid\ngraph LR\n  CANNON --> Genesis["Inherited #38 → #37 → #5"]\n  Genesis --> STATIC["STATIC OS #91 / House A+B"]\n  Genesis --> GHoT["GHoT #129 / synthetic consequences"]\n  Genesis --> WebZ["WebZ / HARMONY"]\n  Genesis --> GrO["GrO #32 / material dispute HOLD"]\n  Genesis --> JARVIS["JAR;VIS / bounded attention"]\n  planZ --> JARVIS\n  JARVIS --> reLATTE["reLATTE / local receiver cases"]\n  reLATTE --> FullMeasure["Full Measure / zero Deeds lens"]\n  StillHere["Full Measure #56 / fictional practice"] --> CANNON\n  GRAFT["GRAFT exact branch / printable renderer"] --> CANNON\n  Atlas["89 public repos / discovery only"] -. HOLD .-> CANNON\n```\n\nTen donor checkouts, nine independent donor repositories, plus CANNON. Existing original code stays in its owning checkout. The separate STILL HERE source cut is not a substitute for current Full Measure authority.\n\n## Owner pins and executed seams\n\n'+Object.entries(SELECTION.sources).map(([k,s])=>`- **${k}**: [${s.repository}@${s.commit}](https://github.com/${s.repository}/tree/${s.commit})`).join('\n')+'\n\n## Public long tail / next adapter gates\n\n'+atlas.repositories.map(r=>`- [${r.repository}](https://github.com/${r.repository}/tree/${r.defaultHead}): ${r.selectedDonors.length?'exact source selected; execution is evidenced separately':'HOLD — source owner must expose a bounded offline contract, fixture and tests'}. ${r.openPullRequests.length} open PR heads inventoried.`).join('\n')+'\n\n18 private repositories are counted for discovery coverage only; their names, source and heads are not exported. Public metadata describes the observation date, not ongoing availability or source-owner selection.\n';
}
export async function composePacket(roots){
 const witnesses=checkSources(roots);
 const atlasBytes=readFileSync(join(ROOT,'constellation/atlas.json'));
 const atlas=JSON.parse(atlasBytes);
 requireThat(atlas.schema==='constellation-atlas/v1'&&atlas.authority==='DISCOVERY_ONLY'&&atlas.repositories.every(r=>/^[a-f0-9]{40}$/.test(r.defaultHead)),'ATLAS_CONTRACT');
 const genesisRoots=Object.fromEntries(['staticos','webz','gro','ghot','jarvis'].map(k=>[k,roots[k]]));
 const genesis=await composeGenesisBoot(genesisRoots,{question:'Can one Suitcase help an ordinary house become cooperative infrastructure?',mission:'living-house',scenario:'FICTIONAL_A_B',mode:'OFFLINE_HOLD_ONLY'});
 const c=await composeCrossings(roots);
 const additional=c.crossings;
 const crossings=[...['staticos','webz','gro','ghot'].map(k=>crossing(k,genesis.receipt.schema)),...additional];
 const files=Object.fromEntries(Object.entries(genesis.files).map(([name,bytes])=>['genesis/'+name,bytes]));
 Object.assign(files,{
  'atlas.json':atlasBytes.toString('utf8'),'source-selection.json':json(SELECTION),
  'planz-return.json':json(c.packet),'planz-attention.json':json(c.plans),
  'receiver-exercise.json':json(c.receiver),'relatte-observation.json':json(c.observation),
  'still-here-exercise.json':json(c.practice),'graft-review-cards.html':c.graftHtml,
  'crossings.json':json(crossings),'repository-integration-map.md':integrationMap(atlas),
  'next-human-gates.json':json(GATES),
  'NEXT-HUMAN-GATES.md':'# Next human verification gates\n\n'+GATES.gates.map(g=>`- **${g.id} / ${g.owner}:** ${g.requires}`).join('\n')+'\n',
 });
 const manifest={schema:'constellation.manifest/v1',ancestry:SELECTION.ancestry,sources:SELECTION.sources,sourceWitnesses:witnesses,atlasSha256:hash(atlasBytes),dependencyWitness:checkRuntimeDependency(roots.relatte),runtime:{node:'24+',python:'3.11+',dependencies:'reLATTE json-canonicalize@3.0.1; acquire once; no install or network during build/replay'},authority:'LOCAL_FICTIONAL_SOFTWARE_ONLY'};
 files['manifest.json']=json(manifest);
 const body={schema:'constellation.receipt/v1',status:'ORIGINAL_SOURCE_SOFTWARE_EXECUTED',sourceRepositories:new Set(Object.values(SELECTION.sources).map(s=>s.repository)).size,donorCheckouts:Object.keys(witnesses).length,cannonAncestry:SELECTION.ancestry,manifestSha256:hash(files['manifest.json']),genesisReceipt:genesis.receipt.receiptSha256,crossings,coreFiles:Object.fromEntries(Object.entries(files).map(([k,v])=>[k,hash(v)])),fieldVerified:false,physicalActs:0,externalContacts:0,humanDeeds:0,ownerCanonSelected:false,hardwarePower:'UNKNOWN',compute:'LOCAL_PROCESS_ONLY',receiptKind:'DETERMINISTIC_UNSIGNED_SOFTWARE_RESULT',signatureBoundary:c.receiver.ephemeralSignatures};
 const receipt={...body,receiptId:hash(json(body))};files['receipt.json']=json(receipt);
 const proof={schema:'constellation.proof-report/v1',receiptId:receipt.receiptId,method:'Recompute every output byte using original pinned code; verify entire tracked donor trees before imports.',checks:{exactPinnedTrackedTrees:true,genesisOriginalCode:true,distinctFictionalHousePlans:true,receiverHoldAndRefusal:true,duplicateIdempotency:true,revocationBlocksStorage:true,transientSignaturesVerified:true,deterministicRetainedBytes:true},limits:['This report is generated during composition, not a claim that an independent human has verified it.','Ephemeral local test signatures and keys are discarded, not exportable signed evidence or authenticated cross-party custody.','Atlas metadata is a dated observation; most repos remain HOLD.','No field, hardware, real person, institutional endorsement or unlimited compute claim.','Local source Git origin is checked, not remote owner authentication.'],coldVerification:'Run the verify command in a separate process or independently acquired clean checkout. The verifier does not trust the stored proof report.'};
 files['proof-report.json']=json(proof);
 for(const id of ['mit','voqal','open'])files[id+'-brief.html']=brief(id,receipt,SELECTION);
 files['first-boot.html']=firstBoot({receipt,manifest,proof,atlas,selection:SELECTION,receiver:c.receiver,practice:c.practice,plans:c.plans,returnCandidate:c.packet,gates:GATES});
 return {files,receipt};
}
function outputBoundary(roots,out){
 const target=resolve(out),parent=realpathSync(resolve(target,'..'));
 requireThat(join(parent,target.split('/').at(-1))===target,'OUTPUT_PARENT_SYMLINK');
 for(const root of Object.values(roots)){
  const r=relative(realpathSync(root),target);
  requireThat(r!==''&&((r==='..'||r.startsWith('../'))||isAbsolute(r)),'OUTPUT_INSIDE_DONOR_REFUSED');
 }
 return target;
}
export async function buildPacket(roots,out){
 requireThat(!existsSync(out),'OUTPUT_EXISTS_NO_OVERWRITE');
 const target=outputBoundary(roots,out);
 const result=await composePacket(roots);let created=false;
 try{
  mkdirSync(target,{mode:0o700});created=true;
  for(const [name,bytes] of Object.entries(result.files)){
   mkdirSync(dirname(join(target,name)),{recursive:true,mode:0o700});
   writeFileSync(join(target,name),bytes,{flag:'wx',mode:0o600});
  }
 }catch(error){if(created)rmSync(target,{recursive:true,force:true});throw error}
 return result.receipt;
}
export async function verifyPacket(roots,out){
 requireThat(lstatSync(out).isDirectory()&&realpathSync(resolve(out))===resolve(out),'PACKET_DIRECTORY_SYMLINK');
 const expected=await composePacket(roots);
 const names=readdirSync(out,{recursive:true});
 requireThat(names.sort().join()===[...Object.keys(expected.files),'genesis'].sort().join(),'PACKET_FILE_SET_MISMATCH');
 for(const name of names)requireThat(!lstatSync(join(out,name)).isSymbolicLink(),'PACKET_SYMLINK');
 for(const [name,bytes] of Object.entries(expected.files)){
  const path=join(out,name);requireThat(lstatSync(path).isFile()&&realpathSync(path)===path,'PACKET_SYMLINK');
  requireThat(readFileSync(path).equals(Buffer.from(bytes)),'PACKET_BYTES_MISMATCH:'+name);
 }
 return {schema:'constellation.cold-verification/v1',status:'INDEPENDENT_PROCESS_REPLAY_REQUIRED',byteReplay:'ALL_PACKET_BYTES_MATCH',receiptId:expected.receipt.receiptId,independentHumanVerified:false,fieldVerified:false};
}
