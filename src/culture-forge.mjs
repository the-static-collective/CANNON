/** CANNON CULTURE FORGE 001 — native, exact-Git WebZ and GrO code, one real printable zine.
 * Live effects are only local output files. All field reports remain synthetic.
 * Original donor source stays read-only. The CANNON selection track is untouched.
 */
import {readSource} from './present-use.mjs';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync,mkdirSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
export const SOURCES={
 webz:{repository:'the-static-collective/webZ',commit:'83b35070d8d56155156655279bfdcf50aa77794f',
  modules:['bridge/harmony/craft-economy.mjs','bridge/harmony/culture-seed.mjs','bridge/harmony/culture-presentation.mjs','bridge/harmony/model.mjs','bridge/harmony/catalog.mjs','bridge/harmony/culture.mjs']},
 gro:{repository:'the-static-collective/GrO',commit:'9e6361105aae335ccb0657092809eef43e7ab4da',
  modules:['src/mattercraft-field.js','src/field.js','src/receipt.js','src/stable.js']}
};
export const SCHEMA='cannon.culture-forge-receipt/v1';
const sha256=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
const exact=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join()===keys.slice().sort().join();
function fail(ok,code){if(!ok)throw Error(code);}
const json=x=>JSON.stringify(x,null,2)+'\n';
function safeText(value){fail(typeof value==='string'&&value.length<=240&&value.trim().length>0,'INVALID_PUBLIC_TOPIC');return value.trim();}
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readVerifiedModule(source,rel,root){
 const spec={id:'source',repository:source.repository,commit:source.commit,path:rel,media_type:'text/javascript',tags:[]};
 const pinned=readSource(spec,{[source.repository]:root});
 const path=join(realpathSync(resolve(root)),rel);
 fail(realpathSync(path)===path,'SYMLINK_OR_PATH_DRIFT');
 const live=readFileSync(path);
 fail(sha256(live)===pinned.witness.blob_sha256,'WORKTREE_DIFFERS_FROM_PINNED_GIT');
 return pinned.witness;
}
export function verifyNativeSources(roots){
 fail(exact(roots,['webz','gro']),'REQUIRE_TWO_INDEPENDENT_ORIGINAL_REPOS');
 return Object.fromEntries(Object.entries(SOURCES).map(([name,source])=>[
  name,source.modules.map(rel=>readVerifiedModule(source,rel,roots[name]))
 ]));
}
const PANELS=[
 ['A ROOM','A room is empty. A question arrives.','◇'],
 ['A HAND','Someone leaves a small usable method instead of a command.','✦'],
 ['A VISITOR','A stranger encounters the method; nothing makes them join.','◌'],
 ['A CHANGE','The visitor changes the arrangement to fit this place.','⬡'],
 ['A SONG','A drawing, a song, and a story carry the discovery outward.','♫'],
 ['A NEW DOOR','The next room can adopt, transform, hold, or walk away.','✧']
];
export function makeZine(topic,webz,grO){
 fail(webz.schema==='abundent.matter-idea-craft/v1','WRONG_WEBZ_CONTRACT');
 fail(grO.schema==='gro.mattercraft-field-projection/v0','WRONG_GRO_NATIVE_CONTRACT');
 fail(webz.economicProjection.material.recognizedSpendable===0,'FAKE_MATERIAL_INVENTORY');
 fail(grO.observations.recognizedSpendableQuantity===0,'FAKE_GRO_INVENTORY');
 fail(webz.economicProjection.penny.issued===0,'FAKE_PENNY_ISSUANCE');
 fail(webz.lawfulCrossings.fullMeasure.deeds===0,'FAKE_HUMAN_DEED');
 fail(grO.observations.discrepancy==='COUNTS_DISAGREE_HOLD','DISPUTE_WAS_LAUNDERED');
 const panels=PANELS.map(([heading,words,icon],i)=>
  '<article class="panel"><div class="stamp">0'+(i+1)+'</div><div class="art" aria-hidden="true">'+icon+'</div><h2>'+htmlEscape(heading)+'</h2><p>'+htmlEscape(words)+'</p></article>').join('\n');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>A Room That Remembers — 6-panel specimen</title>
<style>
:root{font-family:system-ui,sans-serif;color:#172f2b;background:#f1ede0}
body{margin:0 auto;max-width:1100px;padding:24px}header{border-bottom:3px solid #255448;margin-bottom:18px}
header small,.stamp{letter-spacing:.15em;font-weight:700;font-size:.68rem}h1{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3.4rem);margin:.25em 0}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.panel{position:relative;border:2px solid #255448;background:#fffaf0;min-height:300px;padding:18px;break-inside:avoid;overflow-wrap:anywhere}
.panel:nth-child(2n){background:#e0e8dc}.art{font-size:5rem;text-align:center;padding:26px 0;color:#245345}
.panel h2{font-family:Georgia,serif;margin:.4em 0}.panel p{line-height:1.4}
footer{font-size:.78rem;margin-top:1rem;border-top:2px solid #255448;padding-top:12px}
@media(max-width:700px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:450px){.grid{grid-template-columns:1fr}}
@media print{@page{size:landscape;margin:8mm}body{padding:0;max-width:none}header{margin-bottom:8px}.grid{grid-template-columns:repeat(3,1fr);gap:5mm}.panel{min-height:59mm;padding:9px}.art{padding:0;font-size:3rem}}
</style></head><body><header><small>STATIC COLLECTIVE / CANNON CULTURE FORGE 001 / ORIGINAL SYNTHETIC STORY</small><h1>A Room That Remembers</h1>
<p>One question becomes a printable cultural object: <strong>${htmlEscape(topic)}</strong></p></header>
<main class="grid">${panels}</main>
<footer>Print this page and carry the method, not a claim about who owns it. Fictional GrO field test: 42 WOOD claimed, 39 fictitiously counted; all stock and benefits held. This locally produced HTML is an actual artifact, not an NFT, licensed artwork, field receipt, physical inventory or PENNY.</footer>
</body></html>\n`;
}
function makeFieldCard(topic,webz,gro){
 return '# ONE ROOM, SIX PANELS — FIELD CARD\n\n'+
 'Question: '+topic+'\n\n'+
 'This package contains a newly generated printable six-panel cultural object. It is not a report of a real event.\n\n'+
 '## What can happen next?\n\n'+
 '- Print the comic as a fictional demonstration.\n'+
 '- Let a local host choose whether to ask the question.\n'+
 '- Let creators make their own song, photo, film, book or adaptation from the idea.\n'+
 '- Separately check authorship, publication and reuse rights before public release.\n'+
 '- Ask a different authorized person to witness any claimed real contribution.\n\n'+
 '## Native observed computation\n\n'+
 '- WebZ: '+webz.schema+'; cultural medium '+webz.proposedCrafts[1].medium+'.\n'+
 '- GrO: '+gro.schema+'; discrepancy '+gro.observations.discrepancy+'.\n'+
 '- Recognized material stock: 0; Full Measure Deeds: 0; PENNY issued: 0.\n'+
 '- No GrO trace, physical heat, payment, NFT mint, recipient contact, or reLATTE crossing.\n';
}
export async function composeNative(roots,topic='A room that remembers how to share a useful discovery'){
 topic=safeText(topic);
 const witness=verifyNativeSources(roots);
 // The only donor execution allowed here is these specifically reviewed pure functions.
 const webz=await import(pathToFileURL(join(resolve(roots.webz),'bridge/harmony/craft-economy.mjs')).href);
 const gro=await import(pathToFileURL(join(resolve(roots.gro),'src/mattercraft-field.js')).href);
 const w=await webz.composeMatterIdeaCraft({profileId:'food',topic,claimedWood:42,observedWood:39,proposedBurn:4,expression:'panels'});
 fail(await webz.verifyMatterIdeaCraft(w),'WEBZ_NATIVE_PREVIEW_INVALID');
 const claim={schema:'gro.mattercraft-material-claim/v0',resourceId:'wood:042',material:'WOOD',quantity:42,
  unit:'wood-bundle',unitStandardRef:'unit:breadbox-wood-candidate',placeId:'place:fictional-depot',
  stewardRef:'steward:fictional-a',claimStatus:'OWNER_DECLARED_UNVERIFIED'};
 const sha=gro.digestClaim(claim);
 const g=gro.projectMattercraftEncounter({place:{id:claim.placeId},actor:{id:'actor:fictional-volunteer',held:[]},
  traces:[],claim,expectedClaimSha256:sha,
  witness:{observerRef:'actor:fictional-counter',quantityObserved:39,method:'HAND_COUNT',
   evidenceSha256:'e'.repeat(64),status:'UNSIGNED_WITNESS_CANDIDATE'},
  appreciation:{resource:'NONE',quantity:0,sponsorRef:'steward:fictional-a',state:'UNFUNDED_PROPOSAL'}});
 const material=gro.previewMaterialTransform({claim,expectedClaimSha256:sha,woodInputQty:4});
 fail(g.observations.discrepancy==='COUNTS_DISAGREE_HOLD'&&material.materialInventoryChanged===false,'GRo_EFFECT_REFUSED');
 fail(w.proposedCrafts[0].proposedInput.count===material.input.quantity,'CROSS_ORGAN_QUANTITY_MISMATCH');
 const zine=makeZine(topic,w,g),fieldCard=makeFieldCard(topic,w,g);
 const body={schema:SCHEMA,version:1,topic,status:'SOURCE_PINNED_NATIVE_EXECUTION_LOCAL_ARTIFACT_ONLY',
  sources:witness,sourceSelection:'EXPLICIT_COMMIT_PINS_NOT_CANON',
  nativeResults:{webz:{schema:w.schema,previewId:w.previewId},gro:{schema:g.schema,claimSha256:sha,discrepancy:g.observations.discrepancy}},
  outputs:{'comic.html':sha256(Buffer.from(zine)), 'field-card.md':sha256(Buffer.from(fieldCard))},
  executable:{functionsCalled:['webZ.composeMatterIdeaCraft','webZ.verifyMatterIdeaCraft','GrO.digestClaim','GrO.projectMattercraftEncounter','GrO.previewMaterialTransform'],
   actualLocalMediaCreated:['comic.html','field-card.md'],sourceReposModified:false},
  grants:{canonSelected:false,rightsAuthenticated:false,ownerIdentityAuthenticated:false,liveStewardApproved:false,
   sourceCopyrightGranted:false,reLATTEReceived:false,externalSettlement:false},
  effects:{realInventoryChange:0,fullMeasureDeeds:0,pennyIssued:0,marketTokensMinted:0,payments:0,
   thirdPartyMessages:0,publicRelease:false},
  nonclaims:['TEST_ACTOR_IS_FICTIONAL','EXACT_GIT_OBJECTS_DO_NOT_AUTHENTICATE_REAL_OWNER',
   'COMIC_EXISTS_AS_BYTES_BUT_PUBLICATION_AND_REUSE_RIGHTS_ARE_UNREVIEWED',
   'CANNON_RECEIPT_IS_NOT_OWNER_SELECTED_CANON','NO_EXECUTION_BEYOND_FIXED_LOCAL_FUNCTIONS']};
 return {receipt:{...body,receiptSha256:sha256(Buffer.from(JSON.stringify(body)))},
  files:{'comic.html':zine,'field-card.md':fieldCard}};
}
export async function buildNative(roots,out,topic){
 const result=await composeNative(roots,topic);
 fail(!existsSync(out),'OUTPUT_ALREADY_EXISTS');
 mkdirSync(out,{recursive:false,mode:0o700});
 for(const [name,content] of Object.entries({...result.files,'receipt.json':json(result.receipt),'request.json':json({topic:result.receipt.topic})}))
  writeFileSync(join(out,name),content,{flag:'wx',mode:0o600});
 return result.receipt;
}
export async function coldVerifyNative(roots,out){
 const request=JSON.parse(readFileSync(join(out,'request.json'),'utf8'));
 fail(exact(request,['topic']),'REQUEST_SHAPE_CHANGED');
 const expected=await composeNative(roots,request.topic);
 for(const [name,content] of Object.entries({...expected.files,'receipt.json':json(expected.receipt),'request.json':json(request)})){
  const actual=readFileSync(join(out,name));fail(actual.equals(Buffer.from(content)),'COLD_VERIFY_MISMATCH_'+name);
 }
 return {status:'NATIVE_COLD_REPLAY_VERIFIED',receiptSha256:expected.receipt.receiptSha256,
  donorCount:2,donorFunctions:expected.receipt.executable.functionsCalled.length,
  actualLocalMedia:2,spendableWood:0,pennyIssued:0,canonSelected:false};
}
