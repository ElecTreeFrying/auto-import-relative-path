# decisions/CLAUDE.md

The `decisions/` layer sits beside the `spec/` layer and records the **rationale** for what `spec/` describes: the criteria applied, the shapes locked in, and the alternatives rejected. These files record the decisions taken while specifying v1; the gate stays open. Designed-but-unbuilt work does not live here — that belongs in `../future/`.

Each file here is a **living gate** for its spec area: criteria evaluations and rejection records that stay open for amendment as the design evolves. New shapes or choices can be added at any time, but each must pass the rubric and get its own row. The gate never seals — even where the matching `spec/` doc is shipped, the decision file stays open so a new shape can still earn a row.

## Required sections

1. **Criteria application** — how [../CRITERIA.md](../CRITERIA.md) applies to this design. Tables mapping each proposed shape/decision to the inclusion criteria it hits.
2. **Locked-in decisions** — table of major design choices, each anchored to a specific criterion or tiebreaker.
3. **Rejection ledger** ("Things considered and rejected") — criterion-tagged bullets. Every rejection cites Criterion 1–6 or Rejection A–F from the rubric. When no criterion is a clean fit, use a doc-local note and flag it explicitly.

## Criterion-tagging convention

Every rejection bullet must open with its criterion tag in parenthetical italics:

- `**Shape name** — *(Criterion 1: Frequency — rationale.)* Explanation.`
- `**Shape name** — *(Fails Rejection Criterion B — rationale.)* Explanation.`
- `**Shape name** — *(Doc-local rejection — rationale.)* Explanation.`

## Sync rule

These decision files and their matching `spec/` docs are tightly coupled pairs; the full tree-wide sync contract (spec doc ↔ `decisions/` companion, REGISTRY ↔ spec docs, CRITERIA ↔ everything, status table) is stated once, canonically, in the parent [../CLAUDE.md](../CLAUDE.md). Follow it from there — do not restate it here.

## Deviation: `framework-components.md`

`framework-components.md` intentionally omits the criteria-application section. The Criterion 3 tension, picker-bloat checks, and TS-picker reuse justification are woven into the locked-in v1 decisions and the parent design — extracting them would fragment that reasoning. This file records the locked-in decisions and the rejection ledger only. This is an approved exception, not a pattern to follow. New decision files should include all three sections.
