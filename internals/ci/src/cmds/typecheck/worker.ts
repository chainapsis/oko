import { spawnSync } from "node:child_process";
import { parentPort, workerData } from "node:worker_threads";
import chalk from "chalk";

import { getPkgName } from "@oko-wallet-ci/pkg_name";

export async function runBatchTypeCheck(pkgPaths: string[]) {
  if (parentPort === null) {
    console.error("This script is built to run on a worker thread");
    throw new Error(`No parent port`);
  }

  for (const pkg of pkgPaths) {
    parentPort.postMessage(`Checking ${pkg}`);

    const ret = spawnSync("yarn", ["run", "tsc", "--noEmit"], {
      cwd: pkg,
      stdio: "inherit",
    });

    const name = await getPkgName(pkg);

    if (ret.status === 0) {
      console.log("%s %s", chalk.bold.green("Ok"), name);
    } else {
      console.error("Error type checking, pkg: %s", name);

      throw new Error(`Error type checking, pkg ${name}`);
    }
  }

  return `Type checked: ${pkgPaths.length}`;
}

const result = await runBatchTypeCheck(workerData);
if (parentPort !== null) {
  parentPort.postMessage(result);
}
