import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import readline from "node:readline";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

type DeployableApp =
  | "demo_web"
  | "oko_attached"
  | "customer_dashboard"
  | "docs_web"
  | "oko_admin_web"
  | "user_dashboard";

const VERCEL_SCOPE = "keplrwallet";

interface AppConfig {
  path: string;
  project: string;
}

const APP_CONFIGS: Record<DeployableApp, AppConfig> = {
  demo_web: {
    path: paths.demo_web,
    project: "oko-demo-web",
  },
  oko_attached: {
    path: paths.oko_attached,
    project: "oko-attached",
  },
  customer_dashboard: {
    path: paths.ct_dashboard_web,
    project: "oko-customer-dashboard",
  },
  docs_web: {
    path: path.join(paths.root, "apps/docs_web"),
    project: "oko-docs-web",
  },
  oko_admin_web: {
    path: paths.oko_admin_web,
    project: "oko-admin-web",
  },
  user_dashboard: {
    path: path.join(paths.root, "apps/user_dashboard"),
    project: "oko-user-dashboard",
  },
};

async function promptForApp(): Promise<DeployableApp> {
  const apps = Object.keys(APP_CONFIGS) as DeployableApp[];
  let selectedIndex = 0;

  const renderMenu = () => {
    console.clear();
    console.log(chalk.yellow("Please select an app to deploy:"));
    console.log("");
    apps.forEach((key, index) => {
      const config = APP_CONFIGS[key];
      const prefix = index === selectedIndex ? chalk.green("❯") : " ";
      const appName =
        index === selectedIndex ? chalk.green.bold(key) : chalk.white(key);
      const projectName =
        index === selectedIndex
          ? chalk.green(`(${config.project})`)
          : chalk.gray(`(${config.project})`);
      console.log(`${prefix} ${appName} ${projectName}`);
    });
    console.log("");
    console.log(chalk.gray("Use ↑/↓ arrows to navigate, Enter to select"));
  };

  return new Promise((resolve) => {
    renderMenu();

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const onKeypress = (_str: string, key: readline.Key) => {
      if (key.name === "up") {
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : apps.length - 1;
        renderMenu();
      } else if (key.name === "down") {
        selectedIndex = selectedIndex < apps.length - 1 ? selectedIndex + 1 : 0;
        renderMenu();
      } else if (key.name === "return") {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        process.stdin.removeListener("keypress", onKeypress);
        process.stdin.pause();
        console.log("");
        resolve(apps[selectedIndex]);
      } else if (key.ctrl && key.name === "c") {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        process.exit(0);
      }
    };

    process.stdin.on("keypress", onKeypress);
  });
}

export async function deploy(options: { app?: DeployableApp; prod?: boolean }) {
  let { app, prod = false } = options;

  if (!app) {
    app = await promptForApp();
  }

  const config = APP_CONFIGS[app];
  if (!config) {
    console.error(chalk.red(`Unknown app: ${app}`));
    console.log(
      chalk.yellow("Available apps:"),
      Object.keys(APP_CONFIGS).join(", "),
    );
    process.exit(1);
  }

  console.log(
    chalk.bold(
      `Deploying ${config.project}${prod ? " (Production)" : " (Preview)"}...`,
    ),
  );
  console.log("");

  // Step 0: Clean .vercel directory
  const vercelDir = path.join(paths.root, ".vercel");
  if (fs.existsSync(vercelDir)) {
    console.log(chalk.blue("Step 0:"), "Cleaning .vercel directory...");
    fs.rmSync(vercelDir, { recursive: true, force: true });
    console.log(chalk.green("✓ .vercel directory removed"));
    console.log("");
  }

  // Step 1: Link to Vercel project
  console.log(chalk.blue("Step 1/3:"), "Linking to Vercel project...");
  const linkRet = spawnSync(
    "vercel",
    ["link", "--yes", `--scope=${VERCEL_SCOPE}`, `--project=${config.project}`],
    {
      cwd: paths.root,
      stdio: "inherit",
    },
  );
  expectSuccess(linkRet, "Vercel link failed");
  console.log(chalk.green("✓ Linked successfully"));
  console.log("");

  // Step 2: Build
  console.log(chalk.blue("Step 2/3:"), "Building...");
  const buildArgs = ["build", "--yes"];
  if (prod) {
    buildArgs.push("--prod");
  }
  const buildRet = spawnSync("vercel", buildArgs, {
    cwd: paths.root,
    stdio: "inherit",
  });
  expectSuccess(buildRet, "Vercel build failed");
  console.log(chalk.green("✓ Build completed"));
  console.log("");

  // Step 3: Deploy
  console.log(chalk.blue("Step 3/3:"), "Deploying...");
  const deployArgs = ["deploy", "--prebuilt"];
  if (prod) {
    deployArgs.push("--prod");
  }
  const deployRet = spawnSync("vercel", deployArgs, {
    cwd: paths.root,
    stdio: "inherit",
  });
  expectSuccess(deployRet, "Vercel deployment failed");
  console.log("");
  console.log(chalk.bold.green("✓ Deployment completed successfully!"));
}
