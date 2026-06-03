# qa.new/_authoring/

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
| `runbook-{ext}-checklist.md` | Phase A runbook (checklist generation) | Created + committed alongside the checklist it produces |
| `runbook-{ext}-workspace.md` | Phase B+C runbook (workspace fixtures + sync-doc propagation) | Created + committed alongside the workspace it produces |
| `runbook-typescript-migration.md` | TS migration runbook — single-session exception (Phase 0 + A + A.5 parity + B-verify + C) | Created + committed alongside the regenerated TS checklist |
| `parity-ts.md` | TS parity inventory | Disposable; exists only during the TS migration session |

> After this scaffold session only `README.md`, `RECIPE.md`, `PROFILE.md`, and
> `LOOP-PROMPT.md` exist. The `runbook-*.md` files are written one per session as
> each language is generated.

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
  by all 12 destinations; per-language divergence is structurally impossible.
- **`PROFILE.md` is frozen — but "frozen" means freeze-after-review, NOT auto-tracking
  of `src/`.** It is read from disk every session, never re-derived per-session. A
  destination's behavior changes only by editing its PROFILE row and regenerating —
  never by hand-editing a generated checklist. **If extension source behavior changes
  *after* the freeze** (a `src/` fix lands for an already-profiled destination), the
  affected row(s) MUST be re-derived from `src/` and re-reviewed **before** regenerating
  any checklist for that destination — the pipeline does not detect this drift for you.
- **Propagation still applies.** A generated checklist drives its workspace 1:1 and
  ripples into the `qa.new/` inventory docs — see [`../CLAUDE.md`](../CLAUDE.md).

---

Distilled from the design spec at `qa-pipeline/QA-PIPELINE-SPEC.md`. Its
infrastructure-layout, loop-prompt, two-tier-rule, and per-session-workflow
sections are the authoritative references.
