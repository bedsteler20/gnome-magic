// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ResourcesManager } from "./gresources/resources_manager";
import { BlueprintLanguageClient } from "./blueprint/lsp";
import { BlueprintFormattingEditProvider as BlueprintFormatter } from "./blueprint/formater";
import { PythonLanguagePlugin } from "./python";

class Extension {
  private readonly context: vscode.ExtensionContext;
  private readonly resourceManager: ResourcesManager;
  private readonly settings = vscode.workspace.getConfiguration("gnome-magic");
  private readonly blueprintLsp: BlueprintLanguageClient;
  private readonly blueprintFormatter: BlueprintFormatter;
  private readonly pythonReferenceProvider: PythonLanguagePlugin;

  constructor(context: vscode.ExtensionContext) {
    this.resourceManager = new ResourcesManager();

    this.pythonReferenceProvider = new PythonLanguagePlugin(
      this.resourceManager
    );
    this.blueprintLsp = new BlueprintLanguageClient();
    this.blueprintFormatter = new BlueprintFormatter();
    this.context = context;
  }

  async activate(): Promise<void> {
    this.resourceManager.register(this.context);
    this.pythonReferenceProvider.register(this.context);
    this.blueprintLsp.start();
    this.blueprintFormatter.register(this.context);
  }

  async deactivate(): Promise<void> {
    this.blueprintLsp.stop();
  }
}

let extension: Extension | undefined;

export async function activate(context: vscode.ExtensionContext) {
  if (!extension) extension = new Extension(context);
  await extension.activate();
}

// This method is called when your extension is deactivated
export async function deactivate() {
  await extension?.deactivate();
}
