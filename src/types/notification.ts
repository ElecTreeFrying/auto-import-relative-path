/**
 * Identifiers for the toasts the extension can surface via
 * `editor/notification.ts:showNotification`. Variants are raised from
 * `commands/paste-import.ts` and `commands/copy-file-path.ts`.
 *
 * @remarks
 * Three variants accept a payload that gets interpolated into the rendered
 * message — see the overload signatures on `editor/notification.ts:showNotification`:
 * `'not-supported'` takes `{ sourceExt, destinationExt }`, `'source-not-found'`
 * takes `{ basename }`, and `'copy-success'` takes `{ basename }`. The remaining
 * variants take no payload.
 *
 * One variant (`'copy-success'`) renders as an information toast; the other
 * five render as warning toasts.
 */
export type NotificationType =
  /** Source path resolved (case-insensitively) to the same file as the destination. Surfaced as `'Auto Import: A file cannot import itself.'`. Raised from `commands/paste-import.ts`. */
  | 'same-file-path'
  /** Source/destination pair rejected by the eight-clause gating in `commands/paste-import.ts`. Surfaced as `'Auto Import: Cannot import ${sourceExt} into ${destinationExt} files.'`. Raised from `commands/paste-import.ts`. */
  | 'not-supported'
  /** No active text editor when paste-import was invoked. Surfaced as `'Auto Import: Open a file to paste an import.'`. Raised from `commands/paste-import.ts`. */
  | 'no-active-editor'
  /** Built-in `copyFilePath` produced no usable file path (no focused file / no explorer selection). Surfaced as `'Auto Import: No file selected to copy.'`. Raised from `commands/copy-file-path.ts`. */
  | 'no-file-to-copy'
  /** Clipboard is empty or does not contain an absolute file path with an extension. Surfaced as `'Auto Import: Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first.'`. Raised from `commands/paste-import.ts`. */
  | 'empty-clipboard'
  /** Clipboard's source path no longer exists on disk (file deleted, moved, or renamed between copy and paste). Surfaced as `'Auto Import: Source file no longer exists: ${basename}.'`. Raised from `commands/paste-import.ts`. */
  | 'source-not-found'
  /** Successful clipboard write of a file path. Surfaced as an info toast `'Auto Import: Copied path — ${basename}'`. Raised from `commands/copy-file-path.ts`. */
  | 'copy-success';
