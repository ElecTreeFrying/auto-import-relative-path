import * as assert from 'assert';

import { buildTypeScriptImportSnippetByStyle } from '../../../snippets/languages/typescript';

const PATH = './utils/helper';

describe('buildTypeScriptImportSnippetByStyle', () => {
  describe('index 0 — named import with class detection / Angular fallback', () => {
    it('no name, no Angular path produces bare $1 tab stop', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, PATH);
      assert.strictEqual(result.value, `import { $1 } from '${PATH}';`);
    });

    it('detectedImportName pre-fills the tab stop', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, PATH, 'Foo');
      assert.strictEqual(result.value, `import { \${1:Foo} } from '${PATH}';`);
    });

    it('.component path pre-fills a PascalCase tab stop', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './app-root.component');
      assert.strictEqual(result.value, "import { ${1:AppRootComponent} } from './app-root.component';");
    });

    it('.component.ts path strips .ts extension before deriving the Angular identifier', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './app-root.component.ts');
      assert.strictEqual(result.value, "import { ${1:AppRootComponent} } from './app-root.component.ts';");
    });

    it('.directive path produces correct PascalCase', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './highlight.directive');
      assert.strictEqual(result.value, "import { ${1:HighlightDirective} } from './highlight.directive';");
    });

    it('.pipe path produces correct PascalCase', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './trim.pipe');
      assert.strictEqual(result.value, "import { ${1:TrimPipe} } from './trim.pipe';");
    });

    it('.service path produces correct PascalCase', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './user.service');
      assert.strictEqual(result.value, "import { ${1:UserService} } from './user.service';");
    });

    it('.module path produces correct PascalCase', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './auth.module');
      assert.strictEqual(result.value, "import { ${1:AuthModule} } from './auth.module';");
    });

    it('.service path with a space in the basename falls back to a bare $1 tab stop', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './auth guard.service.ts');
      assert.strictEqual(result.value, "import { $1 } from './auth guard.service.ts';");
    });

    it('.service path with a leading-digit basename falls back to a bare $1 tab stop', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './123.service.ts');
      assert.strictEqual(result.value, "import { $1 } from './123.service.ts';");
    });

    it('detectedImportName takes priority over Angular .component path', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './app-root.component', 'DetectedName');
      assert.strictEqual(result.value, "import { ${1:DetectedName} } from './app-root.component';");
    });
  });

  describe('indexes 1–6 — fixed shapes (ignore detectedImportName)', () => {
    // Default-import positions (1, 2, 6) pre-fill the binding with the camelCased basename ('helper').
    const NAME = '${1:helper}';

    it('index 1: ES module default import (basename-derived binding)', () => {
      const result = buildTypeScriptImportSnippetByStyle(1, PATH);
      assert.strictEqual(result.value, `import ${NAME} from '${PATH}';`);
    });

    it('index 2: ES module namespace import (basename-derived binding)', () => {
      const result = buildTypeScriptImportSnippetByStyle(2, PATH);
      assert.strictEqual(result.value, `import * as ${NAME} from '${PATH}';`);
    });

    it('index 3: ES module side-effect import (no binding)', () => {
      const result = buildTypeScriptImportSnippetByStyle(3, PATH);
      assert.strictEqual(result.value, `import '${PATH}';`);
    });

    it('index 4: type-only import (not pre-filled)', () => {
      const result = buildTypeScriptImportSnippetByStyle(4, PATH);
      assert.strictEqual(result.value, `import type { $1 } from '${PATH}';`);
    });

    it('index 5: mixed value + type import (not pre-filled)', () => {
      const result = buildTypeScriptImportSnippetByStyle(5, PATH);
      assert.strictEqual(result.value, `import { $1, type $2 } from '${PATH}';`);
    });

    it('index 6: dynamic import (basename-derived binding)', () => {
      const result = buildTypeScriptImportSnippetByStyle(6, PATH);
      assert.strictEqual(result.value, `const ${NAME} = await import('${PATH}');`);
    });

    it('index 1: falls back to a bare $1 when the basename yields no legal identifier', () => {
      const result = buildTypeScriptImportSnippetByStyle(1, './assets/404');
      assert.strictEqual(result.value, "import $1 from './assets/404';");
    });
  });

  describe('default branch (undefined styleIndex)', () => {
    it('undefined + detectedImportName pre-fills the tab stop', () => {
      const result = buildTypeScriptImportSnippetByStyle(undefined, PATH, 'Bar');
      assert.strictEqual(result.value, `import { \${1:Bar} } from '${PATH}';`);
    });

    it('undefined + no name produces bare $1 (no Angular fallback)', () => {
      const result = buildTypeScriptImportSnippetByStyle(undefined, './app-root.component');
      assert.strictEqual(result.value, "import { $1 } from './app-root.component';");
    });
  });
});
