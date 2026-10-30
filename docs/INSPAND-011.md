# INSPAND-011 — National Treasure Question Box × Truth-First CANNON

## We already owned a better question machine

The original `the-static-collective/national-treasure` **Question Box v0.1** was created independently in draft PR #70 (and extended in stacked PR #85). Its **real** `tools/question-box/engine.mjs` is a **zero-LLM, deterministic** engine that rotates through evidence gaps:

source object → chronology → counterevidence → falsifier → rival models → independent source families → minimum discriminator → witnessed relation.

The output `national-treasure.question-receipt/v0` is explicitly **a question and never an answer or conclusion**. It does not infer hidden meaning or establish ancestry, causation or truth. The source owner already tests these constraints.

This PR executes the **original National Treasure source file**, fetched from exact reviewed PR #85 commit `d6ff149a7a2d59dcb41c2c61606204b20b56a2fa`. CANNON verifies Git origin, exact commit, original Git blob IDs, and working-tree byte identities before importing `buildQuestionFrontier`. No duplicate/question-imitation implementation is supplied. No National Treasure source changes were made.

## How the crossing works

1. The existing **CANNON INSPAND-010** `compileTruth()` establishes two real source-derived facts: CANNON's original `SOURCE_PROOF` wrapper has output `cannon.reflex-memory/v1`; `VISUAL_STUDY` needs `planz.generated-plan/v1`. Their direct port types do not match, but the original source registers `VERIFIED_RECEIPT_PLAN_ID_V1`, which binds `reusableRecipe.planId`. That adapter is known; no new one is invented.
2. CANNON generates two separate **strict research seeds** using actual source provenance. The first is about the real registered adapter. It supplies a recoverable original CANNON code locator (at frozen commit `932c3400903123630d1dc6957ee38ae955944930`) and a SHA-256 source digest. The second is a clearly declared **counterfactual** that intentionally withholds the real adapter. The nonexistent hypothetical state gets **no invented source locator**, support `unsupported`, and provenance `speculation`.
3. The **original National Treasure Question Box** independently asks its first unanswered question. It does not answer the question, choose a software branch, execute a recipe, publish a video or create a human approval.
4. CANNON stores **both original receipts unchanged** in a source-attributed held handoff, with exact content digests and a printable HTML question card. Cold verification reruns the actual owner engine, recomputes every seed and question, compares bytes, and refuses fake answers, upgraded confidence or mutated original source.

### Demonstration expected questions

For the **real source-backed** claim, source recoverability is already present. The Question Box advances to **chronology**:

> What is the earliest date at which the relation implied by the original CANNON adapter source claim can be demonstrated without importing a later meaning backward?

For the **counterfactual** disabled adapter, no such original state exists. The Question Box correctly starts at **source object**:

> What is the earliest recoverable source object for the purported disabled-adapter state, and what does that object actually show before interpretation?

This is not evidence that the real adapter is missing; it is evidence that the hypothetical software state has not been established by an original source. That distinction is the main result.

## Run

```bash
node scripts/national-treasure-question-crossing.mjs list

# checkout original source, exact commit pinned above:
node scripts/national-treasure-question-crossing.mjs build \
  --treasure "$PINNED_NATIONAL_TREASURE" \
  --out /tmp/inspand-011 \
  --authorize SYNTHETIC_TEST_ONLY

node scripts/national-treasure-question-crossing.mjs verify \
  --treasure "$PINNED_NATIONAL_TREASURE" \
  --out /tmp/inspand-011
```

No model weights, inference API, training, network calls (after source acquisition), GitHub merges or native creative executables are required. CANNON's CI runs original Question Box tests plus this crossing and deliberate forgery cases. The source files stay in the original repository.

## What can come next

A useful non-LLM first application is a **Question-to-Experiment Planner**. When the Question Box returns `counterevidence`, `falsifier` or `discriminator`, CANNON can propose *a bounded test plan* using its original actual owner contracts. Only separately reviewed, explicitly authorized local synthetic tests execute. If the question is about missing source or chronology, the plan should HOLD until independently recoverable material is supplied.

This question machine is useful precisely because it does **not** replace a missing answer with model-generated confidence. The research frontier is a first-class artifact, not a newly proven capability or authority.
