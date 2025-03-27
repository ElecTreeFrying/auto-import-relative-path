import { expect } from 'chai';
import { extractFileExtension } from './../../utils';

describe('extractFileExtension', () => {
  it('should return the correct file extension for known file types', () => {
    expect(extractFileExtension('index.ts')).to.equal('.ts');
    expect(extractFileExtension('component.jsx')).to.equal('.jsx');
    expect(extractFileExtension('style.css')).to.equal('.css');
    expect(extractFileExtension('script.js')).to.equal('.js');
    expect(extractFileExtension('image.jpeg')).to.equal('.jpeg');
    expect(extractFileExtension('document.md')).to.equal('.md');
  });

  it('should return an empty string for files without an extension', () => {
    expect(extractFileExtension('README')).to.equal('');
    expect(extractFileExtension('LICENSE')).to.equal('');
  });

  it('should return the last extension for files with multiple dots', () => {
    expect(extractFileExtension('archive.tar.gz')).to.equal('.gz');
    expect(extractFileExtension('backup.sql.zip')).to.equal('.zip');
  });

  it('should handle edge cases with hidden files and special characters', () => {
    expect(extractFileExtension('.gitignore')).to.equal('');
    expect(extractFileExtension('config/.env')).to.equal('');
    expect(extractFileExtension('weird.file.name.config')).to.equal('.config');
  });
});
