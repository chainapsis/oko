import { spawnSync } from "node:child_process";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function langFormat(..._args: any[]) {
  console.log("Formatting codebase...");

  const publishRet = spawnSync("yarn", ["exec", "biome", "format", "--write"], {
    cwd: paths.root,
    stdio: "inherit",
  });

  expectSuccess(publishRet, "format failed");
}
