# VOQAL SELF-APPLICATION 001 — the machine applies to fund the humans it cannot replace

**An executable, intentionally self-referential grant-application *draft*, not a grant submission.**

The real applicant is an individual human, proposing **Still Here — The First Circle Foundry** for Voqal's 2027 fellowship. A source-pinned CANNON constellation proves bounded offline software work and demonstrates several independent HOLD/REFUSE rules, but no actual survivor service, beneficiary, permission or qualified safeguards.

The deliberately goofy but honest proposition: **the technical evidence engine produces its own application packet to request the time and people needed to test what it cannot verify: safe, independently governed first human connection.** The grant is for survivor-informed human review, safety, local relationships, paper/phone access, accessibility and learning, not for autonomous self-government or automating grant submission.

### Command (operator explicitly permits only local draft creation)

```sh
node scripts/constellation-acquire.mjs --into ../constellation-donors
node scripts/constellation.mjs build --roots ../constellation-donors/roots.json --out ../constellation-output --authorize LOCAL_FICTIONAL_ONLY
node scripts/voqal-self-application.mjs build --roots ../constellation-donors/roots.json --constellation ../constellation-output --out ../voqal-application-review --authorize LOCAL_DRAFT_ONLY
node scripts/voqal-self-application.mjs verify --roots ../constellation-donors/roots.json --constellation ../constellation-output --out ../voqal-application-review
```

Before generating a single application artifact, the CLI calls CANNON's **original source-owner exact-Git fresh-process cold verifier** on the full CONSTELLATION-001 output. It refuses any changed native donor source or original result. It then validates original result schema, receipt hash-bound manifest, Voqal brief and zero-field authority. The original full cold verifier proves the brief itself even though it is not included among the earlier receipt's core files.

The resulting `application-review.html` is a printable browser-local review desk; `application-review.md` is copy-ready portal prose with official question limits; `form-copy.json` records every character count and `approved:false`; `budget.csv` totals $30,000; `self-application-receipt.json` fixes all output hashes. A separately executed verifier recomputes all five output byte strings from the original native source bundle, rejects extra/tampered files, and explicitly returns **NOT_SUBMITTED**.

### Source facts checked before drafting

Official [Voqal fellowship](https://voqalpartners.org/fellowship/) and [application guide](https://voqalpartners.org/wp-content/uploads/2026/08/FellowshipApplicationGuide_2026.pdf): October 31, 2026, 11:59 p.m. Eastern (10:59 p.m. Central); April–September 2027, $30,000 award to an individual, plus separately funded convenings. The applicant must personally satisfy eligibility, availability and required in-person participation. Official portal has first-person statements and personally controlled fields that **this machinery must not invent**.

Existing source-owned [VOQAL-007 candidate](https://github.com/the-static-collective/webZ/pull/195) supplies the public-safe overview, not private survivor or child details. Existing private Still Here application v6 remains unmodified. Proposed budget adopts its safeguards/compensation allocation. Narrative responses are **new unapproved drafts**, not a final first-person applicant statement; lineage and coaching are intentionally held for private applicant completion. An official budget file may need the portal's template rather than just the produced CSV.

### The actual boundary

No Foundant/GrantInterface account, login, CAPTCHA, financial award, applicant approval, third-party outreach, live survivor intake, public family disclosure, partner endorsement, proof of real impact or real group exists by this program. `main != canon`; an open pull request or a CI result does not imply a Voqal application. The human must copy approved text through the official portal and obtain its confirmation before the deadline.

**The machine may apply its own methods to preparing the application; it may not impersonate its human applicant or decide who deserves safety or belonging.**
