# 14 — Preserve-extension settings

Validates the two boolean settings that control whether file extensions are preserved on import paths.

**Sources:**
- `src/snippets/languages/javascript.ts`, `typescript.ts`, `_react.ts` — consume `preserveScriptFileExtension`
- `src/snippets/languages/scss.ts:determineScssExtension` — consumes `preserveStylesheetFileExtension` with `.css` asymmetry
- `src/snippets/languages/css.ts` — `.css` always preserves on its own paths regardless of setting (it's the destination doing the preserving)
- `src/config/settings.ts` — `getAutoImportSetting('script', 'preserveScriptFileExtension')` etc.

## Setup

- 00-setup.md complete; 01-sanity passed
- `placement = Cursor` for predictable output
- `typescriptImportStyle = import { name } from '_relativePath_';`
- `javascriptImportStyle = import name from '_relativePath_';`
- `scssImportStyle = @import '_relativePath_';`
- `cssImportStyle = @import '_relativePath_';`

## `preserveScriptFileExtension`

### Setting OFF (default)

- [ ] `src/foo.ts` → `src/bar.ts`: path is `'./foo'` (no `.ts`)
- [ ] `src/sibling.js` → `src/other.js`: `'./sibling'`
- [ ] `src/components/Button.tsx` → `src/components/Card.tsx` (TSX → TSX, same dir): `'./Button'`
- [ ] `src/components/Layout.jsx` → `src/components/NavBar.jsx` (JSX → JSX, same dir): `'./Layout'`
- [ ] **JSX with .js source:** `src/sibling.js` → `src/badge.jsx`: `'./sibling'`
- [ ] **TSX with .ts source:** `src/foo.ts` → `src/widget.tsx`: `'./foo'`
- [ ] **TSX with .tsx source:** `src/components/Button.tsx` → `src/widget.tsx`: `'./components/Button'`
- [ ] **TSX fallback to .js:** `src/sibling.js` → `src/widget.tsx`: `'./sibling'` (path; the SHAPE is JS, not TS)

### Setting ON

Set `preserveScriptFileExtension = true`.

- [ ] `src/foo.ts` → `src/bar.ts`: `'./foo.ts'`
- [ ] `src/sibling.js` → `src/other.js`: `'./sibling.js'`
- [ ] `src/components/Button.tsx` → `src/components/Card.tsx`: `'./Button.tsx'`
- [ ] `src/components/Layout.jsx` → `src/components/NavBar.jsx`: `'./Layout.jsx'`
- [ ] **TSX with .js source:** `src/sibling.js` → `src/widget.tsx`: `'./sibling.js'`
- [ ] **TSX with .ts source:** `src/foo.ts` → `src/widget.tsx`: `'./foo.ts'`
- [ ] **TSX with .tsx source:** `src/components/Button.tsx` → `src/widget.tsx`: `'./components/Button.tsx'`

### Angular naming with preserve ON  ⚡ FIXED (Bug #2)

- [ ] `src/components/app-root.component.ts` → `src/bar.ts` (style 1):
  - Output: `import { AppRootComponent } from './components/app-root.component.ts';`
  - **Identifier is `AppRootComponent`**, NOT `AppRootComponentTs`

- [ ] `src/components/auth.module.ts` → `import { AuthModule } from './components/auth.module.ts';`
- [ ] `src/components/highlight.directive.ts` → `import { HighlightDirective } from './components/highlight.directive.ts';`
- [ ] `src/components/trim.pipe.ts` → `import { TrimPipe } from './components/trim.pipe.ts';`
- [ ] `src/components/user.service.ts` → `import { UserService } from './components/user.service.ts';`

### Setting only affects script paths

For non-script sources in JSX/TSX/MDX (image/data/font/markup), extension is **always** preserved regardless of this setting.

- [ ] With `preserveScriptFileExtension = true`: `assets/logo.png` → `src/widget.tsx`: path is `'./assets/logo.png'` (always)
- [ ] With `preserveScriptFileExtension = false`: same path, `'./assets/logo.png'`. Setting has NO effect on non-script sources.

### Toggle test

- [ ] Set the toggle ON, paste, observe `'./foo.ts'`. Toggle OFF in settings (no reload). Paste again.
  **Expect:** second paste produces `'./foo'` immediately. Setting is read live each call.

### Cleanup

No cleanup needed — every fixture used above is part of the workspace baseline. (Earlier versions of this checklist asked you to construct `src/widget2.tsx`, `src/badge2.jsx`, etc.; those are now replaced by `src/components/Button.tsx`, `Card.tsx`, `Layout.jsx`, `NavBar.jsx`.)

## `preserveStylesheetFileExtension`

### Setting OFF (default)

- [ ] `styles/_partial.scss` → `styles/main.scss`: `'./partial'` (no `.scss`, leading `_` stripped)
- [ ] `styles/secondary.scss` → `styles/main.scss`: `'./secondary'`
- [ ] `styles/global.css` → `styles/reset.css`: `'./global'` (no `.css` — CSS destination paths respect the setting)

### Setting ON

- [ ] `styles/_partial.scss` → `styles/main.scss`: `'./partial.scss'`
- [ ] `styles/secondary.scss` → `styles/main.scss`: `'./secondary.scss'`
- [ ] `styles/global.css` → `styles/reset.css`: `'./global.css'`

### `.css` source in `.scss` destination — ASYMMETRY

`determineScssExtension` always returns `.css` for `.css` sources, regardless of `preserveStylesheetFileExtension`. (Sass requires the extension to recognize a foreign-language import.)

- [ ] **Setting OFF:** `styles/global.css` → `styles/main.scss`: path is `'./global.css'` (extension forced)
- [ ] **Setting ON:** `styles/global.css` → `styles/main.scss`: path is `'./global.css'` (same)

So the setting has **no effect** for `.css` sources in `.scss` destinations.

### `.scss` source in `.scss` destination — respects setting

- [ ] **Setting OFF:** `styles/_partial.scss` → `styles/main.scss`: `'./partial'`
- [ ] **Setting ON:** `styles/_partial.scss` → `styles/main.scss`: `'./partial.scss'`

### Image sources — extension always preserved

For any stylesheet destination (`.css` or `.scss`):

- [ ] `assets/logo.png` → `styles/main.scss` with setting OFF: `'./assets/logo.png'`
- [ ] Same with setting ON: `'./assets/logo.png'` (no change — always preserved)
- [ ] `assets/logo.png` → `styles/global.css`: `'./assets/logo.png'` (always)

## Settings interact independently

The two settings are independent:

- [ ] `preserveScriptFileExtension = true`, `preserveStylesheetFileExtension = false`. Verify TS imports keep `.ts`, SCSS imports drop `.scss`.
- [ ] `preserveScriptFileExtension = false`, `preserveStylesheetFileExtension = true`. Verify TS imports drop `.ts`, SCSS imports keep `.scss`.

## Setting persistence across reload

- [ ] Set both to ON. Paste, verify both extensions preserved. Reload window (Cmd/Ctrl+R or `Developer: Reload Window`). Paste again.
  **Expect:** settings persist; same output.

- [ ] Set both to OFF. Reload. Paste. Same behavior persists.

## Sign-off

- [ ] preserveScriptFileExtension OFF — 8 cases
- [ ] preserveScriptFileExtension ON — 7 cases
- [ ] Angular naming with preserve ON — 5 cases (Bug #2 verified)
- [ ] Non-script sources unaffected — 2 cases
- [ ] Toggle live without reload
- [ ] preserveStylesheetFileExtension OFF — 3 cases
- [ ] preserveStylesheetFileExtension ON — 3 cases
- [ ] `.css → .scss` asymmetry — 2 cases (always preserved)
- [ ] `.scss → .scss` respects setting — 2 cases
- [ ] Image extensions always preserved — 3 cases
- [ ] Settings independent — 2 cases
- [ ] Persistence across reload

Tester / date: ___________________
