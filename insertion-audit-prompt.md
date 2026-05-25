Audit `src/editor/insert-snippet.ts` end-to-end for correctness. I need to be confident that every function in this file produces the right result 100% of the time, across every reachable combination of destination type, source type, placement mode, and document state.

Read `src/editor/CLAUDE.md` and the root `CLAUDE.md` first for architecture context.

Start from the public entry point `insertImportSnippet` and trace every branch:

1. **The `snippet.appendText('\n')` on entry** — is this always correct? What about consecutive pastes, files with/without trailing newlines, interaction with the snippet content itself?

2. **The precedence chain** (`shouldRepositionCursor` → `shouldUseAstroFrontmatter` → placement switch → default fallback):
   - `shouldRepositionCursor` — verify the three conditions are correct and complete for every source/destination pair. Are there cases it forces cursor that shouldn't be? Cases it misses that should be forced?
   - `shouldUseAstroFrontmatter` — verify the Astro intercept is in the right position in the chain.
   - The `default:` fallback in the placement switch — is falling through to cursor the right choice?

3. **Each placement function** (`insertSnippetAtTop`, `insertSnippetAtBottom`, `insertSnippetAtCursor`, `insertSnippetAtPosition`):
   - Correct line for every destination type that can reach it (check which destinations are intercepted by overrides vs. which fall through)
   - Correct column via `determineInsertionColumn` for every destination type

4. **`IMPORT_INDICATORS`** — accuracy and completeness:
   - Does every indicator match real import syntax and only real import syntax?
   - Are any indicators dead (never match real code)?
   - Are any real import patterns missing?
   - How does the matching behave with multi-line imports, commented-out imports, dynamic requires inside function bodies?

5. **The Astro frontmatter handler** (`insertSnippetAtAstroFrontmatter`, `findAstroFrontmatterBounds`, `findAstroBottomLine`):
   - What happens with malformed frontmatter, missing fences, `---` appearing in non-frontmatter contexts?
   - Cursor placement when cursor is outside the fences
   - Bottom placement within frontmatter — same indicator concerns as the main Bottom function

6. **SFC destinations (Vue/Svelte)** — do they have equivalent section awareness, or do they fall through to generic Top/Bottom/Cursor that doesn't know about `<script>` boundaries?

7. **Clipboard re-reads in the async path** — `shouldRepositionCursor()` and `shouldUseAstroFrontmatter()` both await `getFilePathInfo()` which re-reads the clipboard. Two separate reads happen before any insertion. Can the clipboard change between them, causing the override decision to be based on stale data?

8. **`editor.insertSnippet` return value** — it returns `Thenable<boolean>` indicating success/failure. Currently discarded. Is silent failure acceptable, or should it be handled?

Stress-test against:
- Every destination file type (JS/TS/JSX/TSX/MDX/CSS/SCSS/HTML/MD/Vue/Svelte/Astro)
- Every placement mode (Top/Bottom/Cursor) plus forced overrides
- Document shapes: empty, single-line imports, multi-line imports, mixed code below imports, SFC with `<script>` not at line 0, files starting with shebangs or directives
- Consecutive paste operations (does the first insert shift lines in a way that breaks a second insert?)

Prioritize by real-world impact: issues that produce wrong insertion positions in common scenarios first, edge cases in rare document shapes last.

## Workflow

Do NOT fix anything yet. First, present your complete findings as a categorized list — each finding should state: what's wrong, a concrete example that triggers it, and how often it would hit a real user. Wait for my approval before proceeding to fixes.

For fixes, work in steps: present the planned change for one fix category, get my approval, implement it, run `npm run compile` to verify, then commit. One commit per fix category. After all fixes, update `src/test/manual-qa/13-settings-placement.md` to cover any new edge cases added.
