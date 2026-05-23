# Comment criteria

Rubric for what TSDoc, `CLAUDE.md` prose, and `README.md` narrative should say in this extension. **Living gate** — append to the decisions log (§8) when a new shape is settled; never frame as sealed.

This file sets both *what* the comments say and *where* they exist. The target shape: every file under `src/` has a module header; every exported function/type/interface property/constant with non-obvious WHY has TSDoc; private helpers and union-literal variants earn TSDoc only when they encode something the signature doesn't reveal. Pure-WHAT comments are absent — not deleted, but never written.

## §1 Scope

| Layer | Governed by this file |
|---|---|
| TSDoc on every file under `src/` | Yes |
| `CLAUDE.md` files (root + nested per directory) | Yes |
| `README.md` files (root + nested per directory) | Yes — for narrative prose, not link/badge sections |
| `package.json` descriptions | No (constrained by VS Code Marketplace) |
| `CHANGELOG.md` entries | No (constrained by Keep-a-Changelog) |
| Generated files (`dist/`, `out/`) | No |

## §2 The rubric

Apply to every comment, in order:

1. **Does the WHAT already come from the name, signature, or types?** If yes → either justify the comment with WHY, or skip the WHAT.
2. **Does removing this comment cost a future reader information?** If no → decorative.
3. **Does it explain a constraint, invariant, surprise, or coupling that doesn't show in code?** If yes → keep. This is the load-bearing case.
4. **Is the tone proportional to a ~1100-LOC VS Code utility?** If it reads like compiler internals or a Babel plugin spec → tone down.

A comment that passes all four is correct. A comment that fails (1) or (4) usually needs a rewrite, not a deletion — see §6 on house-style departures.

## §3 Reference points

Principles the rubric draws from. No version-pinned URLs (link-rot).

- **Google TypeScript Style Guide** — comments explain WHY. JSDoc covers public APIs and exported types. `@param` only when adding information beyond the type signature.
- **TSDoc spec** — `@param` / `@returns` are tool-aware. Narrative belongs in `@remarks`.
- **VS Code extension samples** (`microsoft/vscode-extension-samples`) — `activate()` typically has zero TSDoc or a one-liner. The extension entry point is not where the command surface gets enumerated.

## §4 Must do

- **Explain WHY for non-obvious decisions.** Examples in this repo worth their tokens: Angular index-1 PascalCase substitution (`snippets/typescript.ts:generateImportName`); the `./` prefix rule (`path/relative.ts:computeRelative`); SCSS partial-filename stripping (`snippets/scss.ts:normalizePartialFilename`); the `.css`-always-preserved-in-SCSS asymmetry (`snippets/scss.ts:determineScssExtension`).
- **Name silent-failure modes.** The `package.json` ↔ `_styles.ts` ↔ per-language `switch` sync (a typo silently returns the default style); the `importIndicators` marker list in `editor/insert-snippet.ts` (a new `import` syntax form silently lands at line 0).
- **Cite the test by name when defending a regression.** "Regression-tested by `<test-describe-string>`" — not by changelog version. Test names don't rot.
- **Flag hidden coupling explicitly.** `SCRIPT_FILE_EXTENSIONS` and `STYLESHEET_FILE_EXTENSIONS` in `constants/extensions.ts` are consumed by exactly one site (`editor/insert-snippet.ts:determineInsertionColumn`); say so.
- **Module-header TSDoc on every `src/` file** (blanket rule — see §6).
- **TSDoc on every exported function, type, interface property, and constant when WHY isn't in the signature** (blanket rule — see §6).

## §5 Must not do

