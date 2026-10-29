# SEASON-001 — the stranger-to-field witness kernel

**Status: experimental draft, not a submitted application, event invitation, field approval, or deployment.**

The question has changed from "Can our local machine generate a plausible scene?" to "What may we honestly say happened after an independent stranger encounters it?" This layer is **not** another all-purpose orchestration engine. It is a small, portable, deliberately conservative record of the transitions we hope to earn.

## Provenance and relationship to CANNON

This branch is stacked on the exact original head of [CANNON CONSTELLATION-002 PR #49](https://github.com/the-static-collective/CANNON/pull/49), commit `f99d4b0f74b117e0af034137d550e88aa3d01f26`. The native 22-owner Stranger Arcade, its 64 documentary sources, five fictional missions, CANNON's previously proved stages, and its original refusal architecture are not rewritten here. The [JAR;VIS operator doorway PR #31](https://github.com/the-static-collective/JAR-VIS/pull/31) is a separate source-locked review branch. This kernel does not change JAR;VIS or assert that either PR merged.

**A recorded claim is not a verified event.** The proof ladder keeps reported software work, reported independent replay, approved *documentation gates*, reported field trials, and reported participant-confirmed outcomes apart. It never automatically promotes a recorded report into a public success claim.

## Five distinct thresholds

| Stage in software | Required recorded input | What it does **not** establish |
| --- | --- | --- |
| `IDEA_ONLY` | A named bounded case, opaque owner ID, brief purpose | A built system |
| `SOFTWARE_EVIDENCE_RECORDED` | Builder + hashed software artifact and output | That the hashes point to real or reproducible artifacts |
| `INDEPENDENT_REPLAY_REPORTED` | A different replayer, matching reported result hash, method hash | Independent verification of actual bytes or person's identity |
| `FIELD_GATE_DOCUMENTED` | A third reviewer, scope/safety/venue/consent-policy document digests and nominated steward | Permission from any real venue or participant |
| `FIELD_TRIAL_REPORTED` | Gate-nominated steward, consent and field-report digests | That a field trial occurred or consent is genuine |
| `HUMAN_OUTCOME_REPORTED` | A different observer, participant-confirmation and observation digests | That the benefit occurred, or permission to publicize a human story |

The last stage is **reported**, not established. `publishableHumanSuccess` remains `false` in every inspection. The kernel does not authenticate identities, digitally sign documents, contact institutions, verify participants, authorize a pilot, transfer money, or submit applications.

Anyone able to modify a file can manufacture a self-consistent hash chain. Chain checks detect *unrecomputed* edits. A credible external proof would require preservation of the root in independent custody, authenticated actors, reviewed source material, and, where needed, independent participant confirmation. A hash alone is not a witness.

## Refusal and privacy are kernel behavior, not marketing claims

- Events use **opaque pseudonymous IDs and SHA-256 document references**; no names, contact details, addresses, testimony, or participant narratives are required or accepted as structured event fields. Free-form purpose must stay non-identifying. The kernel cannot guarantee an operator has not encoded identifying information into an ID or external document: that remains a human responsibility.
- `HOLD` halts advancement; only its recorded issuer may `RELEASE` that particular objection. An unresolved objection is not outvoted by a majority or silently forgotten.
- `REFUSE` and `WITHDRAW` permanently terminate a case's event stream. Reopening requires a new, visibly distinct case, not rewriting history.
- A software builder cannot serve as the independent replayer. A field-gate reviewer must be distinct from builder, replayer and field steward; an outcome observer must differ from builder and steward. These are recorded **role separations**, not cryptographically authenticated people.
- No `DISBURSE`, `SEND`, `SPEND`, `PUBLISH`, `CONTACT`, `ACTUATE`, or `SUBMIT` transition exists. Even a complete ledger is not an instruction to perform any of them.
- Help is never conditional on giving testimonial material or participating in a study. For any real human trial, an appropriately qualified steward must independently determine safeguarding, consent, venue permission, privacy, withdrawal and complaint mechanisms. Particularly sensitive survivor-support work remains outside this toy fictional demo.

## Reproduce locally (no external packages or network)

Requires Node 24+ and the source files in this PR.

```sh
node --test test/season-witness.test.mjs
node scripts/season-witness.mjs demo /tmp/season-fictional-001
node scripts/season-witness.mjs inspect /tmp/season-fictional-001/fictional-garden.json
node scripts/season-witness.mjs verify /tmp/season-fictional-001/fictional-refusal.json
```

The first demo records a **fictional** completed evidence ladder with a consent HOLD and issuer-mediated release. The other has a permission HOLD followed by a terminal refusal. Both are explicitly fabricated test records, not human participants or institutional histories. The CLI also supports:

```sh
node scripts/season-witness.mjs new ./sample.json sample-case operator-1 "A bounded fictional equipment trial"
node scripts/season-witness.mjs add ./sample.json ./single-event.json
node scripts/season-witness.mjs verify ./sample.json
```

The `new` command refuses to overwrite an existing file. `add` explicitly updates the local file after validation. No command reads user contacts, posts to web services, sends email, handles funds, or runs CANNON's native mission build. The focused CI runs this standalone kernel without pretending the 22-source native machine was executed anew.

## Next season, in distinct human steps

**Before the fellowship application is finalized:** Keep all application material as a *mutable draft*. Use the new kernel to prepare honest, source-linked proof cards for the stranger demonstration. Ask an independent reviewer to reproduce the technical software work; capture objections as real objections, not endorsements. No application portal submission or funder contact is implied.

**First bounded community experiment:** Only after a named consenting steward, venue permission, a safeguarding plan, and a consent process genuinely exist, offer one small food/music/help exchange in partnership with willing local people. No one owes the machine a story. Its purpose is to learn whether a specific voluntary exchange is useful, not to manufacture a metric.

**Potential mini-festival sequence:** If the first experiment produces separately validated benefit and people want another gathering, allow optional Courthouse Park/community and traveling music/worship experiments to contribute people, skills and lessons. Each site retains its own permission and risk review; one event does not authorize another.

**Potential later Harmony Park gathering:** A larger collaborative festival, including stations where participants propose the *following* festival, is an invitation-shaped concept, not a venue booking, funding commitment or awarded institutional relationship. If scheduled after a six-month funding period, identify post-period costs, continuity and responsibilities separately. Refusal, lack of venue consent, or inadequate funding means HOLD rather than a fabricated milestone.

**Financial boundary:** An application request, a prospective award, an award notice, funds actually received, restricted obligations, authorized budget, money spent, and a documented community benefit are distinct facts. None is inferred from another, and none is processed by this kernel. Human stability, contingency, transportation, administration and participant safeguarding deserve explicit planning alongside public activities. There is no autonomous purchasing or grant spending.

## What to build next (open invitations, not unbounded mandates)

1. A reviewer packet that cites the exact CANNON artifact and recorded hashes, with reproducible offline commands and a first-time-stranger questionnaire. Criticism is an accepted result.
2. Externally verifiable custody/identity signatures and an explicit human review procedure, rather than accepting arbitrary IDs as authentication.
3. An opt-in, separate, private field-record mechanism that can validate participant withdrawal without collecting public identities. Never use this public artifact as a case-management database.
4. A plain-language bridge from actual field evidence to a minimal claim for applications, using explicit institutional and human approvals.
5. Bounded budget scenarios and alternative festival schedules, with real obligations separated from hypothetical funding.

**Measure success by useful freedom gained by other people, not by the number of connected repositories, generated ideas, or our own declarations.** Until we can independently evidence that freedom, preserve the distinction.
