# INSPAND-001 — First reusable reflex

**Status:** draft experiment, stacked on CANNON FILM-PRESS-001 PR #55. Not merged, deployed, published, or physically acted on.

## What actually runs

1. Check out the **original planZ REACTOR-001** exact unmerged PR #36 commit `64ed8a376acd63a5d630e1649b6001fb3b3251de`. Confirm its Git origin, commit, four exact source blobs and clean checkout.
2. Run the **actual planZ recursive compiler** with depth 1 / crossing limit 0, independently validate the original output manifest SHA-256, every immutable object ID, cut ancestry, proposal/cut linkage, authority NONE and LOW/UNKNOWN evidence.
3. Require an **exact selected generated plan ID** and one explicit route. The initial route only accepts a first-generation plan under RHYTHM-MUTANT. This route is **selection-level only**: it decides whether to perform a separately valid synthetic software proof; no proposal is used as media content.
4. Execute the **unchanged CANNON FILM-PRESS-001 runner** (original runner Git blob pinned), using five separately source-owned original executors: Toaster, PlayDeck, Blender, Band Runtime, lemonPRESS. The creative fixtures remain wholly CANNON synthetic fixtures, not derived from planZ.
5. Preserve native output, exact original planZ manifest, selected plan provenance, a reusable typed capability description, and a joint synthetic HOLD receipt. In verify mode, run planZ and all native code again and compare the wrapper packet byte-for-byte. Native FILM-PRESS also verifies all native output bytes.

CI additionally runs original owners' relevant tests, proves an intact replay and deliberately corrupts selection evidence to require refusal.

## Contract, not a claim of autonomous integration

- Proposed plan **is not** a media prompt, an adopted source-owner interface, automatic action authority, recipient consent, or human KEEP.
- Executed code and silent 3-second video **are not** a licensed song video, released recording, original media, human event, manufactured vinyl record, public launch or external acknowledgment.
- The CI selection is scripted **synthetic operator test choice**, not the real operator's individual selection.
- The capability card tracks time spent/saved as `null`: no fabricated measurements.
- Unknown plans, other routes, altered code, changed sources, broken ancestry and forged receipts all require HOLD.
- An actual source-owner **plan content → creative input** adapter remains future work. In particular, changing textual plan content today does not meaningfully change the native film content; the next integration must prove that it does.

## Commands

Requires Node 24+, Python 3.11 + Pillow, FFmpeg, five original owner checkouts. See exact sources and preparation in `.github/workflows/inspand-001.yml`.

```sh
# $PLANZ is original unmerged planZ commit checkout. $PLAN_ID must be
# explicitly obtained from its original generation-1 output.
node "$PLANZ/reactor/recursive.mjs" --depth 1 --cross-limit 0 --format json

node scripts/inspand-reflex.mjs build --planz "$PLANZ" --plan "$PLAN_ID" \
  --route film-press-synthetic-selection/v1 --roots roots.json \
  --out /tmp/inspand-proof --authorize SYNTHETIC_TEST_ONLY

node scripts/inspand-reflex.mjs verify --planz "$PLANZ" --plan "$PLAN_ID" \
  --route film-press-synthetic-selection/v1 --roots roots.json \
  --out /tmp/inspand-proof
```

## What's next

Introduce a typed capability registry for multiple independently proven owner-native routes; have JAR;VIS propose but never automatically authorize selections. Then write a genuine plan-derived input adapter for one real creative request with owner-provided assets and permissions. Separately measure attention returned to an actual willing human with a repeatable baseline. Never auto-admit CANNON results back into planZ as fact, or merge source owners.

**Related:** CANNON #56 (REACTOR-002), #46 (Stranger Arcade), planZ draft PR #36 and CANNON draft PR #55.
