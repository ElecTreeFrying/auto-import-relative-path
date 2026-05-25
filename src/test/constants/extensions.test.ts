import * as assert from 'assert';

import {
  IMAGE_FILE_EXTENSIONS,
  MEDIA_FILE_EXTENSIONS,
  TEXT_TRACK_FILE_EXTENSIONS,
  HTML_SUPPORTED_EXTENSIONS,
  MARKDOWN_SUPPORTED_EXTENSIONS,
  CSS_SUPPORTED_EXTENSIONS,
  SCSS_SUPPORTED_EXTENSIONS,
  VUE_SUPPORTED_EXTENSIONS,
  SVELTE_SUPPORTED_EXTENSIONS,
  ASTRO_SUPPORTED_EXTENSIONS,
  CROSS_IMPORT_DESTINATIONS,
  SCRIPT_FILE_EXTENSIONS,
  STYLESHEET_FILE_EXTENSIONS,
} from '../../constants/extensions';

describe('constants/extensions', () => {
  it('IMAGE_FILE_EXTENSIONS has exactly 7 entries', () => {
    assert.strictEqual(IMAGE_FILE_EXTENSIONS.length, 7);
    for (const ext of [ '.gif', '.jpeg', '.jpg', '.png', '.svg', '.avif', '.webp' ]) {
      assert.ok(IMAGE_FILE_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
  });

  it('MEDIA_FILE_EXTENSIONS has exactly 7 entries (3 video + 4 audio)', () => {
    assert.strictEqual(MEDIA_FILE_EXTENSIONS.length, 7);
    for (const ext of [ '.mp4', '.webm', '.mov', '.mp3', '.ogg', '.wav', '.m4a' ]) {
      assert.ok(MEDIA_FILE_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
  });

  it('TEXT_TRACK_FILE_EXTENSIONS is [.vtt]', () => {
    assert.deepStrictEqual(TEXT_TRACK_FILE_EXTENSIONS, [ '.vtt' ]);
  });

  it('HTML_SUPPORTED_EXTENSIONS has 17 entries (.js, .css + 7 images + 7 media + .vtt)', () => {
    assert.strictEqual(HTML_SUPPORTED_EXTENSIONS.length, 17);
    for (const ext of [ '.js', '.css' ]) {
      assert.ok(HTML_SUPPORTED_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
    for (const ext of [ '.ts', '.tsx', '.jsx', '.scss', '.md', '.json' ]) {
      assert.ok(!HTML_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} should not be in HTML`);
    }
  });

  it('MARKDOWN_SUPPORTED_EXTENSIONS has 8 entries (.md + 7 images)', () => {
    assert.strictEqual(MARKDOWN_SUPPORTED_EXTENSIONS.length, 8);
    assert.ok(MARKDOWN_SUPPORTED_EXTENSIONS.includes('.md' as any), 'missing .md');
    for (const ext of [ '.html', '.js', '.ts', '.css', '.scss' ]) {
      assert.ok(!MARKDOWN_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} should not be in Markdown`);
    }
  });

  it('CSS_SUPPORTED_EXTENSIONS has 8 entries (.css + 7 images)', () => {
    assert.strictEqual(CSS_SUPPORTED_EXTENSIONS.length, 8);
    assert.ok(CSS_SUPPORTED_EXTENSIONS.includes('.css' as any), 'missing .css');
    for (const ext of [ '.scss', '.js', '.ts' ]) {
      assert.ok(!CSS_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} should not be in CSS`);
    }
  });

  it('SCSS_SUPPORTED_EXTENSIONS has 9 entries (.scss, .css + 7 images)', () => {
    assert.strictEqual(SCSS_SUPPORTED_EXTENSIONS.length, 9);
    for (const ext of [ '.scss', '.css' ]) {
      assert.ok(SCSS_SUPPORTED_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
    for (const ext of [ '.js', '.ts' ]) {
      assert.ok(!SCSS_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} should not be in SCSS`);
    }
  });

  it('VUE_SUPPORTED_EXTENSIONS has 23 entries', () => {
    assert.strictEqual(VUE_SUPPORTED_EXTENSIONS.length, 23);
    for (const ext of [ '.vue', '.ts', '.js', '.jsx', '.tsx', '.json', '.yml', '.yaml' ]) {
      assert.ok(VUE_SUPPORTED_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
    for (const ext of [ '.css', '.scss', '.md', '.mdx' ]) {
      assert.ok(!VUE_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} should not be in Vue`);
    }
  });

  it('SVELTE_SUPPORTED_EXTENSIONS has 23 entries', () => {
    assert.strictEqual(SVELTE_SUPPORTED_EXTENSIONS.length, 23);
    for (const ext of [ '.svelte', '.ts', '.js', '.jsx', '.tsx', '.json', '.yml', '.yaml' ]) {
      assert.ok(SVELTE_SUPPORTED_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
    for (const ext of [ '.css', '.scss', '.md', '.mdx' ]) {
      assert.ok(!SVELTE_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} should not be in Svelte`);
    }
  });

  it('ASTRO_SUPPORTED_EXTENSIONS has 27 entries', () => {
    assert.strictEqual(ASTRO_SUPPORTED_EXTENSIONS.length, 27);
    for (const ext of [ '.astro', '.vue', '.svelte', '.ts', '.js', '.jsx', '.tsx', '.json', '.yml', '.yaml', '.md', '.mdx' ]) {
      assert.ok(ASTRO_SUPPORTED_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
    for (const ext of [ '.css', '.scss' ]) {
      assert.ok(!ASTRO_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} should not be in Astro`);
    }
  });

  it('CROSS_IMPORT_DESTINATIONS has exactly 10 members', () => {
    assert.strictEqual(CROSS_IMPORT_DESTINATIONS.length, 10);
    for (const ext of [ '.html', '.md', '.css', '.scss', '.tsx', '.mdx', '.jsx', '.vue', '.svelte', '.astro' ]) {
      assert.ok(CROSS_IMPORT_DESTINATIONS.includes(ext as any), `missing ${ext}`);
    }
  });

  it('SCRIPT_FILE_EXTENSIONS has 8 entries', () => {
    assert.strictEqual(SCRIPT_FILE_EXTENSIONS.length, 8);
    for (const ext of [ '.ts', '.tsx', '.mdx', '.js', '.jsx', '.vue', '.svelte', '.astro' ]) {
      assert.ok(SCRIPT_FILE_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
  });

  it('STYLESHEET_FILE_EXTENSIONS has exactly 2 entries', () => {
    assert.deepStrictEqual(STYLESHEET_FILE_EXTENSIONS, [ '.scss', '.css' ]);
  });

  it('.ts is not in HTML_SUPPORTED_EXTENSIONS', () => {
    assert.ok(!HTML_SUPPORTED_EXTENSIONS.includes('.ts' as any));
  });

  it('.html is not in MARKDOWN_SUPPORTED_EXTENSIONS', () => {
    assert.ok(!MARKDOWN_SUPPORTED_EXTENSIONS.includes('.html' as any));
  });
});