- **Restate the function name in prose.** A TSDoc opening line that says "Activates the extension" above `function activate(...)` — the name already says it.
- **`@param` descriptions that restate the type.** `context - The extension context provided by VS Code` for `context: vscode.ExtensionContext` — the type already says it.
- **Editorialize feature size.** "Registers five commands" / "the eight-clause conjunction" / "the ten-marker list" / "nine notifications" — counting things turns a list into a named mechanism it isn't.
- **Cite changelog version numbers in source comments.** A TSDoc that says "Regression-tested per CHANGELOG 0.6.1" rots when CHANGELOG conventions change. Cite the test name.
- **Triple-document the same fact** across TSDoc + nested `CLAUDE.md` + root `CLAUDE.md`. Pick the layer closest to the code.
- **Use `{@link}` inside narrative prose.** Every rename forces a doc-only edit at every prose reference. Reserve `{@link}` for `@see` / `@returns` / `@param` where it's tool-aware.

## §6 House-style departures (kept deliberately)

Blanket rules that stay even when the rubric in §2 would otherwise flag them:

- Module-header TSDoc on every file under `src/`
- TSDoc on every exported function/type/interface property/constant whose WHY isn't already in the signature
- Nested `CLAUDE.md` + `README.md` per directory under `src/`
- Block comments only — no `//` line comments under `src/`

**Private helpers and union-literal variants are opt-in, not blanket.** A private helper earns TSDoc only when it encodes a non-obvious rule (`snippets/typescript.ts:generateImportName`'s Angular substitution, `snippets/scss.ts:normalizePartialFilename`'s partial-stripping). A union variant earns TSDoc only when it carries a hidden contract the type name and surrounding context don't reveal. A helper named `toUnixPath` whose body is `filePath.replace(/\\/g, '/')` does not earn one.

The rubric in §2 governs the *content* of every block — including the blanket ones above. A module-header that says "Snippet builders for Markdown destinations" passes; one that says "This file contains the snippet builders for Markdown destinations and serves as the primary integration point for the Markdown language module" fails §2(4) and gets trimmed.

## §7 Vocabulary to retire

Concrete replacements for framework-voice phrases currently in the repo.

| Replace | With | Rationale |
|---|---|---|
| "byte-exact contract" | "must match character-for-character" | Say it once at the canonical site (`src/config/CLAUDE.md`), not in every consuming file |
| "the eight-clause conjunction" | "the gating check" | Counting clauses names an `\|\|`-chain into a mechanism it isn't |
| "single source of truth" | name the function | Always a specific function — say which |
| "canonical list" / "canonical rejection ledger" | (delete the adjective) | Carries no information |
| "the heart of X" | (delete the phrase) | Editorial framing |
| "regression-tested per CHANGELOG 0.6.1" | "regression-tested by `<test-name>`" | Test names don't rot |
| "X-site sync rule" / "N-clause" | name the rule, don't number it | Counting is a tell |
| "the public surface of this directory is …" | name the file | Direct |
| "hidden coupling — touch with care" | "consumed by only `<file:function>`" | Name what's coupled |

## §8 Per-shape decisions log

Living table. Each row records a comment shape with a decision and a one-line rationale. Append when a new shape is settled.

| Shape | Decision | Rationale |
|---|---|---|
| `@param X - The X provided by Y` | bar | Restates the type |
| Restating the function name in TSDoc opening line | bar | Redundant with signature |
| Citing changelog version in source | bar | Rots; cite test name |
| Module-header TSDoc on every file | keep | Onboarding signal for visitors and contributors; mandated by §6 |
| TSDoc on private helpers | opt-in | Only when the helper encodes a non-obvious rule (Angular substitution, SCSS partial-stripping) |
| TSDoc on union-literal variants | opt-in | Only when a variant carries a hidden contract the type name doesn't reveal |
| `{@link}` inside narrative prose | bar | Drift hazard on rename |
| `{@link}` in `@see` / `@returns` / `@param` | allow | Tool-aware |
| Counting clauses / sites / markers in prose | bar | Framework-voice tell |
| Capital-letter rule names ("The ./ Prefix Rule") | tone-down | Lowercase narrative |
| `//` line comments under `src/` | bar | Existing house style — block-only |
| Triple-restatement across TSDoc + nested + root `CLAUDE.md` | bar | Pick the layer closest to code |
| Embedding code examples inside `@remarks` | allow | Examples earn their tokens |
| Cross-file TSDoc reference (`See @path/extension.ts:foo`) | allow | Path-style references survive renames better than `{@link}` in prose |

