import { expect } from 'chai';
import { generateImportStatementSnippet} from './../../commands/utils';

describe('generateImportStatementSnippet', () => {
  it('should generate a correct import snippet for JavaScript files', () => {
    const relativePath = './utils/helper';
    const sourceFilePath = '/project/src/utils/helper.js';
    const destinationFilePath = '/project/src/index.js';

    const snippet = generateImportStatementSnippet(relativePath, sourceFilePath, destinationFilePath);

    expect(snippet.value).to.include(`import`);
    expect(snippet.value).to.include(`'${relativePath}'`);
  });

  it('should generate a correct import snippet for TypeScript files', () => {
    const relativePath = './models/user';
    const sourceFilePath = '/project/src/models/user.ts';
    const destinationFilePath = '/project/src/index.ts';

    const snippet = generateImportStatementSnippet(relativePath, sourceFilePath, destinationFilePath);

    expect(snippet.value).to.include(`import`);
    expect(snippet.value).to.include(`'${relativePath}'`);
  });

  it('should generate an empty snippet for unsupported file types', () => {
    const relativePath = './assets/logo.png';
    const sourceFilePath = '/project/src/assets/logo.png';
    const destinationFilePath = '/project/src/index.js';

    const snippet = generateImportStatementSnippet(relativePath, sourceFilePath, destinationFilePath);

    expect(snippet.value).to.equal('');
  });

  it('should return a CSS import statement when importing a CSS file', () => {
    const relativePath = './styles/main.css';
    const sourceFilePath = '/project/src/styles/main.css';
    const destinationFilePath = '/project/src/index.js';

    const snippet = generateImportStatementSnippet(relativePath, sourceFilePath, destinationFilePath);

    expect(snippet.value).to.include(`import`);
    expect(snippet.value).to.include(`'${relativePath}'`);
  });
});
