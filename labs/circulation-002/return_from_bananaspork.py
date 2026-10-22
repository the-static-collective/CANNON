#!/usr/bin/env python3
"""CIRCULATION-002: native Free Graph receives *test-only* BananaSpork local reply.
Content hashes preserve ancestry; they never authenticate a human or project owner.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

REPLY_SCHEMA = "banana-spork.circulation-local-reply/v0"
EXPECTED = {
    "schema", "sourceGraphPacketId", "offerSetId", "offerId", "destination",
    "lane", "choice", "evidenceClass", "sourceStatus", "externalEffect",
    "helperAssigned", "helpSlipCreated", "campfirePublished",
    "ownerIdentityAuthenticated", "fulfillmentConfirmed", "humanConsentProven", "id"
}

class Refused(ValueError):
    pass

def require(ok, reason):
    if not ok:
        raise Refused("CIRCULATION002_RETURN_REFUSED: " + reason)

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()

def digest(prefix, body):
    return "sha256:" + hashlib.sha256(prefix.encode() + canonical(body)).hexdigest()

def load_module(file, basename, key):
    path = Path(file).resolve()
    require(path.is_file() and path.name == basename, "native code path not provided")
    spec = importlib.util.spec_from_file_location(key, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def read(path):
    p = Path(path)
    require(p.is_file() and 0 < p.stat().st_size < 1_000_000, "bounded fixture input required")
    return json.loads(p.read_text(encoding="utf-8"))

def native_return(graph, reply, fg, plan):
    require(isinstance(graph, dict) and graph.get("schema") == "free-graph.packet/v0",
            "invalid Free Graph source")
    require(not fg.validate_packet(graph) and graph.get("packet_id") == fg.packet_id(graph),
            "Free Graph source fails native validation")
    ex = graph.get("extensions", {})
    require(ex == {"origin": "cannon.circulation001", "synthetic_only": True,
                   "circulation_fixture": True}, "not a fictional CANNON original")
    # The planZ offer is recomputed by the original source-native compiler,
    # not believed merely because an offer ID was supplied by the receiver.
    offer_set = plan.compile_offers(graph, fg)
    require(isinstance(reply, dict) and set(reply) == EXPECTED, "unexpected reply fields")
    source_offer = next((o for o in offer_set["offers"] if o["destination"] ==
                         "the-static-collective/BananaSpork"), None)
    require(source_offer is not None, "BananaSpork wasn't invited by planZ")
    require(reply["schema"] == REPLY_SCHEMA and
            reply["sourceGraphPacketId"] == graph["packet_id"] and
            reply["offerSetId"] == offer_set["id"] and
            reply["offerId"] == source_offer["id"] and
            reply["destination"] == "the-static-collective/BananaSpork" and
            reply["lane"] == "care" and
            reply["choice"] in {"HOLD_LOCAL", "DECLINE_LOCAL"} and
            reply["evidenceClass"] == "LOCAL_USER_SELECTION_UNAUTHENTICATED" and
            reply["sourceStatus"] == "FICTIONAL_UNVERIFIED" and
            reply["externalEffect"] == "NONE" and
            all(reply[x] is False for x in ("helperAssigned", "helpSlipCreated",
                   "campfirePublished", "ownerIdentityAuthenticated",
                   "fulfillmentConfirmed", "humanConsentProven")),
            "recipient fabricated authority or changed source")
    rid = digest("BANANASPORK-CIRCULATION-002|", {k: v for k, v in reply.items() if k != "id"})
    require(reply["id"] == rid, "recipient reply content address changed")
    invite = next((n for n in graph["nodes"] if n["id"] ==
                   source_offer["graph_invitation_node"]), None)
    require(invite is not None and invite["status"] == "proposed",
            "no originally proposed graph invitation")
    original = canonical(graph)
    output = copy.deepcopy(graph)
    src = {
        "id": "temporary",
        "source_class": "conversation-witness",
        "authority": "none",
        "locator": {
            "system": "BananaSpork fixture-only local inbox",
            "coordinate": "circulation002/local-unverified-reply",
            "revision": reply["id"],
            "resolution": "test-only-not-authenticated"
        },
        "digest": digest("", reply), "access": "public", "export": "portable",
        "excerpt": "FICTIONAL: BananaSpork native module emitted a test-only local choice, NOT an owner attestation."
    }
    src["id"] = fg.record_id("source", src)
    node = {
        "id": "temporary", "kind": "receipt",
        "label": "FICTIONAL: BananaSpork " + reply["choice"] + " in offline simulated receiver",
        "status": "observed", "source_ids": [src["id"]],
        "extensions": {
            "circulation_role": "simulated-native-receiver-return",
            "recipient_reply_id": reply["id"],
            "authenticated_human": False,
            "care_fulfillment": False,
            "publication": False
        }
    }
    node["id"] = fg.record_id("node", node)
    link = {
        "id": "temporary", "from": invite["id"], "to": node["id"], "verb": "connects",
        "qualifier": "Observed code-generated local test reply; no owner admission",
        "status": "observed", "source_ids": [src["id"]], "authority": "none"
    }
    link["id"] = fg.record_id("link", link)
    output["sources"].append(src)
    output["nodes"].append(node)
    output["links"].append(link)
    output["purpose"] = "CIRCULATION-002: native BananaSpork simulation returned to Free Graph"
    output["scope"]["task"] = "Trace local fixture reception; no community acts or consent"
    output["task_world_cut"]["selected_ids"].extend([node["id"], link["id"]])
    output["task_world_cut"]["rationale"] = "Separate source packet preserved; native receiver simulation as testimony only"
    output["extensions"] = {
        "origin": "cannon.circulation002-native-receiver-return",
        "synthetic_only": True,
        "parent_packet_id": graph["packet_id"],
        "banana_spork_reply_id": reply["id"],
        "human_or_project_owner_authenticated": False,
        "source_preserved": True
    }
    output["packet_id"] = fg.packet_id(output)
    require(not fg.validate_packet(output), "native Free Graph refused returned packet")
    require(original == canonical(graph), "source packet mutated")
    require(all(l["authority"] == "none" for l in output["links"]),
            "project authority was transferred")
    return output

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("operation", choices=["run", "verify"])
    for x in ("graph", "reply", "free_graph_core", "planz_script", "output"):
        ap.add_argument("--"+x.replace("_","-"), type=Path, required=True)
    args = ap.parse_args()
    try:
        fg = load_module(args.free_graph_core, "fg_core.py", "circulation002_native_fg")
        plan = load_module(args.planz_script, "circulation001_planz.py", "circulation002_native_plan")
        expected = native_return(read(args.graph), read(args.reply), fg, plan)
        if args.operation == "run":
            with args.output.open("x", encoding="utf-8") as f:
                json.dump(expected, f, ensure_ascii=False, sort_keys=True, indent=2)
                f.write("\n")
        else:
            require(read(args.output) == expected, "cold reply replay drift")
        print(json.dumps({
            "status": "PASS_NATIVE_RECEIVER_TEST_ONLY",
            "source_graph": expected["extensions"]["parent_packet_id"],
            "return_graph": expected["packet_id"],
            "human_authority": "NONE",
            "help_slip_created": False,
        }))
        return 0
    except (Refused, ValueError, KeyError, OSError, TypeError) as exc:
        print(str(exc), file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
