# qa/_authoring/

Operational files for the **spec-driven checklist codegen pipeline** — the
machinery that generates the per-language QA checklists in `../checklists/` and
their fixture workspaces in `../workspace/` consistently and resumably. The
underscore prefix marks this as an internal/meta subtree (cf.
`src/snippets/_styles.ts`); it is committed, not gitignored.

Checklist authoring is treated as a compilation problem:

```
source code  →  PROFILE.md (IR)  →  ../checklists/{lang}.md (output)
                     ↑
              human-reviewed, frozen
```

The hard analysis of the extension source is done **once** and frozen in
`PROFILE.md`. Every per-language generation reads the same frozen IR through the
same `RECIPE.md`, so two runs cannot diverge — consistency is structural, not
aspirational.

## Files

| File | What it is | Lifecycle |
|------|-----------|-----------|
| `README.md` | This file — what the subtree is and how to use it | Stable |
| `RECIPE.md` | The codegen rule — the section recipe every checklist is rendered through (required/conditional sections, per-quirk slots, item detail, authoring rules) | Stable; rarely changes |
| `PROFILE.md` | The IR — one frozen row per destination, six fields, populated by reading the extension source | Stable; a row is added if the extension gains a new destination, or an existing row **re-derived** if `src/` behavior for that destination changes after the freeze |
| `LOOP-PROMPT.md` | The reusable loop-prompt text, pasted verbatim per session | Stable; reused verbatim across all runbooks |
| `runbook-{ext}-checklist.md` | Phase A runbook (checklist generation) | Archived — see `.claude/_archive/qa-pipeline/runbooks/` + git history |
| `runbook-{ext}-workspace.md` | Phase B+C runbook (workspace fixtures + sync-doc propagation) | Archived — see `.claude/_archive/qa-pipeline/runbooks/` + git history |
| `runbook-typescript-migration.md` | TS migration runbook — single-session exception (Phase 0 + A + A.5 parity + B-verify + C) | Archived — see `.claude/_archive/qa-pipeline/runbooks/` + git history |
| `parity-ts.md` | TS parity inventory | Disposable; exists only during the TS migration session |

> After this scaffold session only `README.md`, `RECIPE.md`, `PROFILE.md`, and
> `LOOP-PROMPT.md` exist. The `runbook-*.md` files were written one per session as
> each language was generated, and are now archived (see the Files table above).

## ⚠️ Two-tier checkbox rule

The single most dangerous failure mode of this pipeline is **conflating the
agent's task checkboxes with the human's QA checkboxes.** Get it wrong and a QA
artifact ships with phantom "tested" marks.

| Tier | File | Audience | `[ ]` lifecycle |
|------|------|----------|-----------------|
| **1 — Procedural runbook** | `_authoring/runbook-*.md` | the agent | `[ ]` → `[x]` as generation work completes |
| **2 — QA checklist** | `../checklists/{lang}.md` | the human in the Extension Development Host | `[ ]` stays `[ ]` after generation; the human ticks it during manual QA |

**NEVER tick `[ ]` boxes inside `../checklists/{lang}.md` during generation.**
Every runbook restates this rule at its top, and `LOOP-PROMPT.md` repeats it as a
hard rule.

## How to run a session

1. The generation order is fixed: the TypeScript migration first (it stress-tests
   the pipeline), then the 11 remaining languages — each as a **checklist session**
   (Phase A) followed by a **workspace session** (Phases B + C). The full order
   lives in the spec's execution-order section.
2. Each language session writes its runbook (`runbook-{ext}-{phase}.md`) from the
   template, then is driven by pasting `LOOP-PROMPT.md` verbatim with `{lang}` and
   `{phase}` substituted.
3. The loop ticks the runbook's `[ ]` → `[x]` until none remain, then the session
   produces exactly **one commit** (the runbook + its deliverables).

## Stability rules

- **`RECIPE.md` is the single source of truth for checklist shape.** It is shared
  by all 13 destinations; per-language divergence is structurally impossible.
- **`PROFILE.md` is frozen — but "frozen" means freeze-after-review, NOT auto-tracking
  of `src/`.** It is read from disk every session, never re-derived per-session. A
  destination's behavior changes only by editing its PROFILE row and regenerating —
  never by hand-editing a generated checklist. **If extension source behavior changes
  *after* the freeze** (a `src/` fix lands for an already-profiled destination), the
  affected row(s) MUST be re-derived from `src/` and re-reviewed **before** regenerating
  any checklist for that destination — the pipeline does not detect this drift for you.
