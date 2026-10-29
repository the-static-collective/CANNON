import {readFileSync,realpathSync,readdirSync,lstatSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {ROOT,hash,json,requireThat,checkSource,checkSources} from '../constellation/sources.mjs';
import {readSource} from '../present-use.mjs';
import {eligible} from '../../scripts/stranger-source-lab.mjs';
export const NATIVE=JSON.parse(readFileSync(join(ROOT,'constellation/native-002.json')));
export const ATLAS=JSON.parse(readFileSync(join(ROOT,'constellation/atlas.json')));
export function loadConfig(path){
 const c=JSON.parse(readFileSync(resolve(path)));
 requireThat(c?.schema==='arcade.local-config/v1'&&Object.keys(c).sort().join()===['schema','inheritedRoots','nativeRoots','documentRoots','toolchain'].sort().join(),'LOCAL_CONFIG_SHAPE');
 requireThat(Object.keys(c.nativeRoots).sort().join()===Object.keys(NATIVE.sources).sort().join(),'NATIVE_ROOT_SET');
 for(const value of [...Object.values(c.nativeRoots),...Object.values(c.inheritedRoots),c.toolchain,c.documentRoots])requireThat(typeof value==='string'&&value.length>0,'CONFIG_PATH');
 return c;
}
export function checkPackages(config){
 const selection=JSON.parse(readFileSync(join(ROOT,'constellation/arcade-packages.json'))),witnesses=[];
 for(const spec of selection.packages){
  const parent=spec.root==='toolchain'?config.toolchain:config.nativeRoots[spec.root];
  const path=join(realpathSync(parent),'node_modules',spec.path);
  requireThat(realpathSync(path)===path,'RUNTIME_PACKAGE_SYMLINK');
  const files=[];
  function scan(dir,prefix=''){
   for(const e of readdirSync(dir,{withFileTypes:true})){
    const rel=prefix+e.name,p=join(dir,e.name);
    requireThat(!e.isSymbolicLink()&&realpathSync(p)===p,'RUNTIME_PACKAGE_SYMLINK');
    if(e.isDirectory())scan(p,rel+'/');else {requireThat(e.isFile(),'PACKAGE_NONREGULAR');files.push(rel)}
   }
  }
  scan(path);requireThat(files.sort().join()===Object.keys(spec.files).sort().join(),'RUNTIME_PACKAGE_FILE_SET');
  for(const [name,digest] of Object.entries(spec.files))requireThat(hash(readFileSync(join(path,name)))===digest,'RUNTIME_PACKAGE_BYTES:'+spec.path+'/'+name);
  if(spec.resolveFrom){const result=createRequire(join(realpathSync(parent),spec.resolveFrom)).resolve(spec.name);requireThat(realpathSync(result).startsWith(path+'/'),'RUNTIME_PACKAGE_SHADOW')}
  witnesses.push({name:spec.name,version:spec.version,sourceRoot:spec.root,files:files.length,digest:hash(json(spec.files))});
 }
 return witnesses;
}
export function documentSources(config){
 const roots=JSON.parse(readFileSync(config.documentRoots));
 requireThat(roots.schema==='stranger-roots/v1'&&Array.isArray(roots.entries)&&roots.entries.length>=50&&roots.entries.length<=80,'DOCUMENT_ROOTS_SHAPE');
 const entries=new Map(eligible(ATLAS).map(e=>[e.repository,e])),seen=new Set(),documents=[];
 for(const r of roots.entries){
  requireThat(!seen.has(r.repository)&&entries.has(r.repository),'DUPLICATE_OR_UNKNOWN_DOCUMENT');seen.add(r.repository);const pin=entries.get(r.repository);
  requireThat(r.commit===pin.defaultHead,'STALE_DOCUMENT_PIN');
  const root=realpathSync(resolve(r.root));const git=(...args)=>execFileSync('git',['--no-replace-objects','-C',root,...args],{encoding:'utf8',timeout:20000}).trim();
  requireThat(git('rev-parse','HEAD')===pin.defaultHead,'DOCUMENT_HEAD_PIN');
  const {witness}=readSource({id:'arcade-document',repository:pin.repository,commit:pin.defaultHead,path:'README.md',media_type:'text/markdown',tags:[]},{[pin.repository]:root});
  const original=execFileSync('git',['--no-replace-objects','-C',root,'cat-file','blob',witness.blob]);
  const treeBytes=execFileSync('git',['--no-replace-objects','-C',root,'cat-file','tree',pin.tree]);
  requireThat(createHash('sha1').update('tree '+treeBytes.length+'\0').update(treeBytes).digest('hex')===pin.tree,'DOCUMENT_TREE_OBJECT_BYTES');
  const live=join(root,'README.md');requireThat(lstatSync(live).isFile()&&realpathSync(live)===live&&hash(readFileSync(live))===pin.inspectedFiles['README.md'],'DOCUMENT_WORKTREE_BYTES');
  requireThat(git('rev-parse',pin.defaultHead+'^{tree}')===pin.tree,'DOCUMENT_TREE_PIN');
  requireThat(hash(original)===pin.inspectedFiles['README.md'],'DOCUMENT_SOURCE_BYTES');
  documents.push({repository:pin.repository,commit:pin.defaultHead,tree:pin.tree,path:'README.md',sha256:hash(original),witness,bytes:original});
 }
 documents.sort((a,b)=>a.repository.localeCompare(b.repository,'en'));return {roots,documents};
}
export function verifyInputs(config){
 const inherited=checkSources(config.inheritedRoots);
 const native=Object.fromEntries(Object.entries(NATIVE.sources).map(([id,s])=>[id,checkSource(s,config.nativeRoots[id])]));
 const packages=checkPackages(config),sources=documentSources(config);
 return {inherited,native,packages,...sources};
}
