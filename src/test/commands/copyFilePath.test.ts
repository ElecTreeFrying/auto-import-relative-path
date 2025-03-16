import * as vscode from "vscode";
import * as sinon from "sinon";
import { expect } from "chai";
import { executeCopyFilePathCommand } from "../../commands";

describe("executeCopyFilePathCommand", () => {
  beforeEach(async () => {
    // Ensure clipboard is empty before each test
    await vscode.env.clipboard.writeText("");
  });

  it("should copy the active file's path to the clipboard", async () => {
    // Mock an active text editor with a file URI
    const mockFilePath = "/Users/user/project/src/index.ts";
    const mockUri = vscode.Uri.file(mockFilePath);
    const mockDocument = {
      uri: mockUri,
    } as vscode.TextDocument;
    
    // Stub the active text editor
    vscode.window.activeTextEditor = {
      document: mockDocument,
    } as vscode.TextEditor;

    // Execute the command
    await executeCopyFilePathCommand();

    // Read the clipboard
    const clipboardText = await vscode.env.clipboard.readText();

    // Assertion: Clipboard should contain the correct file path
    expect(clipboardText).to.equal(mockFilePath);
  });

  it("should show a notification with the copied file name", async () => {
    // Spy on the VS Code notification
    const showInfoMessageSpy = sinon.spy(vscode.window, "showInformationMessage");

    // Mock file path
    const mockFilePath = "/Users/user/project/src/index.ts";
    await vscode.env.clipboard.writeText(mockFilePath);

    // Execute the command
    await executeCopyFilePathCommand();

    // Assertion: Notification should be displayed with correct file name
    expect(showInfoMessageSpy.calledOnce).to.be.true;
    expect(showInfoMessageSpy.calledWith(`Auto Import: Copied index.ts`)).to.be.true;

    // Restore the spy
    showInfoMessageSpy.restore();
  });
});
