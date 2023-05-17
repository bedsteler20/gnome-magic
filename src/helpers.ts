import * as cp from "child_process";
import { js_beautify } from "js-beautify";
import * as path from "path";
import * as fs from "fs";

export interface ObjectMap<T> {
  [name: string]: T;
}

export function unquote(params: string) {
  while (params.includes('"')) {params = params.replace('"', "");}
  while (params.includes("'")) {params = params.replace("'", "");}
  return params;
}

export const command = (cmd: string) =>
  new Promise<string>((resolve, reject) => {
    let pfx = "";
    if (process.env["FLATPAK_ID"]) {
      pfx = "flatpak-spawn --host ";
    }
    cp.exec(pfx + cmd, (err, out) => {
      if (err) {
        return reject(err);
      }
      return resolve(out);
    });
  });

export function getGtkTemplates(str: string): string[] {
  const regex =
    /@Gtk\.Template[\(\s*resource_path\s*=\s*['|"](.*)['|"]\s*\)|\.from_resource\(['|"](.*)['|"]\)]*/gm;
  let m;
  let r: string[] = [];
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) {regex.lastIndex++;}
    r.push(m[1] ?? m[2]);
  }
  return r;
}

declare global {
  interface String {
    insert(index: number, str: string): string;
    insertAfter(expression: RegExp, str: string, movePointer?: number): string;
    jsBeautify(options?: js_beautify.JSBeautifyOptions | undefined): string;
    lineNumberAt(index: number): number | null;
  }
}

String.prototype.insert = function (index, string) {
  if (index > 0) {
    return (
      this.substring(0, index) + string + this.substring(index, this.length)
    );
  }

  return string + this;
};
String.prototype.insertAfter = function (expression, str, movePointer) {
  if (movePointer === undefined) {movePointer = 0;}
  let res = this.valueOf();
  let c = 0;
  let m;

  while ((m = expression.exec(this.valueOf())) !== null) {
    if (m.index === expression.lastIndex) {expression.lastIndex++;}
    res = res.insert(m.index + m[0].length + movePointer - c, str);
    c += movePointer;
  }

  return res;
};
String.prototype.jsBeautify = function (options) {
  return js_beautify(this.valueOf(), options);
};

String.prototype.lineNumberAt = function (index) {
  return this.substring(0, index).split("\n").length;
};

export async function* walk(dir: string): AsyncGenerator<string> {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) {
      yield* walk(entry);
    } else if (d.isFile()) {
      yield entry;
    }
  }
}