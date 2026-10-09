# KINSHIP SURPLUS 006 — CANNON compose, do not deploy

This is an **authorized research experiment** by the Static Collective, **not** an endorsed or adopted Kinship Radio service, forecast, financial report, donation system, or station grant. The field note that Fall Share crossed half its goal and might provide roughly six months of runway has NOT been reconciled to station books. Synthetic dollar amounts are intentionally unrelated to its actual finances.

## What the executable does

- Uses existing CANNON 003 to reconstruct an immutable document capsule from exactly three owner-repository Git commits and original README blobs.
- Applies a strict, versioned **synthetic** monthly scenario for October 2026 through June 2027. Figures are integer cents; three separate worlds preserve contradictions rather than force one forecast.
- Counts simulated monthly unrestricted cash separately from simulated one-time receipts. A pledged sponsorship, restricted gift, in-kind equipment/labor, or Living Gift never silently becomes recurring unrestricted cash.
- Only an explicitly entered *simulated-confirmed cancelled cash expense* reduces modeled expense. An in-kind offering alone does not. Overlapping savings against one expense line are refused.
- Proves June's **monthly positive recurring margin for April/May/June** and the corresponding quarter's increase in unrestricted reserve. This is a reproducible arithmetic conditional, not an independently established financial outcome.
- Writes stable, content-addressed public simulation receipts; cold replay verifies source Git objects, original station assumptions and exact output bytes.

No donor executables, payment APIs, CRMs, station accounts, broadcasts, secrets or actual reLATTE crossings are opened. Documents are source material rather than executable compatibility contracts. Source origin is checked against local Git configuration only, not authenticated against GitHub ownership. CANNON 004–005 remain separately inherited experiments; **006 does not claim native 004 API compatibility or a 005 adapter reissue**.

## Local run (Node >=24, Git)

Clone the three independent repositories locally, ensuring exact pinned source commits are present. Create a local untracked roots JSON mapping the three repository names to their absolute checkout paths:

    {
      "the-static-collective/static-live": "/absolute/path/to/static-live",
      "the-static-collective/Jubilee-treasury": "/absolute/path/to/Jubilee-treasury",
      "the-static-collective/reLATTE": "/absolute/path/to/reLATTE"
    }

Then:

    npm test
    node scripts/cannon-surplus.mjs inspect --plan examples/kinship-surplus-006.plan.json --station examples/kinship-surplus-006.station.json --roots work/roots-006.json
    node scripts/cannon-surplus.mjs build --plan examples/kinship-surplus-006.plan.json --station examples/kinship-surplus-006.station.json --roots work/roots-006.json --out work/kinship-surplus-006
    node scripts/cannon-surplus.mjs verify --plan examples/kinship-surplus-006.plan.json --station examples/kinship-surplus-006.station.json --roots work/roots-006.json --out work/kinship-surplus-006

The root file contains operator-local filesystem paths; CI reconstructs it. The output directory must not already exist.

## Bounded hypotheses

| World | Oct 2026 monthly operating deficit | June 2027 recurring margin | One-time cash treated as recurring? |
| --- | ---: | ---: | --- |
| baseline | -$2,000 | -$2,000 | No |
| sustainers (hypothetical $1,800/month starts Jan) | -$2,000 | -$200 | No |
| surplus (same support; hypothetical $900/month eliminated cash contract from Apr) | -$2,000 | +$700 | No |

In the third world, a separately imagined $5,000 unrestricted single gift changes modeled cash balance but NOT recurring surplus. A $5,000 pledge, volunteer hours, and a consent-limited story contribute **zero** to the recurring-cash figure. Station confirmation must later establish whether any real avoided expense was budgeted, cancellable, nonoverlapping and actually no longer payable.

### Local acceptance gates

- Independent exact Git commit/tree/blob and origin-config witnesses for all three pinned sources.
- Three scenario worlds, nine monthly rows each, no unknown fields, noninteger dollars, duplicate event ids, month-window loopholes or savings double-count.
- No story, pledge, restricted cash, or in-kind valuation can enter the margin or unrestricted reserves.
- Outputs and receipt must independently cold replay from original objects.
- Changing source roots, tampering outputs or moving a branch to another commit must never silently turn into a new valid version.
- No station/donor rights, payment, airtime, source editing, deployment or reLATTE authority can result.

### Next gate — explicitly outside 006

Ask the station whether it wants to participate. **Only if invited**, request station-selected, privacy-screened categories of real recurring expenses, confirmed unrestricted revenue, reserve policy, and verified expense cancellation receipts. Replace synthetic assumptions under station custody. In subsequent work, independently review licensing, editorial standards, child/third-party permissions, volunteer policies, privacy and nonprofit underwriting before any public product. June surplus is a conditional target, not a guaranteed prediction.

### Relations
- CANNON 003 exact-object document composition; CANNON 004/005 typed fit and reissue limits.
- Static Live Kinship Fall Share local room + Living Gifts: source-derived **inspiration**, never an instruction to publish or sell stories.
- Jubilee Treasury: portable needs/offers; no custody of station funds.
- reLATTE: future independent receiver/crossing layer; no native crossing in 006.

**PLEDGE != CASH. IN_KIND != EXPENSE SAVED. STORY != DOLLAR. SCENARIO != OCCURRENCE. SOURCE != AUTHORITY. KINSHIP OWNS KINSHIP.**
