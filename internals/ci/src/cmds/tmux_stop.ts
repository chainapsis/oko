import { spawnSync } from "node:child_process";

import { expectSuccess } from "@oko-wallet-ci/expect";
import { paths } from "@oko-wallet-ci/paths";

export async function tmuxStop(_args: any) {
  console.log(
    "This command can only run if you call it from 'outside' of tmux session.",
  );

  const shRet = spawnSync("bash", ["./internals/tmux/tmux_e2e_stop.sh"], {
    cwd: paths.root,
    stdio: "inherit",
  });
  expectSuccess(shRet, "tmux start failed");
}
