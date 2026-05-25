import * as assert from 'assert';

import { computeRelative } from '../../path/relative';

const BASE = '/project';

describe('computeRelative', () => {
  it('same directory produces ./ prefix', () => {
    const result = computeRelative(`${BASE}/src/foo.ts`, `${BASE}/src/bar.ts`);
    assert.strictEqual(result, './foo');
  });

  it('parent directory produces ../ traversal', () => {
    const result = computeRelative(`${BASE}/lib/foo.ts`, `${BASE}/src/bar.ts`);
    assert.strictEqual(result, '../lib/foo');
  });

  it('deep nesting produces multiple ../ segments', () => {
    const result = computeRelative(
      `${BASE}/very-deep/level-01/level-02/leaf.ts`,
      `${BASE}/src/bar.ts`
    );
    assert.strictEqual(result, '../very-deep/level-01/level-02/leaf');
  });

  it('child directory gets ./ prefix (no-dot edge case)', () => {
    const result = computeRelative(`${BASE}/src/utils/helper.ts`, `${BASE}/src/app.ts`);
    assert.strictEqual(result, './utils/helper');
  });

  it('result always uses forward slashes', () => {
    const result = computeRelative(`${BASE}/src/foo.ts`, `${BASE}/src/bar.ts`);
    assert.ok(!result.includes('\\'), `expected no backslashes, got: ${result}`);
  });

  it('strips .ts extension', () => {
    const result = computeRelative(`${BASE}/src/foo.ts`, `${BASE}/src/bar.ts`);
    assert.ok(!result.endsWith('.ts'), `expected no .ts extension, got: ${result}`);
    assert.strictEqual(result, './foo');
  });

  it('strips .css extension', () => {
    const result = computeRelative(`${BASE}/styles/app.css`, `${BASE}/styles/main.css`);
    assert.strictEqual(result, './app');
  });

  it('strips .html extension', () => {
    const result = computeRelative(`${BASE}/pages/about.html`, `${BASE}/pages/index.html`);
    assert.strictEqual(result, './about');
  });

  it('handles paths with spaces', () => {
    const result = computeRelative(`${BASE}/my files/spaced.ts`, `${BASE}/src/bar.ts`);
    assert.strictEqual(result, '../my files/spaced');
  });

  it('handles Unicode path segments', () => {
    const result = computeRelative(`${BASE}/unicode-paths/cafe-menu.tsx`, `${BASE}/src/bar.ts`);
    assert.strictEqual(result, '../unicode-paths/cafe-menu');
  });
});
