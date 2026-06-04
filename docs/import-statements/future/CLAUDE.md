# future/CLAUDE.md

> **Status: LIVING / DEFERRED.** This layer holds work that is **designed but NOT implemented**. Every item here was specced through the rubric and locked in on paper, but **nothing in this directory exists in `/src`** — there is no code, no setting, no test for any of it. Each item carries a concrete **revisit trigger** (a calendar checkpoint and/or an on-demand signal); none is scheduled work.

This is the backlog layer of the three-layer import-statements tree:

- **`../spec/`** — what v1 *does* (shipped behavior, declarative).
- **`../decisions/`** — *why* v1 is shaped the way it is (rubric applications, locked-in choices, rejection ledgers).
- **`future/`** (here) — what is *designed but unbuilt*, each with the trigger that would reopen it.

## Index

| Doc | What it is | Revisit trigger |
|-----|-----------|-----------------|
| [auto-detect-extensions.md](auto-detect-extensions.md) | The tri-state `script.preserveScriptFileExtension` enum (`"never"`/`"always"`/`"auto"`) intended to replace the shipped boolean, with runtime detection (signals 1–5), `.ts → .js` rewriting, and a staged rollout. Includes the folded-in design-decisions ledger (criteria application, locked-in design, the Bun `type:"module"` P1 hazard, rejections). | **December 2026** calendar checkpoint, *or* any of its on-demand triggers (a runtime-correctness issue, maintainer dogfooding, an upstream TS/Node/Deno change, or two independent user requests). |
| [framework-roadmap.md](framework-roadmap.md) | The framework-component sub-roadmap that did not ship: PascalCase auto-naming for default imports (P1.5 Vue / P2.5 Svelte / P3.5 Astro) and the joint SFC concerns (`.css`/`.scss`-into-SFC cursor-context detection; `.ts`/`.js` destinations accepting SFC sources; `.md`/`.mdx` as SFC sources). | **On trigger, no date** — each item revisits only when its on-demand signal surfaces (user demand for a given ecosystem; a cross-cutting gating decision). |

## December 2026 checkpoint

`auto-detect-extensions.md` carries the **lone hard date** in this tree: **December 2026.** At that checkpoint, re-read the doc plus its rejection ledger. If none of the revisit triggers fired, defer another six months without guilt. The implementation cold-start estimate from the locked-in design is **~3 days** for Phase 1+2 (the enum plus opt-in `"auto"`, with the default staying `"never"`). `framework-roadmap.md` has **no calendar gate** — its items wait on demand alone.

## future/ vs decisions/ — the principle

Both layers describe things that are *not* current v1 behavior, so the boundary matters:

- **`future/` = designed features with implementation intent that haven't shipped.** The auto-detect tri-state, the framework PascalCase auto-naming, the joint SFC concerns. These are *pending work* — they have a design and a revisit trigger, and an implementer could pick them up. They live here.
- **`../decisions/` rejection ledgers = shapes that were evaluated and DECLINED.** Ember/Marko/Riot/Vue2, `with { type: "json" }`, combined pickers, framework-detect, and the rest. These are *decisions*, not pending work — they stay in `../decisions/` with their "revisit on demand" triggers. They are not promoted to `future/` just because a trigger could in principle reopen them.

The test: if it has a *design to build*, it is `future/`. If it is a *no with a reason*, it is a `../decisions/` rejection row.

## Cross-references

- Sibling files in this directory: bare filename — `[X](X.md)`, no `./` prefix.
- The rubric (top-level): `[../CRITERIA.md](../CRITERIA.md)`.
- Cross-layer: `../spec/x.md`, `../decisions/x.md`.
- Repo code walks up three directories from here: `../../../src/...` (used only in a "See also"). Inline `src/...` paths are backtick-wrapped, not links.

## Sync rule

These deferred docs and their layer siblings are coupled: when an item here **ships**, it graduates out of `future/` into `../spec/` (shipped behavior) with its rationale landing in `../decisions/`, and this index, its revisit trigger, and any cross-layer pointers must all be updated in lockstep. The full tree-wide sync contract is stated once, canonically, in [`../CLAUDE.md`](../CLAUDE.md) — follow it from there; do not restate it here.

## See also

- [`../CRITERIA.md`](../CRITERIA.md) — the rubric every future shape must still pass before it can ship.
- `../../../src/snippets/CLAUDE.md` — the shipped dispatch + snippet-builder rules these features would extend.
