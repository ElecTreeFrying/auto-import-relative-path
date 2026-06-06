# `.claude/workflows/` — guide

Workflow scripts for this project (the `*.js` live in the parent [`../`](../)), **tracked** via the `!.claude/workflows/` exception in root `.gitignore` — **each paired with a Markdown spec here in `specs/`.**

## The pairing convention (required)

Every workflow `../X.js` (in the parent directory) MUST have a paired spec `X.md` here in `specs/`.
- **The `.md` is the source of truth; the `.js` is generated from it.** If they drift, the doc wins.
- Edit the spec first, then regenerate the script from it. The `.js` encodes no policy the `.md` omits;
  the `.md` describes no behaviour the `.js` lacks.
- Each `.md` ends with a **Maintenance** note restating this.

## Spec format (follow the existing specs: `release-align.md`, `doc-sync-full.md`)

- **Source-of-truth banner** — blockquote at the top.
- **Purpose** — what it does, when to run, the report/draft default.
- **What it audits / ground truth** — the single source of truth + the categories/invariants checked.
- **Coverage** — exhaustive vs scoped; what's read.
- **Domain sections** — whatever's special (cross-dir contracts, two-state changelog, packaging policy…).
- **Output & mode** — `report` (default) vs `fix`; what each writes.
- **Workflow phases** — the implementation shape, mapping ~1:1 to the `.js`.
- **Decisions / toggles** — the knobs + current defaults; flipped by editing the doc.
- **Maintenance** — "edit doc → regenerate js; doc wins on drift."

## Conventions baked into every workflow here

- **Report/draft is the default.** Destructive `fix` mode is opt-in (`args {mode:"fix"}`). Lesson learned:
  an `args` mishap once defaulted to `fix` and edited files — so parse `args` defensively (object **or**
  JSON string) and default to the SAFE mode.
- **Read-only phases use `agentType: 'Explore'`** so they physically can't Edit/Write. Only the apply phase
  (fix mode) uses a writer agent.
- **Reuse, don't reimplement.** If logic already lives in an agent (e.g. `changelog-drafter`'s two-state
  logic), the workflow **dispatches that agent** rather than copying it.
- **Inventory once, fan out against it.** Derive one ground-truth, then check each target against it —
  cross-consistency falls out; no pairwise checks.
- `.claude/{agents,skills,workflows}/` are **tracked** via `!` exceptions in root `.gitignore`; the rest of `.claude/` (incl. `agents/state/`) stays gitignored / local-only.

## The cheap/heavy pairing principle

Workflows here are the **heavy, rare** half of a pair; each has a **cheap, frequent** agent counterpart
that's the daily driver — and the workflow often *uses* the agent.

| Concern | Cheap daily driver (agent) | Heavy rare gate (workflow) | Workflow spec |
|---|---|---|---|
| Per-dir docs vs `src/` | `doc-sync-auditor` | `../doc-sync-full.js` | `doc-sync-full.md` |
| Root product files vs `src/` | `changelog-drafter` | `../release-align.js` | `release-align.md` |

Run the agent around commits; run the workflow before a release / periodically. They share state where
relevant (e.g. the doc-sync watermark at `.claude/agents/state/doc-sync-watermark.txt`). Deleting a cheap
agent removes the daily path **and** breaks the workflow that reuses it.

**Standalone exception — `rot-sweep`.** A third workflow (`../rot-sweep.js`, spec `rot-sweep.md`) sits
*outside* this cheap/heavy pairing: a diff-scoped, **report-only** `/_rot` sweep of the **uncommitted
working tree** across the whole repo surface (run before committing a pile). It is **deliberately
self-contained** — it dispatches no agent and no workflow (owner directive, for hermeticity), so it has
**no cheap counterpart and no table row**. That makes it a documented exception to "Reuse, don't
reimplement" above — **do not refactor it to reuse the others**; see `rot-sweep.md`.

## Adding a new workflow

1. Write `X.md` (the spec) first here in `specs/`, in the format above.
2. Generate `../X.js` from it in the parent directory.
3. If it has an agent counterpart, add a row to the table above.
