# Rot-Sweep Workflow — Spec

> **This Markdown is the source of truth.** The implementation lives in `rot-sweep.js`
> (generated from this doc). To change the workflow's behaviour, edit *this file first*, then
> regenerate the script from it. Both files are under `.claude/` → local-only (gitignored).

## Purpose

A **pre-commit drift sweep** for an accumulated pile of uncommitted changes. When you've been editing for
a while without checking as you go, `rot-sweep` reads **only what you changed**, follows each change out to
the docs and contracts it touches, and **reports** — grouped by the five `/_rot` categories — where the
pile left things inconsistent. **Report-only, always:** it never edits, commits, or ticks anything; you
read the report and decide what to fix.

When to run: when a pile of uncommitted changes has built up and you want a consistency check **before
committing**. Re-run it after each fix — being diff-scoped, it only re-examines what's still uncommitted.
This is the change-scoped, whole-repo-surface sibling of the heavier full-tree gates (`doc-sync-full`,
`release-align`) and of the typed `/_rot` (whole-tree); none of those is diff-scoped across the whole repo.

It will **not** find runtime bugs — it checks *consistency* (docs/contracts vs code), not *behaviour*. It
never runs the extension or the tests.

## Ground truth

The single source of truth is **the code** — the docs adjust to it. When the sweep finds a doc and the
code disagreeing, the code is treated as correct and the **doc** is the thing reported as wrong.

> **Caveat — code assumed correct.** This workflow conforms docs to code; it never runs or validates the
> code. It operates on the assumption that the uncommitted code is correct. If that assumption is false on
> some future run, the sweep will faithfully report a doc as "wrong" for not matching the (actually wrong)
> code. Run it on piles you've already verified.

**Scope is strict: only the uncommitted working tree.** The audit *subject* is exactly the set of files in
`git status` — staged + unstaged + untracked, in their **on-disk** form (a file with both staged and
unstaged edits is read as it currently is on disk). To *verify* a finding the sweep MAY open an unchanged,
already-committed partner file to compare against — but such a file is only a witness, never an audit
subject, and is never reported on for its own sake.

## Coverage — what's swept, what isn't

**The PRODUCT is the scope boundary — explicitly, not the gitignore.** Scope = the changed files that fall
within an explicit product allowlist: `src/`, `docs/`, `qa/`, the root product docs, and `package.json`.
Everything else — `.claude/` tooling, `process/`, `.vscode/`, root build configs — is out **by path, even
if tracked**. (This was originally "whatever isn't gitignored"; that was a mistake — un-ignoring `.claude/`
then silently pulled the tooling into scope. Scope must not depend on a mutable ignore rule.)

**Two triggers put something in scope — but the *trigger* is always in your pile:**
1. **Direct** — a file is in the uncommitted set → it is checked against the code.
2. **Implicated** — a *code* change in the pile pulls in the docs and contracts that describe it (read as
   witnesses), **even if those docs are unchanged**. This is what catches "you changed the code, but the
   doc that documents it — which you never touched — is now stale." Doc-side findings on an unchanged
   (committed) file are reported, never written.

### ⭐ Priority targets (Tier-1) — the most important docs

`SPEC.md`, `README.md`, everything under `docs/`, the relevant `qa/` checklist(s), and `CHANGELOG.md` are
**Tier-1**: they get a **claim-by-claim** check (not a count/skim), and they are **standing implicated
partners** — any behavioural code change in the pile is checked against them *even when they aren't
themselves edited*. (The extension is entirely about generating import statements, so most behavioural
changes implicate `SPEC`, `README`, and `docs/import-statements/`.)

**In scope, by surface:**

| Surface | Trigger | What's checked |
|---|---|---|
| ⭐ `SPEC.md`, `README.md` | direct **or** any behavioural code change | claim-by-claim vs the code (the authoritative contract + the front page) |
| ⭐ `docs/**` (criteria, decisions, ledgers) | direct **or** a code change touching the documented design | the relevant criteria/decision claim-by-claim vs current behaviour |
| ⭐ relevant `qa/**` checklist(s) | direct **or** a behavioural code change that has a checklist | the checklist + its qa-doc cascade (inventories, counts, 1:1 fixture pairing) — **only the relevant language(s), never the whole tree** |
| ⭐ `CHANGELOG.md` (Unreleased) | any user-facing change in the pile | does Unreleased accurately cover the pile's Added/Changed/Fixed? (see CHANGELOG section) |
| `CLAUDE.md`, `SUPPORT.md` (root) | direct or relevant code change | counts / claims / sync-rules vs code |
| `package.json` | direct | `contributes` vs `src/` registration; three-site config contract |
| `src/**/*.ts` (non-test) | direct | the file vs its owning-dir `CLAUDE.md` / `README.md` + any contract it belongs to |
| `src/**/{CLAUDE,README}.md` | direct | the dir doc vs its code |
| untracked files (e.g. `README.draft.md`) | direct | Orphan — is anything referencing it? |

