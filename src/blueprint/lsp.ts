import { LanguageClient } from "vscode-languageclient/node";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class BlueprintLanguageClient extends LanguageClient {
  constructor() {
    const args: string[] = [];
    let cmd = "blueprint-compiler";
    for (const wsFolder of vscode.workspace.workspaceFolders ?? []) {
      const dir = wsFolder.uri.fsPath;
      const wsBlp = path.join(
        dir,
        "subprojects",
        "blueprint-compiler",
        "blueprint-compiler.py"
      );
      if (fs.existsSync(wsBlp)) {
        cmd = "python3";
        args[0] = wsBlp;
        break;
      }
    }
    super(
      "blueprint-gtk",
      { command: cmd, args: [...args, "lsp"] },
      {
        documentSelector: [{ scheme: "file", language: "blueprint-gtk" }],
      }
    );
  }
}
