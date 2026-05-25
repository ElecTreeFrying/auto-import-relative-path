import * as assert from 'assert';

import { extractFirstExportedClassName } from '../snippets/_class-name';

describe('extractFirstExportedClassName', () => {
  it('returns the class name for a basic exported class', () => {
    assert.strictEqual(extractFirstExportedClassName('export class Foo {}'), 'Foo');
  });

  it('returns the class name for an exported abstract class', () => {
    assert.strictEqual(extractFirstExportedClassName('export abstract class Foo {}'), 'Foo');
  });

  it('returns the class name when the class has generic parameters', () => {
    assert.strictEqual(extractFirstExportedClassName('export class Repository<T> {}'), 'Repository');
  });

  it('returns the class name when the class extends another', () => {
    assert.strictEqual(extractFirstExportedClassName('export class Foo extends Bar {}'), 'Foo');
  });

  it('returns the class name when the class implements interfaces', () => {
    assert.strictEqual(extractFirstExportedClassName('export class Foo implements OnInit, OnDestroy {}'), 'Foo');
  });

  it('returns the class name when preceded by a decorator', () => {
    const content = [
      "@Component({ selector: 'app-nav' })",
      'export class NavigationComponent {}',
    ].join('\n');
    assert.strictEqual(extractFirstExportedClassName(content), 'NavigationComponent');
  });

  it('returns the class name when preceded by a multiline decorator', () => {
    const content = [
      '@Component({',
      "  selector: 'app-root',",
      "  templateUrl: './app.component.html',",
      '})',
      'export class AppComponent {}',
    ].join('\n');
    assert.strictEqual(extractFirstExportedClassName(content), 'AppComponent');
  });

  it('returns the first class when multiple exported classes exist', () => {
    const content = [
      'export class First {}',
      'export class Second {}',
    ].join('\n');
    assert.strictEqual(extractFirstExportedClassName(content), 'First');
  });

  it('returns null for an export default class', () => {
    assert.strictEqual(extractFirstExportedClassName('export default class Foo {}'), null);
  });

  it('returns null for a single-line commented export class', () => {
    assert.strictEqual(extractFirstExportedClassName('// export class Foo {}'), null);
  });

  it('returns null for an export class inside a block comment', () => {
    const content = [
      '/*',
      'export class CommentedOut {}',
      '*/',
    ].join('\n');
    assert.strictEqual(extractFirstExportedClassName(content), null);
  });

  it('skips a block-commented class and finds the real one', () => {
    const content = [
      '/*',
      'export class FakeComponent {}',
      '*/',
      'export class RealComponent {}',
    ].join('\n');
    assert.strictEqual(extractFirstExportedClassName(content), 'RealComponent');
  });

  it('returns null for an indented export class (namespace-level)', () => {
    assert.strictEqual(extractFirstExportedClassName('  export class Foo {}'), null);
  });

  it('returns null for a re-export statement', () => {
    assert.strictEqual(extractFirstExportedClassName("export { Foo } from './bar';"), null);
  });

  it('returns null for an exported function', () => {
    assert.strictEqual(extractFirstExportedClassName('export function doSomething() {}'), null);
  });

  it('returns null for an exported const', () => {
    assert.strictEqual(extractFirstExportedClassName('export const FOO = 1;'), null);
  });

  it('returns null for an exported type', () => {
    assert.strictEqual(extractFirstExportedClassName('export type Foo = string;'), null);
  });

  it('returns null for an exported interface', () => {
    assert.strictEqual(extractFirstExportedClassName('export interface Foo {}'), null);
  });

  it('returns null for an empty string', () => {
    assert.strictEqual(extractFirstExportedClassName(''), null);
  });

  it('returns null for a file with only imports', () => {
    const content = [
      "import { Component } from '@angular/core';",
      "import { OnInit } from '@angular/core';",
    ].join('\n');
    assert.strictEqual(extractFirstExportedClassName(content), null);
  });

  it('returns the class name when preceded by unrelated code', () => {
    const content = [
      "import { Injectable } from '@angular/core';",
      '',
      'const helper = () => {};',
      '',
      '@Injectable()',
      'export class AuthService {}',
    ].join('\n');
    assert.strictEqual(extractFirstExportedClassName(content), 'AuthService');
  });

  it('returns null for a non-exported class', () => {
    assert.strictEqual(extractFirstExportedClassName('class Foo {}'), null);
  });
});
