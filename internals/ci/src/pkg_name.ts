import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export async function getPkgName(pkg: string) {
  let name = path.parse(pkg).name;

  const pkgJsonPath = path.join(pkg, "package.json");
  const url = pathToFileURL(pkgJsonPath).href;
  if (fs.existsSync(pkgJsonPath)) {
    const pkgJson = await import(url);
    if (pkgJson.name) {
      name = pkgJson.name;
    }
  }

  return name;
}
