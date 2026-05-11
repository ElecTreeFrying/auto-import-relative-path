# src/CLAUDE.md

Source root for the extension. The codebase is layered by responsibility, with strict directional dependencies enforced by convention (no tooling).

## Layered architecture

```
extension.ts                 # entry: activate/deactivate
├── commands/                # public command surface (5 commands)
├── editor/                  # vscode-API helpers (clipboard, snippets, notification)
├── snippets/                # per-language snippet builders + dispatch
├── path/                    # pure path math (no `vscode` import)
├── config/                  # workspace-config access
├── constants/               # runtime gating tables
├── types/                   # cross-cutting type unions
└── test/                    # Mocha tests
```

**Allowed dependency direction (lower never imports higher):**

- `commands → editor, snippets, constants, types`
- `snippets → config, path, editor, types, constants`
- `editor → config, path, constants, types`
- `path → types`

`config`, `constants`, `types` are leaves — they import only from `vscode` (config) or nothing project-internal.

## Conventions for new source files

- **Place by responsibility, not by file type.** Pure functions go in `path/`; vscode-API helpers in `editor/`; snippet builders in `snippets/`. Don't create a `utils/` directory.
- **Naming.** Files use noun-only kebab-case (`relative-path.ts`, `file-path-info.ts`). Don't reintroduce suffixes like `.command.ts`, `.util.ts`, `-fn.ts`, `.types.ts`, `.enums.ts`, `.interface.ts` — the parent directory carries the kind signal.
- **Internal modules.** A leading underscore (`_styles.ts`, `_shared.ts`) marks a directory-internal module; importing one from outside its directory is a smell.
- **The only barrel.** `commands/index.ts` is the only re-export-only file. Other directories use direct imports so dependency direction stays visible at every call site.
- **TSDoc invariant.** Every module, exported function, type, interface property, and constant has TSDoc. New files must follow.
- **No `vscode` import in `path/` or `types/`.** Those layers stay Node-testable.

## Per-directory invariants

See each directory's `CLAUDE.md` for the deep rules:

| Directory | What it owns | Key invariant |
|-----------|--------------|---------------|
| `commands/` | The five registered commands | Clipboard is the data channel; failure paths return void, never throw |
| `editor/` | vscode-API helpers | Forced-cursor placement overrides the user setting for HTML/MD/non-stylesheet → stylesheet |
| `snippets/` | Per-language builders + dispatch | Style `description` strings are byte-exact contracts with `package.json` enums |
| `path/` | Pure path math | No `vscode` import; `./` prefix rule is regression-tested |
| `config/` | Workspace config | Three-site byte-exact sync (`package.json` ↔ `_styles.ts` ↔ per-language `switch`) |
| `constants/` | Gating tables | Runtime mirror of `types/file-extension.ts`; the `as FileExtension` cast at boundaries is erased |
| `types/` | Type unions (no enums) | Adding/removing an extension is a 3-site sync (this dir + `constants/` + `snippets/`) |
| `test/` | Mocha BDD tests | Run from `out/` (compile-tests, NOT esbuild) |
