import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "@oko-wallet-ci/paths";
import { expectSuccess } from "@oko-wallet-ci/expect";

export async function buildCs(..._args: any[]) {
  console.log("Building Cait Sith...");

  const addonRet = spawnSync("yarn", ["run", "build"], {
    cwd: paths.cait_sith_addon_addon,
    stdio: "inherit",
  });
  expectSuccess(addonRet, "addon build failed");
  console.log("%s %s", chalk.bold.green("Done"), "addon");

  const caitSithWasmRet = spawnSync("yarn", ["run", "build:wasm"], {
    cwd: paths.cait_sith_keplr_wasm,
    stdio: "inherit",
  });
  expectSuccess(caitSithWasmRet, "wasm build failed");
  console.log("%s %s", chalk.bold.green("Done"), "build wasm cait sith");

  const wasmRet = spawnSync("yarn", ["run", "build:wasm"], {
    cwd: paths.frost_keplr_wasm,
    stdio: "inherit",
  });
  expectSuccess(wasmRet, "wasm build failed");
  console.log("%s %s", chalk.bold.green("Done"), "build wasm frost keplr");

  const copyRet = spawnSync("yarn", ["run", "copy_wasm"], {
    cwd: paths.oko_attached,
    stdio: "inherit",
  });
  expectSuccess(copyRet, "copy failed");
  console.log("%s %s", chalk.bold.green("Done"), "copy wasm");
}
