import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "@oko-wallet-ci/paths";
import { doBuildPkgs } from "../build_pkgs";
import { expectSuccess } from "@oko-wallet-ci/expect";
import { sleep } from "@oko-wallet-ci/time";
import { doBuildSDK } from "../build_sdk";

function findPackageJsonFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      results.push(...findPackageJsonFiles(fullPath));
    } else if (entry.name === "package.json") {
      results.push(fullPath);
    }
  }

  return results;
}

interface WorkspaceDepInfo {
  filePath: string;
  depName: string;
  depVersion: string;
}

function findWorkspaceDeps(
  pkg: Record<string, unknown>,
): { name: string; version: string }[] {
  const depFields = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ];
  const found: { name: string; version: string }[] = [];

  for (const field of depFields) {
    const deps = pkg[field];
    if (deps && typeof deps === "object") {
      for (const [name, version] of Object.entries(
        deps as Record<string, string>,
      )) {
        if (typeof version === "string" && version.startsWith("workspace:")) {
          found.push({ name, version });
        }
      }
    }
  }

  return found;
}

function checkWorkspaceVersions() {
  console.log('Checking for "workspace:" versions in publishable packages...');

  const packageJsonFiles = findPackageJsonFiles(paths.root);
  const issues: WorkspaceDepInfo[] = [];

  for (const filePath of packageJsonFiles) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const pkg = JSON.parse(content);

      if (pkg.private === true) continue;

      const workspaceDeps = findWorkspaceDeps(pkg);
      for (const dep of workspaceDeps) {
        issues.push({ filePath, depName: dep.name, depVersion: dep.version });
      }
    } catch {
      continue;
    }
  }

  if (issues.length > 0) {
    console.error(
      chalk.bold.red("Error:"),
      'Found "workspace:" versions in publishable packages:',
    );
    for (const issue of issues) {
      console.error(
        `   ${issue.filePath}: ${issue.depName} -> ${issue.depVersion}`,
      );
    }
    console.error(
      "\nPlease replace workspace: with actual version numbers before versioning.",
    );
    process.exit(1);
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
