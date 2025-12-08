import { spawnSync } from "node:child_process";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function depsLint(..._args: any[]) {
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
