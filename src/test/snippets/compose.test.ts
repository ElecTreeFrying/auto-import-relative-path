import * as assert from 'assert';

import { joinImportStatements, shiftTabStops } from '../../snippets/compose';

// Pure string logic that lets a multi-file drop stack N import statements without their
// `$1` tab stops colliding (VS Code links equal-numbered tab stops, so a raw join would make
// typing one import's name overwrite every other). `shiftTabStops` offsets one statement's tab
// stops; `joinImportStatements` chains the offset across statements and assembles the block.

describe('snippets/compose — shiftTabStops', () => {
  it('leaves tab stops unchanged at offset 0 and reports the original max tab stop', () => {
    const result = shiftTabStops('import { ${1:name} } from \'./a\'; $2', 0);
    assert.strictEqual(result.value, 'import { ${1:name} } from \'./a\'; $2');
    assert.strictEqual(result.maxStop, 2);
  });

  it('adds the offset to every tab stop number — both ${N:default} and bare $N forms', () => {
    const result = shiftTabStops('a ${1:x} b $2', 3);
    assert.strictEqual(result.value, 'a ${4:x} b $5');
    assert.strictEqual(result.maxStop, 2, 'maxStop is the original (pre-offset) max');
  });

  it('reports maxStop 0 for a tab-stop-free statement (so it consumes no offset)', () => {
    const result = shiftTabStops("import './side-effect.css';", 5);
    assert.strictEqual(result.value, "import './side-effect.css';");
    assert.strictEqual(result.maxStop, 0);
  });

  it('preserves the placeholder default text while renumbering', () => {
    const result = shiftTabStops('${1:caption}', 4);
    assert.strictEqual(result.value, '${5:caption}');
  });
});

describe('snippets/compose — joinImportStatements', () => {
  it('renders a single statement as indentation + value + trailing newline, tab stops untouched', () => {
    assert.strictEqual(
      joinImportStatements(["import { $1 } from './a';"], ''),
      "import { $1 } from './a';\n",
    );
  });

  it('gives two statements independent tab stops ($1, then $2)', () => {
    assert.strictEqual(
      joinImportStatements(["import $1 from './a';", "import $1 from './b';"], ''),
      "import $1 from './a';\nimport $2 from './b';\n",
    );
  });

  it('renumbers the ${1:name} placeholder form across statements, keeping the default', () => {
    assert.strictEqual(
      joinImportStatements(["import ${1:name} from './a';", "import ${1:name} from './b';"], ''),
      "import ${1:name} from './a';\nimport ${2:name} from './b';\n",
    );
  });

  it('shifts the next statement past a multi-tab-stop statement ($1+$2 → next starts at $3)', () => {
    assert.strictEqual(
      joinImportStatements([
        "<img src='a' alt='${1:alt}' title='$2'>",
        "<img src='b' alt='${1:alt}'>",
      ], ''),
      "<img src='a' alt='${1:alt}' title='$2'>\n<img src='b' alt='${3:alt}'>\n",
    );
  });

  it('lets a tab-stop-free statement consume no offset', () => {
    assert.strictEqual(
      joinImportStatements(["import './side-effect.css';", "import $1 from './b';"], ''),
      "import './side-effect.css';\nimport $1 from './b';\n",
    );
  });

  it('preserves a multi-line statement and shifts its tab stops as one unit', () => {
    const figure = [
      '\\begin{figure}',
      '    \\caption{${1:caption}}',
      '    \\label{fig:${2:label}}',
      '\\end{figure}',
    ].join('\n');
    const result = joinImportStatements([figure, figure], '');
    // First figure keeps 1/2; second figure shifts to 3/4.
    assert.ok(result.includes('\\caption{${1:caption}}'), 'first caption stays $1');
    assert.ok(result.includes('\\label{fig:${2:label}}'), 'first label stays $2');
    assert.ok(result.includes('\\caption{${3:caption}}'), 'second caption shifts to $3');
    assert.ok(result.includes('\\label{fig:${4:label}}'), 'second label shifts to $4');
    assert.ok(result.endsWith('\\end{figure}\n'), 'block ends with a single trailing newline');
  });

  it('prefixes each statement first line with the given indentation', () => {
    assert.strictEqual(
      joinImportStatements(["import $1 from './a';", "import $1 from './b';"], '  '),
      "  import $1 from './a';\n  import $2 from './b';\n",
    );
  });
});
