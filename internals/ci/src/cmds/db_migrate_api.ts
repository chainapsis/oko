import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function DbMigrateAPI(options: { useEnv: boolean }) {
  console.log("Start DB migrating");

  const env = {
    ...process.env,
    USE_ENV: options.useEnv ? "true" : "false",
  };

  if (options.useEnv === false) {
    const dockerComposeRet = spawnSync(
      "docker",
      ["compose", "up", "-d", "pg_local"],
      {
        cwd: paths.dockerfiles,
        stdio: "inherit",
      },
    );
    expectSuccess(dockerComposeRet, "docker compose failed");
  }

  const migrateRet = spawnSync("yarn", ["run", "migrate"], {
    cwd: paths.ewallet_pg_interface,
    stdio: "inherit",
    env,
  });
  expectSuccess(migrateRet, "migrate failed");

  console.info("%s %s", chalk.bold.green("Done"), "migrating");
}
