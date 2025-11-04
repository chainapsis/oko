import { program } from "commander";

import { typeCheck } from "./cmds/typecheck";
import { buildPkgs } from "./cmds/build_pkgs";
import { version } from "./cmds/version";
import { publish } from "./cmds/publish";
import { dbMigrate } from "./cmds/db_migrate";
import { buildCs } from "./cmds/build_cs";
import { apiDbSeed } from "./cmds/api_db_seed";
import { apiDbMigrate } from "./cmds/api_db_migrate";

async function main() {
  const command = program.version("0.0.1").description("EWallet Public CI");

  command.command("typecheck").action(typeCheck);

  command.command("build_pkgs").action(buildPkgs);

  command.command("version").action(version);

  command.command("publish").action(publish);

  // internals2
  command.command("build_cs").action(buildCs);

  command.command("api_db_migrate").action(apiDbMigrate);

  command.command("api_db_seed").action(apiDbSeed);

  command
    .command("db_migrate")
    .option(
      "--use-env-file",
      "use env file config instead of test config",
      false,
    )
    .action(dbMigrate);

  program.parse(process.argv);
}

main().then();
