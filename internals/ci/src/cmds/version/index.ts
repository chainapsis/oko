import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "@oko-wallet-ci/paths";
import { doBuildPkgs } from "@oko-wallet-ci/cmds/build_pkgs";
import { expectSuccess } from "@oko-wallet-ci/expect";
import { doBuildSDK } from "@oko-wallet-ci/cmds/build_sdk";

function getPackageJsonPaths(): string[] {
  const lernaJsonPath = path.join(paths.root, "lerna.json");
  const lernaJson = JSON.parse(fs.readFileSync(lernaJsonPath, "utf-8"));
  const packages: string[] = lernaJson.packages ?? [];

  return packages.map((pkg) => path.join(paths.root, pkg, "package.json"));
}

function buildWorkspaceVersionMap(): Map<string, string> {
  const versionMap = new Map<string, string>();
  const packageJsonPaths = getPackageJsonPaths();

  for (const pkgPath of packageJsonPaths) {
    try {
      const content = fs.readFileSync(pkgPath, "utf-8");
      const pkg = JSON.parse(content);
      if (pkg.name && pkg.version) {
        versionMap.set(pkg.name, pkg.version);
      }
    } catch (err) {
      console.warn("  Failed to read %s: %s", pkgPath, err);
    }
  }

  return versionMap;
}

function replaceWorkspaceVersions() {
  console.log("Replacing workspace:* with actual versions...");

  const versionMap = buildWorkspaceVersionMap();
  const packageJsonPaths = getPackageJsonPaths();
  const depFields = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ];

  let replacedCount = 0;

  for (const pkgPath of packageJsonPaths) {
    try {
      const content = fs.readFileSync(pkgPath, "utf-8");
      const pkg = JSON.parse(content);

      // Skip private packages
      if (pkg.private === true) {
        continue;
      }

      let modified = false;

      for (const field of depFields) {
        const deps = pkg[field];
        if (!deps || typeof deps !== "object") {
          continue;
        }

        for (const [depName, depVersion] of Object.entries(deps)) {
          if (
            typeof depVersion === "string" &&
            depVersion.startsWith("workspace:")
          ) {
            const actualVersion = versionMap.get(depName);
            if (actualVersion) {
              // workspace:* → ^X.Y.Z, workspace:^ → ^X.Y.Z, workspace:~ → ~X.Y.Z
              let prefix = "^";
              if (depVersion === "workspace:~") {
                prefix = "~";
              } else if (depVersion === "workspace:*") {
                prefix = "^";
              } else if (depVersion.startsWith("workspace:^")) {
                prefix = "^";
              }
              deps[depName] = `${prefix}${actualVersion}`;
              modified = true;
              replacedCount += 1;
            }
          }
        }
      }

      if (modified) {
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
        console.log("  Updated: %s", pkgPath);
      }
    } catch (err) {
      console.warn("  Failed to process %s: %s", pkgPath, err);
    }
  }

  console.log(
    "%s Replaced %d workspace:* references",
    chalk.green.bold("Done"),
    replacedCount,
  );
}

function getChangedPackages(
  beforeMap: Map<string, string>,
  afterMap: Map<string, string>,
): Array<{ name: string; version: string }> {
  const changed: Array<{ name: string; version: string }> = [];

  for (const [name, version] of afterMap) {
    const beforeVersion = beforeMap.get(name);
    if (beforeVersion !== version) {
      changed.push({ name, version });
    }
  }

  return changed;
}

function createGitCommitAndTags(
  changedPackages: Array<{ name: string; version: string }>,
) {
  console.log("Creating git commit and tags...");

  if (changedPackages.length === 0) {
    console.log("No packages were changed, skipping commit and tags");
    return;
  }

  // Stage all changes
  const addRet = spawnSync("git", ["add", "."], {
    cwd: paths.root,
    stdio: "inherit",
  });
  expectSuccess(addRet, "git add failed");

  // Build commit message with version info
  const versionList = changedPackages
    .map((pkg) => `- ${pkg.name}@${pkg.version}`)
    .join("\n");
  const commitMessage = `chore: publish

${versionList}`;

  // Create commit
  const commitRet = spawnSync("git", ["commit", "-m", commitMessage], {
    cwd: paths.root,
    stdio: "inherit",
  });
  expectSuccess(commitRet, "git commit failed");

  // Create tags only for changed packages
  for (const pkg of changedPackages) {
    const tag = `${pkg.name}@${pkg.version}`;
    console.log("  Creating tag: %s", tag);
    const tagRet = spawnSync("git", ["tag", "-a", tag, "-m", tag], {
      cwd: paths.root,
      stdio: "inherit",
    });
    if (tagRet.status !== 0) {
      console.warn("  Tag %s already exists, skipping", tag);
    }
  }

  console.log(
    "%s Created commit and %d tags",
    chalk.green.bold("Done"),
    changedPackages.length,
  );

  // Push commit and tags to remote
  console.log("Pushing commit and tags to origin...");
  const pushRet = spawnSync(
    "git",
    ["push", "-u", "origin", "HEAD", "--follow-tags"],
    {
      cwd: paths.root,
      stdio: "inherit",
    },
  );
  expectSuccess(pushRet, "git push failed");
  console.log("%s Pushed to origin", chalk.green.bold("Done"));
}

export async function version(..._args: any[]) {
  console.log("Start versioning packages");

  console.log("We will first re-build the packages\n");
  await doBuildPkgs();
  await doBuildSDK();

  console.log("Checking type definition in sandbox simple host");
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
  expectSuccess(fetchRet, "git fetch failed");

  // Save version map before lerna version
  const beforeVersionMap = buildWorkspaceVersionMap();

  spawnSync(
    "yarn",
    ["lerna", "version", "--no-private", "--no-git-tag-version"],
    {
      cwd: paths.root,
      stdio: "inherit",
    },
  );

  // Get version map after lerna version and find changed packages
  const afterVersionMap = buildWorkspaceVersionMap();
  const changedPackages = getChangedPackages(beforeVersionMap, afterVersionMap);

  try {
    replaceWorkspaceVersions();
  } catch (err) {
    console.error(
      "%s replaceWorkspaceVersions failed, rolling back...",
      chalk.bold.red("Error"),
    );
    spawnSync("git", ["checkout", "--", "."], {
      cwd: paths.root,
      stdio: "inherit",
    });
    throw err;
  }

  createGitCommitAndTags(changedPackages);
}
