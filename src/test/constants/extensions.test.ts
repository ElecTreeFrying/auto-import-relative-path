import * as assert from 'assert';

import {
  IMAGE_FILE_EXTENSIONS,
  MEDIA_FILE_EXTENSIONS,
  TEXT_TRACK_FILE_EXTENSIONS,
  TEX_GRAPHICS_FILE_EXTENSIONS,
  HTML_SUPPORTED_EXTENSIONS,
  MARKDOWN_SUPPORTED_EXTENSIONS,
  CSS_SUPPORTED_EXTENSIONS,
  SCSS_SUPPORTED_EXTENSIONS,
  VUE_SUPPORTED_EXTENSIONS,
  SVELTE_SUPPORTED_EXTENSIONS,
  ASTRO_SUPPORTED_EXTENSIONS,
  TEX_SUPPORTED_EXTENSIONS,
  CROSS_IMPORT_DESTINATIONS,
  SCRIPT_FILE_EXTENSIONS,
  STYLESHEET_FILE_EXTENSIONS,
  FRAMEWORK_COMPONENT_FILE_EXTENSIONS,
  TYPESCRIPT_SUPPORTED_EXTENSIONS,
  JAVASCRIPT_SUPPORTED_EXTENSIONS,
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

  it('VUE_SUPPORTED_EXTENSIONS has 25 entries', () => {
    assert.strictEqual(VUE_SUPPORTED_EXTENSIONS.length, 25);
    for (const ext of [ '.vue', '.ts', '.js', '.jsx', '.tsx', '.json', '.yml', '.yaml', '.css', '.scss' ]) {
      assert.ok(VUE_SUPPORTED_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
    for (const ext of [ '.md', '.mdx' ]) {
      assert.ok(!VUE_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} should not be in Vue`);
    }
  });

  it('SVELTE_SUPPORTED_EXTENSIONS has 25 entries', () => {
    assert.strictEqual(SVELTE_SUPPORTED_EXTENSIONS.length, 25);
    for (const ext of [ '.svelte', '.ts', '.js', '.jsx', '.tsx', '.json', '.yml', '.yaml', '.css', '.scss' ]) {
      assert.ok(SVELTE_SUPPORTED_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
    for (const ext of [ '.md', '.mdx' ]) {
      assert.ok(!SVELTE_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} should not be in Svelte`);
    }
  });

  it('ASTRO_SUPPORTED_EXTENSIONS has 29 entries', () => {
    assert.strictEqual(ASTRO_SUPPORTED_EXTENSIONS.length, 29);
    for (const ext of [ '.astro', '.vue', '.svelte', '.ts', '.js', '.jsx', '.tsx', '.json', '.yml', '.yaml', '.md', '.mdx', '.css', '.scss' ]) {
      assert.ok(ASTRO_SUPPORTED_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
  });

  it('CROSS_IMPORT_DESTINATIONS has exactly 13 members', () => {
    assert.strictEqual(CROSS_IMPORT_DESTINATIONS.length, 13);
    for (const ext of [ '.html', '.md', '.css', '.scss', '.tsx', '.mdx', '.jsx', '.vue', '.svelte', '.astro', '.tex', '.ts', '.js' ]) {
      assert.ok(CROSS_IMPORT_DESTINATIONS.includes(ext as any), `missing ${ext}`);
    }
  });

  it('TEX_GRAPHICS_FILE_EXTENSIONS is the pdflatex-renderable set (.pdf, .png, .jpg, .jpeg, .eps)', () => {
    assert.deepStrictEqual(TEX_GRAPHICS_FILE_EXTENSIONS, [ '.pdf', '.png', '.jpg', '.jpeg', '.eps' ]);
    for (const ext of [ '.svg', '.gif', '.webp', '.avif' ]) {
      assert.ok(!TEX_GRAPHICS_FILE_EXTENSIONS.includes(ext as any), `${ext} is not LaTeX-renderable and must stay out`);
    }
  });

  it('TEX_SUPPORTED_EXTENSIONS has 7 entries (.tex, .bib + 5 graphics)', () => {
    assert.strictEqual(TEX_SUPPORTED_EXTENSIONS.length, 7);
    for (const ext of [ '.tex', '.bib', '.pdf', '.png', '.jpg', '.jpeg', '.eps' ]) {
      assert.ok(TEX_SUPPORTED_EXTENSIONS.includes(ext as any), `missing ${ext}`);
    }
    for (const ext of [ '.svg', '.ts', '.css' ]) {
      assert.ok(!TEX_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} should not be in TeX`);
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

  it('FRAMEWORK_COMPONENT_FILE_EXTENSIONS is the runtime mirror [.vue, .svelte, .astro]', () => {
    assert.deepStrictEqual(FRAMEWORK_COMPONENT_FILE_EXTENSIONS, [ '.vue', '.svelte', '.astro' ]);
  });

  it('TYPESCRIPT_SUPPORTED_EXTENSIONS is .ts + the framework components (own extension + SFC sources)', () => {
    assert.deepStrictEqual(TYPESCRIPT_SUPPORTED_EXTENSIONS, [ '.ts', '.vue', '.svelte', '.astro' ]);
    for (const ext of [ '.js', '.tsx', '.jsx', '.mdx', '.png', '.json' ]) {
      assert.ok(!TYPESCRIPT_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} must not be a .ts-accepted source`);
    }
  });

  it('JAVASCRIPT_SUPPORTED_EXTENSIONS is .js + the framework components (own extension + SFC sources)', () => {
    assert.deepStrictEqual(JAVASCRIPT_SUPPORTED_EXTENSIONS, [ '.js', '.vue', '.svelte', '.astro' ]);
    for (const ext of [ '.ts', '.jsx', '.css', '.json' ]) {
      assert.ok(!JAVASCRIPT_SUPPORTED_EXTENSIONS.includes(ext as any), `${ext} must not be a .js-accepted source`);
    }
  });

  it('.ts is not in HTML_SUPPORTED_EXTENSIONS', () => {
    assert.ok(!HTML_SUPPORTED_EXTENSIONS.includes('.ts' as any));
  });

  it('.html is not in MARKDOWN_SUPPORTED_EXTENSIONS', () => {
    assert.ok(!MARKDOWN_SUPPORTED_EXTENSIONS.includes('.html' as any));
  });

  describe('type-mirror category invariants', () => {
    it('MEDIA_FILE_EXTENSIONS excludes .vtt (it belongs to TEXT_TRACK)', () => {
      assert.ok(!MEDIA_FILE_EXTENSIONS.includes('.vtt' as any), '.vtt must not be in MEDIA');
      assert.ok(TEXT_TRACK_FILE_EXTENSIONS.includes('.vtt' as any), '.vtt must be in TEXT_TRACK');
    });

    it('IMAGE / MEDIA / TEXT_TRACK are pairwise disjoint', () => {
      const overlap = (a: readonly string[], b: readonly string[]) => a.filter(ext => b.includes(ext));
      assert.deepStrictEqual(overlap(IMAGE_FILE_EXTENSIONS, MEDIA_FILE_EXTENSIONS), [], 'IMAGE ∩ MEDIA');
      assert.deepStrictEqual(overlap(IMAGE_FILE_EXTENSIONS, TEXT_TRACK_FILE_EXTENSIONS), [], 'IMAGE ∩ TEXT_TRACK');
      assert.deepStrictEqual(overlap(MEDIA_FILE_EXTENSIONS, TEXT_TRACK_FILE_EXTENSIONS), [], 'MEDIA ∩ TEXT_TRACK');
    });
  });
});
