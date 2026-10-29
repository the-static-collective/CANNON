import hashlib,json,sys
from pathlib import Path
from PIL import Image,ImageDraw
from haunted_blender.dreambreeder import create_ecology,keep_proposal
from haunted_blender.scene_growth import normalize_timing,grow_kept_scene
from haunted_blender.dream_cutout_compiler import KIT_SCHEMA
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
trackp,lyricsp,familyp,planp,out=map(Path,sys.argv[1:])
out.mkdir(parents=True,exist_ok=True)
track=json.loads(trackp.read_text());lyrics=json.loads(lyricsp.read_text())
family=json.loads(familyp.read_text());plan=json.loads(planp.read_text())
assert track["source"]=="synthetic://silent-timing-test"
assert len(family["utterances"])==6 and len(plan["events"])>0
timing=normalize_timing(track,lyrics)
assert len(timing["sections"])==len(track["gates"]) and timing["duration"]==3
rgb=tuple(int(family["utterances"][0]["planHash"][i:i+2],16) for i in (0,2,4))
bg=out/"bg.png";actor=out/"actor.png"
Image.new("RGBA",(96,64),(24,31,35,255)).save(bg)
img=Image.new("RGBA",(24,30),(*rgb,255));ImageDraw.Draw(img).rectangle((4,4,20,24),outline=(255,230,190,255),width=2);img.save(actor)
kit={"schema":KIT_SCHEMA,"canvas":{"width":96,"height":64},"layers":[{"id":"background","role":"background","source":str(bg),"z":0,"x":0,"y":0},{"id":"sigil","role":"actor","source":str(actor),"z":1,"x":36,"y":16}]}
ecology=create_ecology(relation_id="FILM-PRESS-SYNTHETIC",common_checkpoint_id=family["familyHash"],source_receipt_ids=[family["familyHash"],str(plan["id"])])
# Software test fixture selection ONLY. No real human KEEP.
keep=keep_proposal(ecology,ecology["proposals"][0]["id"])
result=grow_kept_scene(keep,timing,kit,out/"scene",fps=8)
scene=result["scene"];assert scene["distributionAuthorized"] is False
video=Path(result["videoPath"])
manifest={"schema":"cannon.silent-blender-study/v1","sourceOwnerSchema":scene["schema"],"sourceOwnerStatus":scene["status"],"toasterFamilyHash":family["familyHash"],"playdeckPlanId":plan["id"],"playdeckEvents":len(plan["events"]),"timingId":timing["id"],"sections":[{"kind":x["kind"],"id":x["id"],"duration":x["duration"]} for x in timing["sections"]],"awakeningWindows":[{"id":x["id"],"authorityClass":x["authorityClass"]} for x in timing["awakeningWindows"]],"automatedKeepTestOnly":True,"actualHumanKeep":False,"masterAudioPresent":False,"sourceOwnedVideoSha256":sha(video),"distributionAuthorized":False,"realMusicVideo":False}
assert len(scene["segments"])==len(timing["sections"])
(out/"study.json").write_text(json.dumps(manifest,sort_keys=True,indent=2)+"\n")
(out/"timing.json").write_text(json.dumps(timing,sort_keys=True,indent=2)+"\n")
(out/"silent.mp4").write_bytes(video.read_bytes())
print(json.dumps({"sections":len(scene["segments"]),"sha256":sha(video)}))
