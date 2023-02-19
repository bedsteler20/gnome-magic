// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ResourcesManager } from "./gresources/resources_manager";
import { PythonTemplateLinkProvider } from "./gresources/gresource_link_provider";
import { PythonDebugTracker } from "./python/debugger";

class Extension {
  private readonly context: vscode.ExtensionContext;
  private readonly pythonLinkProvider: PythonTemplateLinkProvider;
  private readonly resourceManager: ResourcesManager;
  private readonly pythonDebugTracker: PythonDebugTracker;

  constructor(context: vscode.ExtensionContext) {
    this.resourceManager = new ResourcesManager(context);
    this.pythonLinkProvider = new PythonTemplateLinkProvider(
      this.resourceManager
    );
    this.pythonDebugTracker = new PythonDebugTracker();
    this.context = context;
  }

  async activate(): Promise<void> {
    this.pythonLinkProvider.register(this.context);
    this.pythonDebugTracker.register(this.context);
  }

  async deactivate(): Promise<void> {}
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
