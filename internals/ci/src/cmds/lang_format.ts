import { spawnSync } from "node:child_process";

import { paths } from "@oko-wallet-ci/paths";
import { expectSuccess } from "@oko-wallet-ci/expect";

export async function langFormat(..._args: any[]) {
  console.log("Formatting codebase...");

  const publishRet = spawnSync("yarn", ["exec", "biome", "format", "--write"], {
    cwd: paths.root,
    stdio: "inherit",
  });

  expectSuccess(publishRet, "format failed");
}
