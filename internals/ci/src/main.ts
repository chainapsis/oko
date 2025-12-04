import { program } from "commander";

import { typeCheck } from "./cmds/typecheck";
import { buildPkgs } from "./cmds/build_pkgs";
import { buildSDK } from "./cmds/build_sdk";
import { version } from "./cmds/version";
import { publish } from "./cmds/publish";
import { dbMigrateKSN } from "./cmds/db_migrate_ksn";
import { buildCs } from "./cmds/build_cs";
import { DbSeedAPI } from "./cmds/db_seed_api";
import { DbMigrateAPI } from "./cmds/db_migrate_api";
import { deployApps } from "./cmds/deploy_apps";

async function main() {
  const command = program.version("0.0.1").description("Oko Public CI");

  command.command("typecheck").action(typeCheck);

  command.command("build_pkgs").action(buildPkgs);

  command.command("build_sdk").action(buildSDK);

  command.command("version").action(version);

  command.command("publish").action(publish);

  // internals2
  command.command("build_cs").action(buildCs);

  command
    .command("db_migrate_api")
    .option(
      "--use-env-file",
      "use env file config instead of test config",
      false,
    )
    .action(DbMigrateAPI);

  command
    .command("db_seed_api")
    .option(
      "--use-env-file",
      "use env file config instead of test config",
      false,
    )
    .action(DbSeedAPI);

  command
    .command("db_migrate_ksn")
    .option(
      "--use-env-file",
      "use env file config instead of test config",
      false,
    )
    .action(dbMigrateKSN);

  command.command("deploy_apps").action(deployApps);

  program.parse(process.argv);
}

main().then();
