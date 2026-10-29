#!/usr/bin/env python3
"""Read-only GitHub discovery. Never executes discovered source or exports private metadata."""
import argparse,base64,concurrent.futures,datetime,hashlib,json,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parent.parent

def api(path,pages=False):
    result=subprocess.run(['gh','api']+(['--paginate'] if pages else [])+[path],capture_output=True,text=True,timeout=120)
    raw=result.stdout;decoder=json.JSONDecoder();values=[]
    while raw.strip():
        value,n=decoder.raw_decode(raw.lstrip());raw=raw.lstrip()[n:]
        if isinstance(value,dict) and value.get('status'):raise RuntimeError('GitHub discovery failed: '+str(value.get('status')))
        values.append(value)
    if result.returncode or not values:raise RuntimeError('GitHub read failed')
    return sum(values,[]) if pages else values[0]

def inspect(repo,selection):
    prefix='repos/'+repo['full_name'];head=api(prefix+'/commits/'+repo['default_branch']);pin=head['sha']
    tree=api(prefix+'/git/trees/'+pin+'?recursive=1');paths=[x['path'] for x in tree['tree'] if x['type']=='blob']
    pulls=api(prefix+'/pulls?state=open&per_page=100',True);files={}
    for name in ['README.md','AGENTS.md','package.json','pyproject.toml','Cargo.toml']:
        if name in paths:
            item=api(prefix+'/contents/'+name+'?ref='+pin)
            files[name]='sha256:'+hashlib.sha256(base64.b64decode(item['content'])).hexdigest()
    selected=[dict(id=k,**v) for k,v in selection['sources'].items() if v['repository']==repo['full_name']]
    return {'repository':repo['full_name'],'sourceOwner':repo['owner']['login'],'url':repo['html_url'],'defaultBranch':repo['default_branch'],'defaultHead':pin,'tree':head['commit']['tree']['sha'],'treeTruncated':tree.get('truncated',False),'openPullRequests':[{'number':p['number'],'url':p['html_url'],'title':p['title'],'head':p['head']['sha'],'branch':p['head']['ref'],'base':p['base']['ref'],'draft':p['draft']} for p in pulls],'status':'DOCUMENTED' if 'README.md' in files else 'DISCOVERED','admission':'HOLD','authorityRequired':'SOURCE_OWNER_REVIEW_AND_EXPLICIT_LOCAL_EXECUTION_PERMISSION','trustBoundary':'PUBLIC_SOURCE_METADATA_ONLY_NO_RUNTIME_OR_FIELD_AUTHORITY','contracts':[x for x in paths if any(s in x.lower() for s in ['contract','schema','manifest'])][:40],'testEntrypoints':[x for x in paths if 'test' in x.lower() or x in ['package.json','pyproject.toml','Cargo.toml']][:40],'instructions':[x for x in paths if x.endswith(('AGENTS.md','CLAUDE.md'))],'inspectedFiles':files,'selectedDonors':selected,'obstacles':['Discovery does not establish a bounded executable interface, owner admission, rights or physical safety.'],'ownerSuggestion':repo['html_url']+'/issues/new?title=Bounded%20offline%20constellation%20adapter','availableDonor':'EXACT_SELECTED_SOURCE' if selected else 'HOLD_CONTRACT_REVIEW_REQUIRED'}

def validate(atlas):
    assert atlas['schema']=='constellation-atlas/v1' and atlas['authority']=='DISCOVERY_ONLY'
    names=set()
    for r in atlas['repositories']:
        assert r['repository'].startswith('the-static-collective/') and r['repository'] not in names
        assert len(r['defaultHead'])==40 and all(c in 'abcdef0123456789' for c in r['defaultHead'])
        assert r['admission']=='HOLD' and r['trustBoundary']=='PUBLIC_SOURCE_METADATA_ONLY_NO_RUNTIME_OR_FIELD_AUTHORITY'
        names.add(r['repository'])
    assert len(names)==atlas['coverage']['publicRepositories']
    return atlas

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--offline',type=pathlib.Path);parser.add_argument('--out',required=True,type=pathlib.Path);args=parser.parse_args()
    if args.offline:atlas=validate(json.loads(args.offline.read_text()))
    else:
        repos=[r for r in api('user/repos?per_page=100&affiliation=owner',True) if r['owner']['login']=='the-static-collective']
        public=[r for r in repos if not r['private']];selection=json.loads((ROOT/'constellation/sources.json').read_text())
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            entries=list(pool.map(lambda r:inspect(r,selection),public))
        atlas=validate({'schema':'constellation-atlas/v1','observedOn':str(datetime.date.today()),'discoveryMethod':'Authenticated read-only GitHub REST metadata, default-commit tree, public README/build manifests, open pull requests; no donor execution during discovery.','coverage':{'accessibleOwnerRepositories':len(repos),'publicRepositories':len(public),'privateRepositoriesWithheld':len(repos)-len(public),'privateInspection':'METADATA_ONLY_LOCAL_NOT_EXPORTED','publicPrPagination':'COMPLETE_AT_OBSERVATION','defaultTreesComplete':all(not x['treeTruncated'] for x in entries)},'authority':'DISCOVERY_ONLY','selectionIsNotExecution':True,'repositories':sorted(entries,key=lambda x:x['repository'].casefold())})
    with args.out.open('x') as f:f.write(json.dumps(atlas,indent=2)+'\n')
    print(json.dumps({'publicRepositories':len(atlas['repositories']),'out':str(args.out),'status':'DISCOVERY_ONLY'}))
if __name__=='__main__':main()
