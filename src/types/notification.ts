/**
 * Identifiers for the warning toasts the extension can surface via
 * `editor/notification.ts:showNotification`. Both variants are raised
 * exclusively from `commands/paste-import.ts`.
 */
export type NotificationType =
  /** Source path resolved (case-insensitively) to the same file as the destination. Surfaced as `'Auto Import Relative Path: Same file path.'`. */
  | 'same-file-path'
  /** Source/destination pair rejected by gating in `commands/paste-import.ts`. Surfaced as `'Auto Import Relative Path: Not supported.'`. */
  | 'not-supported';
