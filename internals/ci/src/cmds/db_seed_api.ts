import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function DbSeedAPI(options: {
  useEnvFile: boolean;
  target: "dev" | "prod";
}) {
  console.log("Start DB seeding");

  const env = {
    ...process.env,
    USE_ENV_FILE: options.useEnvFile ? "true" : "false",
    TARGET: options.target,
  };

  const seedRet = spawnSync("yarn", ["run", "seed"], {
    cwd: paths.oko_pg_interface,
    stdio: "inherit",
    env,
  });
  expectSuccess(seedRet, "seed failed");

  console.info("%s %s", chalk.bold.green("Done"), "seeding");
}
