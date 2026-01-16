import { spawnSync } from "node:child_process";

import { expectSuccess } from "@oko-wallet-ci/expect";
import { paths } from "@oko-wallet-ci/paths";

export async function langLint(...args: any) {
  console.log("Checking language of codebase...", args);

  const publishRet = spawnSync("yarn", ["exec", "biome", "check", "--write"], {
    cwd: paths.root,
    stdio: "inherit",
  });

  expectSuccess(publishRet, "format failed");
}
