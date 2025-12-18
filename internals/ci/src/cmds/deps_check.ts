import { spawnSync } from "node:child_process";

import { paths } from "@oko-wallet-ci/paths";
import { expectSuccess } from "@oko-wallet-ci/expect";

export async function depsCheck(..._args: any[]) {
  console.log("Checking dependencies...");

  const publishRet = spawnSync(
    "yarn",
    ["syncpack", "lint", "--dependency-types", "prod,dev"],
    {
      cwd: paths.root,
      stdio: "inherit",
    },
  );

  expectSuccess(publishRet, "format failed");
}
