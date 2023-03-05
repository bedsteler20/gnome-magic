import * as cp from "child_process";

export interface ObjectMap<T> {
  [name: string]: T;
}

export function unquote(params: string) {
  while (params.includes('"')) params = params.replace('"', "");
  while (params.includes("'")) params = params.replace("'", "");
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

export  function getGtkTemplates(str: string): string | undefined {
    const regex =
      /@Gtk\.Template[\(\s*resource_path\s*=\s*['|"](.*)['|"]\s*\)|\.from_resource\(['|"](.*)['|"]\)]*/gm;
    let m;
    while ((m = regex.exec(str)) !== null) {
      if (m.index === regex.lastIndex) regex.lastIndex++;
      return m[1] ?? m[2]
    }
  }
  