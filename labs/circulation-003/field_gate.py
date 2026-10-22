#!/usr/bin/env python3
"""CIRCULATION-003 source-only field gate.

A human may voluntarily author or permit ONE deidentified *question*.
This validates typed boundaries and issues an inspectable HOLD — never adoption,
sender authentication, fulfillment, publication or receiver-project consent.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

SCHEMA = "circulation.field-question/v0"
EVENT = "coalition-of-care-greater-mankato-2026-10-24"
DOMAIN = "CIRCULATION-003-FIELD-QUESTION|"
HOLD_SCHEMA = "cannon.circulation-field-hold/v0"
HOLD_DOMAIN = "CANNON-CIRCULATION-003-HOLD|"
QUESTION_ROLES = {"AUTHOR", "FACILITATOR_WITH_PERMISSION"}
KINDS = {"OFFER", "NEED", "BUILD", "QUESTION"}
SHA = re.compile(r"^sha256:[a-f0-9]{64}$")
CONTACT = re.compile(r"@|https?://|\b(?:\+?1[-. ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}\b", re.I)
SENSITIVE = re.compile(r"\b(?:ssn|social security|date of birth|passport|street address|phone number)\b", re.I)
FIELDS = {
    "id", "schema", "event", "event_date", "kind", "public_question", "source_role",
    "permission", "privacy", "evidence", "state", "recipient", "recipient_acceptance",
    "person_authenticated", "organization_endorsed", "fulfillment_claimed",
    "publication_authorized", "contact_collected"
}

class Held(ValueError):
    pass

def must(value, reason):
    if not value:
        raise Held("FIELD_003_REFUSED:" + reason)

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8")

def digest(domain, value):
    return "sha256:" + hashlib.sha256(domain.encode() + canonical(value)).hexdigest()

def read(path):
    file = Path(path)
    must(file.is_file() and 0 < file.stat().st_size <= 15000, "BOUNDED_JSON_FILE_REQUIRED")
    value = json.loads(file.read_text("utf-8"))
    must(isinstance(value, dict), "TOPLEVEL_OBJECT_REQUIRED")
    return value

def validate(candidate):
    must(isinstance(candidate, dict) and set(candidate) == FIELDS, "MISSING_OR_UNRECOGNIZED_FIELDS")
    must(candidate["schema"] == SCHEMA and candidate["event"] == EVENT and
         candidate["event_date"] == "2026-10-24", "EVENT_BOUNDARY_MISMATCH")
    must(candidate["kind"] in KINDS and candidate["source_role"] in QUESTION_ROLES,
         "INVALID_QUESTION_ROLE_OR_KIND")
    q = candidate["public_question"]
    must(isinstance(q, str) and 14 <= len(q) <= 180 and q == q.strip() and
         not any(ord(c) < 32 or ord(c) == 127 for c in q) and
         not CONTACT.search(q) and not SENSITIVE.search(q),
         "UNSAFE_PUBLIC_QUESTION")
    must(candidate["permission"] == "LOCAL_OPERATOR_ATTESTS_PERMISSION_FOR_EXACT_PUBLIC_QUESTION" and
         candidate["privacy"] == "LOCAL_OPERATOR_ATTESTS_NO_IDENTIFIERS" and
         candidate["evidence"] == "SELF_ATTESTED_UNVERIFIED" and
         candidate["state"] == "UNPUBLISHED_CANDIDATE" and
         candidate["recipient"] == "NONE", "NO_ATTESTED_PERMISSION_OR_FALSE_ADMISSION")
    for k in ("recipient_acceptance", "person_authenticated", "organization_endorsed",
              "fulfillment_claimed", "publication_authorized", "contact_collected"):
        must(candidate[k] is False, "FALSE_WORLD_EFFECT_OR_AUTHORITY")
    ident = candidate["id"]
    must(isinstance(ident, str) and SHA.fullmatch(ident) is not None, "INVALID_ID")
    must(ident == digest(DOMAIN, {k:v for k,v in candidate.items() if k != "id"}),
         "QUESTION_BYTES_CHANGED")
    return True

def hold(candidate):
    validate(candidate)
    result = {
        "schema": HOLD_SCHEMA,
        "source_question_id": candidate["id"],
        "source_event": EVENT,
        "source_kind": candidate["kind"],
        "question": candidate["public_question"],
        "disposition": "HOLD_UNPUBLISHED",
        "source_evidence": "LOCAL_OPERATOR_SELF_ATTESTATION_NOT_INDEPENDENTLY_VERIFIED",
        "source_person_authorized": False,
        "recipient_owner_admission": False,
        "care_action_claimed": False,
        "culture_rights_granted": False,
        "publication_authorized": False,
        "network_transmission": False,
        "next_gate": "HUMAN_PRIVACY_AND_SOURCE_PERMISSION_REVIEW_THEN_SEPARATE_RECEIVER_CHOICE",
        "observed_kind": "VALIDATOR_EXECUTION_ONLY"
    }
    return {"id": digest(HOLD_DOMAIN, result), **result}

def check_hold(receipt, candidate):
    must(receipt == hold(candidate), "RECEIPT_CHANGED_OR_FALSE_AUTHORITY")
    return True

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("operation", choices=["validate", "hold", "verify-hold"])
    ap.add_argument("candidate", type=Path)
    ap.add_argument("--output", type=Path)
    args = ap.parse_args()
    try:
        candidate = read(args.candidate)
        validate(candidate)
        if args.operation == "validate":
            print(json.dumps({"status":"VALID_SELF_ATTESTED_UNVERIFIED", "id":candidate["id"],
                              "publication":False,"recipient_admission":False}))
        else:
            must(args.output is not None, "OUTPUT_REQUIRED")
            result = hold(candidate)
            if args.operation == "hold":
                with args.output.open("x", encoding="utf-8") as f:
                    json.dump(result, f, ensure_ascii=False, sort_keys=True, indent=2)
                    f.write("\n")
            else:
                check_hold(read(args.output),candidate)
            print(json.dumps({"status": "HOLD_NOT_ADMITTED", "receipt_id": result["id"],
                              "contact_or_delivery":False, "human_verified":False}))
        return 0
    except (Held, ValueError, TypeError, KeyError, OSError) as exc:
        print(str(exc),file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
