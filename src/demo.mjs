/** Synthetic, independently signed CANNON laboratory. Not real owner approval. */
import {newOwner,signEvent,digest,project,EVENT_SCHEMA,BUNDLE_SCHEMA,PINS_SCHEMA} from "./canon-field.mjs";

const TARGETS = {
  os_before: {repository:"the-static-collective/static-os",
    commit:"a97bf1e20b97eab060d6180cd7f4156ccc644b69",
    ref_hint:"experiment/fabrication-crossing-013",
    evidence:["Historical example from Static OS development; CI not verified here"]},
  os_after: {repository:"the-static-collective/static-os",
    commit:"7bc551610421bd60a8dbf624d93d7a6682ce3987",
    ref_hint:"experiment/fabrication-crossing-013",
    evidence:["Selected exact source SHA; signed lab selection is not organization approval"]},
  ghot: {repository:"the-static-collective/GHoT",
    commit:"752c7e2ca2d5211c9f346ddea40691158fb44dde",
    ref_hint:"experiment/unheard-choir-016",
    evidence:["Witness-domain experimental example; build claims are not verified"]},
  relatte: {repository:"the-static-collective/reLATTE",
    commit:"ded308b463df4eda2003000b4202d3c7aaa2dc84",
    ref_hint:"experiment/fabrication-crossing-013",
    evidence:["Interface-domain experimental example; independently signed local lab history"]},
};
const timestamp=i=>new Date(Date.UTC(2026,9,8,18,i,0)).toISOString();
function signedAppend(events,ownerId,identity,body) {
  const event=signEvent({
    schema:EVENT_SCHEMA,owner_id:ownerId,seq:events.length,
    previous:events.length?digest(events.at(-1)):null,
    occurred_at:timestamp(events.length),
    authority:"CANON_SELECTION_ONLY",
    public_key:identity.public_key,
    ...body,
  },identity.private_key);
  events.push(event);
  return digest(event);
}
export function makeDemo(){
  const os=newOwner(), ghot=newOwner(), relatte=newOwner();
  const a=[],b=[],c=[];
  const first=signedAppend(a,"static-os-owner",os,
      {scope:"fabrication:design",track:"experimental",action:"ADMIT",
       target:TARGETS.os_before,replaces:null});
  const second=signedAppend(a,"static-os-owner",os,
      {scope:"fabrication:design",track:"experimental",action:"ADMIT",
       target:TARGETS.os_after,replaces:first});
  signedAppend(a,"static-os-owner",os,
      {scope:"fabrication:design",track:"historical",action:"ADMIT",
       target:TARGETS.os_before,replaces:null});
  const gone=signedAppend(b,"ghot-owner",ghot,
      {scope:"witness:proof",track:"experimental",action:"ADMIT",
       target:TARGETS.ghot,replaces:null});
  signedAppend(b,"ghot-owner",ghot,
      {scope:"witness:proof",track:"experimental",action:"WITHDRAW",
       target:null,replaces:gone});
  signedAppend(b,"ghot-owner",ghot,
      {scope:"witness:proof",track:"experimental",action:"ADMIT",
       target:TARGETS.ghot,replaces:null});
  signedAppend(c,"relatte-owner",relatte,
      {scope:"interfaces:dynamic",track:"experimental",action:"ADMIT",
       target:TARGETS.relatte,replaces:null});
  const bundle={schema:BUNDLE_SCHEMA,histories:[a,b,c]};
  const pins={schema:PINS_SCHEMA,owners:[
    {owner_id:"static-os-owner",public_key:os.public_key},
    {owner_id:"ghot-owner",public_key:ghot.public_key},
    {owner_id:"relatte-owner",public_key:relatte.public_key}
  ]};
  const view=project(bundle,pins);
  return {bundle,pins,view};
}
