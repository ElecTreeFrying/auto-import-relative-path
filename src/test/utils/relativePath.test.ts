import { expect } from 'chai';
import { computeRelativePath } from '../../utils/relative-path.util';

describe('computeRelativePath', () => {
  it('should return the correct relative path between two files in different directories', () => {

    const relativePath = computeRelativePath();

    expect(relativePath).to.equal('../components/fileB');
  });

  it('should return "./fileB" when both files are in the same directory', () => {

    const relativePath = computeRelativePath();

    expect(relativePath).to.equal('./fileB');
  });

  it('should return the correct relative path for deeply nested directories', () => {

    const relativePath = computeRelativePath();

    expect(relativePath).to.equal('../../components/ui/fileB');
  });

  it('should return the correct relative path when moving from a nested directory to a parent directory', () => {

    const relativePath = computeRelativePath();

    expect(relativePath).to.equal('../fileB');
  });
});
