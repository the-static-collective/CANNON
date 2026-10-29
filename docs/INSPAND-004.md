# INSPAND-004 — The Reflex Composer

**Review-only software experiment.** Stacked on INSPAND-003 (CANNON draft PR #67). Never merge, deploy, publish, manufacture, contact people, or assert real outcomes without separate human/owner authority.

## Genuine executable crossing

This is **not just a drawing of a pipeline**. The bounded recipe `plan-proof-to-pixels-and-print/v1` declares two original previously verified CANNON capabilities with matching typed ports:

1. **SOURCE_PROOF** runs original `film-press-synthetic-selection/v1`. It executes source-owning Toaster, PlayDeck, Blender, Band Runtime and lemonPRESS against a synthetic fixture, and preserves a `cannon.reflex-memory/v1` result whose plan ID, native bytes and provenance can be cold-replayed.
2. A fixed adapter checks that upstream memory is a non-publishing, source-verified result, that its choice and plan ID match the original operator choice, that the memory is content-addressed, and that the original runner requires fresh authorization. It emits an exact `cannon.reflex-typed-handoff/v1`. **The downstream ID comes from this actual verified upstream receipt**, not a second guessed parameter.
3. **VISUAL_STUDY** invokes the **different original** `film-press-plan-shaped/v1` capability with that received plan ID. The actual source-backed plan questions and four independently recorded perspective cuts influence the native Haunted Toaster parameters and the original Blender-rendered silent MP4, as previously tested.
4. CANNON's **editorial-only** formatter builds a printable inspection card whose fields are drawn from both real native video SHA-256s and the new composite receipt. The owner-native lemonPRESS **still executes** within the two established film tests, but the new combined HTML is **not** represented as a lemonPRESS-native press plate or actual manufactured item.

All nodes are exact source-verified original executables through the existing Reflex Library and INSPAND runners; the added adapter and print card are clearly CANNON-authored. This is a *proof-dependency and input-ID crossing* rather than a new semantic media generation method: the first output's plan ID is independently verified before the second invocation, and the actual plan content shapes the second film through INSPAND-002.

## Bounded machine-readable recipe

`registry/reflex-compositions-v1.json` declares the **only** allowed recipe, input/output ports, edge adapter, human gates, and refusal cases. There is no arbitrary code execution or opportunistic auto-wiring. `scripts/reflex-composer.mjs` refuses any unknown recipe, extra stages, altered ports, permission escalation or missing explicit synthetic operator authorization. A wrong plan fails at the original planZ source gate. Both original runners are executed in a reproducible local sandbox, with distinct outputs in `source-proof/` and `visual-study/`.

## Run

Acquire exact original planZ commit and the five pinned creative owner checkouts as in `.github/workflows/inspand-004.yml`. Select an existing original generation-one `RHYTHM-MUTANT` plan ID. Node 24, Python + Pillow and FFmpeg are required.

```bash
node scripts/reflex-composer.mjs list
node scripts/reflex-composer.mjs build --recipe plan-proof-to-pixels-and-print/v1 \
  --plan "$PLAN_ID" --planz "$PLANZ" --roots roots.json \
  --out /tmp/reflex-composition --authorize SYNTHETIC_TEST_ONLY
node scripts/reflex-composer.mjs verify --recipe plan-proof-to-pixels-and-print/v1 \
  --plan "$PLAN_ID" --planz "$PLANZ" --roots roots.json \
  --out /tmp/reflex-composition
```

The result includes `source-proof/` and `visual-study/` trees of real native artifacts, an exact plan-to-plan typed `handoff.json`, `receipt.json`, and `print/inspection-card.{json,html}`. Verification re-runs both original capability paths and byte-compares their complete receipts and native output; it refuses changed source proof, forged memory, altered print files and incompatible selection. CI independently repeats the full composite experiment in two output roots and compares both actual video bytes, composite receipt and HTML.

**What is not proved:** autonomous skill growth, intelligent matching of arbitrary interfaces, actual human approval, original song audio, native lemonPRESS printing of the composite HTML, physical media, real-life field work, independent receiver signatures, actual human time savings or social impact. The recipe remains held and cannot silently activate another capability.

## Next

Allow JAR;VIS to **inspect** the exact source-owned composition recipe through a separately pinned, source-owning attendant without granting execution; then add real tested adapters for other capability types only where actual output and input contracts are known. No automatic authority inheritance.
