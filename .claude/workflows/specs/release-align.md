# Release Alignment Workflow — Spec

> **This Markdown is the source of truth.** The implementation lives in `release-align.js`
> (generated from this doc). To change the workflow's behaviour, edit *this file first*, then
> regenerate the script from it. Both files are under `.claude/` → local-only (gitignored).

## Purpose

A pre-release consistency gate. Before publishing, prove that every top-level file matches what the
code in `src/` actually does — with the **spec** and the **front page** held to the highest bar —
and that the packaged VSIX ships exactly the right files. **Report/draft only by default** — it
proposes fixes; you review and apply.

When to run: before a release, or any time you want to check drift. Day-to-day per-commit doc upkeep
is the separate incremental `doc-sync-auditor` agent's job; this is the whole-product release sweep.

## Ground truth

The single source of truth is **`package.json` (its `contributes`) + `src/`**. The workflow derives a
**complete inventory** from these once, and every other file is checked against that one inventory — so
cross-file consistency falls out automatically (if all files match the inventory, they match each other).

**Coverage is exhaustive: every non-test `.ts` file under `src/` is read** (not just the surface-defining
ones). The point is a full *behaviour* inventory, not only the declared surface — so the workflow catches
**gaps** (a user-facing behaviour that exists in code but is documented nowhere), not just stale/wrong
claims. Files with no user-facing effect are noted as internal and not forced into the docs.

Baseline for "what's new this release" = the latest release **git tag** (`git describe --tags
--abbrev=0`, e.g. `v0.6.1`), never `package.json`'s `version` (it can lag — currently `0.6.1` while
the changelog targets `1.0.0`).

### Canonical invariants to derive + assert everywhere
- **5 commands** — `extension.copyFilePath`, `pasteImport`, `copyPaste`, `pasteImportWithStyle`, `setDefaultImportStyle`
- **16 settings** — the `auto-import.*` configuration keys (+ their enum values)
- **12 destination languages** — `onLanguage:*` events ↔ drop selectors ↔ dispatch
- **3 keybindings** — `cmd/ctrl+shift+a`, `cmd/ctrl+i`, `alt+d`
- **1 drop provider**
- **engine** `^1.115.0`
- **"35 extensions / 15 categories"** claims
- **version reconcile** — `package.json` vs the `CHANGELOG` Unreleased heading must agree at publish

## Scope — files & emphasis tiers

### ⭐ Tier 1 — highest emphasis (full claim-by-claim sweep + adversarial verification of each finding)
| File | Why |
|---|---|
| `SPEC.md` | The authoritative spec of the entire extension — the contract. |
| `README.md` | Front page **everywhere** (Marketplace, Open VSX, GitHub); ships in the VSIX. |

### Standard tier (count + key-claim check)
| File | What "aligned" means |
|---|---|
| `package.json` | The source of truth — *and* self-checked: every declared command/setting/activation is actually registered/read in `src/` (nothing declared-but-dead, nothing in-code-but-undeclared). |
| `SUPPORT.md` | Supported pairs, FAQ, "how to add" match reality. (GitHub-only; excluded from VSIX.) |
| `CLAUDE.md` (root) | Architecture, command list, counts, sync rules accurate. Overlaps the `doc-sync-full` tool — acceptable. |
| `CHANGELOG.md` | Two-state handling — see below. |

### Out of scope
- `.gitignore` — explicitly excluded.

## CHANGELOG — must work in BOTH states (auto-detect)

- **State 1 — no Unreleased section yet:** generate one from scratch (triage commits since the last
  tag → `feat`/`fix`/`perf` + breaking → read diffs → group Breaking/Added/Changed/Fixed).
