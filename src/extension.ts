// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "lineputscript" is now active!');
  const lineputscript = "lineputscript";
  const subSplit = ":|";
  const subSplitFormat = " :| ";
  const regexSubSplit = new RegExp(" *(:\\|) *", "g");
  const dataSplit = "#";
  const dataSplitFormat = " # ";
  const regexDataSplit = new RegExp(" *# *", "g");
  const regexIndentation = new RegExp("^[ \t]+");
  const lineFeedThreshold: number = vscode.workspace
    .getConfiguration(lineputscript)
    .get("lineFeedThreshold") as number;
  const formatterSwitch: Boolean = vscode.workspace
    .getConfiguration(lineputscript)
    .get("formatterSwitch") as boolean;
  let lineEdits: vscode.TextEdit[] = [];
  function formatLineData(lineData: string): string {
    let line = lineData.replace(regexSubSplit, subSplitFormat);
    if (line.endsWith(subSplitFormat)) {
      line = line.substring(0, line.length - 1);
    }
    line = line.replace(regexDataSplit, dataSplitFormat);
    if (line.length > lineFeedThreshold) {
      let newLine = "";
      line.split(subSplitFormat).forEach((sub, i, array) => {
        if (i === array.length - 1) {
          newLine += sub;
        } else {
          // TODO: 拿不到用户的缩进设置 先凑合
          newLine += sub + " " + subSplit + "\n\t";
        }
      });
      line = newLine;
    }
    return line;
  }
  function replaceLines(
    textLines: vscode.TextLine[],
    originalLineData: string
  ) {
    var lineData = formatLineData(originalLineData);
    // TODO : 如果格式化前后相同 则取消格式化 (会占用撤回空间)
    // if (lineData === originalLineData) {
    //   return;
    // }
    lineEdits.push(vscode.TextEdit.replace(textLines[0].range, lineData));
    for (let index = 1; index < textLines.length; index++) {
      lineEdits.push(
        vscode.TextEdit.delete(textLines[index].rangeIncludingLineBreak)
      );
    }
  }
  function formatDocument(
    document: vscode.TextDocument
  ): Thenable<vscode.TextEdit[]> {
    return new Promise((resolve, reject) => {
      if (true) {
        // ! : 暂时关闭格式化
        vscode.window.showWarningMessage(
          "LPS does not support formatting at the moment"
        );
        return;
      }
      lineEdits = [];
      let lineData: string = document.lineAt(0).text;
      let tempLine: vscode.TextLine = document.lineAt(0);
      let textLines: vscode.TextLine[] = [tempLine];
      for (let lineIndex = 1; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        if (regexIndentation.exec(line.text)) {
          // 存在缩进则删除
          textLines.push(line);
          lineData += line.text.replace(regexIndentation, "");
          if (lineIndex === document.lineCount - 1) {
            // 设置尾行
            replaceLines(textLines, lineData);
            break;
          }
        } else {
          replaceLines(textLines, lineData);
          lineData = line.text;
          tempLine = line;
          textLines = [tempLine];
          if (lineIndex === document.lineCount - 1) {
            // 设置尾行
            replaceLines(textLines, lineData);
            break;
          }
        }
      }
      resolve(lineEdits);
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
  context.subscriptions.push(formatCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
