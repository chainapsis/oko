import { spawnSync } from "node:child_process";

import { paths } from "@oko-wallet-ci/paths";
import { expectSuccess } from "@oko-wallet-ci/expect";

export async function dbMigrateKSN(options: { useEnvFile: boolean }) {
  console.log(
    "db_migrate, useEnvFile: %j, ksn pg interface path: %s",
    options.useEnvFile,
    paths.ksn_pg_interface,
  );

  const env = {
    ...process.env,
    USE_ENV_FILE: options.useEnvFile ? "true" : "false",
  };

  const dbMigrateRet = spawnSync("yarn", ["run", "migrate"], {
    cwd: paths.ksn_pg_interface,
    stdio: "inherit",
    env,
  });

  expectSuccess(dbMigrateRet, "db migrate failed");
}
