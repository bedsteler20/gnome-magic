/* eslint-disable @typescript-eslint/naming-convention */
import { ExtensionContext, window, commands, Uri } from "vscode";

import {
  toKebabCase,
  toPascalCase,
  toPathCase,
  toSnakeCase,
} from "js-convert-case";
import { cp, readFile, rm, rename, writeFile, opendir } from "fs/promises";
import { existsSync } from "fs";

import path = require("path");
import { ObjectMap } from "./helpers";
import { userInfo } from "os";

export namespace templates {
  interface ProjectInfo {
    lang: string;
    dirRoot: string;
    name: string;
    appId: string;
    dir: string;
    vars: ObjectMap<string>;
  }

  export async function register(context: ExtensionContext) {
    context.subscriptions.push(
      commands.registerCommand(
        "gnome-magic.newProject",
        async () => await newProjectCommand(context)
      )
    );
  }

  async function newProjectCommand(context: ExtensionContext) {
    try {
      const lang = await window.showQuickPick(["python"], {
        title: "What language do you want to use?",
      });
      const projectDir = await window.showOpenDialog({
        title: "Ware do you want to save your project",
        canSelectFiles: false,
        canSelectFolders: true,
      });
      const projectName = await window.showInputBox({
        title: "Project Name",
      });
      const appId = await window.showInputBox({
        title: "App Id",
      });

      const info: ProjectInfo = {
        lang: lang!,
        appId: appId!,
        dirRoot: projectDir![0].toString(),
        dir: path.join(projectDir![0].path, toSnakeCase(projectName)),
        name: projectName!,
        vars: {
          "@kebab_project@": toKebabCase(projectName!),
          "@snake_project@": toSnakeCase(projectName!),
          "@app_id@": appId!,
          "@app_id_path@": appId!.replaceAll(".", "/"),
          "@pascal_project@": toPascalCase(projectName!),
          "@author@": userInfo().username,
        },
      };

      window.showInformationMessage("Creating Project....");

      await cloneProject(context, info);
      await setupProject(info.dir, info);
      await commands.executeCommand("vscode.openFolder", Uri.file(info.dir));
    } catch (error: any) {
      window.showErrorMessage(error);
    }
  }

  async function cloneProject(context: ExtensionContext, info: ProjectInfo) {
    if (existsSync(info.dir)) {
      throw "A project with this name already exists";
    }
    const templateDir = context.asAbsolutePath(`templates/${info.lang}`);
    await cp(templateDir, info.dir, { recursive: true });
  }

  async function templateFile(
    file: string,
    baseName: string,
    dirName: string,
    info: ProjectInfo
  ) {
    const content = await readFile(file, "utf-8");
    if (containsProjectVars(content, info)) {
      const newContent = evalTemplateVars(content, info);
      await writeFile(file, newContent);
    }

    if (containsProjectVars(baseName, info)) {
      const newName = evalTemplateVars(baseName, info);
      const newPath = path.join(dirName, newName);
      await rename(file, newPath);
    }
  }

  async function setupProject(rootDir: string, info: ProjectInfo) {
    const promises: Promise<unknown>[] = [];
    for await (const dir of await opendir(rootDir)) {
      let currentPath = path.join(rootDir, dir.name);

      // Renaming file needs to be blocked after its renamed we can the
      // deal with the content whenever its content whenever the thread
      // gets around to it
      if (dir.isDirectory()) {
        if (containsProjectVars(dir.name, info)) {
          const oldPath = currentPath;
          currentPath = path.join(rootDir, evalTemplateVars(dir.name, info));
          await rename(oldPath, currentPath);
        }
        await setupProject(currentPath, info);
      } else if (dir.isFile()) {
        await templateFile(currentPath, dir.name, rootDir, info);
      }
    }
    await Promise.all(promises);
    return;
  }

  function evalTemplateVars(text: string, project: ProjectInfo): string {
    let res = text;
    for (const key of Object.keys(project.vars)) {
      res = res.replaceAll(key, project.vars[key]);
    }
    return res;
  }

  function containsProjectVars(val: string, pj: ProjectInfo): boolean {
    for (const v of Object.keys(pj.vars)) {
      if (val.includes(v)) {
        return true;
      }
    }
    return false;
  }
}
