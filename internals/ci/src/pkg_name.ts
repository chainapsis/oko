import path from "node:path";
import fs from "node:fs";

export async function getPkgName(pkg: string) {
  let name = path.parse(pkg).name;

  const pkgJsonPath = path.join(pkg, "package.json");
  if (fs.existsSync(pkgJsonPath)) {
    const pkgJson = await import(pkgJsonPath);
    if (pkgJson.name) {
      name = pkgJson.name;
    }
  }

  return name;
}
