import fs from "node:fs";
import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "@oko-wallet-ci/paths";
import { doBuildPkgs } from "../build_pkgs";
import { expectSuccess } from "@oko-wallet-ci/expect";
import { sleep } from "@oko-wallet-ci/time";
import { doBuildSDK } from "../build_sdk";

function checkWorkspaceVersions() {
  console.log('Checking for "workspace:" versions in publishable packages...');

  const result = spawnSync(
    "grep",
    ["-r", '"workspace:', "--include=package.json", paths.root],
    { encoding: "utf-8" },
  );

  if (result.stdout) {
    const lines = result.stdout.split("\n").filter((line) => {
      if (!line) return false;
      if (line.includes("node_modules")) return false;

      const filePath = line.split(":")[0];
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const pkg = JSON.parse(content);
        return pkg.private !== true;
      } catch {
        return false;
      }
    });

    if (lines.length > 0) {
      console.error(
        chalk.bold.red("Error:"),
        'Found "workspace:" versions in publishable packages:',
      );
      lines.forEach((line) => console.error("  ", line));
      console.error(
        "\nPlease replace workspace: with actual version numbers before versioning.",
      );
      process.exit(1);
    }
  }

  console.log('No "workspace:" versions found in publishable packages');
}

export async function version(..._args: any[]) {
  console.log("Start versioning packages...");

  checkWorkspaceVersions();

  console.log("We will re-build the packages now just to make sure\n");
  await sleep(500);

  await doBuildPkgs();
  await doBuildSDK();

  console.log("Testing type definition in sandbox simple host");
  const testSandboxRet = spawnSync("yarn", ["tsc"], {
    cwd: paths.sandbox_simple_host,
    stdio: "inherit",
  });
  expectSuccess(testSandboxRet, "publish failed");
  console.log("%s %s", chalk.green.bold("Ok"), "sandbox_simple_host");

  console.log("Fetching the Git repository at 'origin' to sync with the local");
  const fetchRet = spawnSync("git", ["fetch", "origin"], {
    cwd: paths.root,
    stdio: "inherit",
  });
  expectSuccess(fetchRet, "publish failed");

  spawnSync("yarn", ["lerna", "version", "--no-private"], {
    cwd: paths.root,
    stdio: "inherit",
  });
}
