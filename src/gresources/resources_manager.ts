import { XMLParser, XMLValidator } from "fast-xml-parser";
import * as vscode from "vscode";
import * as fsSync from "fs";
import * as path from "path";
import { ObjectMap } from "../helpers";
import { TextDecoder } from "util";
export class ResourcesManager {
  private static _resources: ObjectMap<vscode.Uri> = {};
  private readonly _settings = vscode.workspace.getConfiguration("gnome-magic");

  constructor(context: vscode.ExtensionContext) {
    const _watcher =
      vscode.workspace.createFileSystemWatcher("**/*.gresource.xml");
    context.subscriptions.push(_watcher);
    context.subscriptions.push(_watcher.onDidChange(ResourcesManager.onDidChange));
    vscode.workspace
      .findFiles("**/*.gresource.xml")
      .then((uris) => uris.forEach(async (uri) => ResourcesManager.onDidChange(uri)));
  }
  static onDidChange = async (uri: vscode.Uri) => {
    const xmlFilePath = uri.fsPath;
    const fileBytes = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder().decode(fileBytes);
    if (XMLValidator.validate(content) === true) {
      const parser = new XMLParser({
        parseAttributeValue: true,
        ignoreAttributes: false,
        isArray: () => true,
      });
      const xml: XMLFile = parser.parse(content);
      console.log(xml);
      for (const obj of xml.gresources) {
        for (const obj2 of obj.gresource) {
          for (const obj3 of obj2.file) {
            const pfx = obj2["@_prefix"][0];
            const file = obj3["#text"];
            const virtualPath = path.join(pfx, file);
            let fsPath = path.join(path.dirname(xmlFilePath), file);
            if (fsPath.endsWith(".ui") && !fsSync.existsSync(fsPath)) {
              fsPath = fsPath.replace(".ui", ".blp");
            }
            ResourcesManager._resources[virtualPath] = vscode.Uri.parse(
              "file://" + fsPath
            );
          }
        }
      }
    }
  };

   public static async getResource(
    item: string | undefined
  ): Promise<vscode.Uri | undefined> {
    if (item === undefined || item === null) return;
    if (!Object.keys(ResourcesManager._resources).includes(item)) {
      let res = await vscode.workspace.findFiles("**/*.gresource.xml");
      for (let file of res) await this.onDidChange(file);
    }

    return ResourcesManager._resources[item];
  }
}

interface XMLFile {
  gresources: Array<{
    gresource: Array<{
      "@_prefix": string[];
      file: Array<{
        "#text": string;
      }>;
    }>;
  }>;
}
