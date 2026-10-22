#!/usr/bin/env python3
"""CIRCULATION-001 CANNON synthetic seed -> native Free Graph packet.
This constructs invitations, not owner permissions or real-world events.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sys

SCHEMA = "cannon.circulation-seed/v0"
REPO = re.compile(r"^the-static-collective/[a-zA-Z0-9._-]+$")
BAD_PERSONAL = re.compile(r"@|[0-9]{3}[-. ][0-9]{3}[-. ][0-9]{4}|https?://", re.I)

class Refused(ValueError):
    pass

def require(ok, reason):
    if not ok:
        raise Refused("CANNON_CIRCULATION_REFUSED: " + reason)

def native_fg(path):
    p = Path(path).resolve()
    require(p.name == "fg_core.py" and p.is_file(), "native Free Graph core required")
    spec = importlib.util.spec_from_file_location("circulation_cannon_fg", p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m

def read(path):
    p = Path(path)
    require(p.is_file() and 0 < p.stat().st_size < 100000, "seed must be a bounded JSON file")
    return json.loads(p.read_text("utf8"))

def fields(o, keys):
    require(isinstance(o, dict) and set(o) == set(keys), "unexpected or missing fields")

def safe(t):
    return isinstance(t, str) and t.startswith("FICTIONAL:") and len(t) <= 180 and not BAD_PERSONAL.search(t)

def build(seed, fg):
    fields(seed, ["schema", "fictional", "title", "receivers"])
    require(seed["schema"] == SCHEMA and seed["fictional"] is True, "not a declared fictional test")
    require(safe(seed["title"]), "unsafe title")
    receivers = seed["receivers"]
    require(isinstance(receivers, list) and len(receivers) == 2, "exactly two independent receivers")
    dests = set()
    lanes = set()
    for r in receivers:
        fields(r, ["destination", "lane", "question"])
        require(isinstance(r["destination"], str) and REPO.fullmatch(r["destination"]),
                "destination must be explicit source-owned project")
        require(r["destination"] not in dests, "duplicate receiver")
        require(r["lane"] in {"care", "culture"} and r["lane"] not in lanes,
                "each invitation must have its own CARE or CULTURE lane")
        require(safe(r["question"]), "unsafe or non-fictional question")
        dests.add(r["destination"]); lanes.add(r["lane"])

    raw = fg.canonical_bytes(seed)
    source = {"id": "temp", "source_class": "conversation-witness",
              "authority": "none",
              "locator": {"system": "CANNON synthetic fixture", "coordinate": "circulation001/seed.json",
                          "revision": "v0", "resolution": "fixture-only"},
              "digest": "sha256:" + hashlib.sha256(raw).hexdigest(),
              "access": "public", "export": "portable",
              "excerpt": "FICTIONAL: only a deterministic rehearsal; no person or partner asserted"}
    source["id"] = fg.record_id("source", source)
    sid = source["id"]

    def node(kind, label, status, ext):
        obj = {"id": "tmp", "kind": kind, "label": label, "status": status,
               "source_ids": [sid], "extensions": ext}
        obj["id"] = fg.record_id("node", obj)
        return obj

    origin = node("question", seed["title"], "proposed", {"circulation_role": "seed"})
    nodes = [origin]
    links = []
    def link(a, b):
        v = {"id": "tmp", "from": a["id"], "to": b["id"],
             "verb": "connects", "qualifier": "possible invitation only; no permission",
             "status": "proposed", "source_ids": [sid], "authority": "none"}
        v["id"] = fg.record_id("link", v)
        links.append(v)

    for r in sorted(receivers, key=lambda v: v["destination"]):
        world = node("world", r["destination"], "observed",
                     {"circulation_role": "receiver-address-only"})
        invitation = node("question", r["question"], "proposed",
                          {"circulation_role": "invitation", "origin_seed": origin["id"],
                           "destination": r["destination"], "lane": r["lane"]})
        nodes.extend([world, invitation])
        link(origin, invitation)
        link(invitation, world)

    packet = {"schema": fg.SCHEMA, "purpose": "CIRCULATION-001 two-option simulated community seed",
              "modes": ["seed"],
              "scope": {"task": "Test two independent source-owned invitations, no real recipients",
                        "worlds": sorted(dests)},
              "task_world_cut": {"status": "sufficient",
                  "selected_ids": [n["id"] for n in nodes] + [l["id"] for l in links],
                  "owner_head_source_ids": [],
                  "omitted": [{"door": "real receiver permissions",
                               "reason": "not requested, acquired or simulated as evidence"}],
                  "rationale": "fictional, bounded graph for native contract proof"},
              "sources": [source], "nodes": nodes, "links": links,
              "residual_fog": ["Recipient capacity, willingness and real community needs remain unknown."],
              "non_imports": ["No actual contact, names, donations, music rights or real care acts."],
              "extensions": {"origin": "cannon.circulation001", "synthetic_only": True,
                             "circulation_fixture": True}}
    packet["packet_id"] = fg.packet_id(packet)
    require(not fg.validate_packet(packet), "native Free Graph refused generated packet")
    return packet

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("operation", choices=["run", "verify"])
    ap.add_argument("--seed", type=Path, required=True)
    ap.add_argument("--free-graph-core", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    a = ap.parse_args()
    try:
        native = native_fg(a.free_graph_core)
        expected = build(read(a.seed), native)
        if a.operation == "run":
            with a.output.open("x", encoding="utf8") as f:
                json.dump(expected, f, indent=2, sort_keys=True, ensure_ascii=False)
                f.write("\n")
        else:
            require(read(a.output) == expected, "cold replay mismatch")
        print(json.dumps({"result": "PASS_SYNTHETIC_ONLY",
                          "native_free_graph_packet_id": expected["packet_id"],
                          "questions": 3, "possible_relations": 4,
                          "owner_auth": "NONE"}))
        return 0
    except (Refused, ValueError, KeyError, TypeError, OSError) as e:
        print(str(e), file=sys.stderr)
        return 1
if __name__ == "__main__":
    raise SystemExit(main())
