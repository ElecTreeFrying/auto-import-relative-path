# decisions/CLAUDE.md

The `decisions/` layer sits beside the `spec/` layer and records the **rationale** for what `spec/` describes: the criteria applied, the shapes locked in, and the alternatives rejected. These files record the decisions behind each shipped spec area — v1 and later additions such as the LaTeX destination; the gate stays open. Designed-but-unbuilt work does not live here — that belongs in `../future/`.

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

These decision files and their matching `spec/` docs are tightly coupled pairs; the full tree-wide sync contract (spec doc ↔ `decisions/` companion, `spec/statements.md` ↔ design docs, CRITERIA ↔ everything, status table) is stated once, canonically, in the parent [../CLAUDE.md](../CLAUDE.md). Follow it from there — do not restate it here.

## Deviations

These files deviate from the three-section contract. Both are approved exceptions, not patterns to follow — new decision files should include all three sections.

- **`framework-components.md`** intentionally omits the **criteria-application** section. The Criterion 3 tension, picker-bloat checks, and TS-picker reuse justification are woven into the locked-in v1 decisions and the parent design — extracting them would fragment that reasoning. It records the locked-in decisions and the rejection ledger only.
- **`statements.md`** has no standalone **Locked-in decisions** section. The recommended-defaults table (Change?/Rationale columns) under *Criteria application* and the per-language audit together record the locked-in choices, each anchored to the rubric inline — pulling them into a separate table would duplicate the per-language audit's narrative. It records the criteria application (carrying the locked-in defaults) and the rejection ledger.
