import copy
import importlib.util
import json
import os
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("return_002",ROOT/"return_from_bananaspork.py")
R=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(R)
GRAPH=Path(os.environ["CIRCULATION002_GRAPH"])
REPLY=Path(os.environ["CIRCULATION002_REPLY"])
FG=R.load_module(os.environ["CIRCULATION002_FG"],"fg_core.py","native_fg_test")
PLAN=R.load_module(os.environ["CIRCULATION002_PLANZ"],"circulation001_planz.py","native_plan_test")

class ReceiverReturnTest(unittest.TestCase):
    def setUp(self):
        self.g=R.read(GRAPH)
        self.reply=R.read(REPLY)
    def test_native_original_reply_and_return_are_independently_content_addressed(self):
        before=R.canonical(self.g)
        returned=R.native_return(self.g,self.reply,FG,PLAN)
        self.assertEqual(FG.validate_packet(returned),[])
        self.assertEqual(FG.packet_id(returned),returned["packet_id"])
        self.assertNotEqual(self.g["packet_id"],returned["packet_id"])
        self.assertEqual(R.canonical(self.g),before)
        self.assertEqual(returned["extensions"]["banana_spork_reply_id"],self.reply["id"])
        self.assertEqual(returned["extensions"]["human_or_project_owner_authenticated"],False)
        self.assertEqual(len(returned["nodes"]),len(self.g["nodes"])+1)
        self.assertEqual(len(returned["links"]),len(self.g["links"])+1)
        self.assertTrue(all(l["authority"]=="none" for l in returned["links"]))
        self.assertEqual(returned,R.native_return(self.g,self.reply,FG,PLAN))
    def test_reject_false_attestation_or_completed_care(self):
        for field in ["humanConsentProven","ownerIdentityAuthenticated","helpSlipCreated",
                      "campfirePublished","fulfillmentConfirmed","helperAssigned"]:
            q=copy.deepcopy(self.reply)
            q[field]=True
            with self.subTest(field=field),self.assertRaises(R.Refused):
                R.native_return(self.g,q,FG,PLAN)
    def test_reject_changed_offer_identity_and_cross_current(self):
        for field,value in [
            ("offerId","sha256:"+"0"*64),
            ("offerSetId","sha256:"+"0"*64),
            ("sourceGraphPacketId","fgp:sha256:"+"0"*64),
            ("destination","the-static-collective/static-live"),
            ("lane","culture"),
            ("choice","FULFILLMENT_CONFIRMED"),
            ("sourceStatus","REAL"),
            ("externalEffect","PUBLIC"),
        ]:
            q=copy.deepcopy(self.reply)
            q[field]=value
            with self.subTest(field=field),self.assertRaises(R.Refused):
                R.native_return(self.g,q,FG,PLAN)
    def test_reject_drift_or_extra_private_fields(self):
        q=copy.deepcopy(self.reply)
        q["contact"]="person@example.org"
        with self.assertRaises(R.Refused):R.native_return(self.g,q,FG,PLAN)
        q=copy.deepcopy(self.reply)
        q["id"]="sha256:"+"f"*64
        with self.assertRaises(R.Refused):R.native_return(self.g,q,FG,PLAN)
        g=copy.deepcopy(self.g)
        g["nodes"][0]["label"]="a fake occurrence"
        g["packet_id"]=FG.packet_id(g)
        with self.assertRaises(R.Refused):R.native_return(g,self.reply,FG,PLAN)
    def test_refuse_authority_transfer_even_with_self_consistent_graph_hash(self):
        g=copy.deepcopy(self.g)
        g["links"][0]["authority"]="owner-local"
        g["links"][0]["id"]=FG.record_id("link",g["links"][0])
        g["packet_id"]=FG.packet_id(g)
        with self.assertRaises(R.Refused):R.native_return(g,self.reply,FG,PLAN)

if __name__=="__main__":unittest.main()
