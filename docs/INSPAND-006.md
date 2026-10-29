# INSPAND-006 — Seven-Strategy Mutation Pressure Lab

**Owner:** CANNON. **Original model owner:** original Iron Lung PR #8, exact pinned commit `955e2f39493ca4b429969ad268a7e31a3d546445`. **Stacked on:** INSPAND-005 draft #72. Review-only.

## Executable experiment

The original Iron Lung CLI executes a **real Google FLAN-T5 Small** checkpoint on CPU in its own original runtime. CANNON submits one unmodified baseline plus seven controlled CANNON-owned prompt overlays against the **same original typed source braid**: DA_VINCI (mechanism), DARWIN (single-step variation), BACH (functional pattern), ESCHER (inversion), OCTOPUS (alternate path), COMBINATRIX (typed composition), IRON_LUNG (unresolved alternatives). These are experimental question styles, not simulations of historical personalities or separate pretrained models.

Every run executes **three recursive breaths × three Substance → Lineage → Authority-requirement stages**. Eight runs total **72 source-owned sequential model transfers**; the same original braid remains unchanged, and each prompt pressure is explicitly included in source text and source references. Every step retains source hashes, parent step ID, exact model identity, and output hash.

The outputs are fed through the existing CANNON Reflex Library's **literal capability discovery**, not through invented interface oracles. A model output cannot select a recipe, run a builder, mint approval, or promote a capability. No original CANNON creative owner is executed in this experiment; the INSPAND-005 ancestral PR established separately authorized native film composition.

## Falsifiable measurement rather than hype

Each branch records: total distinct outputs, exact repetitions, weak source word-overlap (echo proxy), short/low-information outputs, permission-like output text, and exact literal capability-token matches. Every result is compared to an **unmodified baseline**. Scores are diagnostics, not verified semantic novelty, usefulness, or working code. No winner is automatically chosen. If there is no measured proxy improvement, it remains visible. Model-generated executables added: **zero**.

Each branch includes `input.json`, `field.json`, `pressure.json`, and `metrics.json`, plus whole-run `report.json` and `metadata.json`. Full verification **reruns original Iron Lung** for all branches and byte-compares retained records; the original owner also verifies each field. Actual model greedy output reproducibility is checked in hosted CI; it does not guarantee byte equivalence across hardware.

## Running

Fetch the exactly pinned original Iron Lung, install its Node dependencies and (for the real model) original CPU PyTorch/FLAN requirements. From CANNON:

```bash
node scripts/mutation-pressure-lab.mjs list
node scripts/mutation-pressure-lab.mjs build --lung "$PINNED_IRON_LUNG" --provider fixture --source "$PINNED_IRON_LUNG/fixtures/triple-transfer-input-v1.json" --out /tmp/inspand006-fixture --authorize SYNTHETIC_TEST_ONLY
node scripts/mutation-pressure-lab.mjs verify --lung "$PINNED_IRON_LUNG" --provider fixture --source "$PINNED_IRON_LUNG/fixtures/triple-transfer-input-v1.json" --out /tmp/inspand006-fixture
```

Use `--provider flan` to run actual pretrained model inference on all eight variants. Neither pathway sends private content to a remote model API. Initial model download retrieves public model files. The workflow independently tests the fixture and the actual model.

## Next qualifying gate

If one of these eight produces a genuinely testable typed adapter, a separately approved executable experiment can compare it against actual original source contracts with CANNON and independent replay. Until then model-generated outputs remain held; human review and separate owner permission remain required. No merges, deployment, publication, or real-world action in this experiment.
