# import-statements/CLAUDE.md

This is the **specification** for the import-statement picker. It records the design **as shipped** into `/src`, organised into layers — *what v1 does* (`spec/`), *why those shapes were chosen* (`decisions/` + the top-level rubric), and *what was designed but is not yet built* (`future/`). This tree is the canonical reference.

## Layers

The tree is split into its layers plus the top-level rubric:

- **[CRITERIA.md](CRITERIA.md)** — the rubric. Inclusion/rejection criteria, tiebreakers (incl. Tiebreaker-1 fragility tags), the picker-bloat ceiling, and the named patterns (Promote-to-dispatch, re-applied-per-destination). Long-lived; every admission/rejection decision applies it.
- **[spec/](spec/CLAUDE.md)** — *what v1 does*, declarative. Shipped behavior only: the per-language picker shapes + defaults + snippet placeholder specs (`spec/statements.md`), framework SFC destinations (`spec/framework-components.md`), media support (`spec/media-files.md`), and LaTeX (`.tex`) destinations (`spec/latex.md`). Plus the cross-cutting behavior model — dispatch, gating, placement, naming, extension preservation — in `spec/CLAUDE.md`.
- **[decisions/](decisions/CLAUDE.md)** — *why* (for v1). The criteria applications, locked-in decisions, and rejection ledgers behind each spec area. One file per area (`statements.md`, `framework-components.md`, `media-files.md`, `latex.md`), each a LIVING gate that stays open for new rows.
- **[future/](future/CLAUDE.md)** — *designed but NOT implemented*. The auto-detect tri-state design (`future/auto-detect-extensions.md`) and the framework sub-roadmap (`future/framework-roadmap.md`), each carrying its own revisit trigger. Nothing here exists in `/src`.

## Reading order

Rubric → spec → decisions (for why) → future (for backlog):

- **Triaging a new shape or upstream change** — read [CRITERIA.md](CRITERIA.md) first (the long-lived rubric).
- **Looking up a shipped picker shape, its snippet spec, gating, placement, or default** — read the relevant `spec/` doc. The cross-cutting model (dispatch/gating/placement/naming/extension preservation) is in [spec/CLAUDE.md](spec/CLAUDE.md); the per-language picker spec is [spec/statements.md](spec/statements.md).
- **Understanding *why* a shape is in or out, or what was rejected** — read the matching `decisions/` file alongside the spec doc.
- **Checking what is designed but unbuilt (the backlog)** — read [future/CLAUDE.md](future/CLAUDE.md) and the deferred design it indexes.

> `prompts/` is intentionally **not** carried over into this tree — it held user-only copy-paste prompt scripts that are off-limits and have no place in this tree.

## Status legend

- **LIVING** — long-lived; edit when the rubric or this map itself shifts, not for per-shape decisions. (`CRITERIA.md`, this file.)
- **SEALED / Shipped** — built into `/src`; edit only to track a code change, never to re-litigate a shipped decision. (Everything under `spec/`.)
- **DEFERRED** — designed but **not** shipped; carries a concrete revisit trigger/date. (Everything under `future/`. Auto-detect is the only item with a hard calendar date — December 2026.)
- **LIVING gate** — the `decisions/` ledgers; never sealed — they stay open for new rejection/criteria rows as shapes are evaluated.

## Map table

Every file in this tree, with its layer:

| File | Layer | Role | Status |
|------|-------|------|--------|
| [CLAUDE.md](CLAUDE.md) | index | This file — the tree's index, layer split, status legend, and the canonical sync rule. | **LIVING** |
| [CRITERIA.md](CRITERIA.md) | rubric | Inclusion/rejection criteria, tiebreakers, picker-bloat ceiling, named patterns. | **LIVING** |
| [spec/CLAUDE.md](spec/CLAUDE.md) | spec | Spec index + cross-cutting behavior model (dispatch, gating, placement, naming, extension preservation). | **SEALED / Shipped** |
| [spec/statements.md](spec/statements.md) | spec | Per-language picker shapes + defaults + snippet placeholder spec (canonical source for `src/snippets/_styles.ts`). | **SEALED / Shipped** |
| [spec/framework-components.md](spec/framework-components.md) | spec | Vue/Svelte/Astro SFC destinations through the shared `framework-component.ts` builder. | **SEALED / Shipped** |
| [spec/media-files.md](spec/media-files.md) | spec | Video/audio/text-track support for JSX/TSX/MDX/HTML/Vue/Svelte/Astro. | **SEALED / Shipped** |
| [spec/latex.md](spec/latex.md) | spec | LaTeX (`.tex`) destination — graphics→`figure`, `.tex`→`\input`, `.bib`→`\addbibresource`, via `latex.ts` + the `latex.*` settings. | **SEALED / Shipped** |
| [decisions/CLAUDE.md](decisions/CLAUDE.md) | decisions | Required-sections contract + criterion-tagging convention for the ledgers. | **LIVING gate** |
| [decisions/statements.md](decisions/statements.md) | decisions | Why each picker shape is in/out, the flagged defaults, "Things considered and rejected" appendix. | **LIVING gate** |
| [decisions/framework-components.md](decisions/framework-components.md) | decisions | Locked-in v1 framework decisions + framework rejection ledger. | **LIVING gate** |
| [decisions/media-files.md](decisions/media-files.md) | decisions | Media criteria application, cross-cutting design choices, media rejection ledger. | **LIVING gate** |
| [decisions/latex.md](decisions/latex.md) | decisions | LaTeX criteria application (engine-renderable graphics gate, keep-extension default), locked-in decisions, rejection ledger. | **LIVING gate** |
| [future/CLAUDE.md](future/CLAUDE.md) | future | Backlog contract + index + the December 2026 checkpoint. | **DEFERRED** |
| [future/auto-detect-extensions.md](future/auto-detect-extensions.md) | future | Tri-state enum (`"never"`/`"always"`/`"auto"`) intended to replace the `preserve*FileExtension` booleans. Not implemented. | **DEFERRED** (revisit December 2026) |
| [future/framework-roadmap.md](future/framework-roadmap.md) | future | PascalCase auto-naming + joint SFC concerns (`<style>`/CSS-source, `.ts`/`.js`-into-SFC, `.md`/`.mdx`-as-source). Not implemented. | **DEFERRED** (revisit on trigger) |

