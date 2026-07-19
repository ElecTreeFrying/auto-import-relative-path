# src/CLAUDE.md

Source root for the extension. The codebase is layered by responsibility, with strict directional dependencies enforced by convention (no tooling).

## Layered architecture

```
extension.ts                 # entry: activate/deactivate
gating.ts                    # shared isPairSupported() — pair check. An extensionless source (LICENSE/Dockerfile/Makefile) imports only into .md (a link); otherwise only the CROSS_IMPORT_DESTINATIONS (.html/.md/.css/.scss/.tsx/.mdx/.jsx/.vue/.svelte/.astro/.tex) accept a cross-extension source; every other destination (.js/.ts) accepts same-extension imports only. Of these, .jsx/.tsx/.mdx accept any source; .html/.md/.css/.scss/.vue/.svelte/.astro/.tex carry per-destination source allow-lists
├── commands/                # public command surface
├── drop/                    # DocumentDropEditProvider (drag-from-Explorer imports)
├── editor/                  # vscode-API helpers (clipboard, snippets, notification, placement)
├── snippets/                # per-language snippet builders + dispatch
├── path/                    # pure path math (no `vscode` import)
├── config/                  # workspace-config access
├── constants/               # runtime gating tables
├── types/                   # cross-cutting type unions
└── test/                    # Mocha tests
```

**Allowed dependency direction (lower never imports higher):**

- `commands → gating, editor, snippets, config, constants, types`
- `drop → gating, editor, snippets, constants, types`
- `gating → editor, constants, types`
- `snippets → config, path, editor, types, constants`
- `editor → config, path, constants, types`
- `path → types`
- `constants → types`

`types` is the zero-import leaf; `config` imports only `vscode`; `constants` imports only `types/` (the `FileExtension` union it mirrors at runtime).

## Conventions for new source files

- **Place by responsibility, not by file type.** Pure functions go in `path/`; vscode-API helpers in `editor/`; snippet builders in `snippets/`. Don't create a `utils/` directory.
- **Naming.** Files use noun-only kebab-case (`relative-path.ts`, `file-path-info.ts`). Don't reintroduce suffixes like `.command.ts`, `.util.ts`, `-fn.ts`, `.types.ts`, `.enums.ts`, `.interface.ts` — the parent directory carries the kind signal.
- **Internal modules.** A leading underscore (`_styles.ts`, `_react.ts`) marks a directory-internal module; importing one from outside its directory is a smell.
- **Barrels are avoided.** `commands/index.ts` is the deliberate exception; other directories use direct imports so dependency direction stays visible at every call site.
- **TSDoc invariant.** New modules, exported functions, types, interface properties, and constants must have TSDoc. `snippets/_class-name.ts` and `editor/insert-snippet.ts` (private helpers) are the reference for style.
- **No `vscode` import in `path/` or `types/`.** Those layers stay Node-testable.

## Per-directory invariants

See each directory's `CLAUDE.md` for the deep rules:

| Directory | What it owns | Key invariant |
|-----------|--------------|---------------|
| `commands/` | The registered commands | Clipboard is the data channel; failure paths return void, never throw |
| `drop/` | DocumentDropEditProvider | Same gating as commands (`isPairSupported`); same snippet pipeline; placement via `computeImportPlacement` |
| `editor/` | vscode-API helpers | Inline insertion for non-stylesheet → stylesheet (`url()` at exact cursor, no `\n`); forced-cursor for HTML/MD/LaTeX; Astro frontmatter constrains to `---` fences; Vue/Svelte constrains to `<script>` block |
| `snippets/` | Per-language builders + dispatch | Style `description` strings are byte-exact contracts with `package.json` enums |
| `path/` | Pure path math | No `vscode` import; `./` prefix rule is regression-tested |
| `config/` | Workspace config | Three-site byte-exact sync (`package.json` ↔ `_styles.ts` ↔ per-language `switch`) |
| `constants/` | Gating tables | Runtime mirror of `types/file-extension.ts`; the `as FileExtension` cast at boundaries is erased |
| `types/` | Type unions (no enums) | Adding/removing an extension is the four-site extension sync (this dir + `constants/` + `snippets/dispatch.ts` + `snippets/variants.ts`) |
| `test/` | Mocha BDD tests | Run from `out/` (compile-tests, NOT esbuild) |
