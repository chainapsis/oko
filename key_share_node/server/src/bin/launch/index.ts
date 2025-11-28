import chalk from "chalk";
import dayjs from "dayjs";

import { connectPG } from "@oko-wallet-ksn-server/database";
import { makeApp } from "@oko-wallet-ksn-server/app";
import { loadEnv, verifyEnv } from "@oko-wallet-ksn-server/envs";
import { startPgDumpRuntime } from "@oko-wallet-ksn-server/pg_dump/runtime";
import { loadEncSecret } from "./load_enc_secret";
import { checkDBBackup } from "./check_db_backup";
import { parseCLIArgs } from "./cli_args";
import type { ServerState } from "@oko-wallet-ksn-server/state";
import { getGitCommitHash } from "./git";
import pJson from "@oko-wallet-ksn-server/../package.json";
import { logger } from "@oko-wallet-ksn-server/logger";
import { resetDB } from "./reset_db";

const ONE_DAY_MS = 1 * 86400;

async function main() {
  const opts = parseCLIArgs();
  console.log("Launching ks node server, cli args: %j", opts);
  logger.info("Launching, Logger initialized");

  loadEnv(opts.nodeId);

  const verifyEnvRes = verifyEnv(process.env);
  if (!verifyEnvRes.success) {
    logger.error("ENV variables invalid, err: %s", verifyEnvRes.err);

    process.exit(1);
  }

  const loadEncSecretRes = loadEncSecret(process.env.ENCRYPTION_SECRET_PATH);
  if (!loadEncSecretRes.success) {
    logger.error("Encryption secret invalid, err: %s", loadEncSecretRes.err);

    process.exit(1);
  }

  if (opts.resetDb) {
    logger.info("DB reset flag detected, running migration...");

    const resetDBRes = await resetDB({
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
      port: Number(process.env.DB_PORT),
      ssl: process.env.DB_SSL === "true" ? true : false,
    });
    if (!resetDBRes.success) {
      logger.error(
        "%s: DB reset failed, exiting process, err: %s",
        chalk.bold.red("Error"),
        resetDBRes.err,
      );

      process.exit(1);
    }

    logger.info("DB reset completed");
  }

  // if (opts.nodeId === "1") {
  //   logger.debug("Checking DB backup, nodeId: %s", opts.nodeId);

  //   const backupRes = await checkDBBackup(
  //     {
  //       database: process.env.DB_NAME,
  //       host: process.env.DB_HOST,
  //       password: process.env.DB_PASSWORD,
  //       user: process.env.DB_USER,
  //       port: Number(process.env.DB_PORT),
  //       ssl: process.env.DB_SSL === "true" ? true : false,
  //     },
  //     process.env.DUMP_DIR,
  //   );
  //   if (!backupRes.success) {
  //     logger.error(
  //       "%s: Health check failed, exiting process, err: %s",
  //       chalk.bold.red("Error"),
  //       backupRes.err,
  //     );

  //     process.exit(1);
  //   } else {
  //     logger.info("Finished DB backup check");
  //   }
  // } else {
  //   logger.info("Bypass DB backup checking, nodeId: %s", opts.nodeId);
  // }

  const app = makeApp();

  const git_hash = getGitCommitHash();
  const version = pJson.version;

  const now = dayjs();
  const launch_time = now.toISOString();

  const createPostgresRes = await connectPG({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    port: Number(process.env.DB_PORT),
    ssl: process.env.DB_SSL === "true" ? true : false,
  });
  if (!createPostgresRes.success) {
    logger.error(createPostgresRes.err);

    process.exit(1);
  }

  const state: ServerState = {
    db: createPostgresRes.data,
    encryptionSecret: loadEncSecretRes.data,

    is_db_backup_checked: true,
    launch_time,
    git_hash,
    version,
  };

  app.locals = state;

  startPgDumpRuntime(
    app.locals.db,
    {
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
      port: Number(process.env.DB_PORT),
    },
    {
      sleepTimeSeconds: ONE_DAY_MS,
      retentionDays: 7,
      dumpDir: process.env.DUMP_DIR,
    },
  );

  app.listen(process.env.PORT, () => {
    logger.info("Start server, listening on port: %s", process.env.PORT);
  });

  return;
}

main().then();