## Default behaviour

Apply [CRITERIA.md](CRITERIA.md). TL;DR: modern + frequently-used; multi-hit shapes are easy yeses. C1 (Frequency) and C3 (Framework-portable) are the dispositive admission gates — a shape can pass four of six criteria and still die on one failed C1 or C3.

## Cross-references

- Sibling files at this root linked by bare filename: `[X](spec/x.md)`, `[X](decisions/x.md)`, `[X](future/x.md)` — no `./` prefix.
- From inside a subdir: siblings by bare name; the parent rubric as `../CRITERIA.md`; cross-layer as `../spec/x.md`, `../decisions/x.md`, `../future/x.md`.
- Code links walk up: from this root `../../src/...`; from a subdir `../../../src/...` (used only in a "See also"). Inline `src/...` paths are backtick-wrapped, not links.
- The rubric is `CRITERIA.md` (top-level). The per-language picker spec is `spec/statements.md`; its rationale is `decisions/statements.md`.

## Editing rules

- CRITERIA is long-lived — update when the rubric shifts, not for per-shape decisions.
- The `spec/` layer is sealed/shipped — `spec/statements.md`'s tables remain the canonical source for the `*_IMPORT_OPTIONS` tables in `src/snippets/_styles.ts`; edit only to track a code change in those tables, not to re-litigate shipped shapes.
- The `decisions/` ledgers are LIVING gates — append new criteria-application and rejection rows as shapes are evaluated; never seal them.
- The `future/` docs are DEFERRED — they carry the only forward-looking actions in this tree (auto-detect's December 2026 checkpoint; the framework sub-roadmap's on-trigger revisits).
- Any plan or implementation touching import shapes, settings, detection logic, or behaviour MUST reference: (a) CRITERIA as the rubric, (b) the relevant `decisions/` file for locked-in criteria application and the rejection ledger. Cite specific rows.

## Sync rule (canonical)

> This is the canonical statement of the import-statements sync rule. `decisions/CLAUDE.md` references this section rather than restating it.

Every doc in this tree is interconnected. When updating any file, check and sync all docs that reference or are referenced by the changed content — stale cross-references, drifted status, and orphaned decisions are bugs. Key sync pairs:

- **spec doc ↔ `decisions/` companion** — locked-in decisions, rejection-ledger entries, criteria applications, and status must match on both sides (e.g. `spec/statements.md` ↔ `decisions/statements.md`, `spec/framework-components.md` ↔ `decisions/framework-components.md`, `spec/media-files.md` ↔ `decisions/media-files.md`).
- **`spec/statements.md` ↔ design docs** — the picker spec's per-language sections and Final-list tables reference the other spec docs by status and scope. When a spec doc's status changes, the picker spec's references must update.
- **`spec/statements.md` ↔ `src/snippets/_styles.ts`** — the Final-list tables are the canonical source for the `*_IMPORT_OPTIONS` tables. A change to either side (a renamed `description`, a new style row, a re-ordered entry) must be reflected in the other, and `description` strings stay byte-exact against `package.json` enums.
- **CRITERIA ↔ everything** — a rubric change (new criterion, new tiebreaker, ceiling adjustment) can invalidate criteria applications across all spec and decision files. After any CRITERIA edit, re-check every `decisions/*.md` criteria-application section.
- **`future/` ↔ `decisions/`** — when a deferred item ships, its design moves out of `future/` into the matching `spec/` doc and its rationale/locked-in rows into the matching `decisions/` doc; the rejection ledger stays in `decisions/`.
- **Map table (this file)** — update when any doc's status or layer changes.

## See also

- `../../src/snippets/CLAUDE.md` — the shipped dispatch + snippet-builder rules (the canonical code-side anchor: `buildReactImport` and the single `buildAssetImportStatement` asset switch live in `src/snippets/_react.ts`).
- `../../src/gating.ts` — `isPairSupported`, the source/destination pair check.
