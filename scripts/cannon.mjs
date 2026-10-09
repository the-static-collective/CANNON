#!/usr/bin/env node
/** CANNON 001: offline owner selection, never Git manipulation or execution. */
import {
  readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync
} from "node:fs";
import {resolve,join} from "node:path";
import {newOwner, signEvent,project} from "../src/canon-field.mjs";
import {makeDemo} from "../src/demo.mjs";

const read=path=>JSON.parse(readFileSync(resolve(path),"utf8"));
const save=(path,value,mode=0o600)=>{
  const contents=typeof value==="string"?value:JSON.stringify(value,null,2)+"\n";
  writeFileSync(resolve(path),contents,{flag:"wx",mode});
};
function failUnlessNew(path){
  if(existsSync(resolve(path)))throw new Error("CANNON_OCCURRENCE_ALREADY_EXISTS_NO_AUTORETRY");
}
const [command,...args]=process.argv.slice(2);
try {
  if(command==="demo" && args.length===1) {
    const root=resolve(args[0]);failUnlessNew(root);
    mkdirSync(root,{recursive:true,mode:0o700});
    const {bundle,pins,view}=makeDemo();
    save(join(root,"bundle.json"),bundle);
    save(join(root,"lab-generated-pins.json"),pins);
    save(join(root,"view.json"),view);
    console.log(JSON.stringify({status:"SYNTHETIC_SIGNED_CANON_VIEW_NOT_OWNER_APPROVAL",
      event_count:view.historical_events.length,active_selections:view.active.length,
      branch_merges:0,physical_or_deployment_grants:0,view_file:join(root,"view.json")}));
  } else if(command==="verify" && [2,3].includes(args.length)) {
    const [bundle,pins,checkpoint]=args;
    const out=project(read(bundle),read(pins),
       checkpoint?read(checkpoint):undefined);
    console.log(JSON.stringify(out,null,2));
  } else if(command==="checkpoint" && args.length===3) {
    const [bundle,pins,out]=args;
    failUnlessNew(out);
    const view=project(read(bundle),read(pins));
    save(out,{schema:"cannon.observer-checkpoint/v1",frontiers:view.frontiers});
    console.log("OBSERVER_SELECTED_CHECKPOINT_ONLY_NOT_A_GLOBAL_LATEST_HEAD");
  } else if(command==="keygen" && args.length===1) {
    const root=resolve(args[0]);failUnlessNew(root);
    mkdirSync(root,{recursive:true,mode:0o700});
    const owner=newOwner();
    save(join(root,"private-key.pem"),owner.private_key,0o600);
    save(join(root,"public-key.pem"),owner.public_key,0o644);
    console.log("NEW_OWNER_KEYPAIR_CREATED. Protect the private key; publish only a separately approved trust pin.");
  } else if(command==="sign" && args.length===3) {
    const [unsigned,privatePath,out]=args;failUnlessNew(out);
    const privateKey=readFileSync(resolve(privatePath),"utf8");
    const event=signEvent(read(unsigned),privateKey);
    save(out,event);
    console.log("OWNER_EVENT_SIGNED_CANDIDATE_ONLY_NOT_YET_ADMITTED_IN_A_TRUSTED_HISTORY");
  } else {
    throw Error("Usage: cannon.mjs demo <NEW_DIR> | verify <BUNDLE.json> <EXTERNAL_PINS.json> [CHECKPOINT.json] | checkpoint <BUNDLE> <PINS> <NEW.json> | keygen <NEW_DIR> | sign <UNSIGNED.json> <PRIVATE_KEY.pem> <NEW.json>");
  }
} catch(error) {
  console.error("HOLD:",String(error?.message??error).slice(0,300));
  process.exitCode=2;
}
