#!/usr/bin/env node
/**
 * Native CANON-CROSSING-002 CLI.
 * The donor repo and source Git object must be operator-selected pinned checkouts.
 */
import {readFile,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {makeDemo} from "../src/demo.mjs";
import {preparePlan,carry,verifyCrossing} from "../src/canon-crossing.mjs";

function parse(args){
  const out={};
  for(let i=0;i<args.length;i+=2){
    if(!args[i]?.startsWith("--")||i+1>=args.length||
       Object.hasOwn(out,args[i].slice(2)))throw Error("INVALID_OR_DUPLICATE_CLI_ARGUMENT");
    out[args[i].slice(2)]=args[i+1];
  }
  const required=["source","relatte","out","at"];
  for(const k of required)if(!out[k])throw Error("MISSING_EXPLICIT_"+k.toUpperCase());
  const options={owner_id:out.owner??"static-os-owner",
    scope:out.scope??"fabrication:design",track:out.track??"experimental",
    source_root:resolve(out.source),relay_root:resolve(out.relatte),
    created_at:out.at,output_root:resolve(out.out),disposition:out.disposition??"HOLD"};
  return {options,inputs:out};
}
async function read(p){return JSON.parse(await readFile(resolve(p),"utf8"));}
const [command,...args]=process.argv.slice(2);
try{
  if(!["run","verify"].includes(command))throw Error("COMMAND_REQUIRED_RUN_OR_VERIFY");
  const {options,inputs}=parse(args);
  const demo=inputs.bundle?null:makeDemo();
  const bundle=demo?demo.bundle:await read(inputs.bundle);
  const pins=demo?demo.pins:inputs.pins?await read(inputs.pins):null;
  if(!pins)throw Error("EXTERNALLY_SELECTED_OWNER_PINS_REQUIRED");
  const base={bundle,pins,...options};
  if(command==="run"){
    const plan=preparePlan(base);
    const record=await carry(plan,options.relay_root);
    const root=options.output_root;
    await writeFile(join(root,"cannon-plan.json"),JSON.stringify(plan,null,2)+"\n",
      {encoding:"utf8",flag:"wx",mode:0o600});
    const lab={
      schema:"cannon.lab-native-cryptographic-pins/v0",
      warning:"SELF-DESCRIBED SIGNERS: cryptographic consistency only. External owner policy and trusted receiver keys are NOT established.",
      receiver_public_key:record.receiver_public_key_pin,
      crossing_source_public_key:record.crossing_source_public_key_pin
    };
    await writeFile(join(root,"lab-native-signer-pins.json"),JSON.stringify(lab,null,2)+"\n",
      {encoding:"utf8",flag:"wx",mode:0o600});
    if(demo){
      await writeFile(join(root,"lab-owner-bundle.json"),JSON.stringify(bundle,null,2)+"\n",
        {encoding:"utf8",flag:"wx",mode:0o600});
      await writeFile(join(root,"lab-owner-pins.json"),JSON.stringify(pins,null,2)+"\n",
        {encoding:"utf8",flag:"wx",mode:0o600});
    }
    console.log(JSON.stringify({status:record.status,plan_id:plan.plan_id,
      crossing_id:record.crossing_id,native_receipt:record.disposition_receipt_id,
      main_modified:false,deployed:false,disposition:options.disposition,
      laboratory_pins_used:!!demo},null,2));
  }else{
    const plan=await read(join(options.output_root,"cannon-plan.json"));
    const nativePins=await read(inputs["native-pins"]??join(options.output_root,"lab-native-signer-pins.json"));
    if(nativePins.schema!=="cannon.lab-native-cryptographic-pins/v0")
      throw Error("NATIVE_SIGNER_PIN_FORMAT_UNEXPECTED");
    const result=await verifyCrossing({plan,...base,
      expected_receiver_public_key_pin:nativePins.receiver_public_key,
      expected_crossing_source_public_key_pin:nativePins.crossing_source_public_key});
    console.log(JSON.stringify(result,null,2));
  }
}catch(error){
  console.error("HOLD:",String(error?.message??error).slice(0,420));
  process.exitCode=2;
}
