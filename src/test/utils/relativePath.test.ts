import { expect } from 'chai';
import { computeRelativePath } from './../../commands/utils';

describe('computeRelativePath', () => {
  it('should return the correct relative path between two files in different directories', () => {
    const sourceFilePath = '/Users/dev/project/src/utils/fileA.ts';
    const targetFilePath = '/Users/dev/project/src/components/fileB.ts';

    const relativePath = computeRelativePath(sourceFilePath, targetFilePath);

    expect(relativePath).to.equal('../components/fileB');
  });

  it('should return "./fileB" when both files are in the same directory', () => {
    const sourceFilePath = '/Users/dev/project/src/utils/fileA.ts';
    const targetFilePath = '/Users/dev/project/src/utils/fileB.ts';

    const relativePath = computeRelativePath(sourceFilePath, targetFilePath);

    expect(relativePath).to.equal('./fileB');
  });

  it('should return the correct relative path for deeply nested directories', () => {
    const sourceFilePath = '/Users/dev/project/src/utils/deep/fileA.ts';
    const targetFilePath = '/Users/dev/project/src/components/ui/fileB.ts';

    const relativePath = computeRelativePath(sourceFilePath, targetFilePath);

    expect(relativePath).to.equal('../../components/ui/fileB');
  });

  it('should return the correct relative path when moving from a nested directory to a parent directory', () => {
    const sourceFilePath = '/Users/dev/project/src/utils/deep/fileA.ts';
    const targetFilePath = '/Users/dev/project/src/utils/fileB.ts';

    const relativePath = computeRelativePath(sourceFilePath, targetFilePath);

    expect(relativePath).to.equal('../fileB');
  });
});
