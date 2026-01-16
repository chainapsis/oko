import { spawnSync } from "node:child_process";

import { expectSuccess } from "@oko-wallet-ci/expect";
import { paths } from "@oko-wallet-ci/paths";

export async function langCheck(args: any[]) {
  console.log("Start lang check, args: %s", args);

  const ret = spawnSync("yarn", ["exec", "biome", "check", ...args], {
    cwd: paths.root,
    stdio: "inherit",
  });

  expectSuccess(ret, "format failed");
}
