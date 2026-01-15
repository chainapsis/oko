import { spawnSync } from "node:child_process";

import { expectSuccess } from "@oko-wallet-ci/expect";
import { paths } from "@oko-wallet-ci/paths";

export async function langCheck(..._args: any[]) {
  console.log("Checking language of codebase...");

  const publishRet = spawnSync("yarn", ["exec", "biome", "check"], {
    cwd: paths.root,
    stdio: "inherit",
  });

  expectSuccess(publishRet, "format failed");
}
