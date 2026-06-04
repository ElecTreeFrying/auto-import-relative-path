# qa/workspace/general/CLAUDE.md

Fixtures for `checklists/general.md` — the cross-destination shared-behavior checklist.

## Sync rule

- **Checklist is the source of truth.** If `general.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `general.md`.

## Scope

These fixtures test destination-neutral behaviors: clipboard validation, same-file rejection, notification wording, toast buttons, path computation, extension stripping, drag-and-drop universal behaviors, QuickPick mechanics (Pick Style / Set Default), and settings mid-session. Do not add language-specific fixtures here — those belong in the per-language workspace directories (e.g., `workspace/typescript/`).
