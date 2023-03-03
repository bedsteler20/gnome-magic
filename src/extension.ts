// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ResourcesManager } from "./gresources/resources_manager";
import { PythonTemplateLinkProvider } from "./gresources/gresource_link_provider";
import { PythonDebugTracker } from "./python/debugger";
import { BlueprintLanguageClient } from "./blueprint/lsp";
import { BlueprintFormattingEditProvider as BlueprintFormatter } from "./blueprint/formater";

class Extension {
  private readonly context: vscode.ExtensionContext;
  private readonly pythonLinkProvider: PythonTemplateLinkProvider;
  private readonly resourceManager: ResourcesManager;
  private readonly pythonDebugTracker: PythonDebugTracker;
  private readonly settings = vscode.workspace.getConfiguration("gnome-magic");
  private readonly blueprintLsp:BlueprintLanguageClient;
  private readonly blueprintFormatter: BlueprintFormatter;

  constructor(context: vscode.ExtensionContext) {
    this.resourceManager = new ResourcesManager();
    this.pythonLinkProvider = new PythonTemplateLinkProvider(
      this.resourceManager
    );
    this.pythonDebugTracker = new PythonDebugTracker();
    this.blueprintLsp = new BlueprintLanguageClient();
    this.blueprintFormatter = new BlueprintFormatter();
    this.context = context;
  }

  async activate(): Promise<void> {
    if (this.settings.get("indexResources")) {
      this.resourceManager.register(this.context);
      this.pythonLinkProvider.register(this.context);
    }
    this.pythonDebugTracker.register(this.context);
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
