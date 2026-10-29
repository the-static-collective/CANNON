import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,cpSync,existsSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const config=process.env.CREATIVE_BRIDGE_CONFIG;
const run=(args)=>spawnSync(process.execPath,['scripts/creative-bridge.mjs',...args],{encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});
// Catches skipped parent verification, replay that only checks declared hashes,
// disconnected native inputs, forged human KEEP, and an admission that invents human KEEP.
test('verified scenes feed original JAR dealer and Static Live, replay refuses output and parent tampering',{skip:!config?'CREATIVE_BRIDGE_CONFIG required for original source execution':false},()=>{
 const home=mkdtempSync(join(tmpdir(),'creative-bridge-test-'));
 try{
  const out=join(home,'show'), localConfig=join(home,'config.json');
  const sourceConfig=JSON.parse(readFileSync(config));
  cpSync(sourceConfig.parentPacket,join(home,'parent'),{recursive:true});
  const cfg={...sourceConfig,parentPacket:join(home,'parent')};writeFileSync(localConfig,JSON.stringify(cfg));
  let r=run(['build','--config',localConfig,'--out',out,'--authorize','HUMAN_APPROVED']);assert.equal(r.status,2);
  r=run(['build','--config',localConfig,'--out',out,'--authorize','LOCAL_FICTIONAL_ONLY']);assert.equal(r.status,0,r.stderr);
  r=run(['build','--config',localConfig,'--out',out,'--authorize','LOCAL_FICTIONAL_ONLY']);assert.equal(r.status,2);assert.match(r.stderr,/OUTPUT_EXISTS/);
  const receipt=JSON.parse(readFileSync(join(out,'receipt.json')));
  assert.equal(receipt.nativeRepositoryCountAdded,0);assert.equal(receipt.humanKeepCount,0);
  assert.equal(receipt.projections,20);assert.equal(receipt.parentCoverage.executingNativeDonorRepositories,22);
  const decks=[];
  for(const mission of ['mit','voqal','garden','jubilee','commons']){
   const first=JSON.parse(readFileSync(join(out,mission,'0/deck.json'))),last=JSON.parse(readFileSync(join(out,mission,'3/deck.json')));
   assert.equal(first.family.creatures.length,6);assert.match(first.question,new RegExp(mission));
   assert.equal(last.family.operation,'FRESH_BIRTH');assert.equal(last.keepers.length,0);
   assert.notEqual(first.family.familyDigest,last.family.familyDigest);decks.push(first.family.familyDigest);
   const stage=JSON.parse(readFileSync(join(out,mission,'0/stage.json')));
   assert.equal(stage.song.sourceReceipt,first.family.familyDigest);assert.equal(stage.song.title,first.family.creatures[0].title);
   const refusal=JSON.parse(readFileSync(join(out,mission,'0/refusal.json')));
   assert.equal(refusal.noFallback.playable,false);assert.match(refusal.forgedKeep,/HOLD_KEEP_EXACT_CURRENT_CREATURE_REQUIRED/);
  }
  assert.equal(new Set(decks).size,5);
  r=run(['verify','--config',localConfig,'--out',out]);assert.equal(r.status,0,r.stderr);
  const file=join(out,'jubilee/0/deck.json'),saved=readFileSync(file);writeFileSync(file,'forged');
  r=run(['verify','--config',localConfig,'--out',out]);assert.equal(r.status,2);assert.match(r.stderr,/PACKET_BYTES/);writeFileSync(file,saved);
  const bad=join(home,'bad.json');
  writeFileSync(bad,JSON.stringify({...cfg,jarvisRoot:cfg.staticLiveRoot}));
  r=run(['build','--config',bad,'--out',join(home,'wrong-owner'),'--authorize','LOCAL_FICTIONAL_ONLY']);assert.equal(r.status,2);assert.match(r.stderr,/CHECKOUT_PIN_MISMATCH/);
  // Editing parent bytes must fail even if bridge output itself is unchanged.
  const scene=join(cfg.parentPacket,'scenes/jubilee.json'),old=readFileSync(scene);
  try{writeFileSync(scene,'forged');r=run(['verify','--config',localConfig,'--out',out]);assert.equal(r.status,2);assert.match(r.stderr,/PARENT_REPLAY_REFUSED/)}finally{writeFileSync(scene,old)}
 }finally{rmSync(home,{recursive:true,force:true})}
});

