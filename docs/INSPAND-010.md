# INSPAND-010 — Truth-First Golden Compass

**Source owner:** original CANNON, stacked on INSPAND-009 draft PR #80. No model was silently trained, installed, or allowed to execute code. All software is unchanged unless a draft PR is reviewed and merged.

## Why this was necessary

The original nested T5 experiments established something concrete: FLAN-T5 Small struggled to interpret our extremely compressed question language. The recent meaning-bearing dyads were faithfully generated, but its exact type/adapter answers were **0/72**. Adding more prompts and role labels was not a proven fix.

We therefore **changed which system is responsible for which task**, rather than asking a small language model to guess real interface types.

- **Original CANNON source** establishes exact facts using existing `validateCompositionRegistry`, `extractActualContract`, and original Reflex Library records.
- A small **deterministic typed compiler** checks port identity, the registered original adapter and the original handoff implementation. No model is used to decide truth.
- The **Golden Compass** is an optional inspectable meaning-bearing short-line representation of these source facts, possible bridges and typed relationships, not a source of truth.
- A separately explicit **operator grant** is necessary before an executable source-native software test.
- The **existing original Reflex Composer** builds and independently verifies the actual two-stage video/print study. No generated software executes.

This is not yet a useful *autonomous adapter creator*; it is a reliable **knowledge-to-test gateway** whose factual outputs cannot be overridden by generated text.

## What is actually known

The canonical recipe `plan-proof-to-pixels-and-print/v1` has two source-native capabilities:

1. Source stage `SOURCE_PROOF` produces a verified CANNON wrapper memory, typed `cannon.reflex-memory/v1`. This is **distinct** from the original `cannon.inspand-receipt/v1` software receipt output.
2. Receiver `VISUAL_STUDY` needs `planz.generated-plan/v1`.
3. The direct port types **do not match**.
4. The original, explicitly registered and separately verified `VERIFIED_RECEIPT_PLAN_ID_V1` adapter extracts `reusableRecipe.planId` from the source receipt and binds it to the downstream plan.
5. The original CANNON composer source has the actual `handoffFromProof` checks and tests; its native execution validates source memory, original route, plan identity, output receipts and audio-free silent MP4 files.

The compiler therefore outputs TWO contrasted, source-verified outcomes:

| Case | Known type decision | Next step |
| --- | --- | --- |
| ADAPTED | `TESTABLE_WITH_OPERATOR_AUTHORIZATION` | Only a local operator explicitly choosing `SYNTHETIC_TEST_ONLY` may invoke the existing original composer |
| DIRECT_ONLY | `HOLD_DIRECT_TYPE_MISMATCH` | **Refuse**, even if an operator supplies a synthetic test token |

The second is explicitly a **synthetic counterfactual**, not a claim that CANNON actually lacks its adapter. Unknown additional connectors or hypothetical adapters are never granted or invented.

## Meaning-bearing compass, no empty labels

The inspect output includes a short textual rendering of the facts:

```text
SOURCE_PROOF produces
cannon.reflex-memory/v1 memory
VISUAL_STUDY expects
planz.generated-plan/v1 input
These ports
cannot connect
A bridge
could translate
VERIFIED_RECEIPT_PLAN_ID_V1 connects
reusableRecipe.planId identity
Source verifies
that bridge
You inspect
the crossing
```

Every actual line has **two or three words**, and no `FACT`, `IDEA`, `RELATION`, `SOURCE`, `ADAPTER`, or `ASK` heading that merely declares a category. The assertions, possibility, and relation exist **in the words**, which is the operator's requested distinction. The representation does not contain new evidence; all source IDs and proof digests are retained separately.

## Run independently

```bash
node scripts/truth-first-compiler.mjs inspect
node --test test/truth-first-compiler.test.mjs
```

That first command is **read only**, returns source-bounded typed decisions, and needs **no model weights, APIs, GPUs or original remote checkouts**.

For a preselected exact original planZ plan ID and separately provided pinned original native owner roots:

```bash
node scripts/truth-first-compiler.mjs build \
 --case ADAPTED \
 --plan "$EXACT_PINNED_PLAN_ID" \
 --planz "$ORIGINAL_PINNED_PLANZ_CHECKOUT" \
 --roots "$EXACT_PINNED_ROOT_MAP" \
 --out /tmp/truth-first-proof \
 --authorize SYNTHETIC_TEST_ONLY

node scripts/truth-first-compiler.mjs verify \
 --case ADAPTED \
 --plan "$EXACT_PINNED_PLAN_ID" \
 --planz "$ORIGINAL_PINNED_PLANZ_CHECKOUT" \
 --roots "$EXACT_PINNED_ROOT_MAP" \
 --out /tmp/truth-first-proof
```

The hosted original-owner CI clones and pins the original planZ, Haunted Toaster, PlayDeck, Haunted Blender, band-runtime and lemonPRESS source checkouts; uses planZ's actual plan generator; installs the original runtime prerequisites; builds the original two CANNON capabilities through their original source. It validates the original handoff and native media receipts, fully cold replays, and rejects tampered source-truth/owner receipts. It also explicitly confirms DIRECT_ONLY cannot execute.

## Proven and not proven

**Proven if the CI workflow is GREEN:** the deterministic source compiler returns the correct original type decisions; the operator-approved positive case really executes the two previously demonstrated native capabilities; incompatible direct-type connections are refused before execution; the original results can be verified and replayed.

**Not proven:** automatic construction of an adapter; independent discovery of a new working capability; superior language-model reasoning; human-assented adoption; publication; physical activity; recovered human time; deployment; cost savings or user impact.

**Next meaningful study:** collect several original owner-source interface graphs including deliberately incompatible, adaptable and no-known-adapter edges; see whether a constrained model can *suggest a missing adapter specification* without making up ground truth. Any novel adapter still requires distinct owner permission, an original executable test and cold replay.
