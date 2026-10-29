# INSPAND-006 — Observed eight-way real FLAN-T5 run

**Observed from hosted GitHub Actions run:** `40956030972`, original Google `google/flan-t5-small` checkpoint revision `14fd6edcfdd71f2ef5b67d4e735fee8bc6d9fd31`. Original independent Iron Lung owner commit `955e2f39493ca4b429969ad268a7e31a3d546445`. The real model job and deterministic control both passed, including full cold replays.

**Result SHA256:** `da6a83c8317c4e60a6d30134b9ac43c52552be61b6c573c607579fdc5968c5e0`. Full source records and actual model text are in that run's uploaded artifact `inspand-006-real-google-flan-seven-mutation-branches-and-baseline`.

| Explicit question pressure | Distinct out of 9 | Exact repetitions | Weak source-echo proxy | Short/low-info replies | Literal capability matches |
| --- | ---: | ---: | ---: | ---: | ---: |
| BASELINE | 3 | 6 | 3 | 6 | 3 |
| DA_VINCI | 1 | 8 | 9 | 9 | 0 |
| DARWIN | 4 | 5 | 4 | 1 | 0 |
| BACH | 5 | 4 | 3 | 4 | 0 |
| ESCHER | 5 | 4 | 4 | 1 | 0 |
| OCTOPUS | 1 | 8 | 9 | 9 | 0 |
| COMBINATRIX | 6 | 3 | 5 | 1 | 1 |
| IRON_LUNG | 2 | 7 | 8 | 8 | 0 |

**Do not interpret higher distinct counts as meaningful novelty.** The direct responses often echoed the experiment's own prompt text. The DA_VINCI branch returned `No proposal` in every step. The OCTOPUS branch returned `CANNON proposal pressure` in every step. BACH repeated unrelated text about a re-election. COMBINATRIX demonstrated more varied *strings*, but did not produce a verified executable adapter. The baseline itself frequently returned `No invention ancestry` and `No action is required`.

## Actual conclusion

The **software architecture performed its intended job**: 72 real original-source transfer calls (8 complete 3×3 sequences), preserved provenance, each candidate delivered to CANNON's original source-backed literal Reflex Library discovery, independently cold replayed, and without a fabricated owner grant, Heart beat, new executable capability, or physical action.

The **model does not yet demonstrate useful recursive problem solving**. More varied instructions did not reliably produce specific usable connections; the simple lexical proxies misrepresent some copied prompt phrases as diversity. On these fixtures we have **no evidence that seven strategy overlays increase semantic novelty or executable capability creation**. This is a negative capability-generation result, not a success claim. Report's `improvesAnyLexicalProxyCount = 4` means only that four treatments shifted one or more shallow token-count proxies, not that any treatment produced a valid novel mechanism.

## Highest-value next scientific experiment

Introduce an explicitly pinned **larger instruction-tuned model or a structured constrained transformation grammar**, test against a blind suite with multiple real input problems and independently graded target requirements, and record model cost (CPU seconds, tokens, memory), candidate quality, valid typed adapters built, and zero-laundering compliance. Run each treatment at the **same compute budget** and keep an unpressured baseline. Only promote a capability after an original owner executable actually tests a proposed interface and survives cold replay.

The diagnostic improvement to target is **specific new testable hypotheses**, not just more words. No training or autonomous grant is implied.
