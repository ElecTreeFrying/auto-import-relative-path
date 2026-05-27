# qa.new/workspace/general/

Fixtures for the cross-destination general checklist ([`checklists/general.md`](../../checklists/general.md)).

## Layout

```
general/
├── source.ts                      Default source file to copy
├── destination.ts                 Default destination to paste into
├── Makefile                       No file extension — rejection test
├── unsupported.js                 Unsupported-pair source (.js → .ts)
├── fixed-source.css               Fixed-style source (.css → .html)
├── fixed-destination.html         Fixed-style destination
├── components/
│   └── child.ts                   Child-dir and parent-dir path computation
└── edge-cases/
    ├── komponent-日本語.ts          Unicode characters in filename
    └── my folder/
        └── spaced.ts              Spaces in directory path
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `source.ts` | 1.1, 2.4, 3.1, 5.1–5.3, 5.9, 7.1, 7.3, 7.5–7.6, 8.2, 9.1–9.4, 10.1–10.7, 11.1–11.3 | Default source for copy/paste tests |
| `destination.ts` | 5.2, 5.4, 7.1–7.2, 7.5–7.6, 8.1–8.2, 9.1–9.4, 10.1–10.7, 11.1–11.3 | Default destination for paste tests |
| `Makefile` | 1.3, 4.1, 5.7 | No-extension rejection |
| `unsupported.js` | 4.2, 5.4 | Unsupported pair (.js → .ts destination) |
| `fixed-source.css` | 5.10, 7.7, 9.5 | Fixed-style pair source |
| `fixed-destination.html` | 5.10, 7.7, 9.5 | Fixed-style pair destination |
| `components/child.ts` | 7.2, 7.3 | Child-directory and parent-directory path computation |
| `edge-cases/komponent-日本語.ts` | 6.3 | Unicode in filename |
| `edge-cases/my folder/spaced.ts` | 6.4 | Spaces in path |

## File count

| Directory | Files |
|-----------|-------|
| Root | 6 |
| `components/` | 1 |
| `edge-cases/` | 2 |
| **Total** | **9** |
