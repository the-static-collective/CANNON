#!/usr/bin/env python3
"""Native STATIC OS GENESIS-008 cartridge runner (CANNON integration boundary).

Executes the original owner source from an exact pinned checkout, but no real
hardware, festival, steward, identity, site, or field witness is claimed.
"""
import argparse
import json
import pathlib
import sys

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--focus", choices=["Repair Lab", "Festival Table"], required=True)
    args = parser.parse_args()
    sys.path.insert(0, str(pathlib.Path(args.root).resolve()))
    from cartridges import genesis008 as source
    ask = source.mint("ASK", args.focus, "FESTIVAL_SYNTHETIC_DEMO")
    offer = source.mint("OFFER", args.focus, "FESTIVAL_SYNTHETIC_DEMO", [ask["digest"]])
    propose = source.mint("PROPOSE", args.focus, "FESTIVAL_SYNTHETIC_DEMO", [ask["digest"], offer["digest"]])
    checked = source.validate_chain([ask, offer, propose])
    text = source.encode(propose)
    assert source.decode(text) == propose
    assert checked["count"] == 3 and checked["has_real_field_witness"] is False
    assert not any(x["signed"] or x["physical_observation"] or x["human_permission"] for x in (ask, offer, propose))
    print(json.dumps({"schema":"cannon.native-static-os-cartridge-bridge/v1",
                      "nativeOwner":"the-static-collective/static-os",
                      "focus":args.focus, "cards":[ask, offer, propose],
                      "encoded":text, "nativeValidation":checked,
                      "planZProvenanceEmbedded":False, "physicalHardwareUsed":False,
                      "fieldProof":False, "authority":"NONE"}, indent=2))

if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("HOLD_NATIVE_STATIC_OS_"+str(error)[:300], file=sys.stderr)
        raise SystemExit(2)
