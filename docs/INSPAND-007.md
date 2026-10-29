# INSPAND-007 — Golden Compass: two-word questions, triad bearings

**Owner:** CANNON's independent read-only evaluation and review-book layer. **Original model / generation owner:** Iron Lung's COMPASS-001 draft PR #9, exact locked commit `cc770ff20688e9768477f92f4e880bef36a06e98`. **Parent:** INSPAND-006 draft #74, with a previous long-form and seven-style negative benchmark.

## Hypothesis

When the small original FLAN-T5 model failed to generate specific useful hypotheses, an alternate prompt language might help: every line of the **actual model input** contains **two to three words**, with these fixed compass bearings at the top of every card:

```text
FACT stated
IDEA speculative
RELATION unverified
```

The raw source is chunked as word-pairs rather than buried inside a paragraph; previous model output is also chunked and supplied into the next recursive stage. No prompt line exceeds three words (every line has at least two). There are 3 breaths × 3 original layers (Substance, Lineage, Authority Requirements). Stage-specific microquestions ask one focused next operation, not an open-ended creative essay. Fact means *reported source*, not verified truth, and Authority asks for external requirements, not granting consent.

## Scientifically meaningful comparisons

- **A — Existing original source-owner full-prose 3×3:** 9 actual model calls. Same source, model revision, source braid.
- **B — Golden Compass 2–3-word cards 3×3:** **9 actual model calls** on the same input and same model. This is the *equal-inference-call* A/B comparison; character/token lengths and context structure differ.
- **C — Compass Fact/Idea/Relation microquestions:** **27 actual model calls**. This tests whether an additional three-way internal decomposition helps but is a *larger-inference-budget arm*; never interpret its results as a format-only improvement.

Total across an original source-owned three-way execution: **45 actual calls** in a single pinned original Google FLAN-T5 Small process. The model is still fixed, not fine-tuned. Every card has source, previous step, phase, focus and proof checks; no candidate can promote itself, write code or grant rights.

## CANNON's independent review

CANNON pins exact original Iron Lung Git commit and original source blobs (including its real provider, card grammar, engine and input fixture) and runs the original `npm run compass-lab` twice: **build** a new packet, and **verify** by rerunning the original model under the same source. Its native CLI also validates the output. This experiment runs no original creative/production native owner; comparison is purely about model responses.

CANNON produces a held `comparison.json`, independent `evaluation.json`, source observation receipt, and `review.html` (HTML-escaped text) showing all nine equal-budget comparisons and expandable twenty-seven microquestions. Metrics explicitly labeled lexical: exact repeated answers, no-answer patterns, possible prompt echo, response length, submitted card word-count and generated response compliance. No metric establishes semantic truth, testable interface compatibility or creative novelty.

An outcome can be worse; results must not be cherry-picked. No automatic winner, code execution, capability promotion, publishing, independent approvals, time savings or real-world outcomes.

## Reproduce

Clone Iron Lung at the locked commit, install its Node dependencies and, if using pretrained inference, CPU PyTorch and its original `model/requirements-triple.txt`.

```bash
node scripts/compass-evaluator.mjs inspect --lung /path/to/pinned/iron-lung
node scripts/compass-evaluator.mjs build \
  --lung /path/to/pinned/iron-lung \
  --provider fixture \
  --source /path/to/pinned/iron-lung/fixtures/triple-transfer-input-v1.json \
  --out /tmp/inspand007 --authorize SYNTHETIC_TEST_ONLY
node scripts/compass-evaluator.mjs verify \
  --lung /path/to/pinned/iron-lung \
  --provider fixture \
  --source /path/to/pinned/iron-lung/fixtures/triple-transfer-input-v1.json \
  --out /tmp/inspand007
```

For real Google FLAN-T5 inference change to `--provider flan` after installing model dependencies. The hosted workflow separately executes the deterministic control and actual pretrained model, and attaches review books; source-owner Iron Lung also has its independently passing CI.

**Next question:** if dyads increase source-linked specificity without increasing empty echo or unsupported claims, test them on several independently selected actual typed capability contracts, rather than extrapolating from one fictional fixture.
