import * as vscode from "vscode";
import { expect } from "chai";
import * as sinon from "sinon";
import { executePasteImportCommand } from "../../commands";

describe("executePasteImportCommand", () => {
  let showInfoMessageSpy: sinon.SinonSpy;
  let showWarningMessageSpy: sinon.SinonSpy;

  beforeEach(async () => {
    // Clear clipboard and reset spies before each test
    await vscode.env.clipboard.writeText("");
    showInfoMessageSpy = sinon.spy(vscode.window, "showInformationMessage");
    showWarningMessageSpy = sinon.spy(vscode.window, "showWarningMessage");
  });

  afterEach(() => {
    // Restore spies to avoid leaks
    sinon.restore();
  });

  it("should paste the import statement into the active editor", async () => {
    // Mock the active text editor with a file URI
    const mockFilePath = "/Users/user/project/src/index.ts";
    const mockUri = vscode.Uri.file(mockFilePath);
    const mockDocument = {
      uri: mockUri,
    } as vscode.TextDocument;
    
    // Mock the active text editor
    vscode.window.activeTextEditor = {
      document: mockDocument,
    } as vscode.TextEditor;

    // Mock the copied file path
    const copiedFilePath = "/Users/user/project/src/utils/helper.ts";
    await vscode.env.clipboard.writeText(copiedFilePath);

    // Execute the paste import command
    await executePasteImportCommand();

    // Assertion: Information message should be displayed with the correct file path
    expect(showInfoMessageSpy.calledOnce).to.be.true;
    expect(showInfoMessageSpy.calledWith(`Auto Import: Copied helper.ts`)).to.be.true;
  });

  it("should show a warning if the file is the same as the source", async () => {
    // Mock the active text editor with a file URI
    const mockFilePath = "/Users/user/project/src/index.ts";
    const mockUri = vscode.Uri.file(mockFilePath);
    const mockDocument = {
      uri: mockUri,
    } as vscode.TextDocument;
    
    // Mock the active text editor
    vscode.window.activeTextEditor = {
      document: mockDocument,
    } as vscode.TextEditor;

    // Mock the clipboard with the same file path as the active editor
    await vscode.env.clipboard.writeText(mockFilePath);

    // Execute the paste import command
    await executePasteImportCommand();

    // Assertion: A warning message should be shown for same file path
    expect(showWarningMessageSpy.calledOnce).to.be.true;
    expect(showWarningMessageSpy.calledWith("Same file path.")).to.be.true;
  });

  it("should show a warning for unsupported file types", async () => {
    // Mock the active text editor with a file URI (for unsupported file type)
    const mockFilePath = "/Users/user/project/src/index.css";
    const mockUri = vscode.Uri.file(mockFilePath);
    const mockDocument = {
      uri: mockUri,
    } as vscode.TextDocument;
    
    // Mock the active text editor
    vscode.window.activeTextEditor = {
      document: mockDocument,
    } as vscode.TextEditor;

    // Mock the copied file path for an unsupported import
    const copiedFilePath = "/Users/user/project/src/assets/logo.svg";
    await vscode.env.clipboard.writeText(copiedFilePath);

    // Execute the paste import command
    await executePasteImportCommand();

    // Assertion: Warning for unsupported import scenario
    expect(showWarningMessageSpy.calledOnce).to.be.true;
    expect(showWarningMessageSpy.calledWith("Not supported.")).to.be.true;
  });
});
