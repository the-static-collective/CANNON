"""Adversarial three-repository cold-test of CIRCULATION-001."""
from __future__ import annotations
import copy
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent
FG = Path(os.environ["FREE_GRAPH_CORE"]).resolve()
PLANZ = Path(os.environ["PLANZ_SCRIPT"]).resolve()

def load(path, key):
    spec = importlib.util.spec_from_file_location(key, path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m

C = load(ROOT / "cannon_seed.py", "circulation_cannon_test")
P = load(PLANZ, "circulation_planz_test")
R = load(ROOT / "return_to_graph.py", "circulation_return_test")
N = C.native_fg(FG)
SEED = json.loads((ROOT / "seed.json").read_text())
REPLIES = json.loads((ROOT / "replies.json").read_text())

class CirculationTests(unittest.TestCase):
    def setUp(self):
        self.graph = C.build(SEED, N)
        self.out = P.compose(self.graph, REPLIES, N)

    def test_native_graph_carries_two_distinct_invitation_questions(self):
        self.assertEqual([], N.validate_packet(self.graph))
        self.assertEqual(N.packet_id(self.graph), self.graph["packet_id"])
        self.assertEqual(len(self.graph["nodes"]), 5)
        self.assertEqual(len(self.graph["links"]), 4)
        self.assertFalse(any(l["verb"] == "constitutes" for l in self.graph["links"]))
        self.assertEqual({o["lane"] for o in self.out["offer_set"]["offers"]}, {"care", "culture"})
        self.assertTrue(all(o["status"] == "PROPOSED_ONLY" for o in self.out["offer_set"]["offers"]))

    def test_two_independent_simulated_replies_cold_reenter_free_graph(self):
        frozen = json.dumps(self.graph, sort_keys=True)
        returned = R.build(self.graph, REPLIES, self.out, N, P)
        self.assertEqual([], N.validate_packet(returned))
        self.assertEqual(returned["extensions"]["parent_packet_id"], self.graph["packet_id"])
        self.assertNotEqual(returned["packet_id"], self.graph["packet_id"])
        self.assertEqual(json.dumps(self.graph, sort_keys=True), frozen)
        self.assertEqual([v["choice"] for v in self.out["return"]["receipts"]], ["HOLD", "DECLINE"])
        # Sorted by destination; BananaSpork precedes static-live.
        self.assertEqual(sum(n.get("extensions", {}).get("circulation_role") == "simulated-reply"
                             for n in returned["nodes"]), 2)
        self.assertTrue(all(l["authority"] == "none" for l in returned["links"]))
        self.assertEqual(R.build(self.graph, REPLIES, self.out, N, P), returned)

    def test_false_owner_authority_refused(self):
        replies = copy.deepcopy(REPLIES)
        replies["decisions"][0]["owner_admission"] = True
        with self.assertRaises(Exception):
            P.compose(self.graph, replies, N)
        fake = copy.deepcopy(self.out)
        fake["return"]["receipts"][0]["owner_admission"] = True
        with self.assertRaises(Exception):
            R.build(self.graph, REPLIES, fake, N, P)

    def test_no_reply_replay_or_cross_current_substitution(self):
        duplicate = copy.deepcopy(REPLIES)
        duplicate["decisions"][1]["destination"] = duplicate["decisions"][0]["destination"]
        with self.assertRaises(Exception):
            P.compose(self.graph, duplicate, N)
        forged = copy.deepcopy(REPLIES)
        forged["decisions"][1]["choice"] = "CONFIRMED_DELIVERY"
        with self.assertRaises(Exception):
            P.compose(self.graph, forged, N)
        missing = copy.deepcopy(REPLIES)
        missing["decisions"].pop()
        with self.assertRaises(Exception):
            P.compose(self.graph, missing, N)

    def test_source_tamper_and_private_field_refused(self):
        corrupted = copy.deepcopy(self.graph)
        corrupted["nodes"][0]["label"] = "real event"
        corrupted["packet_id"] = N.packet_id(corrupted)
        with self.assertRaises(Exception):
            P.compose(corrupted, REPLIES, N)
        new_seed = copy.deepcopy(SEED)
        new_seed["contact"] = "person@example.org"
        with self.assertRaises(Exception):
            C.build(new_seed, N)
        new_seed = copy.deepcopy(SEED)
        new_seed["title"] = "FICTIONAL: person@example.org"
        with self.assertRaises(Exception):
            C.build(new_seed, N)
        new_seed = copy.deepcopy(SEED)
        new_seed["title"] = "FICTIONAL: call 555-123-4567"
        with self.assertRaises(Exception):
            C.build(new_seed, N)

    def test_real_owner_claim_and_foreign_return_blocked(self):
        injected = copy.deepcopy(self.graph)
        injected["nodes"][1]["status"] = "locally-adopted"
        with self.assertRaises(Exception):
            P.compose(injected, REPLIES, N)
        forged = copy.deepcopy(self.out)
        forged["graph_packet_id"] = "fgp:sha256:" + "0" * 64
        with self.assertRaises(Exception):
            R.build(self.graph, REPLIES, forged, N, P)

    def test_three_native_cli_stages_cold_verify_and_refuse_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            paths = [Path(directory) / n for n in ("source-graph.json", "planz-return.json", "return-graph.json")]
            cannon = [sys.executable, str(ROOT / "cannon_seed.py"),
                      "--seed", str(ROOT / "seed.json"), "--free-graph-core", str(FG),
                      "--output", str(paths[0])]
            planz = [sys.executable, str(PLANZ), "--graph", str(paths[0]),
                     "--replies", str(ROOT / "replies.json"), "--free-graph-core", str(FG),
                     "--output", str(paths[1])]
            back = [sys.executable, str(ROOT / "return_to_graph.py"),
                    "--graph", str(paths[0]), "--replies", str(ROOT / "replies.json"),
                    "--plan-return", str(paths[1]), "--planz-script", str(PLANZ),
                    "--free-graph-core", str(FG), "--output", str(paths[2])]
            for args in (cannon, planz, back):
                self.assertEqual(subprocess.run(args[:2] + ["run"] + args[2:], capture_output=True).returncode, 0)
                self.assertEqual(subprocess.run(args[:2] + ["verify"] + args[2:], capture_output=True).returncode, 0)
            self.assertNotEqual(subprocess.run(cannon[:2] + ["run"] + cannon[2:],
                                               capture_output=True).returncode, 0)
            altered = json.loads(paths[2].read_text())
            altered["extensions"]["owner_permission"] = True
            paths[2].write_text(json.dumps(altered))
            self.assertNotEqual(subprocess.run(back[:2] + ["verify"] + back[2:],
                                               capture_output=True).returncode, 0)

if __name__ == "__main__":
    unittest.main()
