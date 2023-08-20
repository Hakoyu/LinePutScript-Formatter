// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import { spawn } from "child_process";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "lineputscript" is now active!');
  const subSplit = ":|";
  const subSplitFormat = " :| ";
  const regexSubSplit = new RegExp(" *(:\\|) *", "g");
  const dataSplit = "#";
  const dataSplitFormat = " # ";
  const regexDataSplit = new RegExp(" *# *", "g");
  function formatDocument(
    document: vscode.TextDocument
  ): Thenable<vscode.TextEdit[]> {
    return new Promise((resolve, reject) => {
      let lines = [];
      for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        let tempLine = line.text.replace(regexSubSplit, subSplitFormat);
        if (tempLine.endsWith(":| ")) {
          tempLine = tempLine.substring(0, tempLine.length - 1);
        }
        tempLine = tempLine.replace(regexDataSplit, dataSplitFormat);
		// TODO : 长度放到设置中让玩家自定义
        if (tempLine.length > 64) {
          let newLine = "";
          tempLine.split(subSplitFormat).forEach((sub, i, array) => {
            if (i === array.length - 1) {
              newLine += sub;
            } else {
              // TODO: 拿不到用户的缩进设置 先凑合
              newLine += sub + " " + subSplit + "\n\t";
            }
          });
          tempLine = newLine;
        }
        lines.push(vscode.TextEdit.replace(line.range, tempLine));
      }
      resolve(lines);
    });
  }
  vscode.languages.registerDocumentFormattingEditProvider("lps", {
    provideDocumentFormattingEdits(
      document: vscode.TextDocument,
      options: vscode.FormattingOptions,
      token: vscode.CancellationToken
    ): Thenable<vscode.TextEdit[]> {
      return formatDocument(document);
    },
  });

  let formatCommand = vscode.commands.registerCommand(
    "lineputscript.format",
    () => {
      const document = vscode.window.activeTextEditor?.document;
      if (document) {
        formatDocument(document).then((edits: vscode.TextEdit[]) => {
          let edit = new vscode.WorkspaceEdit();
          edit.set(document.uri, edits);
          vscode.workspace.applyEdit(edit);
        });
      }
    }
  );

  // // The command has been defined in the package.json file
  // // Now provide the implementation of the command with registerCommand
  // // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('lps-formatters.helloWorld', () => {
  // 	// The code you place here will be executed every time your command is executed
  // 	// Display a message box to the user
  // 	vscode.window.showInformationMessage('Hello World from LPS-Formatters!');
  // });

  context.subscriptions.push(formatCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