- **Propagation still applies.** A generated checklist drives its workspace 1:1 and
  ripples into the `qa/` inventory docs — see [`../CLAUDE.md`](../CLAUDE.md).

## Guarantees

What treating checklist authoring as compilation actually buys you — the
properties the shared `RECIPE.md`, the frozen `PROFILE.md`, and the runbook loop
provide by construction:

| Guarantee | Mechanism |
|-----------|-----------|
| **Consistency across languages** | Every checklist is rendered through the same `RECIPE.md` over the same frozen `PROFILE.md` — one rule, one IR, all 13 destinations |
| **Determinism across sessions** | The IR is frozen and human-reviewed; no session re-derives it, so two runs cannot diverge |
| **Resumability across sessions** | Runbook `[ ]` → `[x]` state lives on disk and survives session death; the loop picks up at the first unchecked box |
| **Data preservation (TS migration)** | The parity gate refuses to ship the regenerated `typescript.md` until every case in the old one has a verified home in the new file |
| **Audit trail** | Each `runbook-{ext}-*.md` is committed alongside the deliverable it produced, so `git log` shows exactly which procedure generated each checklist |
| **Sync safety** | Phase C is mandatory and validates `checklist ↔ workspace` 1:1, satisfying the propagation rule in [`../CLAUDE.md`](../CLAUDE.md) |
| **Agent isolation** | Each runbook phase is bounded to one cognitive mode — generation, fixture creation, or wiring — so no single session competes for context across all three |
| **Executable QA artifact** | Every checklist step names file + gesture + expected result, so the human tests by doing, never guessing — enforced by `RECIPE.md`'s executable-instruction rule and the Phase A self-verify |

## Failure modes guarded against

The flip side of the guarantees — the specific ways generation can go wrong, and
where each is caught:

| Failure | Where it's caught |
|---------|-------------------|
| An agent ticks the human's `[ ]` boxes inside `../checklists/{lang}.md` | The **Two-tier checkbox rule** above — restated at the top of every runbook and in `LOOP-PROMPT.md` |
| Workspace has a fixture the checklist never references, or a referenced path with no fixture | Phase C validation tasks (`checklist ↔ workspace`, both directions) |
| A new style added to `src/snippets/_styles.ts` isn't reflected in the checklists | Phase A re-reads `_styles.ts` every run; a section-4 style-count change surfaces in the self-verify |
| RECIPE drift between languages | One shared `RECIPE.md` — structurally impossible (see **Stability rules**) |
| Context overload in one session | The phase split keeps each runbook invocation bounded (the **Agent isolation** guarantee above) |
| TS regression during migration | The parity gate blocks the swap until the orphan list is empty |
| Mid-session interruption | The loop prompt resumes at the next `[ ]` (the **Resumability** guarantee above) |
| PROFILE drift across sessions | `PROFILE.md` is committed and re-read from disk every session (see **Stability rules**) |
| Two languages worked in one session | `LOOP-PROMPT.md` is per-language; pasting it drives exactly one runbook |
| Phase C ("Wire & propagate") skipped | Phase C tasks live in the runbook; the loop won't finish until they're `[x]` |
| A workspace session run before its checklist session committed | `runbook-{ext}-workspace.md`'s first Phase B task verifies `../checklists/{ext}.md` exists on disk and halts with a clear error if not |
| An abstract, non-executable checklist step ("copy a source file and paste it") | The Phase A self-verify enforces `RECIPE.md`'s executable-instruction rule — every step must name file + gesture + expected result |
| A regenerated checklist duplicates `../checklists/general.md`'s shared sections, or drops the cross-references back to it | `RECIPE.md`'s BOUNDARY preamble + per-section DELTA-ONLY markers; for TS, the parity gate also catches it against the `general.md` cross-reference lines already in `typescript.md` |
| A persisted `*ImportStyle` value matches no enum entry (name/string drift — e.g. hand-typed into `settings.json`) | `RECIPE.md`'s item-4 style-name-drift case: the checklist verifies the builder's `default:` arm still emits style-0 (and keeps the smart identifier on `.ts`) — distinct from the style-count drift the Phase A self-verify guards |

---

Distilled from the design spec, now archived at
`.claude/_archive/qa-pipeline/QA-PIPELINE-SPEC.md` (+ git history). Its
infrastructure-layout, loop-prompt, two-tier-rule, and per-session-workflow
sections are the authoritative references.
