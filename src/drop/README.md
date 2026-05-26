# src/drop/

Drag-and-drop import provider. When a user drags a file from the explorer onto a supported editor, this provider builds and offers an import snippet as a `DocumentDropEdit`.

## Files

| File | Export | What it does |
|------|--------|--------------|
| `provider.ts` | `AutoImportOnDropProvider` | Implements `DocumentDropEditProvider`; resolves the source path from `DataTransfer`, gates via `isPairSupported`, builds an import snippet via `snippets/dispatch.ts`, computes placement via `editor/placement.ts`, and returns a `DocumentDropEdit`. Returns `null` (no drop edit) for unsupported pairs. |
| `selector.ts` | `DROP_LANGUAGE_SELECTORS` | `DocumentSelector` covering all 12 supported destination languages with `scheme: 'file'`. |

## Registration

Registered in `src/extension.ts:activate` alongside the five commands:

```typescript
vscode.languages.registerDocumentDropEditProvider(DROP_LANGUAGE_SELECTORS, new AutoImportOnDropProvider())
```

## Where to add new code

- New drop-related provider or helper → here.
- New destination language → add a `{ language, scheme: 'file' }` entry in `selector.ts` in addition to the four-site sync (`types/`, `constants/`, `dispatch.ts`, `variants.ts`).

See [`CLAUDE.md`](CLAUDE.md) (this directory) for the full flow, unsupported-pair handling, and how the drop flow differs from the command flow.
