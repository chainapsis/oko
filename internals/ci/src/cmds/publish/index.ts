import { spawnSync } from "node:child_process";

import { paths } from "@oko-wallet-ci/paths";
import { expectSuccess } from "@oko-wallet-ci/expect";

export async function publish(..._args: any[]) {
  console.log("Publishing packages...");

  console.log(`\
1. Ensure you have "npm logged-in in the first place. \
It's "npm login", not "yarn npm login".
2. git remote "origin" needs to be set up in case you use an alias.
3. Do "yarn ci version" first
`);

  return;

  const publishRet = spawnSync(
    "yarn",
    ["lerna", "publish", "from-package", "--loglevel", "verbose"],
    {
      cwd: paths.root,
      stdio: "inherit",
    },
  );

  expectSuccess(publishRet, "publish failed");
}