// A disconnected decorative bridge would reuse the baseline family and admit a refused parent.
test('a real recombined native scene changes the creative output; refused receiver stops the crossing',{skip:!config?'CREATIVE_BRIDGE_CONFIG required':false},()=>{
 const home=mkdtempSync(join(tmpdir(),'creative-challenge-test-'));
 try{
  const cfg=JSON.parse(readFileSync(config));
  const original=(args)=>spawnSync(process.execPath,['scripts/arcade-machine.mjs',...args],{encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});
  const baselineOut=join(home,'baseline');
  let initial=run(['build','--config',config,'--out',baselineOut,'--authorize','LOCAL_FICTIONAL_ONLY']);assert.equal(initial.status,0,initial.stderr);
  const baseline=JSON.parse(readFileSync(join(baselineOut,'garden/0/deck.json'))).family.familyDigest;
  for(const action of ['recombine','refuse']){
   const parent=join(home,action),req=join(home,action+'.json'),localConfig=join(home,action+'-config.json'),out=join(home,action+'-creative');
   writeFileSync(req,JSON.stringify({schema:'arcade.challenge/v1',mission:'garden',action,authorized:true,receiver:'HOLD',variant:'A',secondary:'jubilee',requestId:'creative-'+action}));
   let r=original(['challenge','--config',cfg.arcadeConfig,'--request',req,'--out',parent,'--authorize','LOCAL_FICTIONAL_ONLY']);assert.equal(r.status,0,r.stderr);
   writeFileSync(localConfig,JSON.stringify({...cfg,parentPacket:parent}));
   r=run(['build','--config',localConfig,'--out',out,'--authorize','LOCAL_FICTIONAL_ONLY']);
   if(action==='refuse'){assert.equal(r.status,2);assert.match(r.stderr,/PARENT_REFUSAL_OR_UNRESOLVED_BRANCH:REFUSE_RECEIVER/);assert.equal(existsSync(out),false)}
   else{
    assert.equal(r.status,0,r.stderr);
    const deck=JSON.parse(readFileSync(join(out,'garden/0/deck.json')));
    const answer=JSON.parse(deck.answer);
    assert.deepEqual(answer.selectedSources,JSON.parse(readFileSync(join(parent,'result.json'))).selectedSources);
    assert.ok(answer.selectedSources.length>=2);
    assert.equal(JSON.parse(readFileSync(join(out,'receipt.json'))).projections,4);
    assert.notEqual(deck.family.familyDigest,baseline);
    const html=readFileSync(join(out,'first-boot.html'),'utf8');
    const target=/href="([^"]+)">Open the retained stranger machine/.exec(html)[1];
    assert.ok(existsSync(join(out,target)),'retained challenge navigation must resolve');
   }
  }
 }finally{rmSync(home,{recursive:true,force:true})}
});

test('parent snapshot cannot discard an unreceipted empty directory',{skip:!config?'CREATIVE_BRIDGE_CONFIG required':false},()=>{
 const home=mkdtempSync(join(tmpdir(),'creative-empty-test-'));
 try{
  const cfg=JSON.parse(readFileSync(config));cpSync(cfg.parentPacket,join(home,'parent'),{recursive:true});mkdirSync(join(home,'parent/unreceipted'));
  const local=join(home,'config.json');writeFileSync(local,JSON.stringify({...cfg,parentPacket:join(home,'parent')}));
  const r=run(['build','--config',local,'--out',join(home,'out'),'--authorize','LOCAL_FICTIONAL_ONLY']);
  assert.equal(r.status,2,'unexpected empty parent directory must refuse');
 }finally{rmSync(home,{recursive:true,force:true})}
});
