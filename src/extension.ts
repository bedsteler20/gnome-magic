// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { BlueprintLanguagePlugin } from "./blueprint";
import { ResourcesManager } from "./gresources/resources_manager";
import { PythonLanguagePlugin } from "./python";
import { SymbolManager } from "./symbol_manager";

export async function activate(context: vscode.ExtensionContext) {
  new ResourcesManager(context);
  new SymbolManager(context);
  new PythonLanguagePlugin(context);
  new BlueprintLanguagePlugin(context);
}

// This method is called when your extension is deactivated
export async function deactivate() {}
