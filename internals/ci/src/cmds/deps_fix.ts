import { spawnSync } from "node:child_process";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function depsFix(..._args: any[]) {
  console.log("Fixing dependencies...");

  const publishRet = spawnSync(
    "yarn",
    ["syncpack", "fix", "--dependency-types", "prod,dev"],
    {
      cwd: paths.root,
      stdio: "inherit",
    },
  );

  expectSuccess(publishRet, "format failed");
}
