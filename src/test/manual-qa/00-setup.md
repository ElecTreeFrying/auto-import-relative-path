# 00 — Test workspace setup

Build a fixture workspace **once**, then reuse it for every checklist (01 → 17). All subsequent files assume this exact layout.

## Goal

Create a directory called `test-workspace/` somewhere outside this project (so the fixtures never get committed). Populate it with the file/directory tree below.

## Step 1 — Create the directory tree

Run this in a terminal:

```bash
mkdir -p ~/test-workspace/src/components
mkdir -p ~/test-workspace/styles/_partials
mkdir -p ~/test-workspace/pages
mkdir -p ~/test-workspace/docs
mkdir -p ~/test-workspace/assets
mkdir -p ~/test-workspace/data
mkdir -p "~/test-workspace/my files"
```

## Step 2 — Create the script fixtures

```bash
cd ~/test-workspace

# src/ scripts (TS/JS/TSX/JSX)
echo 'export const foo = 1;' > src/foo.ts
echo 'export const bar = 2;' > src/bar.ts
echo 'export function help() {}' > src/helpers.ts
echo 'module.exports = {};' > src/sibling.js
echo 'module.exports = {};' > src/other.js
echo 'export const Widget = () => null;' > src/widget.tsx
echo 'export const Badge = () => null;' > src/badge.jsx

# Angular convention fixtures (all 5 suffixes)
echo 'export class AppRootComponent {}' > src/components/app-root.component.ts
echo 'export class AuthModule {}' > src/components/auth.module.ts
echo 'export class HighlightDirective {}' > src/components/highlight.directive.ts
echo 'export class TrimPipe {}' > src/components/trim.pipe.ts
echo 'export class UserService {}' > src/components/user.service.ts
```

## Step 3 — Create the stylesheet fixtures

```bash
# Stylesheets
echo '.main {}' > styles/main.scss
echo '.secondary {}' > styles/secondary.scss
echo '$color: red;' > styles/_partial.scss
echo '$primary: blue;' > styles/_variables.scss
echo '.global {}' > styles/global.css
echo '* {}' > styles/reset.css

# Partial inside a directory (for path-computation tests)
echo '$nested: green;' > styles/_partials/_nested.scss
```

## Step 4 — Create markup fixtures

```bash
# HTML
cat > pages/index.html <<'EOF'
<!DOCTYPE html>
<html>
<head><title>Index</title></head>
<body></body>
</html>
EOF

cat > pages/about.html <<'EOF'
<!DOCTYPE html>
<html>
<head><title>About</title></head>
<body></body>
</html>
EOF

# Markdown
echo '# README' > docs/README.md
echo '# Guide' > docs/guide.md
```

## Step 5 — Create binary/asset fixtures

The image fixtures don't need to be valid images — just files with the right extension.

```bash
# Images (5 supported types)
touch assets/logo.png
touch assets/icon.gif
touch assets/photo.jpeg
touch assets/photo.jpg
touch assets/thumb.webp

# Fonts (4 supported types — pick at least 2)
touch assets/font.woff2
touch assets/regular.ttf

# Data
echo '{}' > data/config.json
echo 'key: value' > data/config.yaml
echo 'k: v' > data/locale.yml
```

## Step 6 — Create edge-case fixtures

```bash
# Zero-byte file (for empty-file tests)
touch empty-file.ts

# Comments-only file (for Bottom placement tests)
cat > comments-only.ts <<'EOF'
// just a comment
/* block comment */
// I want to import bar later   <-- documented heuristic false-positive
EOF

# Path with a space (for path-computation tests)
echo 'export const spaced = 1;' > "my files/spaced.ts"

# An unsupported file extension (for rejection tests)
touch assets/icon.svg
```

## Step 7 — Open in the Extension Development Host

1. Open the `auto-import-relative-path` project in VS Code.
2. Press **F5**. A second VS Code window opens — this is the Extension Development Host with the extension loaded from `dist/extension.js`.
3. In the new window: **File → Open Folder…** → select `~/test-workspace/`.

## Step 8 — Verify

- [ ] All directories exist (run `find ~/test-workspace -type d`).
- [ ] All files exist (run `find ~/test-workspace -type f | wc -l` → should be ≥ 26).
- [ ] Extension Development Host has the `test-workspace` open.
- [ ] You can open `src/foo.ts` and the editor renders normally.

## Tree summary (final state)

```
test-workspace/
├── src/
│   ├── foo.ts, bar.ts, helpers.ts
│   ├── sibling.js, other.js
│   ├── widget.tsx, badge.jsx
│   └── components/
│       ├── app-root.component.ts
│       ├── auth.module.ts
│       ├── highlight.directive.ts
│       ├── trim.pipe.ts
│       └── user.service.ts
├── styles/
│   ├── main.scss, secondary.scss
│   ├── _partial.scss, _variables.scss
│   ├── global.css, reset.css
│   └── _partials/
│       └── _nested.scss
├── pages/
│   ├── index.html, about.html
├── docs/
│   ├── README.md, guide.md
├── assets/
│   ├── logo.png, icon.gif, photo.jpeg, photo.jpg, thumb.webp
│   ├── font.woff2, regular.ttf
│   └── icon.svg                (unsupported — for rejection tests)
├── data/
│   ├── config.json, config.yaml, locale.yml
├── empty-file.ts                (0 bytes)
├── comments-only.ts
└── my files/
    └── spaced.ts
```

## Sign-off

- [ ] Workspace built per Steps 1–6
- [ ] Verified per Step 8
- [ ] Extension Development Host running with the workspace open

Tester / date: ___________________
