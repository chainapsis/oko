import { spawnSync } from "node:child_process";

import { paths } from "@oko-wallet-ci/paths";
import { expectSuccess } from "@oko-wallet-ci/expect";

export async function langCheck(args: any[]) {
  console.log("Start lang check, args: %s", args);

  const ret = spawnSync("yarn", ["exec", "biome", "check", ...args], {
    cwd: paths.root,
    stdio: "inherit",
  });

  expectSuccess(ret, "format failed");
}
