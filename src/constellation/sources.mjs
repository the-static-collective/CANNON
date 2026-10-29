import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,lstatSync,realpathSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export const SELECTION=JSON.parse(readFileSync(join(ROOT,'constellation/sources.json'),'utf8'));
export const json=v=>JSON.stringify(v,null,2)+'\n';
export const hash=v=>'sha256:'+createHash('sha256').update(v).digest('hex');
export const requireThat=(ok,code)=>{if(!ok)throw Error(code);};
export function checkSource(source,root){
 requireThat(/^[a-f0-9]{40}$/.test(source.commit),'INVALID_EXACT_PIN');
 const base=realpathSync(resolve(root));
 const git=(...args)=>execFileSync('git',['--no-replace-objects','-C',base,...args],{encoding:'utf8',timeout:20000,maxBuffer:16*1024*1024}).trim();
 requireThat(git('rev-parse','HEAD')===source.commit,'CHECKOUT_PIN_MISMATCH');
 requireThat(git('cat-file','-t',source.commit)==='commit','PIN_NOT_COMMIT');
 const objectCheck=(type,oid)=>{
  const bytes=execFileSync('git',['--no-replace-objects','-C',base,'cat-file',type,oid],{maxBuffer:16*1024*1024,timeout:20000});
  const actual=createHash('sha1').update(type+' '+bytes.length+'\0').update(bytes).digest('hex');
  requireThat(actual===oid,'SOURCE_GIT_OBJECT_BYTES:'+oid);
 };
 objectCheck('commit',source.commit);
 const rootTree=git('rev-parse',source.commit+'^{tree}');objectCheck('tree',rootTree);
 for(const entry of git('ls-tree','-rdz',source.commit).split('\0').filter(Boolean))objectCheck('tree',entry.split('\t')[0].split(' ')[2]);
 const origin=git('remote','get-url','origin').replace(/\.git$/,'');
 requireThat(origin==='https://github.com/'+source.repository||origin==='git@github.com:'+source.repository,'SOURCE_ORIGIN_MISMATCH');
 const tree=git('ls-tree','-rz',source.commit).split('\0').filter(Boolean);
 const content=[],tracked=new Set(tree.map(entry=>entry.split('\t')[1]));
 // Reject nearer Node package scopes/resolvers, injected Python modules and
 // untracked symlinks before importing any selected source. Root dependencies
 // are acquired separately; the sole imported external package is byte-locked.
 function runtimeInputs(dir,prefix=''){
  for(const e of readdirSync(dir,{withFileTypes:true})){
   const rel=prefix+e.name;
   if(!prefix&&['.git','node_modules','.build','dist','build','coverage','.venv','.pytest_cache'].includes(e.name))continue;
   if(e.name==='__pycache__')continue; // CLI uses an isolated fresh Python cache.
   requireThat(!e.isSymbolicLink(),'SOURCE_UNTRACKED_RUNTIME_SYMLINK:'+rel);
   if(e.isDirectory())runtimeInputs(join(dir,e.name),rel+'/');
   else if(/\.(?:mjs|cjs|js|ts|json|py|pyc|pth|so|node)$/i.test(e.name))
    requireThat(tracked.has(rel),'SOURCE_UNTRACKED_RUNTIME_INPUT:'+rel);
  }
 }
 runtimeInputs(base);
 for(const entry of tree){
  const [meta,path]=entry.split('\t');const [mode,type,oid]=meta.split(' ');
  requireThat(type==='blob'&&['100644','100755'].includes(mode),'SOURCE_NONREGULAR_ENTRY');
  const live=join(base,path);
  requireThat(lstatSync(live).isFile()&&realpathSync(live)===live,'SOURCE_SYMLINK');
  const bytes=readFileSync(live),blob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  requireThat(blob===oid,'SOURCE_BYTES_MISMATCH:'+source.repository+':'+path);
  content.push([path,oid,hash(bytes)]);
 }
 return {repository:source.repository,commit:source.commit,tree:git('rev-parse',source.commit+'^{tree}'),files:tree.length,trackedBytesDigest:hash(json(content)),originAuthenticated:false};
}
export function checkRuntimeDependency(root){
 const pin=JSON.parse(readFileSync(join(ROOT,'constellation/runtime-dependency.json')));
 const base=join(realpathSync(root),'node_modules',pin.package);
 const entries=[];
 function walk(dir,prefix=''){
  for(const e of readdirSync(dir,{withFileTypes:true})){
   const rel=prefix+e.name,path=join(dir,e.name);
   requireThat(!e.isSymbolicLink()&&realpathSync(path)===path,'DEPENDENCY_SYMLINK');
   if(e.isDirectory())walk(path,rel+'/');else{requireThat(e.isFile(),'DEPENDENCY_ENTRY');entries.push(rel)}
  }
 }
 walk(base);
 const resolved=createRequire(join(realpathSync(root),'src/canonical.ts')).resolve(pin.package);
 requireThat(realpathSync(resolved).startsWith(base+'/'),'DEPENDENCY_RESOLVER_SHADOW');
 requireThat(entries.sort().join()===Object.keys(pin.files).sort().join(),'DEPENDENCY_FILE_SET');
 for(const [name,digest] of Object.entries(pin.files))requireThat(hash(readFileSync(join(base,name)))===digest,'DEPENDENCY_BYTES:'+name);
 requireThat(JSON.parse(readFileSync(join(base,'package.json'))).version===pin.version,'DEPENDENCY_VERSION');
 return {package:pin.package,version:pin.version,bytesDigest:hash(json(pin.files))};
}
export function checkSources(roots){
 requireThat(Object.keys(roots).sort().join()===Object.keys(SELECTION.sources).sort().join(),'EXACT_DONOR_ROOTS_REQUIRED');
 const witnesses=Object.fromEntries(Object.entries(SELECTION.sources).map(([id,s])=>[id,checkSource(s,roots[id])]));
 checkRuntimeDependency(roots.relatte);return witnesses;
}
