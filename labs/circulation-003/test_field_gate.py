"""CIRCULATION-003 independent privacy and no-authority verifier tests."""
from __future__ import annotations
import copy
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("field003",ROOT/"field_gate.py")
G=importlib.util.module_from_spec(spec);spec.loader.exec_module(G)

def specimen():
    body={
      "schema":G.SCHEMA,
      "event":G.EVENT, "event_date":"2026-10-24",
      "kind":"BUILD",
      "public_question":"FICTIONAL: Could a community arts table share an empty room?",
      "source_role":"AUTHOR",
      "permission":"LOCAL_OPERATOR_ATTESTS_PERMISSION_FOR_EXACT_PUBLIC_QUESTION",
      "privacy":"LOCAL_OPERATOR_ATTESTS_NO_IDENTIFIERS",
      "evidence":"SELF_ATTESTED_UNVERIFIED",
      "state":"UNPUBLISHED_CANDIDATE","recipient":"NONE",
      "recipient_acceptance":False,"person_authenticated":False,
      "organization_endorsed":False,"fulfillment_claimed":False,
      "publication_authorized":False,"contact_collected":False,
    }
    return {"id":G.digest(G.DOMAIN,body),**body}

class Field003Test(unittest.TestCase):
    def test_canon_and_independent_hold_cannot_adopt(self):
        p=specimen();self.assertTrue(G.validate(p))
        a=G.hold(p);b=G.hold(copy.deepcopy(p))
        self.assertEqual(a,b)
        self.assertTrue(G.check_hold(a,p))
        self.assertEqual(a["disposition"],"HOLD_UNPUBLISHED")
        for key in ("source_person_authorized","recipient_owner_admission","publication_authorized",
                    "care_action_claimed","culture_rights_granted","network_transmission"):
            self.assertIs(a[key],False)
        self.assertNotIn("name",G.canonical(a).decode())
    def test_refuse_unconsented_or_fake_effect(self):
        for k,v in [
            ("permission","NONE"),("privacy","UNREVIEWED"),("evidence","SIGNED_BY_COALITION"),
            ("state","PUBLISHED"),("recipient","the-static-collective/BananaSpork"),
            ("recipient_acceptance",True),("person_authenticated",True),
            ("organization_endorsed",True),("fulfillment_claimed",True),
            ("publication_authorized",True),("contact_collected",True),
        ]:
            p=specimen();p[k]=v;p["id"]=G.digest(G.DOMAIN,{a:b for a,b in p.items() if a!="id"})
            with self.subTest(k=k),self.assertRaises(G.Held):
                G.validate(p)
    def test_refuse_private_contacts_or_source_tamper(self):
        for val in ["Here is jane@example.org to contact", "Call 507-555-1234 about food",
                    "Visit https://example.org for a person's story",
                    "Please text @someone right now",
                    "What is my SSN 123-45-6789?",
                    "I need to share my street address with a volunteer"]:
            p=specimen();p["public_question"]=val
            p["id"]=G.digest(G.DOMAIN,{a:b for a,b in p.items() if a!="id"})
            with self.subTest(question=val),self.assertRaises(G.Held):G.validate(p)
        p=specimen();p["public_question"]+=" please"
        with self.assertRaises(G.Held):G.validate(p)
    def test_no_private_extra_metadata_or_false_approval(self):
        p=specimen();p["participantName"]="Anon"
        with self.assertRaises(G.Held):G.validate(p)
        p=specimen();p["id"]="sha256:"+"0"*64
        with self.assertRaises(G.Held):G.validate(p)
        p=specimen();a=G.hold(p);a["recipient_owner_admission"]=True
        with self.assertRaises(G.Held):G.check_hold(a,p)
        p=specimen();a=G.hold(p);a["id"]="sha256:"+"a"*64
        with self.assertRaises(G.Held):G.check_hold(a,p)
    def test_cold_create_only_replay(self):
        with tempfile.TemporaryDirectory() as d:
            packet=Path(d)/"input.json";result=Path(d)/"hold.json"
            packet.write_text(json.dumps(specimen()),encoding="utf-8")
            with result.open("x",encoding="utf-8") as f:json.dump(G.hold(G.read(packet)),f)
            self.assertTrue(G.check_hold(G.read(result),G.read(packet)))
            with self.assertRaises(FileExistsError):result.open("x")

if __name__=="__main__":unittest.main()