## §9 Rejection ledger

Considered and rejected, recorded so contributors don't re-litigate:

- **Auto-generated TSDoc from signatures** — captures WHAT, not WHY. WHY is the point of TSDoc here.
- **ESLint rule enforcing comment shape** — too lax to matter or too strict to apply at this scale. Manual review is the gate.
- **Blanket TSDoc on every private/internal helper** — produces pure-WHAT comments on mechanical helpers (`toUnixPath`, `areFilesInSameDirectory`) that fail §2(4). Opt-in per §6 instead — only helpers that encode a non-obvious rule earn TSDoc.
- **Collapsing nested `CLAUDE.md` into a single root file** — per-directory invariants stay close to the code they govern.
- **Removing all `{@link}` references** — allowed in tool-aware tags. Only barred from narrative prose.
- **Single-line `//` comments for short remarks** — break the block-only house style. If a comment is short enough to fit on one line, write it as `/** ... */` anyway.

## §10 Worked examples

Five verdicts illustrating the policy in §§2 + 6.

### Keep — model module header for a small file

For `src/path/relative.ts` (currently has no header):

```ts
/**
 * Computes the import-ready relative path from `destination`'s directory to
 * `source`. Returns a Unix-style path with the file extension stripped.
 *
 * Pure — no `vscode` import; Node-testable.
 */
```

Three short lines. Names the role; flags the testability invariant. Passes §2 — every clause carries information a reader couldn't recover from a directory listing.

### Keep — model exported-symbol TSDoc when WHY isn't in the signature

For `computeRelative(sourceFilePath, destinationFilePath)`:

```ts
/**
 * Adds `./` when the two files share a directory or when `path.relative`
 * produced a result that doesn't already start with `.` (covers absolute →
 * relative edges where the raw result would be `'foo'` not `'./foo'`).
 *
 * Regression-tested by `extension.test.ts > computeRelative > same-directory prefix`.
 */
```

No `@param` lines — the signature is self-describing. The `./` prefix rule is the non-obvious WHY. Test cited by name (§4), not by changelog version (§5).

### Keep — `snippets/typescript.ts:generateImportName` TSDoc (already in repo)

The Angular `.component` / `.directive` / `.pipe` / `.service` / `.module` filename convention drives a PascalCase substitution that nothing else in the codebase signals. The TSDoc is the only mechanism that explains why `app-root.component.ts` becomes `{ AppRootComponent }`. §2(3) load-bearing — keep as-is when Pass-B runs.

### Skip — private helper that does NOT earn TSDoc

`src/path/relative.ts:toUnixPath`:

```ts
function toUnixPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}
```

One-line body, mechanical, name says it. Adding TSDoc here would fail §2(4) — the tone would be disproportionate. Same call for `areFilesInSameDirectory` in the same file.

### Skip — union-literal variants that do NOT each earn TSDoc

`src/types/notification.ts:NotificationType` has nine variants. The variant names are self-describing (`'same-file-path'`, `'no-active-editor'`, etc.); the per-variant message contracts live in `src/editor/notification.ts:showNotification`'s overload signatures and in `src/types/CLAUDE.md`'s "`notification.ts` — `NotificationType`" section. Per-variant TSDoc would triple-document and fail §5 ("Triple-document the same fact"). Skip.

## §11 Amending this file

Three rules:

1. **A new shape gets a row in §8**, with a one-line rationale.
2. **A retired phrase gets a row in §7.**
3. **A considered-and-rejected approach gets a row in §9.**

This document is the gate, not the spec. The gate moves as decisions are made.

## §12 Retroactive application

Commit `02b8030` retroactively stripped pure-WHAT TSDoc from `src/` against an earlier draft of this criteria, leaving `src/` near-zero on TSDoc coverage pending a reapplication pass. Subsequent comment-shape passes follow the same stepped pattern: one commit per file or per logical group, plan-mode approval per step, with literal Before / After previews of every doc edit.
