import * as vscode from "vscode";
import { unquote } from "../helpers";
import { ResourcesManager } from "./resources_manager";

export class PythonTemplateLinkProvider implements vscode.DocumentLinkProvider {
  private _resourceManager: ResourcesManager;

  constructor(resourceManager: ResourcesManager) {
    this._resourceManager = resourceManager;
  }

  readonly selector: vscode.DocumentSelector = {
    language: "python",
    scheme: "file",
  };

  async provideDocumentLinks(document: vscode.TextDocument) {
    const links: vscode.DocumentLink[] = [];
    const regexPattern = /['"](?:[^'"]+[\\])*[^'"]+\.ui['"]/gm;
    let index = 0;
    while (index < document.lineCount) {
      let line = document.lineAt(index);
      let result = line.text.match(regexPattern);
      if (result !== null) {
        for (let item of result) {
          let filePath = await this._resourceManager.getResource(unquote(item));
          console.log(filePath);
          if (filePath !== undefined) {
            let start = new vscode.Position(
              line.lineNumber,
              line.text.indexOf(item) + 1
            );
            let end = start.translate(0, item.length - 2);
            links.push({
              range: new vscode.Range(start, end),
              target: filePath!,
            });
          }
        }
      }
      index++;
    }
    return links;
  }

  register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.languages.registerDocumentLinkProvider(this.selector, this)
    );
  }
}
