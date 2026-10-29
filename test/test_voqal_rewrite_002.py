"""VOQAL-002 applicant-review contract checks; zero credentials or network calls."""
import json
import re
import unittest
from pathlib import Path

BASE = Path(__file__).resolve().parents[1] / "docs" / "voqal-rewrite-002"

def packet():
    return json.loads((BASE/"form-copy-rewritten.json").read_text("utf-8"))

def validate(doc):
    assert doc["schema"]=="voqal.rewrite-review/v2"
    assert doc["applicationStatus"]=="REWRITTEN_NOT_APPROVED_NOT_SUBMITTED"
    assert doc["applicantType"]=="INDIVIDUAL_HUMAN"
    assert doc["deadline"]=="2026-10-31T22:59:00-05:00"
    assert doc["proposedBudgetTotalUSD"]==30000
    assert doc["personalClaimsApproved"] is False and doc["submitted"] is False
    fields=doc["fields"]
    assert len(fields)==10
    for key,value in fields.items():
        assert value["length"]==len(value["text"]), key
        assert 0 < value["length"]<=value["limit"], key
        assert value["approved"] is False
    assert "APPLICANT PRIVATE REVIEW REQUIRED" in fields["lineage"]["text"]
    assert "APPLICANT PRIVATE REVIEW REQUIRED" in fields["coaching"]["text"]
    e=doc["sourceEvidence"]
    assert e["nativeSourceCommit"]=="f99d4b0f74b117e0af034137d550e88aa3d01f26"
    assert e["nativeExecutedOwners"]==22
    assert e["documentSourcesVerified"]==64
    assert e["distinctPublicRepositories"]==69
    assert e["fieldVerified"] is False and e["partnerEndorsement"] is False
    assert re.fullmatch("sha256:[0-9a-f]{64}",e["nativeSourceReceipt"])
    return True

class VoqalRewriteTests(unittest.TestCase):
    def test_contract_and_real_fields(self):
        self.assertTrue(validate(packet()))

    def test_generated_markdown_matches_every_field_exactly(self):
        doc=packet(); markdown=(BASE/"application-rewrite.md").read_text("utf-8")
        for key,v in doc["fields"].items():
            marker=f"### {key.upper()} — {v['length']}/{v['limit']} characters"
            self.assertIn(marker,markdown)
            self.assertIn(v["text"],markdown)
        self.assertIn("NOT APPROVED / NOT SUBMITTED",markdown)
        self.assertIn("22 native",markdown)

    def test_html_contains_fields_and_copy_boundaries(self):
        text=(BASE/"application-rewrite.html").read_text("utf-8")
        self.assertIn("NOT SUBMITTED",text)
        self.assertIn("Copy field",text)
        self.assertIn("APPLICANT PRIVATE REVIEW REQUIRED",text)
        self.assertNotIn("FORM_SUBMITTED",text)

    def test_actual_artifact_source_references_recorded_not_invented(self):
        s=json.loads((BASE/"source-verification.json").read_text("utf-8"))
        self.assertEqual(s["nativeArtifact"]["pr"],49)
        self.assertEqual(s["originalApplication"]["pr"],48)
        self.assertEqual(s["nativeArtifact"]["receiptId"],packet()["sourceEvidence"]["nativeSourceReceipt"])
        self.assertFalse(s["checks"]["applicationSubmitted"])
        self.assertFalse(s["checks"]["fieldValidated"])

    def test_refusal_of_forged_counts_and_fake_applicant_approval(self):
        original=packet()
        for change in [{"sourceEvidence":{"nativeExecutedOwners":69}},{"submitted":True},{"personalClaimsApproved":True}]:
            altered=json.loads(json.dumps(original))
            if "sourceEvidence" in change:
                altered["sourceEvidence"].update(change["sourceEvidence"])
            else:
                altered.update(change)
            with self.assertRaises(AssertionError):
                validate(altered)

if __name__=="__main__":
    unittest.main()
