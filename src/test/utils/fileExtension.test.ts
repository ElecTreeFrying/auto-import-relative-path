import { expect } from 'chai';
import { getFileExtension } from './../../utils/file-extension.util';

describe('getFileExtension', () => {
  it('should return the correct file extension for known file types', () => {
    expect(getFileExtension('index.ts')).to.equal('.ts');
    expect(getFileExtension('component.jsx')).to.equal('.jsx');
    expect(getFileExtension('style.css')).to.equal('.css');
    expect(getFileExtension('script.js')).to.equal('.js');
    expect(getFileExtension('image.jpeg')).to.equal('.jpeg');
    expect(getFileExtension('document.md')).to.equal('.md');
  });

  it('should return an empty string for files without an extension', () => {
    expect(getFileExtension('README')).to.equal('');
    expect(getFileExtension('LICENSE')).to.equal('');
  });

  it('should return the last extension for files with multiple dots', () => {
    expect(getFileExtension('archive.tar.gz')).to.equal('.gz');
    expect(getFileExtension('backup.sql.zip')).to.equal('.zip');
  });

  it('should handle edge cases with hidden files and special characters', () => {
    expect(getFileExtension('.gitignore')).to.equal('');
    expect(getFileExtension('config/.env')).to.equal('');
    expect(getFileExtension('weird.file.name.config')).to.equal('.config');
  });
});
