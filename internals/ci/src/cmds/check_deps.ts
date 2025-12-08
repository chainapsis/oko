import { spawnSync } from "node:child_process";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function checkDeps(..._args: any[]) {
  console.log("Checking language of codebase...");

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
