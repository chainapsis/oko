import { spawnSync } from "node:child_process";
import path from "node:path";
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
    console.log("Starting pg_local container");

    const pgLocalComposeFile = path.join(
      paths.dockerfiles,
      "pg_local",
      "docker-compose.yml",
    );

    const dockerComposeRet = spawnSync(
      "docker",
      ["compose", "-f", pgLocalComposeFile, "up", "-d"],
      {
        cwd: paths.dockerfiles,
        stdio: "inherit",
      },
    );

    if (dockerComposeRet.status === 0) {
      await waitForPgContainer(pgLocalComposeFile);
    } else {
      console.log(
        "pg_local is not spanwed but we will continue as there is a change \
        that some other pg instance may be running",
      );
    }
  }

  const migrateRet = spawnSync("yarn", ["run", "migrate"], {
    cwd: paths.oko_pg_interface,
    stdio: "inherit",
    env,
  });
  expectSuccess(migrateRet, "migrate failed");

  console.info("%s %s", chalk.bold.green("Done"), "migrating");
}

async function waitForPgContainer(
  pgLocalComposeFile: string,
  maxAttempts: number = 5,
  delayMs: number = 1000,
): Promise<void> {
  console.log("Waiting for PostgreSQL to be ready...");
  const composeArgs = ["compose", "-f", pgLocalComposeFile];
  const execArgs = [
    ...composeArgs,
    "exec",
    "-T",
    "pg_local",
    "pg_isready",
    "-U",
    "postgres",
  ];

  for (let i = 0; i < maxAttempts; i += 1) {
    const ret = spawnSync("docker", execArgs, {
      cwd: paths.dockerfiles,
      stdio: "pipe",
    });

    if (ret.status === 0) {
      console.log("PostgreSQL is ready");
      return;
    }

    if (i < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(
    `PostgreSQL did not become ready within ${maxAttempts * delayMs}ms`,
  );
}
