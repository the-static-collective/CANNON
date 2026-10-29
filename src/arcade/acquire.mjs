import {existsSync,mkdirSync,writeFileSync,copyFileSync,readFileSync,realpathSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT,checkSource,requireThat,json} from '../constellation/sources.mjs';
import {ATLAS,NATIVE,checkPackages} from './sources.mjs';
import {acquire as acquireDocuments} from '../../scripts/stranger-source-lab.mjs';
export async function acquireMachine(into){
 requireThat(!existsSync(into),'ACQUISITION_DIRECTORY_EXISTS');mkdirSync(into,{mode:0o700});
 const run=(bin,args,opts={})=>execFileSync(bin,args,{stdio:'inherit',timeout:180000,env:{...process.env,GIT_NO_REPLACE_OBJECTS:'1',GIT_TERMINAL_PROMPT:'0'},...opts});
 run(process.execPath,[join(ROOT,'scripts/constellation-acquire.mjs'),'--into',join(into,'inherited')]);
 const documents=acquireDocuments(ATLAS,join(into,'documents'),64);requireThat(documents.entries.length>=50,'HOLD_SOURCE_ACQUISITION_INCOMPLETE');
 const nativeRoots={};
 for(const [id,s] of Object.entries(NATIVE.sources)){
  const reuse=documents.entries.find(e=>e.repository===s.repository&&e.commit===s.commit);
  const root=reuse?reuse.root:join(into,'native-'+id);nativeRoots[id]=root;
  if(!reuse){
   run('git',['init','-q',root]);run('git',['-C',root,'remote','add','origin','https://github.com/'+s.repository+'.git']);
   run('git',['-C',root,'fetch','--depth=1','origin',s.commit]);run('git',['-C',root,'checkout','--detach','FETCH_HEAD']);
  }
  checkSource(s,root);
 }
 // TranchNode's canonicalizer is its own exact locked dependency. No models,
 // providers, services, runtime installs, or postinstall scripts are invoked.
 run('npm',['ci','--ignore-scripts','--omit=dev'],{cwd:nativeRoots.tranch});
 const toolchain=join(into,'toolchain');mkdirSync(toolchain);
 for(const name of ['package.json','package-lock.json'])copyFileSync(join(ROOT,'constellation/arcade-toolchain',name),join(toolchain,name));
 run('npm',['ci','--ignore-scripts'],{cwd:toolchain});
 const config={schema:'arcade.local-config/v1',inheritedRoots:JSON.parse(readFileSync(join(into,'inherited/roots.json'))),nativeRoots,documentRoots:join(into,'documents/roots.json'),toolchain};
 checkPackages(config);writeFileSync(join(into,'config.json'),json(config),{flag:'wx',mode:0o600});
 return {status:'EXACT_MACHINE_INPUTS_ACQUIRED',documentSources:documents.entries.length,newNativeSourceCuts:Object.keys(nativeRoots).length,config:join(into,'config.json'),networkAfterAcquisition:'NONE_REQUIRED',platform:'Verified runtime byte lock: linux-x64 / Node24+ / Python3.11+'};
}