- **State 2 — an Unreleased section already exists** (e.g. today's `[1.0.0] - Unreleased`): verify its
  entries against `src/` + commits, **merge in anything missing idempotently** (never duplicate), flag
  stale/inaccurate bullets.
- Either state: never touch published version sections; version number + date are set at publish.
- **Reuse, don't reimplement:** this is exactly the logic in the **`changelog-drafter` agent**. The
  workflow's changelog step **dispatches that agent** so the two-state logic lives in one place and
  can't drift. In report mode, dispatch it with a *propose-only* instruction (output the draft/merge,
  don't write); in fix mode, let it write the Unreleased section.

## `.vscodeignore` — packaging-correctness audit (a different kind of check)

Not "match `src/`" but "does the VSIX ship exactly what it should?"
- **Must ship:** `dist/` (the esbuild bundle), `README.md`, `CHANGELOG.md`, `LICENSE.md`,
  `package.json`, and README-referenced assets.
- **Must NOT ship:** `src/`, `out/`, tests, `qa*/`, `process/`, `.claude/`, build configs
  (`tsconfig.json`, `esbuild.js`, `eslint.config.mjs`, `.vscode-test.*`), `*.ts`/`*.map`, and the
  GitHub-only docs (`SPEC.md`, `SUPPORT.md`, `CLAUDE.md`).
- Flag anything currently included that shouldn't ship, or excluded that should (the user's stated
  worry: "I might add something that shouldn't be there").
- **Verify against reality, not the file text:** run `npx @vscode/vsce ls` (read-only) to list what
  would actually be packaged, then diff against the policy above. (Never touch `process/`, where the
  real publish flow lives.)

## Double-check the rest of root (light finalization sweep)

`LICENSE.md`, `tsconfig.json`, `esbuild.js`, `eslint.config.mjs`, `.vscode-test.mjs`,
`package-lock.json` — scan for anything stale, wrong, or misplaced before shipping (e.g. correct
license/year, sane build config, lockfile in sync with `package.json`).

## Output & mode

- **Report/draft only (default).** Produces one consolidated report grouped by file: each finding with
  severity, the doc claim, the reality in code, and a proposed fix; plus the `.vscodeignore` verdict,
  the version-reconcile callout, and the changelog draft/merge proposal. **Writes nothing.**
- `package.json` is **never** auto-edited under any mode.
- Fix mode (opt-in) may apply doc edits to the doc files only; the changelog step writes its Unreleased
  section; still never `package.json`, never published changelog versions, never code.

## Proposed workflow phases (implementation shape for `release-align.js`)

1. **Derive ground truth — exhaustively** (fan out, 1 agent per `src/` file):
   - **1a. Enumerate** every non-test `.ts` under `src/` (`git ls-files`; skip `src/test/**` and `*.test.ts`).
   - **1b. Extract per file** — one agent per file reports the user-facing surface/behaviour it contributes
     (commands registered, settings read, languages/pairs gated, notable behaviours + edge cases), and
     flags internal-only files as "no user-facing surface."
   - **1c. Synthesize** those + `package.json.contributes` into ONE complete inventory (invariant counts +
     a behaviour catalogue) and emit `package.json` self-check findings (declared-but-dead /
     in-code-but-undeclared). This complete inventory is what every doc is checked against — so
     gap-detection (behaviour present in code, absent from a doc) is airtight.
2. **Per-file alignment** (fan out, 1 agent per doc) — each checks its file against the canonical
   inventory. **Tier-1 (`SPEC`, `README`)** → claim-by-claim sweep. **Standard** → counts + key claims.
   Cross-file consistency is automatic (shared inventory).
3. **Changelog** — dispatch the `changelog-drafter` agent (propose-only in report mode).
4. **`.vscodeignore` audit** (1 agent) — run `vsce ls`, diff against the ship/don't-ship policy.
5. **Root sweep** (1 agent) — the remaining root files.
6. **Verify + synthesize** — adversarially verify Tier-1 findings; assemble the single consolidated
   report. (No writes in report mode.)

## Decisions / toggles (current defaults — flip by editing this doc)

- **Mode:** `report` (default) | `fix`. *Currently: report-only.*
- **`vsce ls` for the packaging audit:** allowed (read-only). *Currently: yes.*
- **`src/` coverage:** **exhaustive** — every non-test `.ts` file is read (full behaviour inventory, catches gaps). *Currently: exhaustive. Switch to "surface files only" here for a cheaper claim-driven run.*
- **Tier-1 files:** `SPEC.md`, `README.md`. *(Add/remove here to change emphasis.)*
- **Changelog engine:** reuse `changelog-drafter` agent (do not reimplement).

## Maintenance

Edit this doc, then regenerate `release-align.js` from it. The `.js` should contain no policy the doc
doesn't state; the doc should describe no behaviour the `.js` doesn't implement. If they drift, this
doc wins.
