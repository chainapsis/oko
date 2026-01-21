import type { SpawnSyncReturns } from "node:child_process";
import chalk from "chalk";

export function expectSuccess(
  ret: SpawnSyncReturns<ArrayBuffer | Uint8Array | string>,
  msg: string,
) {
  if (ret.error) {
    console.error("Spawn err, msg: %s, err: %s", msg, ret.error);

    process.exit(1);
  }

  if (ret.status !== 0) {
    console.error(
      "%s %s, msg: %s",
      chalk.bold.red("Error"),
      "Exit with error",
      msg,
    );

    process.exit(1);
  }
}
