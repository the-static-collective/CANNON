# INSPAND-008 — Real interfaces, conditional YOU address, and bounded translation

**Source owner:** the-static-collective/CANNON. **Original generative owner:** the-static-collective/iron-lung COMPASS-002 PR #10, pinned at executable commit `4222b2a9a7629bd8abacf215609e364fc13b88d0`. **Parent:** CANNON COMPASS-001/INSPAND-007 PR #77. Synthetic experiment, not deployment.

## No placeholder representors

The CANNON runner obtains actual source values by reading and checking **both original existing registries** `registry/reflex-compositions-v1.json` and `registry/reflex-library-v1.json`, passing them through the *existing original CANNON validators* rather than an invented type registry. Its real source task has:

```text
PRODUCER SOURCE_PROOF
CAPABILITY film-press-synthetic-selection/v1
OUTPUT cannon.reflex-memory/v1
CONSUMER VISUAL_STUDY
CAPABILITY film-press-plan-shaped/v1
INPUT planz.generated-plan/v1
ADAPTER VERIFIED_RECEIPT_PLAN_ID_V1
FIELD reusableRecipe.planId
AUTHORIZATION SYNTHETIC_TEST_ONLY
PUBLISH false
```

There is a known difference between the **native receipt port** (`cannon.inspand-receipt/v1`) and the **CANNON composition wrapper memory** (`cannon.reflex-memory/v1`). This is a real, verified original typed adapter that binds a field from the upstream source receipt to a plan identity required by a native consumer. The actual source-sha and owner Git blob identities are retained.

## Test four arms against the exact original source facts

The original Iron Lung CLI, not a CANNON imitation, runs the same original Google FLAN-T5 Small pretrained model for 36 total calls: nine questions each under **neutral dyads**, **second-person dyads**, **neutral compiled instructions**, **second-person compiled instructions**.

Dyads retain FACT / IDEA / RELATION and two or three words on each actual model prompt line. Directed versions contain the real **`You inspect`** line. Compiled variants convert the exact same task card into an explicit, deterministic instruction and when appropriate address the model as **you**. In every case the original model receives one grounded microquestion at a time. Each arm recursively feeds its own last response to the next question and resets prior context between arms. All four make nine model calls: equal call budgets, but **not equal token budgets**.

Questions explicitly ask for grounded source values: producer output type, adapter ID, existing synthetic permission, consumer input type, receipt field, publishing boolean, producer capability ID. Exact source-value match is measurable, and copied correct answers are **retrieval**, not evidence of original invention.

## Verification and review

Original Iron Lung signs every card, source task, prompt, response, prior-message chain and 2x2 result and independently verifies the 36-step sequence. CANNON verifies the original independent Git checkout/byte identity and that the received task **exactly equals its canonical original-source interface records**, then records raw answers, exact matches, prompt echoes, no answers, and whether the response literally contains **you**. Source owner and CANNON each reject forged permission, changed answers, changed source or changed interface labels. The review page is escaped HTML, and the CLI has a read-only `inspect` mode.

Run from the CANNON repo after checking out the pinned original Iron Lung and installing its Node and CPU model dependencies:

```bash
node scripts/real-contract-compass.mjs inspect
node scripts/real-contract-compass.mjs build --lung /path/to/pinned/iron-lung --provider fixture --out /tmp/inspand008 --authorize SYNTHETIC_TEST_ONLY
node scripts/real-contract-compass.mjs verify --lung /path/to/pinned/iron-lung --provider fixture --out /tmp/inspand008
```

Use `--provider flan` for the actual original Google FLAN-T5 checkpoint. CI separately runs fixed controls and actual model inference.

**Never promoted:** model-generated rights, runnable adapters, rewritten original interfaces, actual creative owner executions, automatically selected hypotheses, publication, real-world outcomes, or measured time savings. Even a high score in this experiment only demonstrates extracting facts explicitly supplied in the model's input. The next serious benchmark should include *different real interfaces*, including deliberate incompatibilities, without training on ground truth answers.
