# src/drop/

Drag-and-drop import provider. When a user drags a file from the explorer onto a supported editor, this provider builds and offers an import snippet as a `DocumentDropEdit`.

## Files

| File | Export | What it does |
|------|--------|--------------|
| `provider.ts` | `AutoImportOnDropProvider` | Implements `DocumentDropEditProvider`; resolves the source path from `DataTransfer`, gates via `isPairSupported`, builds an import snippet via `snippets/dispatch.ts`, computes placement via `editor/placement.ts`, and returns a `DocumentDropEdit`. For same-file / unsupported / empty-snippet drops it returns a **suppressing empty edit** (`suppressDrop()`) so nothing is inserted; it returns `null` only when the dragged file can't be identified (ceding to VS Code's default drop). |
| `selector.ts` | `DROP_LANGUAGE_SELECTORS` | `DocumentSelector` covering all 12 supported destination languages with `scheme: 'file'`. |

## Registration

Registered in `src/extension.ts:activate` alongside the eight commands:

```typescript
vscode.languages.registerDocumentDropEditProvider(
  DROP_LANGUAGE_SELECTORS,
  new AutoImportOnDropProvider(),
  { dropMimeTypes: [ 'text/uri-list' ] },
)
```

The third argument restricts the provider to drops carrying a `text/uri-list` mime type (file drags from the Explorer), so it isn't invoked for plain-text drops.

## Where to add new code

- New drop-related provider or helper → here.
- New language ID for an existing file extension → add a `{ language, scheme: 'file' }` entry in `selector.ts` only. The four-site sync is keyed on the file extension (which already flows through `dispatch.ts`), so it needs no change.
- New file extension (e.g. `.rs`) → add the `{ language, scheme: 'file' }` entry in `selector.ts` (unless its language ID is already listed) in addition to the four-site sync (`types/`, `constants/`, `dispatch.ts`, `variants.ts`).

See [`CLAUDE.md`](CLAUDE.md) (this directory) for the full flow, unsupported-pair handling, and how the drop flow differs from the command flow.
