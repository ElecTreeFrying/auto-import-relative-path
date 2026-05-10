import * as assert from 'assert';

import { buildJavaScriptImportSnippetByStyle } from '../snippets/javascript';
import { buildTypeScriptImportSnippetByStyle } from '../snippets/typescript';
import { buildCssImportSnippetByStyle } from '../snippets/css';
import { buildScssImportSnippetByStyle } from '../snippets/scss';
import { buildMarkdownImageImportSnippetByStyle } from '../snippets/markdown';

describe('buildJavaScriptImportSnippetByStyle', () => {
  const path = './foo';

  const cases: Array<[number, string]> = [
    [0, "import $1 from './foo';"],
    [1, "import { $1 } from './foo';"],
    [2, "import { default as $1 } from './foo';"],
    [3, "import * as $1 from './foo';"],
    [4, "import './foo';"],
    [5, "var $1 = require('./foo');"],
    [6, "const $1 = require('./foo');"],
    [7, "var $1 = import('./foo');"],
    [8, "const $1 = import('./foo');"],
  ];

  for (const [index, expected] of cases) {
    it(`renders index ${index} as ${expected}`, () => {
      assert.strictEqual(buildJavaScriptImportSnippetByStyle(index, path).value, expected);
    });
  }

  it('falls through to the default-import shape on undefined index', () => {
    assert.strictEqual(buildJavaScriptImportSnippetByStyle(undefined, path).value, "import $1 from './foo';");
  });
});

describe('buildTypeScriptImportSnippetByStyle', () => {
  const path = './foo';

  const cases: Array<[number, string]> = [
    [0, "import $1 from './foo';"],
    [2, "import { default as $1 } from './foo';"],
    [3, "import * as $1 from './foo';"],
    [4, "import './foo';"],
  ];

  for (const [index, expected] of cases) {
    it(`renders index ${index} as ${expected}`, () => {
      assert.strictEqual(buildTypeScriptImportSnippetByStyle(index, path).value, expected);
    });
  }

  it('falls through to the named-import shape on undefined index', () => {
    assert.strictEqual(buildTypeScriptImportSnippetByStyle(undefined, path).value, "import { $1 } from './foo';");
  });

  it('renders index 1 with $1 placeholder for non-Angular paths', () => {
    assert.strictEqual(buildTypeScriptImportSnippetByStyle(1, './foo').value, "import { $1 } from './foo';");
  });

  it('renders index 1 with PascalCase substitution for .component paths', () => {
    assert.strictEqual(
      buildTypeScriptImportSnippetByStyle(1, './app-root.component').value,
      "import { AppRootComponent } from './app-root.component';",
    );
  });

  it('renders index 1 with PascalCase substitution for .service paths', () => {
    assert.strictEqual(
      buildTypeScriptImportSnippetByStyle(1, './data.service').value,
      "import { DataService } from './data.service';",
    );
  });

  it('strips a trailing .ts extension before deriving the Angular identifier', () => {
    assert.strictEqual(
      buildTypeScriptImportSnippetByStyle(1, './app-root.component.ts').value,
      "import { AppRootComponent } from './app-root.component.ts';",
    );
  });
});

describe('buildCssImportSnippetByStyle', () => {
  const path = './styles.css';

  it('renders index 0 as @import with quoted path', () => {
    assert.strictEqual(buildCssImportSnippetByStyle(0, path).value, "@import './styles.css';");
  });

  it('renders index 1 as @import url()', () => {
    assert.strictEqual(buildCssImportSnippetByStyle(1, path).value, "@import url('./styles.css');");
  });

  it('falls through to quoted @import on undefined index', () => {
    assert.strictEqual(buildCssImportSnippetByStyle(undefined, path).value, "@import './styles.css';");
  });
});

describe('buildScssImportSnippetByStyle', () => {
  const path = './partial';

  const cases: Array<[number, string]> = [
    [0, "@import './partial';"],
    [1, "@import url('./partial');"],
    [2, "@use './partial';"],
    [3, "@use './partial' as ${1:*};"],
  ];

  for (const [index, expected] of cases) {
    it(`renders index ${index} as ${expected}`, () => {
      assert.strictEqual(buildScssImportSnippetByStyle(index, path).value, expected);
    });
  }

  it('falls through to quoted @import on undefined index', () => {
    assert.strictEqual(buildScssImportSnippetByStyle(undefined, path).value, "@import './partial';");
  });
});

describe('buildMarkdownImageImportSnippetByStyle', () => {
  const path = './hero.png';

  it('renders index 0 as inline image with hover text', () => {
    assert.strictEqual(
      buildMarkdownImageImportSnippetByStyle(0, path).value,
      '![alt-text](./hero.png "Hover text")',
    );
  });

  it('renders index 1 as reference-style image', () => {
    assert.strictEqual(
      buildMarkdownImageImportSnippetByStyle(1, path).value,
      '![alt-text][image] / [image]: ./hero.png "Hover text"',
    );
  });

  it('falls through to inline shape on undefined index', () => {
    assert.strictEqual(
      buildMarkdownImageImportSnippetByStyle(undefined, path).value,
      '![alt-text](./hero.png "Hover text")',
    );
  });
});
