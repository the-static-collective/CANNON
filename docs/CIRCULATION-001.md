# CIRCULATION-001 — one question, two independent doors, one inspectable return

**2026-10-22 · CANNON draft experiment · HOLD.** Built on STACK² 025 (branch-first community survey), not main. This experiment is **not** an operational Coalition of Care network, grocery partner, music license, Abundent feature, or autonomous idea circulation service.

## Why

A shared source can produce multiple, independent invitations. Neither the graph nor planZ can appoint a recipient, grant consent, create obligations, publish a story, or verify a physical act. Preserve non-transitive owner authority.

```text
CANNON: fictional surplus-produce question
       |
       v
Free Graph: native v0 content-addressed packet, no constitutes links
       |                                      |
       v                                      v
planZ: independent CARE proposal       planZ: independent CULTURE proposal
       |                                      |
simulated BananaSpork HOLD           simulated Static Live DECLINE
       \                                      /
        \__ planZ two separate, hash-bound replies __/
                            |
                            v
       CANNON: **new** native Free Graph return packet
       source packet preserved, simulator-only testimony
```

## What is real at this gate

- `cannon_seed.py` runs exact fixture validation and invokes **native Free Graph `fg_core.py`**, using native content hashes, node IDs, links, schema checks and packet IDs. Source packet is retained separately.
- A **new planZ native-script branch** compiles two exact graph invitations into an offer set and records **two different simulated receiving-world choices**, individually content-addressed. It does not contact either named repository.
- `return_to_graph.py` independently recomputes the planZ artifact, refuses tampering, and creates a **new** natively verified Free Graph packet with two simulation-receipt nodes. It does not alter the source graph.
- GitHub Actions checks out Free Graph by exact commit and planZ by exact commit; no README-based compatibility assumptions. It runs full CLI cold replays plus hostile tests.
- This is an actual **three-repository source execution**, if CI passes, but the modeled human and recipient dispositions remain fictional. Native interface verification is not donor-world permission.

## Repeatable test

From the CANNON checkout, or in CI with pinned sibling checkouts:

```sh
export FREE_GRAPH_CORE=deps/free-graph/scripts/fg_core.py
export PLANZ_SCRIPT=deps/planZ/scripts/circulation001_planz.py
python -m unittest discover -s labs/circulation-001 -p 'test_*.py' -v
```

The workflow also writes three distinct artifacts: `source.json`, `planZ-return.json`, `return-graph.json`. It runs native `fg.py validate` for both graph packets and separate create-only/cold-verify runs for all three stages.

## Independent rights and failure boundaries

- **CARE ≠ CULTURE.** An invitation about a need gives no rights to publish a participant's music, image, or story. A cultural invitation doesn't claim delivery or confirmation of assistance.
- **HOLD/DECLINE are synthetic** in the current fixture. Nothing was sent to an operator of BananaSpork or Static Live, and neither source repository was mutated.
- **Graph reachability ≠ owner permission.** No `constitutes` link, enrollment, recipient consent, real actions, payment, message, media, or source-person identifier.
- **Source branch ≠ live capability.** Project names are addressing suggestions only.
- **Content hashes ≠ attestation.** Native Free Graph validation detects malformed or inconsistent graph content, not the truth of an asserted event.
- **Return ≠ rewrite.** The source graph is immutable and new simulated replies carry explicit ancestral IDs.

## Next gates

1. Review this lab and the companion planZ PR; run exact three-repository CI.
2. Independently select one source-native receiving adapter after owner review (for example BananaSpork), **not** because its named address appears in the fictional test.
3. Follow organizer invitation to test a no-account, no-identifiers paper OFFER/NEED/BUILD encounter on October 24. No collection of participant data without informed permission.
4. Only then prototype a read-only, permission-reviewed Abundent **Circulation Door**, with separate publication/deletion/withdrawal decisions. No production deployment from this PR.

**Acceptance at this phase:** two independently addressed proposals; two distinguishable simulated responses; deterministic, native content-addressed return; no inferred rights, execution, human occurrence or downstream project admission.
