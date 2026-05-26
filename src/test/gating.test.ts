import * as assert from 'assert';

import { isPairSupported } from '../gating';
import { FilePathInfo } from '../editor/file-path-info';
import { FileExtension } from '../types/file-extension';

function info(sourceFileExt: string, destinationFileExt: string): FilePathInfo {
  return {
    relativePath: './test',
    sourceFilePath: `/src/test${sourceFileExt}`,
    destinationFilePath: `/src/dest${destinationFileExt}`,
    sourceFileExt: sourceFileExt as FileExtension,
    destinationFileExt: destinationFileExt as FileExtension,
  };
}

describe('gating/isPairSupported', () => {
  describe('same-extension bypass (clause 1)', () => {
    it('.js → .js passes', () => {
      assert.strictEqual(isPairSupported(info('.js', '.js')), true);
    });

    it('.ts → .ts passes', () => {
      assert.strictEqual(isPairSupported(info('.ts', '.ts')), true);
    });

    it('.css → .css passes', () => {
      assert.strictEqual(isPairSupported(info('.css', '.css')), true);
    });
  });

  describe('cross-import destinations (clause 1)', () => {
    it('.js → .ts rejected (not in CROSS_IMPORT_DESTINATIONS)', () => {
      assert.strictEqual(isPairSupported(info('.js', '.ts')), false);
    });

    it('.ts → .js rejected (not in CROSS_IMPORT_DESTINATIONS)', () => {
      assert.strictEqual(isPairSupported(info('.ts', '.js')), false);
    });

    it('.js → .tsx accepted (tsx in CROSS_IMPORT_DESTINATIONS)', () => {
      assert.strictEqual(isPairSupported(info('.js', '.tsx')), true);
    });

    it('.ts → .mdx accepted (mdx in CROSS_IMPORT_DESTINATIONS)', () => {
      assert.strictEqual(isPairSupported(info('.ts', '.mdx')), true);
    });

    it('.js → .jsx accepted (jsx in CROSS_IMPORT_DESTINATIONS)', () => {
      assert.strictEqual(isPairSupported(info('.js', '.jsx')), true);
    });
  });

  describe('HTML self-import rejection (clause 2)', () => {
    it('.html → .html rejected', () => {
      assert.strictEqual(isPairSupported(info('.html', '.html')), false);
    });
  });

  describe('HTML destination (clause 3)', () => {
    it('.js → .html accepted', () => {
      assert.strictEqual(isPairSupported(info('.js', '.html')), true);
    });

    it('.css → .html accepted', () => {
      assert.strictEqual(isPairSupported(info('.css', '.html')), true);
    });

    it('.png → .html accepted', () => {
      assert.strictEqual(isPairSupported(info('.png', '.html')), true);
    });

    it('.ts → .html rejected', () => {
      assert.strictEqual(isPairSupported(info('.ts', '.html')), false);
    });

    it('.scss → .html rejected', () => {
      assert.strictEqual(isPairSupported(info('.scss', '.html')), false);
    });
  });

  describe('Markdown destination (clause 4)', () => {
    it('.md → .md accepted', () => {
      assert.strictEqual(isPairSupported(info('.md', '.md')), true);
    });

    it('.png → .md accepted', () => {
      assert.strictEqual(isPairSupported(info('.png', '.md')), true);
    });

    it('.html → .md rejected', () => {
      assert.strictEqual(isPairSupported(info('.html', '.md')), false);
    });

    it('.js → .md rejected', () => {
      assert.strictEqual(isPairSupported(info('.js', '.md')), false);
    });
  });

  describe('CSS destination (clause 5)', () => {
    it('.css → .css accepted', () => {
      assert.strictEqual(isPairSupported(info('.css', '.css')), true);
    });

    it('.png → .css accepted', () => {
      assert.strictEqual(isPairSupported(info('.png', '.css')), true);
    });

    it('.js → .css rejected', () => {
      assert.strictEqual(isPairSupported(info('.js', '.css')), false);
    });

    it('.scss → .css rejected', () => {
      assert.strictEqual(isPairSupported(info('.scss', '.css')), false);
    });
  });

  describe('SCSS destination (clause 6)', () => {
    it('.scss → .scss accepted', () => {
      assert.strictEqual(isPairSupported(info('.scss', '.scss')), true);
    });

    it('.css → .scss accepted', () => {
      assert.strictEqual(isPairSupported(info('.css', '.scss')), true);
    });

    it('.png → .scss accepted', () => {
      assert.strictEqual(isPairSupported(info('.png', '.scss')), true);
    });

    it('.js → .scss rejected', () => {
      assert.strictEqual(isPairSupported(info('.js', '.scss')), false);
    });
  });

  describe('Vue destination (clause 7)', () => {
    it('.ts → .vue accepted', () => {
      assert.strictEqual(isPairSupported(info('.ts', '.vue')), true);
    });

    it('.vue → .vue accepted', () => {
      assert.strictEqual(isPairSupported(info('.vue', '.vue')), true);
    });

    it('.json → .vue accepted', () => {
      assert.strictEqual(isPairSupported(info('.json', '.vue')), true);
    });

    it('.css → .vue rejected', () => {
      assert.strictEqual(isPairSupported(info('.css', '.vue')), false);
    });
  });

  describe('Svelte destination (clause 8)', () => {
    it('.ts → .svelte accepted', () => {
      assert.strictEqual(isPairSupported(info('.ts', '.svelte')), true);
    });

    it('.svelte → .svelte accepted', () => {
      assert.strictEqual(isPairSupported(info('.svelte', '.svelte')), true);
    });

    it('.scss → .svelte rejected', () => {
      assert.strictEqual(isPairSupported(info('.scss', '.svelte')), false);
    });
  });

  describe('Astro destination (clause 9)', () => {
    it('.ts → .astro accepted', () => {
      assert.strictEqual(isPairSupported(info('.ts', '.astro')), true);
    });

    it('.astro → .astro accepted', () => {
      assert.strictEqual(isPairSupported(info('.astro', '.astro')), true);
    });

    it('.vue → .astro accepted', () => {
      assert.strictEqual(isPairSupported(info('.vue', '.astro')), true);
    });

    it('.md → .astro accepted', () => {
      assert.strictEqual(isPairSupported(info('.md', '.astro')), true);
    });

    it('.css → .astro rejected', () => {
      assert.strictEqual(isPairSupported(info('.css', '.astro')), false);
    });
  });
});
