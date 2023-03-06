import { TextDecoder } from "util";
import * as vscode from "vscode";
import { ResourcesManager } from "./gresources/resources_manager";
import { getGtkTemplates, ObjectMap } from "./helpers";
import "./helpers";

export class SymbolManager {
    static associations = new Map<string, string>();
    static pythonSymbols = new Map<string, GSymbol[]>();
    static blueprintSymbols = new Map<string, GSymbol[]>();

    constructor(context: vscode.ExtensionContext) {
    const pythonFileWatcher =
      vscode.workspace.createFileSystemWatcher("**/*.py");
    pythonFileWatcher.onDidChange(this.indexPythonFile);
    const blueprintFileWatcher =
      vscode.workspace.createFileSystemWatcher("**/*.blp");
    blueprintFileWatcher.onDidChange(this.indexBlueprintFile);
    vscode.workspace
      .findFiles("**/*.blp", "**/subprojects/**")
      .then((r) => r.forEach(this.indexBlueprintFile));
    //   Dont touch black magic
    setTimeout(
      () =>
        vscode.workspace
          .findFiles("**/*.py", "**/subprojects/**")
          .then((r) => r.forEach(this.indexPythonFile)),
      5000
    );
    context.subscriptions.push(pythonFileWatcher);
    context.subscriptions.push(blueprintFileWatcher);
  }

  async indexPythonFile(pythonFile: vscode.Uri) {
    const fileBytes = await vscode.workspace.fs.readFile(pythonFile);
    const content = new TextDecoder().decode(fileBytes);
    const blpFile = await ResourcesManager.getResource(
      getGtkTemplates(content)[0]
    );
    if (!blpFile) return;
    SymbolManager.associations.set(blpFile.fsPath, pythonFile.fsPath);
    SymbolManager.pythonSymbols.set(pythonFile.fsPath, [
      ...getPythonChildren(content),
      ...getPythonFuncs(content),
    ]);
  }

  async indexBlueprintFile(blueprintFile: vscode.Uri) {
    const fileBytes = await vscode.workspace.fs.readFile(blueprintFile);
    const content = new TextDecoder().decode(fileBytes);
    SymbolManager.blueprintSymbols.set(blueprintFile.fsPath, [
      ...getBlueprintChildren(content),
      ...getBlueprintFuncs(content),
    ]);
  }
}

function getBlueprintChildren(str: string) {
  const regex = /([\w.]+)\s*([_\w]+)?\s*{/gm;
  const r: GSymbol[] = [];
  let m;
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++;
    if (m[1] && m[2]) {
      r.push({
        type: GSymbolType.child,
        name: m[2],
        typeHint: m[1].includes(".") ? m[1] : m[1].insert(0, "Gtk."),
      });
    }
  }
  return r;
}

function getBlueprintFuncs(str: string): GSymbol[] {
  const regex = /[_-\w]+\s*=>\s*([\w_]+)\(\s*\)/gm;
  let r: GSymbol[] = [];
  let m;
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++;
    r.push({
      type: GSymbolType.func,
      name: m[1],
    });
  }
  return r;
}

function getPythonChildren(str: string): GSymbol[] {
  const regex =
    /([_a-zA-Z]+)\s*:?\s*([a-zA-Z.]+)?\s*=\s*Gtk\.Template\.Child\(\s*\)/gm;
  const r: GSymbol[] = [];
  let m;
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++;
    r.push({
      type: GSymbolType.child,
      name: m[1],
      typeHint: m[2],
    });
  }
  return r;
}
function getPythonFuncs(str: string): GSymbol[] {
  const regex = /@Gtk\.Template\.Callback\(\s*\)\s*\n\s*def\s*(\w+)/g;
  let r: GSymbol[] = [];
  let m;
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++;
    r.push({
      type: GSymbolType.func,
      name: m[1],
    });
  }
  return r;
}

enum GSymbolType {
  child = 0,
  func = 1,
}

interface GSymbol {
  type: GSymbolType;
  name: string;
  typeHint?: string | undefined | null;
}
