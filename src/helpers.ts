export interface ObjectMap<T> {
    [name: string]: T;
};


export function unquote(params: string) {
    while (params.includes('"')) params = params.replace('"', "");
    while (params.includes("'")) params = params.replace("'", "");
    return params;
  }
  