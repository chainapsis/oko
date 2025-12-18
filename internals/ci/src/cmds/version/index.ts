import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "@oko-wallet-ci/paths";
import { doBuildPkgs } from "@oko-wallet-ci/cmds/build_pkgs";
import { expectSuccess } from "@oko-wallet-ci/expect";
import { doBuildSDK } from "@oko-wallet-ci/cmds/build_sdk";

const WILD_CHARACTER_VERSION = "workspace:*";

function getPackageJsonPaths(): string[] {
  const lernaJsonPath = path.join(paths.root, "lerna.json");
  const lernaJson = JSON.parse(fs.readFileSync(lernaJsonPath, "utf-8"));
  const packages: string[] = lernaJson.packages ?? [];

  return packages.map((pkg) => path.join(paths.root, pkg, "package.json"));
}

interface WorkspaceDepInfo {
  filePath: string;
  depName: string;
  depVersion: string;
}

interface WorkspaceDep {
  name: string;
  version: string;
}

function findWorkspaceDeps(pkg: Record<string, unknown>): WorkspaceDep[] {
  const depFields = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ];
  const found: { name: string; version: string }[] = [];

  for (const field of depFields) {
    const deps = pkg[field] as Record<string, string>;

    if (deps && typeof deps === "object") {
      for (const [name, version] of Object.entries(deps)) {
        if (
          typeof version === "string" &&
          version.startsWith(WILD_CHARACTER_VERSION)
        ) {
          found.push({ name, version });
        }
      }
    }
  }

  return found;
}

function checkWorkspaceVersions() {
  console.log('Checking for "workspace:" versions in publishable pkgs');

  const packageJsonFiles = getPackageJsonPaths();
  const issues: WorkspaceDepInfo[] = [];

  for (const filePath of packageJsonFiles) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const pkg = JSON.parse(content);

      if (pkg.private === true) {
        continue;
      }

      const workspaceDeps = findWorkspaceDeps(pkg);
      for (const dep of workspaceDeps) {
        issues.push({ filePath, depName: dep.name, depVersion: dep.version });
      }
    } catch (err) {
      console.warn(
        "%s failed to read %s, err: %s",
        chalk.bold.red("error"),
        filePath,
        err instanceof Error ? err.message : err,
      );

      process.exit(1);
    }
  }

  if (issues.length > 0) {
    console.error(
      `%s Found "workspace:" versions in publishable packages`,
      chalk.bold.red("error"),
    );

    for (const issue of issues) {
      console.error(
        `   ${issue.filePath}: ${issue.depName} -> ${issue.depVersion}`,
      );
    }

    console.error(
      `Please replace wildcard versions ("%s") with actual version numbers 
beforeversioning.`,
      WILD_CHARACTER_VERSION,
    );

    process.exit(1);
  }

  console.log(
    `%s No "workspace:" versions found in publishable packages`,
    chalk.bold.green("Done"),
  );
}

export async function version(..._args: any[]) {
  console.log("Start versioning packages");

  checkWorkspaceVersions();

  console.log("We will re-build the packages now just to make sure\n");

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
