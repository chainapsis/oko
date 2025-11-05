import chalk from "chalk";
import { Worker } from "node:worker_threads";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { paths } from "../../paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function typeCheck(..._args: any[]) {
  const pkgPaths = [
    paths.sdk_core,
    paths.sdk_cosmos,
    paths.sdk_eth,
    paths.ksn_server,
    paths.sandbox_simple_host,
    paths.ewallet_api_server,
    paths.tss_api,
    paths.admin_api,
    paths.ct_dashboard_api,
    paths.ewallet_attached,
    paths.ewallet_pg_interface,
    paths.demo_web,
    paths.ewallet_admin_web,
    paths.ct_dashboard_web,
  ];

  console.log("Type checking, total (%s)", pkgPaths.length);

  const targets1 = pkgPaths.slice(0, pkgPaths.length / 2);
  const w1 = spawnWorker("worker1", targets1);

  const targets2 = pkgPaths.slice(pkgPaths.length / 2);
  const w2 = spawnWorker("worker2", targets2);

  if (targets1.length + targets2.length !== pkgPaths.length) {
    console.log("Not all packages are selected to type-check");
    process.exit(1);
  }

  try {
    const since = Date.now();
    await Promise.all([w1]);
    await Promise.all([w2]);
    const now = Date.now();

    console.log("Took %sms", now - since);
    console.log(
      "%s",
      chalk.bold.green("Success"),
      `All ${pkgPaths.length} ok!`,
    );
  } catch (err) {
    console.log("error", err);
  }
}

export async function spawnWorker(workerName: string, pkgPaths: string[]) {
  const threadPath = join(__dirname, "./thread.ts");
  console.log("thread path: %s", threadPath);

  const p1 = new Promise((resolve, reject) => {
    const worker = new Worker(
      // NOTE:Register runtime hook, if not, scripts in a worker thread run on
      // NodeJS runtime, not TSX (or any TypeScript runtime).
      `import('tsx/esm/api')
        .then(({ register }) => {
          register();
          import('${threadPath}')
        })`,
      {
        workerData: pkgPaths,
        eval: true,
      },
    );

    worker.on("message", (msg) => {
      console.log("%s %s", chalk.cyanBright.bold(workerName), msg);
    });

    worker.on("error", reject);

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      } else {
        resolve(0);
      }
    });
  });

  return p1;
}
