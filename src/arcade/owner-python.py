"""Fixed, pure original-owner calls. No user-supplied module/function names."""
import json,sys
from pathlib import Path
MAX=4*1024*1024
raw=sys.stdin.buffer.read(MAX+1)
if len(raw)>MAX:raise ValueError('OWNER_INPUT_TOO_LARGE')
r=json.loads(raw);op=r['operation'];root=Path(r['root']);data=r['input']
if op in ('graph','graph-union'):
 sys.path.insert(0,str(root))
 from scripts.fg_core import validate_packet
 from scripts.fg_ops import rehash_packet,neighbors,merge_packets
 if op=='graph':
  packet=rehash_packet(data['packet'],stamp=True)
  assert not validate_packet(packet)
  node=packet['nodes'][data.get('focusIndex',0)]['id']
  view=neighbors(packet,node,data.get('depth',1));merged=merge_packets([packet,view])
  out={'packet':packet,'view':view,'union':merged}
 else:
  for p in data['packets']:assert not validate_packet(p)
  out=merge_packets(data['packets'])
elif op=='loadout':
 sys.path.insert(0,str(root/'src'))
 from loadout.compile import compile_loadout
 out=compile_loadout(data)
elif op=='alex':
 sys.path.insert(0,str(root))
 from alex_runtime.derivation import evaluate_relation_case
 out=evaluate_relation_case(data)
else:raise ValueError('OWNER_OPERATION_NOT_ALLOWLISTED')
print(json.dumps(out,ensure_ascii=False,sort_keys=True,allow_nan=False))
