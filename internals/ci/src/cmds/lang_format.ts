import { spawnSync } from "node:child_process";

import { expectSuccess } from "@oko-wallet-ci/expect";
import { paths } from "@oko-wallet-ci/paths";

export async function langFormat(..._args: any[]) {
  console.log("Formatting codebase...");

  const publishRet = spawnSync("yarn", ["exec", "biome", "format", "--write"], {
    cwd: paths.root,
    stdio: "inherit",
  });

  expectSuccess(publishRet, "format failed");
}
