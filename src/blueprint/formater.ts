import { js_beautify } from "js-beautify";
import * as vscode from "vscode";

const BLUEPRINT_DASH_ESCAPE =
  "$GNOME_MAGIC_BLUEPRINT_DASH_ESCAPE_PLEASE_DONT_USE_THIS_STRING$";

export class BlueprintFormattingEditProvider
  implements vscode.DocumentFormattingEditProvider
{
  provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions
  ) {
    const txt = document.getText();
    return [
      vscode.TextEdit.replace(
        new vscode.Range(
          document.positionAt(0),
          document.positionAt(txt.length)
        ),
        this.format(txt, options)
      ),
    ];
  }

  format(text: string, opts: vscode.FormattingOptions): string {
    text = text.replaceAll("-", BLUEPRINT_DASH_ESCAPE);

    text = js_beautify(text, {
      indent_with_tabs: !opts.insertSpaces,
      indent_size: opts.tabSize,
      space_before_conditional: false,
      space_in_paren: false,
    });
    text = text.replaceAll(BLUEPRINT_DASH_ESCAPE, "-");

    return text;
  }

  register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.languages.registerDocumentFormattingEditProvider(
        "blueprint-gtk",
        this
      )
    );
  }
}
