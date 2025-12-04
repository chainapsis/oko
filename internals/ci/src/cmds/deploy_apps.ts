import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function deployApps(..._args: any[]) {
  console.log("Deploying apps...");

  // Find the bash script and run it

  // const copyRet = spawnSync("yarn", ["run", "copy_wasm"], {
  //   cwd: paths.oko_attached,
  //   stdio: "inherit",
  // });
  // expectSuccess(copyRet, "copy failed");
  // console.log("%s %s", chalk.bold.green("Copied"), "wasm");
}
