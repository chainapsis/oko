import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function DbMakeApi(name: string) {
    console.log("Start creating migration: %s", name);

    const migrateRet = spawnSync(
        "yarn",
        ["knex", "migrate:make", name, "-x", "ts"],
        {
            cwd: paths.oko_pg_interface,
            stdio: "inherit",
        },
    );
    expectSuccess(migrateRet, "migrate:make failed");

    console.info("%s %s", chalk.bold.green("Done"), "creating migration");
}
