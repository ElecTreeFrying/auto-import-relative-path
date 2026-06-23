# Doc-Sync Full Audit Workflow — Spec

> **This Markdown is the source of truth.** The implementation lives in `doc-sync-full.js`. To change
> behaviour, edit *this file first*, then regenerate the script from it. Both are under `.claude/` →
> local-only (gitignored).

## Purpose

The **exhaustive** counterpart to the incremental `doc-sync-auditor` agent. It audits **every** directory
under `src/` to keep each dir's `CLAUDE.md` + `README.md` truthful against the code — including the
cross-directory sync contracts a per-change pass can't see. **Report/draft by default** — it proposes doc
edits; you review. `args {mode:"fix"}` applies them.

When to run: **before publish**, or as a periodic deep re-audit. It assumes a **large accumulated diff** —
files and whole directories **added, removed, updated, and relocated** since the last sweep — so it
reconciles the **entire interconnected doc web** (per-dir pairs *and* the registration tables + cross-doc
links that wire them together), not just per-file content. Day-to-day per-commit upkeep is the
`doc-sync-auditor` agent's job — see Handoff below.

**Relocations are first-class.** A moved file is one event with three rot signatures: an **Orphan** in the
old dir's docs, a **Gap** in the new dir's docs, and a **broken interconnection** (a table row or link
still pointing at the old path). The audit reconciles all three sides.

## What it audits (the `/_rot` taxonomy)

Each directory's docs vs its code, in the repo's `/_rot` categories:
- **Stale** — a claim no longer true.
- **Drift** — doc and code diverged (especially byte-exact contracts).
- **Gap** — code has something the docs don't cover.
- **Orphan** — docs reference a renamed/deleted file/symbol/path.
- **Broken invariant** — a documented invariant/sync-contract is violated.

Lens per file: `CLAUDE.md` → conventions / sync-rules / gotchas / dependency-direction; `README.md` →
file inventory / public exports / "where to add code".

## Coverage — exhaustive

- Reads **every non-test `.ts` under `src/`** — tracked **and** untracked-but-not-ignored
  (`git ls-files` + `git ls-files --others --exclude-standard`); skips `src/test/**` and `*.test.ts`.
- **Doc-dirs** = every dir (incl. `src/` root) containing BOTH `CLAUDE.md` and `README.md`.
- **File → doc-dir mapping:** nearest ancestor dir holding both files; root files (`extension.ts`,
  `gating.ts`) → `src/`; files with no local pair roll up to the nearest one.

## Cross-directory contracts (what per-file detection can't see)

A dedicated pass checks the four multi-site contracts, since they span directories:
- **Four-site extension sync** — `types/file-extension.ts` → `constants/extensions.ts` → `snippets/dispatch.ts` → `snippets/variants.ts`.
- **Three-site config sync** — `package.json` (outside `src/`) → `snippets/_styles.ts` → per-language switches.
- **Two-site button-label sync** — `editor/notification.ts` ↔ `commands/copy-file-path.ts` and `commands/reset-import-styles.ts`.
- **Runtime-type mirror** — `constants/extensions.ts` ↔ `types/file-extension.ts`.

## Interconnection (the doc web must stay coherent)

A dedicated pass checks the cross-references that adds / removes / relocations break, across the three
registration sites the docs use (the `scaffold-doc-pair` targets):
- **Registration tables** — root `CLAUDE.md` (the "Subdirectory guides" table), `src/README.md`,
  `src/CLAUDE.md`. A row pointing at a renamed/removed dir = **Orphan** (high-confidence); a live dir
  absent from a table = **Gap** (*advisory* — the tables are curated; e.g. `src/test/fixtures/` is
  intentionally unlisted).
- **Inter-doc links** — relative `[text](path)` and `[[name]]` references resolve to a real file
  (broken target = Orphan).
- **Scope:** root `CLAUDE.md` is *outside* `src/`, so fix-mode **never edits it** — its findings are
  **report-only** for you to hand-fix. `src/README.md` + `src/CLAUDE.md` are in-scope (the `src/` writer).

## Output & mode

- **Report/draft (default):** proposes edits + a completeness-critic report; **writes nothing**, watermark
  untouched. Report-mode apply agents run as read-only `Explore` (physically can't write).
- **Fix (`args {mode:"fix"}`):** applies doc-only edits — **one writer per dir** (disjoint files), never
  code / tests / `package.json` / root `README` / `.claude/` / `process/` — then advances the watermark.
- **Out-of-`src/` findings (e.g. root `CLAUDE.md`):** surfaced in the report, never auto-edited even in
  fix mode — no writer owns them.

## Handoff (pairs with the agent)

Shares one watermark: `.claude/agents/state/doc-sync-watermark.txt`. A fix run advances it to `HEAD`, so
the incremental `doc-sync-auditor` agent maintains docs commit-to-commit from there. **Workflow = rare deep
sweep that seeds; agent = daily driver that maintains.**

## Workflow phases (implementation shape)

1. **Enumerate** (1 agent) — every non-test `.ts` + the doc-dirs.
2. **Detect** (fan out, read-only) — one agent per file + one per doc-dir (`Detect`) + one per cross-dir contract + one **interconnection** pass over the registration tables & cross-doc links (`Contracts`).
3. **Verify** — 3-lens adversarial check (majority vote) on each deduped finding; prunes false positives.
4. **Apply** — per dir, one writer (propose in report mode, edit in fix mode).
5. **Complete** — completeness critic ("what was missed?") + advance the watermark (fix mode only).

## Decisions / toggles (current defaults — flip by editing this doc)

- **Mode:** `report` (default) | `fix`. *Currently: report-only.*
- **`src/` coverage:** exhaustive, incl. untracked-but-not-ignored. *Currently: exhaustive.*
- **Report-mode safety:** apply agents forced to read-only `Explore`. *Currently: on.*
- **Verification:** 3-lens adversarial, majority vote. *Currently: 3 lenses.*
- **Interconnection pass:** registration tables (3 sites) + cross-doc links vs the live doc-dir set.
  *Currently: on.*
- **Root `CLAUDE.md` (out of `src/`):** report-only | writer-allowlisted. *Currently: report-only.*

## Maintenance

Edit this doc, then regenerate `doc-sync-full.js` from it. The `.js` should encode no policy the doc
doesn't state; the doc should describe no behaviour the `.js` doesn't implement. If they drift, this doc wins.
