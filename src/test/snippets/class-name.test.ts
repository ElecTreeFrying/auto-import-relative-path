import * as assert from 'assert';
import * as path from 'path';

import { extractFirstExportedClassName, readExportedClassName } from '../../snippets/_class-name';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/manual-qa-workspace');

describe('class-name', () => {
  describe('extractFirstExportedClassName', () => {
    it('detects export class Foo', () => {
      assert.strictEqual(extractFirstExportedClassName('export class Foo {}'), 'Foo');
    });

    it('detects export abstract class BaseService', () => {
      assert.strictEqual(
        extractFirstExportedClassName('export abstract class BaseService {}'),
        'BaseService'
      );
    });

    it('returns null for non-exported class', () => {
      assert.strictEqual(extractFirstExportedClassName('class Baz {}'), null);
    });

    it('returns null when no class exists', () => {
      assert.strictEqual(extractFirstExportedClassName('const x = 1;'), null);
    });

    it('returns null for single-line commented-out export class', () => {
      assert.strictEqual(
        extractFirstExportedClassName('// export class Ghost {}'),
        null
      );
    });

    it('returns null for block-commented export class', () => {
      assert.strictEqual(
        extractFirstExportedClassName('/* export class X {} */'),
        null
      );
    });

    it('returns first match when multiple exported classes exist', () => {
      const content = [
        'export class Alpha {}',
        'export class Beta {}',
      ].join('\n');
      assert.strictEqual(extractFirstExportedClassName(content), 'Alpha');
    });
  });

  describe('readExportedClassName', () => {
    it('reads class name from app-root.component.ts fixture', async () => {
      const filePath = path.join(FIXTURE_ROOT, 'src/components/app-root.component.ts');
      const result = await readExportedClassName(filePath);
      assert.strictEqual(result, 'AppRootComponent');
    });

    it('returns null for helpers.ts fixture (no exported class)', async () => {
      const filePath = path.join(FIXTURE_ROOT, 'src/helpers.ts');
      const result = await readExportedClassName(filePath);
      assert.strictEqual(result, null);
    });

    it('returns null for nonexistent path', async () => {
      const result = await readExportedClassName('/nonexistent/file.ts');
      assert.strictEqual(result, null);
    });
  });
});
