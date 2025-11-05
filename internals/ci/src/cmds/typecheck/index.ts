import chalk from "chalk";
import { Worker } from "node:worker_threads";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { paths } from "../../paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKER_COUNT = 4;

export async function typeCheck(..._args: any[]) {
  const pkgPaths = [
    paths.sdk_core,
    paths.sdk_cosmos,
    paths.sdk_eth,
    paths.ksn_server,
    paths.sandbox_simple_host,
    paths.oko_api_server,
    paths.tss_api,
    paths.admin_api,
    paths.ct_dashboard_api,
    paths.ewallet_attached,
    paths.oko_pg_interface,
    paths.demo_web,
    paths.ewallet_admin_web,
    paths.ct_dashboard_web,
  ];

  console.log("Type checking, total (%s)", pkgPaths.length);

  const chunckedPaths = chunkArr(pkgPaths, WORKER_COUNT);

  let workers = [];
  for (let idx = 0; idx < chunckedPaths.length; idx += 1) {
    const worker = spawnWorker(`worker-${idx}`, chunckedPaths[idx]);
    workers.push(worker);
  }

  try {
    const since = Date.now();
    await Promise.all(workers);
    const now = Date.now();

    console.log("Took %sms", now - since);
    console.log(
      "%s",
      chalk.bold.green("Success"),
      `All ${pkgPaths.length} ok!`,
    );
  } catch (err: any) {
    console.log("Worker exec error: %s", err);

    // TODO: @elden stop workers
  }
}

export async function spawnWorker(workerName: string, pkgPaths: string[]) {
  const scriptPath = join(__dirname, "./worker.ts");

  const p1 = new Promise((resolve, reject) => {
    console.log(
      "Spawn worker (%s), checking %s pkgs, script path: %s",
      workerName,
      pkgPaths.length,
      scriptPath,
    );

    const worker = new Worker(
      // NOTE:Register runtime hook, if not, scripts in a worker thread run on
      // NodeJS runtime, not TSX (or any TypeScript runtime).
      `import('tsx/esm/api')
        .then(({ register }) => {
          register();
          import('${scriptPath}')
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

function chunkArr(arr: any[], chunkCount: number) {
  let ret: any[][] = [];
  for (let i = 0; i < chunkCount; i += 1) {
    ret.push([]);
  }

  let currArrIdx = 0;
  for (let i = 0; i < arr.length; i += 1) {
    ret[currArrIdx].push(arr[i]);

    currArrIdx = (currArrIdx + 1) % chunkCount;
  }

  return ret;
}
