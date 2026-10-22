// STACK² 025: an inspection-only census of potential community donors.
// Read-only, offline, zero dependencies. It does not execute or contact donor repositories.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('./', import.meta.url);
const organs = ['notice','gather','relate','offer','create','act','witness','return'];
const lanes = ['door','care','culture','compute','planning','provenance','research','scripture_optional','stewardship'];
const shape = (value, required) => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw Error('BREATH_REFUSED: expected object');
  const keys = Object.keys(value);
  if (keys.length !== required.length || keys.some(k => !required.includes(k)) || required.some(k => !Object.hasOwn(value,k)))
    throw Error('BREATH_REFUSED: unexpected, missing or personal-data-shaped field');
};
const assert = (x,m) => { if (!x) throw Error('BREATH_REFUSED: '+m); };
const sha = x => typeof x === 'string' && /^[0-9a-f]{40}$/.test(x);

export function audit(census, sources) {
  shape(census, ['schema','observedDate','classification','coverage','rules','repositories']);
  assert(census.schema === 'cannon.community-breath-census/v0', 'schema');
  assert(census.observedDate === '2026-10-22', 'observation date');
  assert(census.classification === 'CANDIDATE_METADATA_NOT_ADOPTION_OR_RUNTIME', 'no authority promotion');
  assert(census.coverage === 'CONNECTED_LIST_PAGE_PLUS_DIRECT_README_FETCHES_NON_EXHAUSTIVE', 'coverage caveat required');
  const requiredRules = ['UNARCHIVED_IS_NOT_ALIVE','README_IS_NOT_FIELD_PROOF','BLOB_SHA_IS_NOT_COMMIT_SHA',
    'DISCOVERED_IS_NOT_CONSENT','NAME_IS_NOT_FUNCTION','NO_AUTOMATIC_EXECUTION'];
  assert(Array.isArray(census.rules) && census.rules.length === requiredRules.length &&
    requiredRules.every(rule => census.rules.includes(rule)), 'invariants');
  assert(Array.isArray(census.repositories) && census.repositories.length <= 2048 && census.repositories.length > 0, 'bounded registry');
  const seen = new Set();
  let readmes = 0, metadataOnly = 0, listed = 0, extra = 0;
  for (const row of census.repositories) {
    shape(row, ['repository','branch','archived','discovery','observation','proposedLane','readmeBlobSha']);
    assert(typeof row.repository === 'string' && /^the-static-collective\/[A-Za-z0-9._-]+$/.test(row.repository), 'repository address');
    assert(!seen.has(row.repository.toLowerCase()), 'duplicate repository'); seen.add(row.repository.toLowerCase());
    assert(row.discovery === 'CONNECTED_GITHUB_REPOSITORY_LIST' || row.discovery === 'DIRECT_README_FETCH', 'discovery source');
    if (row.discovery === 'CONNECTED_GITHUB_REPOSITORY_LIST') {
      assert(typeof row.branch === 'string' && row.branch.length <= 128 &&
        /^[\w./-]+$/.test(row.branch), 'listed branch');
      assert(typeof row.archived === 'boolean', 'listed archive observation');
      listed++;
    } else {
      assert(row.branch === null && row.archived === null, 'no inferred status for direct inspection');
      extra++;
    }
    assert(row.observation === 'README_INSPECTED_ONLY' || row.observation === 'METADATA_ONLY', 'no inferred runtime');
    if (row.observation === 'README_INSPECTED_ONLY') {
      assert(sha(row.readmeBlobSha) && lanes.includes(row.proposedLane), 'README evidence or tentative lane');
      readmes++;
    } else {
      assert(row.readmeBlobSha === null && row.proposedLane === null, 'unreviewed classification');
      metadataOnly++;
    }
  }
  shape(sources, ['schema','classification','organs']);
  assert(sources.schema === 'cannon.stack82-source-registry/v0' &&
    sources.classification === 'SOURCE_POINTERS_NOT_PERMISSION', 'source registry');
  assert(Array.isArray(sources.organs) && sources.organs.length === 8, 'eight organs');
  sources.organs.forEach((o,i) => {
    shape(o,['organ','repository','commit','pr','state','interface']);
    assert(o.organ === organs[i], 'organ order');
    assert(seen.has(o.repository.toLowerCase()) && sha(o.commit) && Number.isSafeInteger(o.pr) && o.pr > 0, 'source pin');
    assert(['EXPERIMENTAL_DRAFT','MERGED_SOURCE_UNDEPLOYED'].includes(o.state), 'experimental source');
    assert(o.interface === 'INSPECT_ONLY_UNVERIFIED', 'no live adapter');
  });
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({census,sourceRegistry:sources})).digest('hex');
  return {
    schema:'cannon.community-breath-audit/v0',
    observedDate:census.observedDate,
    inventory:{total:seen.size,metadataOnly,readmeInspectedOnly:readmes,listed,additionalDirectReads:extra},
    sourceRegistry:{organs:organs.length,potentialDirectedPairs:organs.length**2,
      actualValidatedInteroperableAdapters:0,status:'UNTESTED_RELATIONS_ONLY'},
    operationalReady:'NOT_ASSESSED',communityAuthorized:false,liveOperations:false,
    permitsDeployment:false,permitsPublication:false,
    reproducibleInputDigest:fingerprint
  };
}

function main() {
  const census=JSON.parse(readFileSync(new URL('./community-breath-census.json',root),'utf8'));
  const sources=JSON.parse(readFileSync(new URL('./source-registry.json',root),'utf8'));
  process.stdout.write(JSON.stringify(audit(census,sources),null,2)+'\n');
}
if(process.argv[1] && import.meta.url === new URL('file://'+process.argv[1]).href){
  try{main()}catch(e){console.error(e.message);process.exitCode=1}
}
