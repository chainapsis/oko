import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function deployApps(..._args: any[]) {
  console.log("Deploying apps...");

  // const addonRet = spawnSync("yarn", ["run", "build"], {
  //   cwd: paths.cait_sith_addon_addon,
  //   stdio: "inherit",
  // });
  // expectSuccess(addonRet, "addon build failed");
  // console.log("%s %s", chalk.bold.green("Done"), "addon");
  //
  // const wasmRet = spawnSync("yarn", ["run", "build:wasm"], {
  //   cwd: paths.cait_sith_keplr_wasm,
  //   stdio: "inherit",
  // });
  // expectSuccess(wasmRet, "wasm build failed");
  // console.log("%s %s", chalk.bold.green("Done"), "wasm");
  //
  // const copyRet = spawnSync("yarn", ["run", "copy_wasm"], {
  //   cwd: paths.oko_attached,
  //   stdio: "inherit",
  // });
  // expectSuccess(copyRet, "copy failed");
  // console.log("%s %s", chalk.bold.green("Copied"), "wasm");
}
