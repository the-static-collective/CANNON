#!/usr/bin/env node
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {appendEvent, createLedger, hash, inspectLedger} from '../src/season/witness.mjs';

const readJson = path => JSON.parse(readFileSync(resolve(path), 'utf8'));
const save = (path, value, exclusive = false) =>
  writeFileSync(resolve(path), JSON.stringify(value, null, 2) + '\n',
    {encoding:'utf8', flag:exclusive ? 'wx' : 'w'});
const proof = label => hash('FICTIONAL_FIXTURE_' + label);
function demonstration(dir) {
  mkdirSync(dir, {recursive:true});
  let garden = createLedger({
    caseId:'fictional-garden-001', ownerId:'fixture-owner',
    purpose:'A fictional community food and music exchange experiment'
  });
  const events = [
    {id:'s1',kind:'SOFTWARE',actor:'fixture-builder',at:'2027-01-01T10:00:00Z',
      resultDigest:proof('output'),artifactDigest:proof('build-record')},
    {id:'r1',kind:'REPLAY',actor:'fixture-replayer',at:'2027-01-01T10:01:00Z',
      softwareId:'s1',resultDigest:proof('output'),methodDigest:proof('replay-method')},
    {id:'h1',kind:'HOLD',actor:'fixture-critic',at:'2027-01-01T10:02:00Z',
      reason:'CONSENT',detailDigest:proof('consent-objection')},
    {id:'u1',kind:'RELEASE',actor:'fixture-critic',at:'2027-01-01T10:03:00Z',
      holdId:'h1',resolutionDigest:proof('resolved-objection')},
    {id:'g1',kind:'TRIAL_GATE',actor:'fixture-gate-reviewer',at:'2027-01-01T10:04:00Z',
      replayId:'r1',scopeDigest:proof('scope'),safetyDigest:proof('safety'),
      venueDigest:proof('venue'),consentPolicyDigest:proof('consent-policy'),
      stewardId:'fixture-steward'},
    {id:'f1',kind:'FIELD',actor:'fixture-steward',at:'2027-01-01T10:05:00Z',
      gateId:'g1',consentDigest:proof('participant-consent'),reportDigest:proof('field-report')},
    {id:'o1',kind:'OUTCOME',actor:'fixture-independent-observer',at:'2027-01-01T10:06:00Z',
      fieldId:'f1',participantConfirmationDigest:proof('participant-confirmation'),
      reportDigest:proof('outcome-observation')}
  ];
  for (const event of events) garden = appendEvent(garden, event);
  save(join(dir,'fictional-garden.json'),garden,true);
  let refusal = createLedger({
    caseId:'fictional-refusal-001', ownerId:'fixture-owner',
    purpose:'A fictional institution declines a proposed experiment'
  });
  refusal = appendEvent(refusal,{...events[0],id:'s2'});
  refusal = appendEvent(refusal,{id:'h2',kind:'HOLD',actor:'fixture-reviewer',at:'2027-01-01T10:02:00Z',
    reason:'PERMISSION',detailDigest:proof('permission-missing')});
  refusal = appendEvent(refusal,{id:'x2',kind:'REFUSE',actor:'fixture-reviewer',at:'2027-01-01T10:03:00Z',
    reason:'PERMISSION',detailDigest:proof('declined')});
  save(join(dir,'fictional-refusal.json'),refusal,true);
  return [inspectLedger(garden),inspectLedger(refusal)];
}
function usage() { throw new Error('USAGE: new FILE CASE_ID OWNER_ID PURPOSE | add FILE EVENT.json | verify FILE | inspect FILE | demo NEW_DIRECTORY'); }

try {
  const [command, ...args] = process.argv.slice(2);
  let output;
  if (command === 'new' && args.length === 4) {
    const [path,caseId,ownerId,purpose] = args;
    const ledger = createLedger({caseId,ownerId,purpose});
    save(path,ledger,true);
    output = inspectLedger(ledger);
  } else if (command === 'add' && args.length === 2) {
    const [path,eventFile] = args;
    const ledger = appendEvent(readJson(path),readJson(eventFile));
    save(path,ledger);
    output = inspectLedger(ledger);
  } else if (['verify','inspect'].includes(command) && args.length === 1) {
    output = inspectLedger(readJson(args[0]));
  } else if (command === 'demo' && args.length === 1) {
    output = demonstration(resolve(args[0]));
  } else usage();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
} catch (error) {
  process.stderr.write('HOLD / REFUSE: '+String(error.message)+'\n');
  process.exitCode=2;
}
