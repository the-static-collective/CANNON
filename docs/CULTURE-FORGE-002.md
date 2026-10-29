# CULTURE FORGE 002 — three real source owners, independently held publication

**2026-10-29.** Stacked on [CANNON Culture Forge 001](https://github.com/the-static-collective/CANNON/pull/37), which itself is stacked on PRESENT USE 003. These are intentionally unmerged experimental versions. A branch is a revisitable source position, not canon or automatic release.

## What runs

1. CANNON cold-verifies the actual original pinned WebZ and GrO runtime and printable six-panel `comic.html` / field guide from [Culture Forge 001](./CULTURE-FORGE-001.md).
2. CANNON independently verifies **the original lemonPRESS receiver Git objects** at exact commit `f091e73d2f64b2237ee828010ae244b39e4070b8` and compares local bytes to those same original objects.
3. CANNON invokes **original lemonPRESS** `receiveLocal()` / `coldVerifyLocal()` (not a copied or synthetic wrapper).
4. The independent lemonPRESS receiver independently recomputes the CANNON receipt digest, verifies source/output SHA-256 hashes and strictly refuses fabricated rights, money and admission.
5. Its owner-local policy produces a **HOLD** containing exact unmodified comic and field card and a separately addressable receiver receipt, or **REFUSE** without cultural media copies.
6. A fresh process cold-verifies source donors, original media, local receiver output and disposition. CI intentionally corrupts the receiver media and checks refusal; restores exact bytes and checks replay.

```sh
node scripts/culture-forge.mjs build --webz ../webZ --gro ../GrO --out ../culture-out
node scripts/culture-delivery.mjs deliver --webz ../webZ --gro ../GrO --press ../lemonPRESS --forge ../culture-out --out ../press-held --choice HOLD
node scripts/culture-delivery.mjs verify --webz ../webZ --gro ../GrO --press ../lemonPRESS --forge ../culture-out --out ../press-held --choice HOLD
```

The output `press-held/candidate.json` has **no admitted house work**, **no chosen edition**, **no publication** and **no established use license**. No actual rights holders, recipient identity, work value, payments, PENNY issuance, Full Measure Deeds, NFTs, reLATTE network messages, mailing or physical print are claimed. Local verification of an unsigned CANNON receipt proves integrity *against the supplied record*, not its origin's human identity or legal rights.

## Future source-owned gates

A genuine editor may separately admit a source, assign a house ID, select a specific edition, confirm author/license and print/publish. A real community host could independently confirm an actual useful act; Full Measure must do that human-witness transition itself. PENNY can then assess independently confirmed stewardship under its own source-owned policy. **Nothing in this experiment grants those later gates.**

The resulting **real cultural bytes** are now transferable as a held candidate between three independent native runtimes without collapsing their ownership.
