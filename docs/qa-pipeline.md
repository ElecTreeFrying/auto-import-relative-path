# QA checklist pipeline

How the extension's per-language manual-QA checklists are generated — and why generation, not hand-authoring. This is the *design* of the pipeline (the what & why). The operator's how-to-run note and the live machinery are in `../qa/_authoring/` (see its [README](../qa/_authoring/README.md)).

## The problem

The extension supports a set of destination languages (`.ts`, `.js`, `.jsx`, `.tsx`, `.mdx`, `.css`, `.scss`, `.html`, `.md`, `.vue`, `.svelte`, `.astro`, `.tex`), each with its own import-statement shapes, gating, placement, and smart-identifier rules. Manual QA needs one checklist per covered language, plus a shared `general.md`. (LaTeX joined outside the pipeline — its checklist and workspace were authored as a normal feature; see [`../qa/_authoring/README.md`](../qa/_authoring/README.md).)

Hand-writing those checklists invites two failures:

- **Drift** — structural inconsistency, missed sections, divergent wording between languages: the very thing the suite exists to catch, reintroduced by the suite itself.
- **No audit trail** — a hand-written checklist records no trace of *how* it was derived from the source, so maintaining it as the code evolves becomes guesswork.

So checklist authoring is treated as a **compilation problem**: do the hard analysis once, freeze it, and render every checklist mechanically from that frozen analysis.

## The compiler mental model

```
source code  →  PROFILE.md (IR)  →  checklists/{lang}.md (output)
                     ↑
              human-reviewed, frozen
```

Read it as a compiler:

- The **front end** reads the extension's `src/` once and distills each destination's observable behavior into an intermediate representation.
- The **IR** (`PROFILE.md`) is that distilled form — a static, human-readable table, reviewed by a human and then **frozen**.
- The **back end** renders each language's checklist from the IR through one shared rule.

The leverage is the freeze. Because every per-language generation reads the *same* frozen IR through the *same* rule, two runs cannot diverge. Consistency stops being something you hope for and becomes a property of the construction.

## The IR — a frozen profile of each destination

`PROFILE.md` holds **one row per destination**, each recording six fields of observable behavior:

| Field | What it captures |
|-------|------------------|
| `gating` | which source extensions this destination accepts vs rejects |
| `styles` | the import-style shapes and how the builder dispatches between them |
| `smartId` | exported-class / Angular-suffix identifier inference, and where it applies |
| `defaultStyle` | the default style index *and* its rendered output string |
| `placement` | how the Top/Bottom/Cursor setting is honored, and any container the import is confined to |
| `pathQuirks` | extension-preservation rules and path normalization |

Two choices make this the load-bearing part:

- **Built by reading source, once.** Every field is populated from the actual extension code (`src/gating.ts`, `src/snippets/**`, `src/editor/placement.ts`, `package.json`, …) — not guessed from docs. The IR is the single place the source is interpreted.
- **Frozen after human review — not auto-tracking.** Once reviewed, the IR is read from disk every run; no session re-derives it. That is what guarantees determinism. The flip side: if `src/` behavior changes *after* the freeze, the affected row must be re-derived and re-reviewed by hand before regenerating — the pipeline does not detect that drift for you.

The completeness bar: anything a checklist needs to assert must be derivable from these six fields. If a behavior has no home in a field, it's the field that's incomplete, not the checklist.

## The recipe — one shared section rule

`RECIPE.md` is the back end: a single **section skeleton** every checklist is rendered through. It lists the numbered sections (gating matrix, happy-path paste, insert-from-selected-file, all-N-styles, smart-identifier, placement, pick-style, set-default, drag-and-drop, edge cases, sign-off), each marked **required** or **conditional** — and the conditions resolve against the IR fields. A destination with `smartId = none` simply omits the smart-identifier section; a stylesheet destination picks up its path-quirk sub-sections.

One recipe shared by every destination is why per-language divergence is *structurally* impossible: there is only one rule to render through.

The recipe also enforces one boundary: **`general.md` is assumed to have passed.** That shared checklist owns every destination-neutral behavior (clipboard validation, same-file rejection, notification wording, the universal QuickPick / drag-and-drop mechanics). Each generated per-language checklist emits only the destination-specific *delta* and cross-references `general.md` for the shared parts — it never re-tests them.

## What this buys

Three properties fall out of the construction:

| Property | Why it holds |
|----------|--------------|
| **Consistency** | one `RECIPE.md` over one `PROFILE.md`, shared by every destination |
| **Determinism** | the IR is frozen and human-reviewed; no run re-derives it, so the same input yields the same checklist |
| **Resumability** | generation state lives on disk as runbook `[ ]`/`[x]` checkboxes, so a session can die and resume at the first unchecked box |

The full catalogue of guarantees — and the specific failure modes each one guards against — lives in the operator README ([`../qa/_authoring/README.md`](../qa/_authoring/README.md)). This section is the conceptual core, not the exhaustive list.

## The two-tier checkbox rule

One rule every reader of this pipeline must internalize, because getting it wrong silently corrupts the QA artifact:

| Tier | File | Audience | The `[ ]` boxes |
|------|------|----------|-----------------|
| **1 — runbook** | `_authoring/runbook-*.md` | the agent generating the checklist | go `[ ]` → `[x]` as generation work completes |
| **2 — QA checklist** | `checklists/{lang}.md` | the human running QA in the Extension Development Host | stay `[ ]` after generation; the human ticks them during manual testing |

Ticking a Tier-2 box during generation ships a checklist with phantom "tested" marks — a QA artifact that lies about what was verified. The generation machinery restates this rule at the top of every runbook for exactly this reason.

## Where the machinery lives

This doc is the *why*. The runnable pipeline lives in `../qa/_authoring/`:

| Artifact | Role |
|----------|------|
| [`_authoring/README.md`](../qa/_authoring/README.md) | the operator's note — how to run a generation session, stability rules, the full guarantees + failure-mode tables |
| [`_authoring/RECIPE.md`](../qa/_authoring/RECIPE.md) | the section rule (the back end) |
| [`_authoring/PROFILE.md`](../qa/_authoring/PROFILE.md) | the frozen IR (one row per destination) |
| [`../qa/checklists/`](../qa/checklists/) | the generated output — `general.md` + the per-language checklists |

For *why a given import shape exists* (the behavior the IR profiles), see the sibling design tree [`import-statements/`](import-statements/CLAUDE.md).

---

*The operator README carries the provenance pointer and is the authoritative reference for running the pipeline.*
