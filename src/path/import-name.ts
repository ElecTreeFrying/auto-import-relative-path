import * as path from 'path';

/** A legal JS/TS binding identifier: starts with a letter, `_`, or `$`; no leading digit. */
const VALID_IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/**
 * Derives an import identifier from a file's basename, or `null` when no legal identifier can be
 * formed. The basename's extension is stripped, the remainder is split on `-`, `_`, `.`, and
 * whitespace, and the segments are joined in camelCase (`my-logo.v2.svg` → `myLogoV2`). The first
 * segment's original case is **preserved**, so a lowercase filename stays camelCase (`logo.svg` →
 * `logo`) while a PascalCase filename keeps its case (`App.jsx` → `App`, the React component
 * convention) rather than being lowercased to `app`. The result is validated against
 * {@link VALID_IDENTIFIER}; a leading-digit or otherwise-illegal result (`404.png` → `404`) returns
 * `null` so callers keep their generic placeholder.
 *
 * Pure path/string math — takes either a bare basename or a full relative path, since only the
 * basename is used (`deriveImportName('./a/b/logo.png')` === `deriveImportName('logo.png')`).
 */
export function deriveImportName(filePath: string): string | null {
  const base = path.basename(filePath);
  const withoutExt = base.slice(0, base.length - path.extname(base).length);

  const segments = withoutExt.split(/[-_.\s]+/).filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const camelCased = segments
    .map((segment, index) => (index === 0 ? segment : upperFirst(segment)))
    .join('');

  return VALID_IDENTIFIER.test(camelCased) ? camelCased : null;
}

function upperFirst(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}
