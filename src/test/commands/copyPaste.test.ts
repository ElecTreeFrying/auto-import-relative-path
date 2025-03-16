import * as sinon from 'sinon';
import { expect } from 'chai';
import { executeCopyPasteCommand } from '../../commands';
import * as copyFilePathCommand from '../../commands/copy-file-path.command';
import * as pasteImportCommand from '../../commands/paste-import.command';

describe('executeCopyPasteCommand', () => {
  let copyFilePathStub: sinon.SinonStub;
  let pasteImportStub: sinon.SinonStub;

  beforeEach(() => {
    copyFilePathStub = sinon.stub(copyFilePathCommand, 'executeCopyFilePathCommand').resolves();
    pasteImportStub = sinon.stub(pasteImportCommand, 'executePasteImportCommand').resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call copyFilePath and then pasteImport in sequence', async () => {
    await executeCopyPasteCommand();

    expect(copyFilePathStub.calledOnce).to.be.true;
    expect(pasteImportStub.calledOnce).to.be.true;
    expect(copyFilePathStub.calledBefore(pasteImportStub)).to.be.true;
  });

  it('should handle errors gracefully', async () => {
    copyFilePathStub.rejects(new Error('Copy failed'));

    try {
      await executeCopyPasteCommand();
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Copy failed');
    }

    expect(copyFilePathStub.calledOnce).to.be.true;
    expect(pasteImportStub.called).to.be.false;
  });
});
