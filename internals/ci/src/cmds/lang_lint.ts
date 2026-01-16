import { spawnSync } from "node:child_process";

import { paths } from "@oko-wallet-ci/paths";
import { expectSuccess } from "@oko-wallet-ci/expect";

export async function langCheck(..._args: any[]) {
  console.log("Checking language of codebase...");

  const publishRet = spawnSync("yarn", ["exec", "biome", "check", "--write"], {
    cwd: paths.root,
    stdio: "inherit",
  });

  expectSuccess(publishRet, "format failed");
}
