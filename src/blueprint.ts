import * as vscode from "vscode";
import "./helpers";
const BLUEPRINT_DASH_ESCAPE = "$7ce02ad5_1379_4f28-99df_f6dc2bf9e534$";

export class BlueprintLanguagePlugin {
  readonly language = "blueprint-gtk";

  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.languages.registerDocumentFormattingEditProvider(
        this.language,
        this.formatter
      ),
      vscode.languages.
      vscode.languages.registerCodeActionsProvider(
        this.language,
        this.codeActionProvider
      )
    );
  }

  codeActionProvider: vscode.CodeActionProvider = {
    provideCodeActions: (document, range, context, token) => {
      return new vscode.CodeAction("", vscode.CodeActionKind.)
    },
  };

  formatter: vscode.DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits: (document, options) => {
      let text = document.getText();
      return [
        vscode.TextEdit.replace(
          new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
          ),
          text
            .replaceAll("-", BLUEPRINT_DASH_ESCAPE)
            .jsBeautify({
              indent_with_tabs: !options.insertSpaces,
              indent_size: options.tabSize,
            })
            .replaceAll(BLUEPRINT_DASH_ESCAPE, "-")
            .insertAfter(/template\s[_a-zA-Z]+/gm, " ")
            .insertAfter(/styles\[/gm, " ", -1)
        ),
      ];
    },
  };
}
