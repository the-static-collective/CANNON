# CANNON-098 — Independent Review of a Missing-World Model

This is an **unsigned HOLD reviewer**, not authentication of a new physical world.

It independently checks the original, source-pinned [MOTIF-013](https://github.com/the-static-collective/MOTIF/tree/experiment/door-foundry-013-missing-world) code and [GRAFT-031](https://github.com/the-static-collective/GRAFT/pull/27) source generator. The historical original PNG worlds and original GRAFT-030 movement compiler remain unchanged and source-owned.

## What was independently checked

An original MOTIF-009 9×8 PNG world contains an eight-cell full-height blue barrier. A new **synthetically generated second PNG** keeps the same red 2×2 crate but removes two vertically adjacent blue barrier cells. The earlier closed-model family has only a four-cell partial barrier or an eight-cell full barrier; the original GRAFT-030 modes cannot **remove** blue cells. Thus the new six-cell observation is outside that *finite old model*. It is **not** a global proof that all explanations are impossible.

GRAFT-031 genuinely compiles three different environment transition families (unchanged, remove the observed gate pair, remove every blue cell) and selects the exact-pair candidate under source-owned test labels. Its output is a **synthetic external observation model**, not a mechanism for commanding any real gate.

CANNON-098:
- Pins MOTIF-013's exact original Git commit and source blob, and GRAFT-031's owner commit and blob.
- Independently verifies each original PNG's SHA and decodes the synthetic before/after/goal PNGs with its own bounded RGB+CRC decoder.
- Checks the original world family, 8→6 blue-cell change and conserved red object.
- Rebuilds the GRAFT-031 typed question and uniquely selected generated source from the original owner code, then checks the stored source hash and **actually executes the generated JS**.
- Confirms physical gate command strings are rejected.
- Uses an **independent JavaScript breadth-first search over the finite 2×2-crate grid** to establish that the goal is unreachable before the simulated environment change and reachable afterward.
- Verifies the new result stays unsigned, unadmitted, unobserved and external-effect-free.

## Reproduce

The independent `.github/workflows/cannon-098.yml` recreates the original PNG worlds from original MOTIF-007, GRAFT-030 and CANNON-095 code, generates an actual GRAFT-031 local executable from the synthetic new observation, evaluates the original MOTIF-013 answer, and runs **11 CANNON-owned tests** and a held receipt. Source-owned GRAFT-030 and GRAFT-031 suites also pass.

```sh
node --test experiments/cannon-098/test-review.mjs

node experiments/cannon-098/review.mjs \
  --motif motif-source \
  --graft graft031-source \
  --question original-question \
  --probe probe \
  --answer answer \
  --out evidence/cannon098-held-review.json
```

Output schema: `cannon098.missing-world-review.v0`.

Status: **`HOLD_NEW_MODEL_BOUNDED_NOT_OBSERVED_OR_ADMITTED`**.

### Scientific limits

The newly introduced event is **author-created synthetic pixel evidence**, not a sensor observation, human answer or photographed physical transformation. The event family is a deliberately small finite grammar; the code does **not** autonomously invent arbitrary operators or prove a novel model of the real world. A same-information classical finite state model can reproduce the result. The exact source hashes show which code and pixels were reviewed; they do not authenticate external facts.

No physical actuator, contact with people, network API, production deployment, automatic source admission or canonical promotion was involved.

**Evidence ≠ world. A newly consistent model ≠ permission to install it.**
