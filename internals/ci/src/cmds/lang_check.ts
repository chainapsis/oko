import { spawnSync } from "node:child_process";

import { paths } from "@oko-wallet-ci/paths";
import { expectSuccess } from "@oko-wallet-ci/expect";

export async function langCheck(args: any[]) {
  console.log("Checking language of codebase...", args);

  const publishRet = spawnSync("yarn", ["exec", "biome", "check"], {
    cwd: paths.root,
    stdio: "inherit",
  });

  expectSuccess(publishRet, "format failed");
}
