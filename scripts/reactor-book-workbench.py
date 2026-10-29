#!/usr/bin/env python3
"""CANNON reactor-book adapter: original Workbench MADDLOOP/Book in disposable local stores.

The plan originated with original planZ. Four editorial port assignments are
synthetic test fixtures; the Workbench does NOT attest that they are real tools.
"""
import argparse
import hashlib
import json
import pathlib
import sys

from static_workbench.maddloop import MaddloopStore
from static_workbench.machine_book import MachineBook

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()

def require(ok, message):
    if not ok:
        raise ValueError("HOLD_BOOK_" + message)

def build(manifest, selected, sandbox):
    require(manifest.get("schema") == "static-collective/planz-recursive-reactor/v1/manifest", "PLANZ_SCHEMA")
    require(manifest.get("authority") == "NONE" and not manifest.get("executed") and not manifest.get("admitted"), "PLANZ_AUTHORITY")
    require(len(manifest.get("roots", [])) == 8, "ROOTS")
    plans = {x["id"]: x for x in manifest.get("proposedPlans", [])}
    require(selected in plans and selected.startswith("plan-"), "EXPLICIT_PLAN_ID")
    plan = plans[selected]
    require(plan["kind"] == "LENS_SYNTHESIS" and plan["generation"] == 1, "SELECT_ORIGINAL_LENS_SYNTHESIS")
    require(plan["status"] == "PROPOSED_UNVERIFIED" and not plan["executed"], "PLAN_STATUS")
    cuts = {x["id"]: x for x in manifest["cuts"]}
    require(len(plan["cutIds"]) == 4 and all(c in cuts for c in plan["cutIds"]), "SOURCE_CUTS")
    by_lens = {cuts[x]["lensId"]: cuts[x] for x in plan["cutIds"]}
    require(set(by_lens) == {"ABSENCE", "TIME", "CARRIER", "RECEIVER"}, "FOUR_LENSES")
    require(all(x["parentId"] == plan["parentIds"][0] for x in by_lens.values()), "CUT_ANCESTRY")
    require(all(x["authority"] == "NONE" and not x["executed"] for x in by_lens.values()), "CUT_AUTHORITY")

    sandbox.mkdir(parents=True, exist_ok=False)
    loops = MaddloopStore(sandbox / "maddloop.sqlite3")
    book = MachineBook(sandbox / "machine_book.sqlite3", sandbox / "maddloop.sqlite3")
    # Deliberately a synthetic port laboratory. Not derived capability contracts.
    ports = [
        ("ABSENCE", "question", "proposed", "review", "questioned"),
        ("TIME", "review", "questioned", "time", "delay"),
        ("CARRIER", "time", "delay", "parcel", "held"),
        ("RECEIVER", "parcel", "admit", "receipt", "held"),
    ]
    folios = []
    for lens, ic, ip, oc, op in ports:
        cut = by_lens[lens]
        title = "Synthetic " + lens + " folio"
        layer = {"kind": "text", "label": title, "body": "CI test fixture; inspect candidate " + cut["id"],
                 "input_class": ic, "input_port": ip, "output_class": oc, "output_port": op}
        loop = loops.create(title, layer)
        folio = book.record_folio(title, "Scripted fixture port demonstration, not source-owner admission.", loop["id"], loop["head_revision_id"])
        require(folio["revision_id"] == loop["head_revision_id"] and folio["snapshot_sha256"] == loop["snapshot_sha256"], "NATIVE_FOLIO_FREEZE")
        folios.append(folio)
    board = book.compose("Unresolved receiving-world admission", [f["id"] for f in folios])
    require(board["result"]["status"] == "candidate_with_gaps" and len(board["result"]["gaps"]) == 1, "MISSING_EXPECTED_GAP")
    gap = board["result"]["gaps"][0]
    require(gap["reason"] == "concrete_lift_gap" and gap["available"]["port"] == "held" and gap["required"]["port"] == "admit", "WRONG_NATIVE_OBSTRUCTION")
    # A counterexample only, not an admitted adapter or automatic repair.
    replacement = dict(layer)
    replacement.update({"label": "Scripted RECEIVER alternate", "body": "Alternate editorial port assumption only.",
                        "input_class": "parcel", "input_port": "held", "output_class": "receipt", "output_port": "held"})
    new_loop = loops.create("Synthetic alternate", replacement)
    alternative = book.record_folio("Synthetic alternate receiver", "Unapproved replacement domino.", new_loop["id"], new_loop["head_revision_id"])
    alternate_board = book.compose("Counterexample with matching invented ports", [*(f["id"] for f in folios[:-1]), alternative["id"]])
    require(alternate_board["result"]["status"] == "synthetic_route_matched" and not alternate_board["result"]["gaps"], "ALTERNATE_ROUTE")
    require(book.board(board["id"])["result"] == board["result"], "ORIGINAL_BOARD_CHANGED")
    require(len(book.boards()) == 2, "BOARD_PERSISTENCE")

    editorial_folios = [
        {"id": lens.lower() + "-" + by_lens[lens]["id"][4:16], "title": "Synthetic " + lens + " folio",
         "purpose": by_lens[lens]["pressureQuestion"], "inputClass": ic, "inputPort": ip,
         "outputClass": oc, "outputPort": op, "originCutId": by_lens[lens]["id"]}
        for lens, ic, ip, oc, op in ports
    ]
    portable_gap = {"kind": "between_folios", "index": gap["index"], "reason": gap["reason"],
                    "available": gap["available"], "required": gap["required"]}
    portable_board = {"status": board["result"]["status"], "gaps": [portable_gap], "nonclaim": board["result"]["nonclaim"]}
    result = {
        "schema": "cannon.workbench-book-native-review/v1",
        "selectedPlanId": selected,
        "planZManifestSha256": manifest["manifestSha256"],
        "sourceCutIds": {lens: by_lens[lens]["id"] for lens in sorted(by_lens)},
        "folios": editorial_folios, "board": portable_board,
        "originalBoardReopened": True, "nativeSqliteFolioCount": 5, "nativeSqliteBoardCount": 2,
        "syntheticCounterexampleStatus": alternate_board["result"]["status"],
        "fixturePortOrigin": "CANNON_EDITORIAL_NOT_OWNER_CAPABILITIES",
        "humanSelected": False, "humanEntered": False, "sourceOwnerCompatible": False,
        "externalEngineExecuted": False, "published": False, "authority": "NONE",
    }
    result["portableReviewSha256"] = digest(result)
    return result

if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser()
        parser.add_argument("--manifest", required=True)
        parser.add_argument("--plan-id", required=True)
        parser.add_argument("--scratch", required=True)
        parser.add_argument("--out", required=True)
        a = parser.parse_args()
        source = json.loads(pathlib.Path(a.manifest).read_text())
        result = build(source, a.plan_id, pathlib.Path(a.scratch))
        pathlib.Path(a.out).write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
        print(json.dumps({"nativeWorkbenchUsed": True, "held": True, "portGaps": len(result["board"]["gaps"]),
                          "syntheticAlternate": result["syntheticCounterexampleStatus"]}))
    except Exception as error:
        print(str(error)[:600], file=sys.stderr)
        sys.exit(2)
