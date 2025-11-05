import { program } from "commander";

import { typeCheck } from "./cmds/typecheck";
import { buildPkgs } from "./cmds/build_pkgs";
import { version } from "./cmds/version";
import { publish } from "./cmds/publish";
import { dbMigrateKSN } from "./cmds/db_migrate_ksn";
import { buildCs } from "./cmds/build_cs";
import { DbSeedAPI } from "./cmds/db_seed_api";
import { DbMigrateAPI } from "./cmds/db_migrate_api";

async function main() {
  const command = program.version("0.0.1").description("EWallet Public CI");

  command.command("typecheck").action(typeCheck);

  command.command("build_pkgs").action(buildPkgs);

  command.command("version").action(version);

  command.command("publish").action(publish);

  // internals2
  command.command("build_cs").action(buildCs);

  command.command("db_migrate_api").action(DbMigrateAPI);

  command.command("db_seed_api").action(DbSeedAPI);

  command
    .command("db_migrate_ksn")
    .option(
      "--use-env-file",
      "use env file config instead of test config",
      false,
    )
    .action(dbMigrateKSN);

  program.parse(process.argv);
}

main().then();
