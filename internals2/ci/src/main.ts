import { program } from "commander";

import { dbMigrate } from "./cmds/db_migrate";
import { dbSeed } from "./cmds/db_seed";
import { buildCs } from "./cmds/build_cs";
import { typeCheck } from "./cmds/typecheck";

async function main() {
  const command = program.version("0.0.1").description("EWallet CI");

  command
    .command("db_migrate")
    .description("Run DB migrations")
    .option("--use-env", "use env file config instead of test config", false)
    .action(dbMigrate);

  command
    .command("db_seed")
    .description("Adding data for testing to the DB")
    .option("--use-env", "use env file config instead of test config", false)
    .option("--target <env>", "target dataset to seed: dev | prod", "dev")
    .action(dbSeed);

  command
    .command("typecheck")
    .description(
      "Type checking about api_server, ewallet_attached, ewallet_pg_interface, demo_web",
    )
    .action(typeCheck);

  command
    .command("build_cs")
    .description("Build Cait Sith (addon/wasm)")
    .action(buildCs);

  program.parse(process.argv);
}

main().then();
