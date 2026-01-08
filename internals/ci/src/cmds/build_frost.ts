import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "@oko-wallet-ci/paths";
import { expectSuccess } from "@oko-wallet-ci/expect";

export async function buildFrost(..._args: any[]) {
  console.log("Building frost_ed25519_keplr_wasm...");

  const wasmRet = spawnSync("yarn", ["run", "build:wasm"], {
    cwd: paths.frost_keplr_wasm,
    stdio: "inherit",
  });
  expectSuccess(wasmRet, "wasm build failed");
  console.log("%s %s", chalk.bold.green("Done"), "build wasm frost keplr");

  // TODO: copy wasm to oko_attached or other target locations @chemonoworld
  // const copyRet = spawnSync("yarn", ["run", "copy_wasm"], {
  //   cwd: paths.oko_attached,
  //   stdio: "inherit",
  // });
  // expectSuccess(copyRet, "copy failed");
  // console.log("%s %s", chalk.bold.green("Done"), "copy wasm");
}
