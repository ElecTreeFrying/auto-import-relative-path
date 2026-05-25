# qa/checklists/CLAUDE.md

Sequential markdown checklists driving the human manual-QA pass before each release. Pure documentation — no executable code, no compilation surface, no test runner picks up anything here.

## Files

20 markdown files, flat directory:

| File(s) | Role |
|---------|------|
| `README.md` | Driver: run-order table, fixture-purpose table, settings-under-test list, "skip these" non-bug catalogue, master sign-off matrix |
| `00-setup.md` | Pre-test: F5 the Extension Development Host, open `../workspace/` as a folder. Not numbered in the run sequence |
| `01-sanity-and-keybindings.md` | Extension activation; five-command palette presence; three keybindings |
| `02-bug-fix-verification.md` | **Priority 1** — current-session bug fixes; re-runs every session that lands a fix |
| `03-copy-command.md` | `extension.copyFilePath` round-trip + `copy-success` toast buttons |
| `04-paste-into-javascript.md` … `11-paste-into-markdown.md` | One per destination extension (`.js`, `.ts`, `.jsx`, `.tsx`, `.css`, `.scss`, `.html`, `.md`) |
| `12-auto-command.md` | `extension.copyPaste` (alt+d): sequential copy→paste, race stress, copy-fail short-circuit |
| `13-settings-placement.md` | `importStatementPlacement` + the inline-snippet override + the 2 forced-cursor overrides + Astro frontmatter + SFC script block + the 9 Bottom-marker indicators |
| `14-settings-preserve-extension.md` | `preserve{Script,Stylesheet}FileExtension` + the `.css → .scss` asymmetry |
| `15-gating-and-rejection.md` | 11-clause gating conjunction + 8 of 10 notification variants (remaining 2 in `18`) |
| `16-path-computation.md` | `./` prefix rule (CHANGELOG 0.6.1), `../`, partial `_` stripping, spaces, unicode |
| `17-edge-cases-and-regression.md` | Degenerate files, multi-root, multi-cursor, stress, regression re-checks |
| `18-style-pickers.md` | `extension.pasteImportWithStyle` + `extension.setDefaultImportStyle` picker UX, persistence, hardcoded-destination rejection |

## Read the named file, not the tree

Most edits here touch exactly one checklist. **Read `README.md` first** — its run-order and fixture-purpose tables identify the file you need with one read. Then read only that file. The other checklists are 1–2k lines of human-readable prose each; grepping or surveying the tree is a token sink with no machine-relevant signal.

Sibling `workspace/` is also off-limits for routine reads — see its own `CLAUDE.md` for the "DO NOT scan" rule.

## Checklist anatomy — keep this shape when adding or editing

Every numbered file (`01-…` onward) follows the same skeleton:

1. `# NN — Topic` heading (digits must match the filename)
2. **Why** — 1–2 sentences naming the code paths under test, cross-referencing the source file (`src/commands/<name>.ts`, `src/snippets/<name>.ts`, `src/editor/insert-snippet.ts`, etc.)
3. **Prerequisites** — earlier checklists that must pass first (at minimum `00-setup.md` and `01-sanity-and-keybindings.md`)
4. **Setup** — setting toggles (`Cmd/Ctrl+,`), fixture preparation
5. **Test steps** — numbered `- [ ]` checkboxes; each step states the action, the byte-exact expected snippet/toast, and the source-of-truth file
6. **Known limitations** — documented intentional non-bugs (mirrors `README.md`'s "Skip these" section if relevant)
7. **Per-file sign-off** — single `- [ ]` before the tester returns to the master matrix

## Cross-file invariants — drift breaks tests silently

- **Notification text is byte-exact with `src/editor/notification.ts`.** Every toast string a checklist quotes must match the constant character-for-character — `Auto Import:` prefix, parameter interpolations (`${sourceExt}`, `${destinationExt}`, `${basename}`), trailing punctuation. `15-gating-and-rejection.md` is the canonical reference; the same strings recur in `02`, `03`, `11`, `12`, `18`. When `notification.ts` changes, grep `qa/checklists/` for the old string and update every occurrence — also bump the variant count in `README.md` "Why this exists" if the total changed.
- **"Settings under test" in `README.md:72–91` mirrors `package.json:contributes.configuration.properties` exactly.** Adding or renaming a setting requires updating the README list and every checklist that exercises it (typically `04`, `05`, `08`, `09`, `13`, `14`, `18`).
- **Enum `description` strings in `package.json` are byte-exact contracts** with `src/snippets/_styles.ts` *and* with what `18-style-pickers.md` quotes as expected picker labels and persisted-setting templates, and what `04–11` quote as expected emitted snippet shapes. A drift here fails no automated test — only a human running the checklist catches it.
- **Fixture filenames are locked.** The 37 baseline names in `../workspace/README.md` ("Maintenance notes") are referenced literally by checklists. Renaming a baseline file produces a silent ghost reference — the tester pastes against a *different* file and the test still appears to pass. Add new fixtures alongside instead.
- **File numbers grow monotonically.** Never re-number an existing checklist. The master sign-off matrix and run-order table reference the integer, and partial sign-offs from prior testers would become ambiguous. Insert at the next free integer (current high-water mark: `18`).

## Adding a new checklist

1. Pick the next free integer. Filename `NN-descriptive-kebab-case.md` (noun-only kebab-case, matching the project naming convention from `src/CLAUDE.md`).
2. Write the file following "Checklist anatomy" above.
3. Update `README.md` in three places:
   - **"Run order"** table — add the row in numeric order with a one-line "Why".
   - **"Files purpose-built for specific tests"** table — list any new fixtures and the test number that consumes them.
   - **"Master sign-off"** — append `- [ ] NN — Topic`.
4. If the checklist needs new fixtures, add them to `../workspace/` *and* to that workspace's `README.md` "Maintenance notes" (renaming-protection).
5. Cross-reference the source file(s) the checklist verifies in the **Why** section — future readers should trace from test to implementation without grepping.

## Updating existing checklists by change category

- **Notification text changed in `src/editor/notification.ts`** → grep `qa/checklists/` for the old string; update everywhere it appears. If the total notification count changed, bump it in `README.md` "Why this exists".
- **Setting renamed or added in `package.json`** → update `README.md:72–91`, then the per-destination checklist (`04–11`) and settings checklists (`13`, `14`, `18`) that exercise it.
- **New session bug fixed** → add a `Bug #N` sub-section in `02-bug-fix-verification.md` (full end-to-end verification) *and* a re-check stanza in `17-edge-cases-and-regression.md` under "Regression — current-session fixes".
- **CHANGELOG-pinned regression (like 0.6.1's `./` prefix)** → add a stanza in `17-edge-cases-and-regression.md` under "Regression — pinned", keyed by the CHANGELOG version.

## Workspace pairing

This directory is one half of a pair; the other half is the fixture workspace.

| Sibling | Role |
|---------|------|
| `checklists/` (this dir) | Procedure — 18 sequential checklists, `00-setup.md`, master sign-off matrix |
| `../workspace/` | Fixtures — ~174 files opened as a folder in the EDH so the procedure has something to paste between |

The two are coupled at the literal filename level: `04-paste-into-javascript.md` says "copy `src/foo.ts`" and means `../workspace/src/foo.ts`. The workspace is excluded from linting — `eslint.config.mjs:ignores` lists `qa/workspace/**`. It falls outside `tsconfig.json`'s `include` glob (`src/**/*`), so tsc never sees it either. Don't lift those exclusions; fixtures intentionally `import` packages that aren't installed and use DOM globals not in `lib`.
