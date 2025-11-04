import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function apiDbSeed(options: {
  useEnv: boolean;
  target: "dev" | "prod";
}) {
  console.log("Start DB seeding");

  const env = {
    ...process.env,
    USE_ENV: options.useEnv ? "true" : "false",
    TARGET: options.target,
  };

  const seedRet = spawnSync("yarn", ["run", "seed"], {
    cwd: paths.ewallet_pg_interface,
    stdio: "inherit",
    env,
  });
  expectSuccess(seedRet, "seed failed");

  console.info("%s %s", chalk.bold.green("Done"), "seeding");
}
