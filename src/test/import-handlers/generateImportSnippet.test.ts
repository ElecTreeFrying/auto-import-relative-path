import { expect } from 'chai';
import { generateImportStatementSnippet} from './../../commands/utils';

describe('generateImportStatementSnippet', () => {
  it('should generate a correct import snippet for JavaScript files', async () => {
    const relativePath = './utils/helper';

    const snippet = await generateImportStatementSnippet();

    expect(snippet.value).to.include(`import`);
    expect(snippet.value).to.include(`'${relativePath}'`);
  });

  it('should generate a correct import snippet for TypeScript files', async () => {
    const relativePath = './models/user';

    const snippet = await generateImportStatementSnippet();

    expect(snippet.value).to.include(`import`);
    expect(snippet.value).to.include(`'${relativePath}'`);
  });

  it('should generate an empty snippet for unsupported file types', async () => {

    const snippet = await generateImportStatementSnippet();

    expect(snippet.value).to.equal('');
  });

  it('should return a CSS import statement when importing a CSS file', async () => {
    const relativePath = './styles/main.css';

    const snippet = await generateImportStatementSnippet();

    expect(snippet.value).to.include(`import`);
    expect(snippet.value).to.include(`'${relativePath}'`);
  });
});
