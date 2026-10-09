/** CANNON PRESENT USE 003 — source witness and deterministic composition.
 * This does not select canon, grant rights, execute donor code, or modify Git.
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, realpathSync, existsSync} from 'node:fs';
import {join, resolve} from 'node:path';

export const PLAN_SCHEMA = 'cannon.present-use-plan/v0';
export const RECEIPT_SCHEMA = 'cannon.present-use-receipt/v0';
const sha40 = /^[0-9a-f]{40}$/;
const repository = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const idPattern = /^[a-z][a-z0-9_-]{0,63}$/;
const sha256 = b => 'sha256:' + createHash('sha256').update(b).digest('hex');
const fail = (v, code) => {if (!v) throw Error(code);};
const object = v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
const fields = (obj, keys) => object(obj) && Object.keys(obj).sort().join() === [...keys].sort().join();
function canonical(v) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return JSON.stringify(v);
  if (typeof v === 'number') {fail(Number.isSafeInteger(v), 'INVALID_INTEGER');return JSON.stringify(v);}
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  fail(object(v), 'INVALID_JSON_VALUE');
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k)+':'+canonical(v[k])).join(',') + '}';
}
const digest = v => sha256(Buffer.from(canonical(v)));
function safePath(p) {
  return typeof p === 'string' && p.length > 0 && p.length < 240 &&
    /^[A-Za-z0-9_.\/-]+$/.test(p) && !p.startsWith('/') &&
    p.split('/').every(segment => segment !== '..' && segment !== '.' && segment !== '');
}
export function validatePlan(plan) {
  fail(fields(plan,['schema','goal','sources','assembly']), 'PLAN_FIELDS_INVALID');
  fail(plan.schema === PLAN_SCHEMA && typeof plan.goal === 'string' &&
    plan.goal.trim().length > 0 && plan.goal.length < 501 &&
    plan.assembly === 'markdown-capsule-v0' && Array.isArray(plan.sources) &&
    plan.sources.length >= 2 && plan.sources.length <= 8, 'INVALID_PLAN');
  const seen = new Set();
  for (const s of plan.sources) {
    fail(fields(s,['id','repository','commit','path','media_type','tags']), 'SOURCE_FIELDS_INVALID');
    fail(typeof s.id === 'string' && idPattern.test(s.id) && !seen.has(s.id) &&
      repository.test(s.repository) && sha40.test(s.commit) && safePath(s.path) &&
      s.media_type === 'text/markdown' && Array.isArray(s.tags) &&
      s.tags.length <= 12 && s.tags.every(t => typeof t === 'string' &&
        /^[a-z0-9-]{1,40}$/.test(t)), 'INVALID_SOURCE');
    seen.add(s.id);
  }
  return plan;
}
function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], {
    encoding: 'buffer', maxBuffer: 2 * 1024 * 1024, timeout: 10000,
    stdio: ['ignore', 'pipe', 'pipe'], env: {...process.env, GIT_CONFIG_NOSYSTEM: '1'},
  });
}
function utf8(b) {
  const decoded = new TextDecoder('utf-8', {fatal:true}).decode(b);
  fail(!decoded.includes('\0'), 'NULL_SOURCE_TEXT');
  return decoded;
}
function gitId(type, body) {
  return createHash('sha1').update(Buffer.from(`${type} ${body.length}\0`)).update(body).digest('hex');
}
function checkOrigin(remote, repo) {
  return remote === `https://github.com/${repo}.git` ||
    remote === `https://github.com/${repo}` ||
    remote === `git@github.com:${repo}.git` ||
    remote === `git@github.com:${repo}`;
}
export function readSource(s, roots) {
  fail(object(roots) && Object.hasOwn(roots, s.repository) &&
    typeof roots[s.repository] === 'string', 'MISSING_REPO_ROOT');
  const root = realpathSync(resolve(roots[s.repository]));
  fail(realpathSync(utf8(git(root, 'rev-parse', '--show-toplevel')).trim()) === root,
    'ROOT_NOT_GIT_TOPLEVEL');
  fail(utf8(git(root, 'rev-parse', '--show-object-format')).trim() === 'sha1', 'UNSUPPORTED_GIT_OBJECT_FORMAT');
  const remote = utf8(git(root, 'config', '--get', 'remote.origin.url')).trim();
  fail(checkOrigin(remote, s.repository), 'DECLARED_GIT_ORIGIN_MISMATCH');
  fail(utf8(git(root, 'cat-file', '-t', s.commit)).trim() === 'commit', 'COMMIT_NOT_PRESENT');
  const body = git(root, 'cat-file', 'commit', s.commit);
  fail(gitId('commit', body) === s.commit, 'COMMIT_OBJECT_HASH_MISMATCH');
  const tree = body.toString('utf8').match(/^tree ([0-9a-f]{40})\n/)?.[1];
  fail(!!tree && utf8(git(root,'rev-parse',`${s.commit}^{tree}`)).trim() === tree, 'COMMIT_TREE_MISMATCH');
  const blob = utf8(git(root,'rev-parse',`${s.commit}:${s.path}`)).trim();
  fail(sha40.test(blob) && utf8(git(root,'cat-file','-t',blob)).trim()==='blob','FILE_NOT_BLOB');
  const bytes = git(root,'cat-file','blob',blob);
  fail(bytes.length <= 512 * 1024 && gitId('blob',bytes) === blob, 'SOURCE_BLOB_INVALID');
  const content = utf8(bytes);
  return {witness: {
    id:s.id, repository:s.repository, commit:s.commit, tree, commit_bytes_sha256:sha256(body),
    path:s.path, blob, blob_sha256:sha256(bytes), size:bytes.length,
    media_type:s.media_type, tags:s.tags,
    origin_check:'LOCAL_CONFIG_ONLY_NOT_REMOTE_ATTESTATION',
  }, content};
}
export function compose(plan, roots) {
  validatePlan(plan);
  const read = plan.sources.map(s => readSource(s,roots));
  const witnesses = read.map(x=>x.witness);
  const sections = read.map((x,i) => `\n---\n\n## ${i+1}. ${x.witness.id}\n\nSource: ${x.witness.repository}@${x.witness.commit} / ${x.witness.path}\n\n` + x.content + (x.content.endsWith('\n')?'':'\n'));
  const composed = `# CANNON 003 — Present-use source capsule\n\nGoal: ${plan.goal}\n\nThis is a deterministic **document composition** from exact independent Git objects. The donor text is source material, not a claimed trusted instruction, executable module, or deployment approval. Branch and canon status do not enter source eligibility.\n` + sections.join('');
  const body = {schema:RECEIPT_SCHEMA,plan_digest:digest(plan),goal:plan.goal,assembly:plan.assembly,
    sources:witnesses,artifact_sha256:sha256(Buffer.from(composed)),
    result:'DOCUMENT_COMPOSED_NOT_EXECUTED',canon_selection_required:false,
    verified_git_source:true,remote_owner_authenticated:false,
    permission_granted:false,git_mutations:0,deployments:0};
  const receipt = {...body,receipt_id:digest(body)};
  return {composed,receipt};
}
export function emit(plan, roots, out) {
  // Resolve and validate everything before creating any output root.
  const result=compose(plan,roots);
  fail(!existsSync(out), 'OUTPUT_ALREADY_EXISTS');
  mkdirSync(out,{recursive:false,mode:0o700});
  writeFileSync(join(out,'composition.md'),result.composed,{flag:'wx',mode:0o600});
  writeFileSync(join(out,'receipt.json'),JSON.stringify(result.receipt,null,2)+'\n',{flag:'wx',mode:0o600});
  return result.receipt;
}
export function coldVerify(plan,roots,out) {
  const expected=compose(plan,roots);
  const actual=readFileSync(join(out,'composition.md'));
  fail(actual.equals(Buffer.from(expected.composed)), 'COMPOSED_ARTIFACT_MISMATCH');
  const rec=JSON.parse(readFileSync(join(out,'receipt.json'),'utf8'));
  fail(canonical(rec) === canonical(expected.receipt), 'RECEIPT_REPLAY_MISMATCH');
  return {status:'COLD_REPLAY_VERIFIED',receipt_id:rec.receipt_id,
    source_count:rec.sources.length,artifact_sha256:rec.artifact_sha256,
    canon_required:false,git_mutations:0,hardware_actions:0};
}
export function now(plan,roots,goal) {
  validatePlan(plan);
  fail(typeof goal==='string' && goal.trim().length>0, 'GOAL_REQUIRED');
  const terms=goal.toLowerCase().match(/[a-z0-9-]{3,}/g)??[];
  const candidates=plan.sources.map(s=> {
    const matched=terms.filter(w=>s.tags.includes(w)||s.repository.toLowerCase().includes(w)||s.path.toLowerCase().includes(w));
    try {
      const checked=readSource(s, roots).witness;
      return {id:s.id, repository:s.repository,commit:s.commit, path:s.path,
        status:'VERIFIED_DOCUMENT_SOURCE',matches:matched.length,bytes:checked.size};
    }catch(error) {
      return {id:s.id,repository:s.repository,commit:s.commit,path:s.path,
        status:'HOLD',matches:matched.length,reason:String(error.message).slice(0,100)};
    }
  }).sort((a,b) => b.matches-a.matches || a.id.localeCompare(b.id));
  return {schema:'cannon.present-use-view/v0',goal,candidates,
    composition_available:candidates.filter(x=>x.status==='VERIFIED_DOCUMENT_SOURCE').length>=2,
    execution_authority:'NONE',canon_required:false,
    notes:'Tags are source-owner claims; matching is string-only, not semantic validation or compatibility proof.'};
}
