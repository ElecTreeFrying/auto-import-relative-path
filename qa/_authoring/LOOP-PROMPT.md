# LOOP-PROMPT.md — reusable per-session loop prompt

Paste the block below **verbatim** at the start of each per-language session,
substituting two placeholders: `{lang}` (the language word, e.g. `javascript`,
`typescript` — matching the `../checklists/{lang}.md` filename) and `{phase}` (one
of `checklist`, `workspace`, or `migration`).

---

```
Read qa/_authoring/runbook-{lang}-{phase}.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa/checklists/{lang}.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## Usage examples

```
.js checklist session:    {lang} = javascript,  {phase} = checklist
.js workspace session:    {lang} = javascript,  {phase} = workspace
TS migration session:     {lang} = typescript,  {phase} = migration
```

## Properties

- **Idempotent.** Re-pasting after a partial run picks up at the first remaining `[ ]`.
- **Resumable across sessions.** Runbook state is on disk; conversation history is
  not required.
- **Two-axis substitution.** Only `{lang}` and `{phase}` change; everything else is
  verbatim.