**On the qa/ volume worry:** diff-scoping is what keeps qa/ manageable. The sweep never reads the whole
12-language qa/ tree — only the checklist(s) your change actually touches, plus the bounded cascade those
edits propagate to. If your pile touches no qa-relevant behaviour, qa/ is skipped entirely.

**Out of scope (explicit exclusions, by path):**
- **Non-product paths** — `.claude/` (the audit tooling itself, **even now that it's tracked**), `process/`,
  `.vscode/`, root build configs (`tsconfig.json`, `esbuild.js`, `eslint.config.mjs`, …), `dist/`, `out/`,
  `node_modules/`. Excluded **by path, not by gitignore state**. *(So `.claude/`-internal drift is NOT covered
  here — that's the whole-tree typed `/_rot`'s job; and auditing the audit-tooling with itself is
  deliberately avoided.)*
- **`src/test/**`** — no doc pairs; skipped as finder targets.
- **Packaging / `.vscodeignore` / `vsce ls`** — owned by `release-align`; the sweep emits a one-line note
  deferring to it and never runs `vsce`.

## The five `/_rot` categories

Every finding is exactly one of (definitions match the typed `/_rot` taxonomy and `spec-sync.js`):

- **Stale** — a doc statement that is no longer true.
- **Drift** — a doc and the code have diverged (especially the byte-exact cross-site contracts below).
- **Gap** — the code has something the docs don't cover (a new command, setting, behaviour).
- **Orphan** — a doc / table / link references a file / symbol / path that was renamed or deleted (or a new
  file that nothing references).
- **Broken invariant** — a documented invariant, count, or sync-contract is now violated (e.g. the "seven
  commands" count, the dependency-direction rule, the "only barrel is `commands/index.ts`" rule).

## Cross-site contracts (checked only when implicated)

The four documented multi-site contracts (root `CLAUDE.md` → "Cross-cutting sync rules"). A contract finder
runs **only if the uncommitted set intersects that contract's member files** — diff-triggered, but it then
reads *all* member sites (committed ones as witnesses) so a half-finished edit is caught:

| Contract | Member files (intersection triggers the finder) |
|---|---|
| Four-site extension sync | `src/types/file-extension.ts`, `src/constants/extensions.ts`, `src/snippets/dispatch.ts`, `src/snippets/variants.ts` |
| Three-site config sync | `package.json`, `src/snippets/_styles.ts`, `src/snippets/languages/*.ts` |
| Two-site button-label sync | `src/editor/notification.ts`, `src/commands/copy-file-path.ts`, `src/commands/reset-import-styles.ts` |
| Runtime-type mirror | `src/constants/extensions.ts`, `src/types/file-extension.ts` |

## CHANGELOG — accurate Unreleased check

The changelog is a Tier-1 target with its own finder. It does NOT just diff prose — it triages the
**user-facing** changes in your pile (new/changed commands, settings, behaviours; fixes) and checks them
against the `## [Unreleased]` section:
- **Gap** — a user-facing change in the pile that Unreleased doesn't mention → propose the exact
  Added / Changed / Fixed bullet.
- **Stale** — an Unreleased bullet that misstates what the code now does → propose the correction.
- Never touches published version sections; the version number + date are a publish-time concern.

Report-only: it *proposes* the accurate entries; you (or the assistant, afterward) apply them. rot-sweep
cannot reuse `release-align`'s `changelog-drafter` agent (it is self-contained), so this is a lightweight,
pile-scoped reimplementation — not the full two-state release drafter.

## Diff → bucket routing

The enumerate phase buckets each uncommitted path (in plain JS, no agent) so the right finder is dispatched:
- a root product doc → root-doc finder
- `package.json` → package finder (and marks the three-site contract implicated)
- under `docs/` → docs finder; under `qa/` → qa finder
- a non-test `.ts` under `src/` → per-file finder against its **owning doc-dir** (nearest ancestor holding
  both `CLAUDE.md` + `README.md`; `src/snippets/languages/*` maps up to `src/snippets/`; files directly in
  `src/` map to `src/`)
- a `CLAUDE.md` / `README.md` under `src/` → dir-doc finder
- an added / deleted / renamed path → also feeds the interconnection finder (registration tables +
  cross-doc links) and the Orphan check
- a member of any contract above → marks that contract implicated
- a **behavioural** `src/` code change → also implicates the **Tier-1 partner docs** (`SPEC.md`,
  `README.md`, the relevant `docs/` criteria, the relevant `qa/` checklist) and the **CHANGELOG Unreleased**
  finder — read as witnesses even when those files are unchanged

## Deliberately self-contained (do not "fix" this)

`rot-sweep` **reimplements** the finder → verify → critic shape inline. It does **not** dispatch or call any
local agent or workflow (`doc-sync-auditor`, `doc-sync-full`, `release-align`, `qa-doc-sync`, the typed
`/_rot`). This is a **deliberate exception** to this repo's "reuse, don't reimplement" convention
(`specs/CLAUDE.md`), made by owner directive for hermeticity — the sweep must behave identically regardless
of how those other tools evolve. **Do not refactor it to reuse them.** (It does use the built-in `Explore`
agent type — a harness primitive, not a local agent.) Consequence to accept: the four contract definitions
above are restated here and must be updated by hand if a contract changes.

## Output & mode

- **Report-only — the only mode.** There is no `fix` path; the workflow has no writer agent and edits
  nothing. (So the "args mishap silently edits files" failure that motivated the house report-default
  cannot occur here at all.)
- **It writes no file.** Per the house convention the workflow *returns* the structured report; the caller
  persists it. Findings are grouped **by `/_rot` category** and **by surface / file**, each with severity,
  `file:line` for both the doc claim and the code reality, a described `proposedFix` (never applied), and
  triage tags (`mechanical` | `behavioral`, `uncommitted` | `committed`).
- After the run the assistant relays a chat summary; only if you ask for a persisted file does it write one
  to the **gitignored** `.claude/rot-sweep.audit.md` (so the report never pollutes your pile).
- **Coverage manifest (honesty, not hedging).** The report always carries a factual manifest from the
  completeness critic — which files were *read* (diff subjects + pulled-in witnesses), which were *checked*,
  which in-scope surfaces were *skipped* and why — plus **one** line: "diff-scoped; for a completeness
  guarantee run the full-tree `/_rot` before publish." No speculation about unread files, no generic
  disclaimer — just this run's actual coverage, so a clean report is never mistaken for an exhaustive one.
- A one-line `note` records that packaging / `.vscodeignore` is out of scope (see `release-align`).

## Workflow phases (implementation shape for `rot-sweep.js`)

All fan-out runs through `runBatched(thunks, 6)` (throttle-avoidance — a whole-repo surface is many
agents). Every agent is `agentType:'Explore'` (read-only; there is no writer phase) and `model:'opus'`.

1. **Enumerate** (1 agent) — `git status --porcelain` (+ untracked) → the uncommitted path set; bucket each
   path (root-doc / package.json / docs / qa / src-code / src-doc / orphan-candidate) and mark implicated
   contracts. Read-only git.
2. **Detect** (fan out, `runBatched(6)`) — one finder per bucketed item: per changed `src/` file (vs its
   owning doc-dir); per changed root-doc / `docs/` / `qa/` surface; per **implicated** contract (reads all
   its member sites); one **Tier-1 partner** finder each for `SPEC.md` / `README.md` / the relevant `docs/`
   criteria / the relevant `qa/` checklist — **claim-by-claim** — whenever a behavioural code change
   implicates them even if unchanged; one **CHANGELOG** finder (triage the pile's user-facing changes vs the
   Unreleased section); plus one interconnection finder when the set adds / deletes / renames a path. Each
   finding: `category, severity, surface, location, claim, reality, proposedFix, tags`. Dedupe in JS.
3. **Verify** (fan out, `runBatched(6)`) — one **single-lens, refute-by-default** agent per deduped finding
   (re-read the actual doc location AND the actual code; default `real=false` unless the evidence clearly
   holds). Keep only `real===true`.
4. **Complete** (1 agent) — completeness critic: which uncommitted path or implicated contract wasn't
   represented? Emits the **coverage manifest** (read / checked / in-scope-skipped) the report carries —
   facts about this run's coverage, **not** speculation about unread files (recall safety net).
5. **Assemble** — `return { mode:'report', findings (byCategory + bySurface), coverage, note }`. No writes.

## Decisions / toggles (current defaults — flip by editing this doc)

- **Mode:** `report` only. *There is no `fix` mode, by design.*
- **Scope:** strict uncommitted working tree (`git status`) ∩ an explicit product allowlist (`src/`,
  `docs/`, `qa/`, root product docs, `package.json`). *Currently: product-allowlist — NOT gitignore-derived,
  so an ignore-rule edit can't move scope; `.claude/` is excluded by path.*
- **Verification depth:** single-lens, refute-by-default, per finding. *Currently: single-lens — the report
  is human-reviewed, so budget goes to finder recall + the critic, not 3-lens voting. Raise here for a
  higher-precision report.*
- **Fan-out batching:** `runBatched(size=6)`. *Currently: 6 (throttle-safe).*
- **Models:** every agent `model:'opus'` + `agentType:'Explore'`. *Currently: all-opus.*
- **Self-contained:** no reuse of local agents / workflows. *Currently: standalone (deliberate exception).*
- **Recall posture:** report carries a factual coverage manifest + a one-line pointer to the full-tree
  `/_rot`; no speculation about unread files, no rules derived from audited docs. *Currently: manifest-only
  — completeness is the full-tree pass's job, not this tool's.*
- **Tier-1 priority targets:** `SPEC.md`, `README.md`, `docs/**`, relevant `qa/**`, `CHANGELOG.md` —
  claim-by-claim + checked as standing partners against behavioural code changes even when unchanged.
  *(Add/remove targets here.)*
- **Packaging audit (`vsce ls` / `.vscodeignore`):** excluded. *Currently: no — owned by `release-align`.*

## Maintenance

Edit this doc, then regenerate `rot-sweep.js` from it. The `.js` should contain no policy the doc doesn't
state; the doc should describe no behaviour the `.js` doesn't implement. If they drift, this doc wins.
