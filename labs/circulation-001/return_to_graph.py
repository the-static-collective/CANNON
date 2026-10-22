#!/usr/bin/env python3
"""CIRCULATION-001: inspect a simulated planZ return and re-enter native Free Graph.
Never rewrites source packet or grants recipient/local authority.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

class Refused(ValueError):
    pass

def must(ok, reason):
    if not ok:
        raise Refused("CIRCULATION_RETURN_REFUSED: " + reason)

def read(path):
    p = Path(path)
    must(p.is_file() and 0 < p.stat().st_size < 1000000, "missing or unbounded input")
    return json.loads(p.read_text("utf8"))

def module(file, identifier, expected_name):
    p = Path(file).resolve()
    must(p.is_file() and p.name == expected_name, "required native module absent")
    spec = importlib.util.spec_from_file_location(identifier, p)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def build(original, replies, plan_return, fg, plan):
    must(plan_return == plan.compose(original, replies, fg),
         "planZ return not byte-consistent with native compile")
    must(original["packet_id"] == plan_return["graph_packet_id"], "source graph mismatch")
    old = json.dumps(original, sort_keys=True, separators=(",", ":"))
    extension = copy.deepcopy(original)
    ret = plan_return["return"]
    source = {
        "id": "temp", "source_class": "conversation-witness", "authority": "none",
        "locator": {
            "system": "CANNON / planZ local simulation",
            "coordinate": "circulation001/simulated-return.json",
            "revision": ret["id"], "resolution": "fixture-only"
        },
        "digest": "sha256:" + hashlib.sha256(fg.canonical_bytes(ret)).hexdigest(),
        "access": "public", "export": "portable",
        "excerpt": "FICTIONAL: two simulated replies, not receiver owner action or human permission"
    }
    source["id"] = fg.record_id("source", source)
    extension["sources"].append(source)
    new_ids = [source["id"]]
    invitations = {
        n["extensions"]["destination"]: n for n in original["nodes"]
        if n.get("extensions", {}).get("circulation_role") == "invitation"
    }
    for receipt in ret["receipts"]:
        invite = invitations[receipt["destination"]]
        node = {
            "id": "temp", "kind": "receipt",
            "label": "FICTIONAL: " + receipt["destination"] + " " + receipt["choice"],
            "status": "observed", "source_ids": [source["id"]],
            "extensions": {
                "circulation_role": "simulated-reply",
                "planZ_receipt_id": receipt["id"],
                "owner_admission": False,
                "physical_act": False
            }
        }
        node["id"] = fg.record_id("node", node)
        link = {
            "id": "temp", "from": invite["id"], "to": node["id"],
            "verb": "connects", "status": "observed",
            "qualifier": "simulation returned; real-world consequence none",
            "source_ids": [source["id"]], "authority": "none"
        }
        link["id"] = fg.record_id("link", link)
        extension["nodes"].append(node)
        extension["links"].append(link)
        new_ids.extend([node["id"], link["id"]])
    must(len(ret["receipts"]) == 2 and len(new_ids) == 5, "return did not remain bounded")
    extension["purpose"] = "CIRCULATION-001: synthetic outbound and return trace"
    extension["scope"]["task"] = "Observe two fixture-only replies; no owner decisions"
    extension["task_world_cut"]["selected_ids"].extend(new_ids[1:])
    extension["task_world_cut"]["rationale"] = "Source preserved; deterministic mock-return extension"
    extension["extensions"] = {
        "origin": "cannon.circulation001-return",
        "synthetic_only": True, "parent_packet_id": original["packet_id"],
        "planZ_return_id": ret["id"], "owner_permission": False
    }
    extension["packet_id"] = fg.packet_id(extension)
    must(not fg.validate_packet(extension), "native Free Graph refused return packet")
    must(old == json.dumps(original, sort_keys=True, separators=(",", ":")),
         "source packet was mutated")
    must(all(l["verb"] != "constitutes" and l["authority"] == "none"
             for l in extension["links"]), "inherited local authority")
    return extension

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("operation", choices=["run", "verify"])
    for name in ("graph", "replies", "plan_return", "free_graph_core", "planz_script", "output"):
        ap.add_argument("--" + name.replace("_", "-"), required=True, type=Path)
    a = ap.parse_args()
    try:
        fg = module(a.free_graph_core, "circulation_return_fg", "fg_core.py")
        plan = module(a.planz_script, "circulation_return_planz", "circulation001_planz.py")
        expected = build(read(a.graph), read(a.replies), read(a.plan_return), fg, plan)
        if a.operation == "run":
            with a.output.open("x", encoding="utf8") as f:
                json.dump(expected, f, sort_keys=True, indent=2, ensure_ascii=False)
                f.write("\n")
        else:
            must(read(a.output) == expected, "cold graph return drift or tamper")
        print(json.dumps({"result": "PASS_SYNTHETIC_ONLY",
                          "source_packet": expected["extensions"]["parent_packet_id"],
                          "return_packet": expected["packet_id"],
                          "simulated_replies": 2, "owner_admission": False}))
        return 0
    except (Refused, ValueError, KeyError, OSError, TypeError) as exc:
        print(str(exc), file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
