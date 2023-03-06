import * as vscode from "vscode";
import { ObjectMap } from "./helpers";
export class SymbolManager {
    private static _associations: ObjectMap<string> = {}
    constructor(context: vscode.ExtensionContext) {
       const pythonFileWatcher = vscode.workspace.createFileSystemWatcher("**/*.py")
       pythonFileWatcher.onDidChange((uri) => {
        
       })
    }
}