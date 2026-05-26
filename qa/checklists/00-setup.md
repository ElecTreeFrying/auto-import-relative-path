# 00 — Open the fixture workspace

The fixtures already live in the `qa/workspace/` folder the developer shared with you. You don't build anything — you just open that folder in VS Code with the extension already installed. All subsequent checklists 01–21 use paths *relative to that workspace root*.

## Steps

1. **Make sure the extension is installed.** If you haven't already, install the `.vsix` file the developer sent you: **Cmd+Shift+P** (macOS) or **Ctrl+Shift+P** (Windows / Linux) → **Extensions: Install from VSIX…** → browse to the file → **Install** → **Reload**.
2. **File → Open Folder…** → select the `qa/workspace/` folder.
3. The window reloads with the fixture workspace open. Every checklist now references files inside this folder.

> **Activation:** The extension activates on file open (`onLanguage:*` for 12 languages) rather than waiting for the first command invocation. Drag-and-drop import is available immediately once VS Code opens any supported file.

> **Heads up**: when you copy a file from the Explorer with `Cmd/Ctrl+Shift+A`, the toast and clipboard contain the *absolute* path of the file inside `qa/workspace/` — that's expected. The relative paths inside generated import snippets are computed from there.

## What's in the workspace

The full layout and the rationale for every fixture is documented in [`../workspace/README.md`](../workspace/README.md). Key categories the checklists rely on:

| Area | Examples used by checklists |
|------|------------------------------|
| Script baseline | `src/foo.ts`, `bar.ts`, `helpers.ts`, `sibling.js`, `other.js`, `widget.tsx`, `badge.jsx` |
| Angular convention | `src/components/{app-root.component, auth.module, highlight.directive, trim.pipe, user.service}.ts` |
| Stylesheets | `styles/main.scss`, `_partial.scss`, `_variables.scss`, `global.css`, `reset.css`, `_partials/_nested.scss` |
| Bottom-landing | `with-imports.ts`, `with-requires.js`, `styles/with-imports.css`, `styles/with-uses.scss`, `pages/with-resources.html` |
| Markup / docs | `pages/index.html`, `pages/about.html`, `docs/README.md`, `docs/guide.md` |
| Images / fonts / data | `assets/logo.png`, `icon.gif`, `photo.jpeg`, `photo.jpg`, `icon.svg`, `banner.avif`, `thumb.webp`, `font.woff2`, `regular.ttf`; `data/config.json`, `config.yaml`, `locale.yml` |
| Media / text-track | `assets/media/clip.mp4`, `demo.webm`, `animation.mov`, `song.mp3`, `effect.ogg`, `voice.wav`, `track.m4a`, `captions.vtt` |
| Framework-component destinations | `src/App.vue`, `App.svelte`, `App.astro` |
| Edge cases | `empty-file.ts`, `whitespace-only.ts`, `single-char.ts`, `comments-only.ts`, `my files/spaced.ts` |
| Unicode / deep paths | `unicode-paths/日本語.ts`, `unicode-paths/café-menu.tsx`, `deeply/nested/components/widgets/{deep-widget.tsx, deep-styles.scss}`, `very-deep/level-01/.../level-09/extreme-leaf.ts` |
| Unsupported (rejection) | `unsupported/Main.java`, `unsupported/styles.less`, `unsupported/texture.bmp`, `unsupported/render.avi`, `unsupported/archive.zip` |

`qa/workspace/` is also stocked with rich exploratory siblings (`Button.tsx`, `Layout.jsx`, `legacy/*.js`, `hooks/`, `utils/`, etc.) — handy for ad-hoc QA but not required by any specific checklist.

## A few tests still construct files on the fly

Some scenarios are inherently transient (read-only files, multi-root workspaces, the unsupported-extension path, custom case-collision dirs). Those checklists call out the construction and cleanup commands inline. **Don't** check those temporary files into the workspace.

## Verify

- [ ] EDH window is open with `qa/workspace/` as the folder.
- [ ] You can open `src/foo.ts` from the Explorer and it renders normally.
- [ ] `Cmd/Ctrl+Shift+P` → typing `Auto Import` shows the three commands (`Copy File Path`, `Paste as Import`, `Insert Import from Selected File`).
- [ ] Drag any `.ts` file from Explorer into an open `.ts` editor — the drop-edit widget appears (confirms DnD provider is active without running a command).

## Sign-off

- [ ] Fixture workspace open in VS Code with the extension installed
- [ ] No files were modified to bootstrap (everything was already there)

Tester / date: ___________________
