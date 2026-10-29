# GROOVETOWN-003 — The Four-Town Flour Fugue

**A conditional cross-town purpose compiler, not a dispatch service.** A fictional receiving town needs 12 loaves of bread. One independently governed town has 6 kg of flour, another offers a 1 kg → 2 loaves oven capability for six runs, and a third claims two delivery legs. With each acting alone, the declared target-town stock cannot be replenished. A bounded, capacity-aware search finds one three-operation chain, plus a supplier and recipient approval gate. A counterfactual analysis actually removes each contributor's claims and re-solves feasibility. If any contributor declines, the proposed collaboration is held or refused; no delivery or credit is inferred.

The material quantities are **deliberately fictional math**, not a baking recipe, safety guidance or a claim that 1 kg of flour literally yields two loaves in practice.

## Run

Node.js 20+, no dependencies. From the repository root:

```sh
node --test experiments/groovetown-001/groovetown.test.mjs experiments/groovetown-002/particularity.test.mjs experiments/groovetown-003/intertown.test.mjs
node experiments/groovetown-003/intertown.mjs demo /tmp/groovetown-003
# Open /tmp/groovetown-003/index.html
```

Runs the original source from the immediately ancestral GROOVETOWN-001 and GROOVETOWN-002 CANNON branches as Node modules. The intertown planner's conditional local output **actually calls** the GROOVETOWN-002 Particularity compiler, which holds missing pickup windows and a permissioned contact route.

## Inputs and inference boundaries

All source claims include a unique ID, source identifier, owner, evidence state and `PROPOSAL_ONLY` authority. Claims with `visibility:PRIVATE` or `NO_USE` are excluded before planning and public hashing. Claims have typed resource/unit/quantity dimensions, fixed process conversions, bounded runs, directed transport routes and per-route capacities. Only **SHARE**-scoped claims enter the proof model. A `SYNTHETIC`, `REPORTED`, or `REVIEWED` tag does not itself verify real-world truth.

The bounded discrete search uses local inventories, consumed process quotas and route capacities. It cannot conjure stock, cross an undeclared edge, change units or reuse exhausted routes. Each proposal includes concrete stages, owners and source IDs, partner-specific **unsent** invitation drafts, open questions, human gates, a contextual unrendered creative score, a local GROOVETOWN-002 work-order/HOLD, and SHA-256 receipt files. Alternate carrier ownership changes both the plan and its creative score. Missing quantity, permissions or links produce a model-level no-chain response, not invented logistics.

`NO_CHAIN_IN_DECLARED_MODEL` means no plan **within the supplied bounded model**, not that the goal is impossible in the outside world. `CONDITIONAL_CHAIN_FOUND` is **never** permission to execute. Self-reported capacity remains unverified. Synthetic test YES/NO/HOLD decisions are not authenticated pledges, and unanimous synthetic YES leaves field execution and deed credit on HOLD. An external system would need independent identities, consent, real schedules, safe custody, relevant food-handling safeguards, and independent evidence of outcomes.

## Generated files

- `01-conditional-network-plan.json` — staged source-specific conditional plan, local-only comparison, owner counterfactuals, audiences and HOLD gates.
- `02-share-only-scenario.json` — source-trimmed typed model consumed by the planner.
- `03-negotiation-hold-and-refusal.json` — synthetic local YES and NO decisions, zero physical credit.
- `04-without-carrier.json` — actually re-solved counterfactual, not a hardcoded slogan.
- `05-unsent-invitations.json` — one review request per distinct participating town.
- `06-purpose-compiler-local-output.json` — actual GROOVETOWN-002 compiled context, retains missing-information HOLD.
- `index.html` — independent offline interactive exhibit showing stages, owners, unknowns and precomputed real solver counterfactuals.
- `receipt.json` — SHA-256 of exact emitted file bytes; duplicate runs match.

## Honest integration map

1. **Original executing source**: sibling CANNON-authored GROOVETOWN-001 and GROOVETOWN-002 local modules. GROOVETOWN-002 `compile` is executed by this experiment.
2. **New CANNON adapter**: exact typed feasibility solver, local proposal protocol, partner questions, and inspectable HTML.
3. **Not yet connected**: owner-native Garden offers/Help Slips, reLATTE identity and receiver custody, planZ recursion, JAR;VIS, source-native music/Toaster, geospatial travel, actual people, verified institutions, live availability, payments, transport arrangements, food safety, and physical-world confirmation.
4. **No changes** to source-owner histories, no selection of operational canon, no publication or automatic message sending.

CANNON PR must remain review-only; no auto-merge. Future real-world use must install a separate consent and evidence layer before any claim may become a commitment, dispatch or credited act.
