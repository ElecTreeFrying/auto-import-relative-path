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
    assert.ok(HTML_SUPPORTED_EXTENSIONS.includes('.js' as any), 'missing .js');
    assert.ok(HTML_SUPPORTED_EXTENSIONS.includes('.css' as any), 'missing .css');
  });

  it('MARKDOWN_SUPPORTED_EXTENSIONS has 8 entries (.md + 7 images)', () => {
    assert.strictEqual(MARKDOWN_SUPPORTED_EXTENSIONS.length, 8);
    assert.ok(MARKDOWN_SUPPORTED_EXTENSIONS.includes('.md' as any), 'missing .md');
  });

  it('CSS_SUPPORTED_EXTENSIONS has 8 entries (.css + 7 images)', () => {
    assert.strictEqual(CSS_SUPPORTED_EXTENSIONS.length, 8);
    assert.ok(CSS_SUPPORTED_EXTENSIONS.includes('.css' as any), 'missing .css');
  });

  it('SCSS_SUPPORTED_EXTENSIONS has 9 entries (.scss, .css + 7 images)', () => {
    assert.strictEqual(SCSS_SUPPORTED_EXTENSIONS.length, 9);
    assert.ok(SCSS_SUPPORTED_EXTENSIONS.includes('.scss' as any), 'missing .scss');
    assert.ok(SCSS_SUPPORTED_EXTENSIONS.includes('.css' as any), 'missing .css');
  });

  it('VUE_SUPPORTED_EXTENSIONS has 23 entries', () => {
    assert.strictEqual(VUE_SUPPORTED_EXTENSIONS.length, 23);
    assert.ok(VUE_SUPPORTED_EXTENSIONS.includes('.vue' as any), 'missing .vue');
    assert.ok(VUE_SUPPORTED_EXTENSIONS.includes('.ts' as any), 'missing .ts');
    assert.ok(VUE_SUPPORTED_EXTENSIONS.includes('.json' as any), 'missing .json');
  });

  it('SVELTE_SUPPORTED_EXTENSIONS has 23 entries', () => {
    assert.strictEqual(SVELTE_SUPPORTED_EXTENSIONS.length, 23);
    assert.ok(SVELTE_SUPPORTED_EXTENSIONS.includes('.svelte' as any), 'missing .svelte');
    assert.ok(SVELTE_SUPPORTED_EXTENSIONS.includes('.ts' as any), 'missing .ts');
  });

  it('ASTRO_SUPPORTED_EXTENSIONS has 27 entries', () => {
    assert.strictEqual(ASTRO_SUPPORTED_EXTENSIONS.length, 27);
    assert.ok(ASTRO_SUPPORTED_EXTENSIONS.includes('.astro' as any), 'missing .astro');
    assert.ok(ASTRO_SUPPORTED_EXTENSIONS.includes('.vue' as any), 'missing .vue');
    assert.ok(ASTRO_SUPPORTED_EXTENSIONS.includes('.svelte' as any), 'missing .svelte');
    assert.ok(ASTRO_SUPPORTED_EXTENSIONS.includes('.md' as any), 'missing .md');
    assert.ok(ASTRO_SUPPORTED_EXTENSIONS.includes('.mdx' as any), 'missing .mdx');
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
