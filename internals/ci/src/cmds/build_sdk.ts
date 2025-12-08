import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";
import { getPkgName } from "../pkg_name";

export function buildSDK(..._args: any[]) {
  doBuildSDK();
}

export function doBuildSDK() {
  // Order matters!
  const pkgsInOrder = [
    paths.sdk_core,
    paths.sdk_cosmos,
    paths.sdk_eth,
    paths.sdk_cosmos_kit,
  ];

  console.log("Building sdk packages, total (%s)", pkgsInOrder.length);

  for (const path of pkgsInOrder) {
    console.log("Building %s", path);

    const coreRet = spawnSync("yarn", ["run", "build"], {
      cwd: path,
      stdio: "inherit",
    });

    const name = getPkgName(path);

    expectSuccess(coreRet, `build ${name} failed`);
    console.log("%s %s", chalk.bold.green("Done"), name);
  }

  console.log(
    "%s All (%s) done!",
    chalk.bold.green("Success"),
    pkgsInOrder.length,
  );
}
