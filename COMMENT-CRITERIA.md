# Comment criteria

Rubric for what TSDoc, `CLAUDE.md` prose, and `README.md` narrative should say in this extension. **Living gate** — append to the decisions log (§8) when a new shape is settled; never frame as sealed.

This file does **not** override `src/CLAUDE.md`'s standing rule that every module / exported function / type / interface property / constant has TSDoc. Coverage stays at 100%. What this file settles is *what those comments say*.

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
- **Module-header TSDoc on every `src/` file** (existing rule).
- **TSDoc on every exported function, type, interface property, and constant** (existing rule).

## §5 Must not do

- **Restate the function name in prose.** "Activates the extension" on a function named `activate` is the canonical case (`src/extension.ts:26`).
- **`@param` descriptions that restate the type.** `context - The extension context provided by VS Code` on `context: vscode.ExtensionContext` is the canonical case (`src/extension.ts:24`).
- **Editorialize feature size.** "Registers five commands" / "the eight-clause conjunction" / "the ten-marker list" / "nine notifications" — counting things turns a list into a named mechanism it isn't.
- **Cite changelog version numbers in source comments.** "Regression-tested per CHANGELOG 0.6.1" (currently in `path/relative.ts` and `path/extension.ts`) rots when CHANGELOG conventions change. Cite the test name.
- **Triple-document the same fact** across TSDoc + nested `CLAUDE.md` + root `CLAUDE.md`. Pick the layer closest to the code. The Bottom-placement marker list is currently in `insert-snippet.ts` TSDoc, in `src/editor/CLAUDE.md`, and in root `CLAUDE.md`; three sites to update on every change.
- **Use `{@link}` inside narrative prose.** Every rename forces a doc-only edit at every prose reference. Reserve `{@link}` for `@see` / `@returns` / `@param` where it's tool-aware.

## §6 House-style departures (kept deliberately)

These stay even when they look pure-WHAT to the rubric in §2 — the file-level symmetry is the point:

- Module-header TSDoc on every file
- TSDoc on every exported function/type/interface property/constant
- TSDoc on every private/internal helper (e.g. `path/relative.ts:toUnixPath`, `path/relative.ts:areFilesInSameDirectory`)
- TSDoc on every union-literal variant (e.g. `types/notification.ts:NotificationType`'s nine variants)
- Nested `CLAUDE.md` + `README.md` per directory under `src/`
- Block comments only — no `//` line comments under `src/`

The rubric in §2 governs the *content* of these blocks, not their existence. A TSDoc on a private helper that says "Replaces every backslash with a forward slash" passes house style; one that says "Standardises path separators to ensure cross-platform compatibility for downstream consumers" fails §2(4) and gets trimmed.

## §7 Vocabulary to retire

Concrete replacements for framework-voice phrases currently in the repo.

| Replace | With | Rationale |
|---|---|---|
| "byte-exact contract" | "must match character-for-character" | Say it once at the canonical site (`config/settings.ts`), not in every consuming file |
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
| Module-header TSDoc on every file | keep | Existing rule; onboarding |
| TSDoc on private helpers | keep | Symmetry |
| TSDoc on union-literal variants | keep | Symmetry |
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
- **Stripping TSDoc from internal / private helpers** — breaks file-level symmetry. House-style departure stays.
- **Collapsing nested `CLAUDE.md` into a single root file** — per-directory invariants stay close to the code they govern.
- **Removing all `{@link}` references** — allowed in tool-aware tags. Only barred from narrative prose.
- **Single-line `//` comments for short remarks** — break the block-only house style. If a comment is short enough to fit on one line, write it as `/** ... */` anyway.

## §10 Worked examples

Five existing-comment verdicts, applying the rubric.

### Keep — `src/extension.ts:36`

```ts
/** No-op — the extension holds no resources to release. */
export function deactivate(): void {
}
```

§2(2) — removing it would let a reader wonder if cleanup was forgotten. Answers WHY for an empty body in six words. Model for the project.

### Keep — `src/snippets/typescript.ts:generateImportName` TSDoc

The Angular `.component` / `.directive` / `.pipe` / `.service` / `.module` filename convention drives a PascalCase substitution that nothing else in the codebase signals. Removing the TSDoc would leave a string-includes chain that looks arbitrary. §2(3) load-bearing.

### Fix — `src/extension.ts:10-25` (`activate` TSDoc)

Fails §2(1) (restates the function name) and §2(4) (enumerates a command surface that's already visible in the six-line body). Tone-down or delete. The two genuinely-non-obvious commands (`pasteImportWithStyle`, `setDefaultImportStyle`) are already documented in their own files.

### Fix — `src/commands/paste-import.ts:1-33` module header

The "eight-clause conjunction" framing fails §5 (editorializing feature size). The clauses themselves are real and worth listing, but call the structure "the gating check" — counting clauses turns an `||`-chain into a Named Mechanism it doesn't need to be. Reduce to ~10 lines listing the gating tables referenced.

### Mixed — `src/path/relative.ts:1-21` module header

The `./` prefix rule explanation passes §2(3) — real edge case, real algorithm. **Keep that.** The "regression-tested per CHANGELOG 0.6.1" line fails §5 — replace with the test's `describe` string from `src/test/extension.test.ts`. The "Cross-platform" subhead is fine. The "Same-directory check is case-insensitive" subhead is also fine — both explain decisions a reader couldn't recover from the code.

## §11 Amending this file

Three rules:

1. **A new shape gets a row in §8**, with a one-line rationale.
2. **A retired phrase gets a row in §7.**
3. **A considered-and-rejected approach gets a row in §9.**

This document is the gate, not the spec. The gate moves as decisions are made.

## §12 Retroactive application

This file does not retroactively edit existing comments. A cleanup pass against existing TSDoc / `CLAUDE.md` / `README.md` content is a separate stepped effort — one commit per file or per logical group, plan-mode approval per step.
