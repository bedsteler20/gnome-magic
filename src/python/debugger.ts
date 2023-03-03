import * as vscode from "vscode";
import { command } from "../helpers";

export class PythonDebugTracker implements vscode.DebugAdapterTrackerFactory {
  createDebugAdapterTracker(
    session: vscode.DebugSession
  ): vscode.ProviderResult<vscode.DebugAdapterTracker> {
    const isFlatpak = session.configuration["isFlatpak"];
    const appId = session.configuration["appId"];
    return {
      async onWillReceiveMessage(message) {
        if (isFlatpak) {
          if (message.command === "initialize") {
            await vscode.commands.executeCommand(
              "flatpak-vscode.build-and-run"
            );
          } else if (message.command === "disconnect") {
            if (appId) {
              await command("flatpak kill " + appId);
            } else {
              await vscode.commands.executeCommand("flatpak-vscode.stop");
            }
          }
        }
      },
    };
  }
  public register(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.debug.registerDebugAdapterTrackerFactory("python", this)
    );
  }
}
