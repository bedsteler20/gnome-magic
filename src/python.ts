import { TextDecoder } from "util";
import * as vscode from "vscode";
import { ResourcesManager } from "./gresources/resources_manager";
import { command, getGtkTemplates, ObjectMap } from "./helpers";
import { getPythonChildren, GSymbol, SymbolManager } from "./symbol_manager";
import "./helpers";
export class PythonLanguagePlugin {
  readonly selector = "python";

  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        this.selector,
        this.codeActionsProvider
      ),
      vscode.debug.registerDebugAdapterTrackerFactory(
        this.selector,
        this.flatpakDebugAdapter
      ),
      vscode.languages.registerDefinitionProvider(
        this.selector,
        this.blueprintDefinitionProvider
      ),
      vscode.languages.registerDocumentLinkProvider(
        this.selector,
        this.gresourceLinkProvider
      )
    );
    Object.keys(this.commands).forEach((key) => {
      context.subscriptions.push(
        vscode.commands.registerCommand(key, this.commands[key], this)
      );
    });
  }

  flatpakDebugAdapter: vscode.DebugAdapterTrackerFactory = {
    createDebugAdapterTracker: (session) => ({
      async onWillReceiveMessage(message) {
        if (!session.configuration["appId"]) return;
        if (message.command === "initialize") {
          await vscode.commands.executeCommand("flatpak-vscode.build-and-run");
        } else if (message.command === "disconnect") {
          await command("flatpak kill " + session.configuration["appId"]);
        }
      },
    }),
  };

  blueprintDefinitionProvider: vscode.DefinitionProvider = {
    provideDefinition: async (document, position, token) => {
      const varName = document.getText(
        document.getWordRangeAtPosition(position)
      );
      const declarationRx = new RegExp(
        varName + "\\s*[:\\s*a-zA-Z.]+\\s*=\\s*Gtk\\.Template\\.Child\\(\\)",
        "gm"
      );
      if (!declarationRx.test(document.lineAt(position.line).text)) return;
      const docText = document.getText();

      if (declarationRx.test(docText)) {
        const [res_path] = getGtkTemplates(docText);
        if (!res_path) return;
        const uri = await ResourcesManager.getResource(res_path);
        if (!uri) return;
        const fileBytes = await vscode.workspace.fs.readFile(uri);
        const blpFileContent = new TextDecoder().decode(fileBytes);
        const blpRx = new RegExp(varName + "\\s*{");
        const lines = blpFileContent.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (blpRx.test(lines[i])) {
            return {
              uri: uri,
              range: new vscode.Range(
                i,
                lines[i].indexOf(varName),
                i,
                lines[i].lastIndexOf(varName)
              ),
            };
          }
        }
      }
      return null;
    },
  };

  commands: ObjectMap<(...args: any[]) => any> = {
    "gnome-magic.codeAction.goToBlp": async (file: string, symbol: GSymbol) => {
      const blpPath = SymbolManager.getBlueprintFile(file);
      const doc = await vscode.workspace.openTextDocument(
        vscode.Uri.parse(blpPath!)
      );
      const textEditor = await vscode.window.showTextDocument(doc);
      // const position = doc.lineAt(symbol.range.start.line);
      // textEditor.revealRange(position.range);
    },
  };

  codeActionsProvider: vscode.CodeActionProvider = {
    provideCodeActions: (document, range, context, token) => {
      const actions: vscode.Command[] = [];
      if (!range.isSingleLine) return;
      const prevLine = document.lineAt(range.start.line - 1).text;
      const line = document.lineAt(range.start.line).text;

      if (
        line.includes("Gtk.Template.Child()") ||
        prevLine.includes("Gtk.Template.Callback()") ||
        line.includes("Gtk.Template.Callback()")
      ) {
        actions.push({
          title: "Got to blueprint",
          command: "gnome-magic.codeAction.goToBlp",
          arguments: [document.uri.fsPath, getPythonChildren(line)[0]],
        });
      }

      return actions;
    },
  };

  gresourceLinkProvider: vscode.DocumentLinkProvider = {
    provideDocumentLinks: async (document) => {
      const links: vscode.DocumentLink[] = [];
      for (let i = 0; i < document.lineCount; i++) {
        const { text, lineNumber } = document.lineAt(i);
        const [file] = getGtkTemplates(text);
        const filePath = await ResourcesManager.getResource(file);
        if (!filePath || !file) continue;
        const ind = text.indexOf(file);
        links.push({
          range: new vscode.Range(
            lineNumber,
            ind,
            lineNumber,
            ind + file.length
          ),
          target: filePath!,
        });
      }
      return links;
    },
  };
}
