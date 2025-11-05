import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function DbMigrateAPI(options: { useEnvFile: boolean }) {
  console.log("Start DB migrating");

  const env = {
    ...process.env,
    USE_ENV_FILE: options.useEnvFile ? "true" : "false",
  };

  if (options.useEnvFile === false) {
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
    cwd: paths.oko_pg_interface,
    stdio: "inherit",
    env,
  });
  expectSuccess(migrateRet, "migrate failed");

  console.info("%s %s", chalk.bold.green("Done"), "migrating");
}
