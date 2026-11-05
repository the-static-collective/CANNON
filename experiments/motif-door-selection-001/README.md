# CANNON × MOTIF — BRANCH-NATIVE DOOR SELECTION 001

**Main is not canon. A branch is usable source evidence when a particular exact revision is deliberately selected and independently checked.** Neither existence nor successful tests select it as authoritative.

This experiment places CANNON at its proper boundary after MOTIF [DOOR-FOUNDRY-001 PR #66](https://github.com/the-static-collective/MOTIF/pull/66):

1. **Select** one exact, unmerged MOTIF commit and six actual Git blob hashes for a specified local synthetic research purpose.
2. **Inspect** a separate working checkout at that commit, check its Git tree and bytes, read the real MOTIF capability registry, and cross-check typed interfaces against the human-authored selection.
3. **Execute** original MOTIF native owner tests plus the original positive and denied synthetic demonstrations using their own code in an isolated runner. There are **no copied or rewritten owner modules** in CANNON.
4. **Review independently** the native output: exact Door schema and digest, five genuinely source-linked capability steps, typed dependencies, current primitive-step count, explicit success of the ordinary fixed planner, refusal of forged authorizations, and mandatory consent denial HOLD.
5. **Emit** a deterministic, content-digested CANNON receiver packet with `HOLD_FOR_INDEPENDENT_RECEIVER_REVIEW`. The selection does not authenticate the GitHub author, grant consent, sign canon, authorize operations, deploy a service, contact a human, or automatically merge a branch.

### Important architectural distinction

**MOTIF's task:** propose a capability composition and a hypothetical Door.

**CANNON's task:** determine which *exact source revision* was chosen and what its source-native evidence establishes. CANNON cannot infer anything that the owning code did not prove, and it cannot automatically promote the source.

**reLATTE/receiving owner:** retains any actual admission or later authority, independently and explicitly.

This demonstration **does not require MOTIF to be merged into main**. The manifest explicitly binds the current branch commit `5ee9207f04af2826750863526af7f92b31ef8578`, including source files from MOTIF's own main, but selects **the composite experiment at the branch commit**.

### Reproduce from public GitHub on Linux/macOS with Node 22+ and Python 3.11

```sh
git clone https://github.com/the-static-collective/CANNON.git
cd CANNON
git switch experiment/motif-door-first-branch-native-selection-001
git clone https://github.com/the-static-collective/MOTIF.git motif-source
git -C motif-source checkout 5ee9207f04af2826750863526af7f92b31ef8578
MOTIF_SOURCE="$PWD/motif-source" node --test experiments/motif-door-selection-001/test-door.mjs
mkdir -p evidence
node experiments/motif-door-selection-001/cannon-door.mjs --source motif-source --output evidence/door-selection-001.json
```

Native MOTIF has Python standard-library dependencies only. CANNON needs Node standard library and the local `git` program. The bundled GitHub Actions workflow pins the exact donor SHA and preserves a downloadable evidence packet. Nothing writes into the source checkout's tracked files.

### What this **actually** establishes

- CANNON can re-enter an existing, **non-main** MOTIF branch as an exact piece of usable code and data.
- Original source owner modules can be invoked without copying them and their claims independently challenged.
- A typed cross-organ composition can be checked without confusing it for an actual human action.
- A source selection can remain useful yet **HOLD** for independent receiver authority.

### What it does **not** establish

The MOTIF task is synthetic bike repairs. The original fixed MOTIF-002 planner already reaches the same synthetic goal. CANNON shows no new planning advantage, general intelligence, real-world proof of consent, independent cryptographic signer authentication, arbitrary GitHub browsing, open-ended adapter generation, real delivery, or useful human outcome.

Git hashes establish content identity, not who authorized a source. A matching git remote URL is no more than an address syntax check. All external action and human contact are forbidden by this experiment.

### Next bump

Provide a separate **typed adapter port** between CANNON's reviewed source receipt and MOTIF's candidate Capability Commons, and independently test the handoff in both directions. A receiver should always be able to hold or refuse even a reproducible successful test. After that, run one reversible **Fellowship workroom** exercise and observe human results separately from software results.

**Selection ≠ canon ≠ authorization ≠ occurrence.**
