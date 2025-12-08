import { spawnSync } from "node:child_process";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function langCheck(..._args: any[]) {
  console.log("Formatting codebase...");

  const publishRet = spawnSync("yarn", ["exec", "biome", "check"], {
    cwd: paths.root,
    stdio: "inherit",
  });

  expectSuccess(publishRet, "format failed");
}
