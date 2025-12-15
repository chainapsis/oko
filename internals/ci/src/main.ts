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
import { DbMakeApi } from "./cmds/db_make_api";
import { deploy } from "./cmds/deploy";
import { langFormat } from "./cmds/lang_format";
import { langCheck } from "./cmds/lang_check";
import { depsCheck } from "./cmds/deps_check";

async function main() {
  const command = program.version("0.0.1").description("Oko Public CI");

  command.command("typecheck").action(typeCheck);

  command.command("version").action(version);

  command.command("publish").action(publish);

  command.command("deps_check").action(depsCheck);

  command.command("lang_format").action(langFormat);

  command.command("lang_check").action(langCheck);

  command.command("build_pkgs").action(buildPkgs);

  command.command("build_sdk").action(buildSDK);

  command.command("build_cs").action(buildCs);

  command
    .command("db_migrate_api")
    .option(
      "--use-env-file",
      "use env file config instead of test config",
      false,
    )
    .action(DbMigrateAPI);

  command.command("db_make_api <name>").action(DbMakeApi);

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

  command
    .command("deploy")
    .option("--app <app>", "App to deploy")
    .option(
      "--env <env>",
      "Deployment environment (preview|develop|prod). Default: preview",
      "preview",
    )
    .action(deploy);

  program.parse(process.argv);
}

main().then();
