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

    it('.component path produces literal PascalCase (no tab stop)', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './app-root.component');
      assert.strictEqual(result.value, "import { AppRootComponent } from './app-root.component';");
    });

    it('.component.ts path strips .ts extension before deriving the Angular identifier', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './app-root.component.ts');
      assert.strictEqual(result.value, "import { AppRootComponent } from './app-root.component.ts';");
    });

    it('.directive path produces correct PascalCase', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './highlight.directive');
      assert.strictEqual(result.value, "import { HighlightDirective } from './highlight.directive';");
    });

    it('.pipe path produces correct PascalCase', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './trim.pipe');
      assert.strictEqual(result.value, "import { TrimPipe } from './trim.pipe';");
    });

    it('.service path produces correct PascalCase', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './user.service');
      assert.strictEqual(result.value, "import { UserService } from './user.service';");
    });

    it('.module path produces correct PascalCase', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './auth.module');
      assert.strictEqual(result.value, "import { AuthModule } from './auth.module';");
    });

    it('detectedImportName takes priority over Angular .component path', () => {
      const result = buildTypeScriptImportSnippetByStyle(0, './app-root.component', 'DetectedName');
      assert.strictEqual(result.value, "import { ${1:DetectedName} } from './app-root.component';");
    });
  });

  describe('indexes 1–6 — fixed shapes (ignore detectedImportName)', () => {
    it('index 1: ES module default import', () => {
      const result = buildTypeScriptImportSnippetByStyle(1, PATH);
      assert.strictEqual(result.value, `import $1 from '${PATH}';`);
    });

    it('index 2: ES module namespace import', () => {
      const result = buildTypeScriptImportSnippetByStyle(2, PATH);
      assert.strictEqual(result.value, `import * as $1 from '${PATH}';`);
    });

    it('index 3: ES module side-effect import', () => {
      const result = buildTypeScriptImportSnippetByStyle(3, PATH);
      assert.strictEqual(result.value, `import '${PATH}';`);
    });

    it('index 4: type-only import', () => {
      const result = buildTypeScriptImportSnippetByStyle(4, PATH);
      assert.strictEqual(result.value, `import type { $1 } from '${PATH}';`);
    });

    it('index 5: mixed value + type import', () => {
      const result = buildTypeScriptImportSnippetByStyle(5, PATH);
      assert.strictEqual(result.value, `import { $1, type $2 } from '${PATH}';`);
    });

    it('index 6: dynamic import', () => {
      const result = buildTypeScriptImportSnippetByStyle(6, PATH);
      assert.strictEqual(result.value, `const $1 = await import('${PATH}');`);
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
