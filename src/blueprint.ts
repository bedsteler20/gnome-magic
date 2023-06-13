import * as vscode from "vscode";
import "./helpers";
import { getBlueprintChildren } from "./symbol_manager";
const BLUEPRINT_DASH_ESCAPE = "$7ce02ad5_1379_4f299df_f6dc2bf9e534$";

export class BlueprintLanguagePlugin
  implements vscode.DocumentFormattingEditProvider, vscode.CodeActionProvider
{
  readonly language = "blueprint-gtk";

  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.languages.registerDocumentFormattingEditProvider(
        this.language,
        this
      ),
      vscode.languages.registerCodeActionsProvider(this.language, this)
    );
  }
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    const actions: vscode.Command[] = [];
    if (!range.isSingleLine) return;
    const line = document.lineAt(range.start.line).text;
    const symbols = getBlueprintChildren(line);
    symbols.forEach((symbol) => {});
    return actions;
  }

  provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ) {
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
  }
}
