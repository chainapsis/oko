import { deleteAsync } from "del";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import chalk from "chalk";
import {
  rollup,
  type InputOptions,
  type OutputOptions,
  type RollupBuild,
} from "rollup";

async function main() {
  console.log("Start rollup-build");

  await removeDirtyFiles();

  let bundle: RollupBuild;

  const inputOptions: InputOptions = {
    input: "src/index.ts",
    external: ["@oko-wallet/stdlib-js", "@keplr-wallet/types"],
    plugins: [
      json(),
      nodeResolve(),
      typescript({
        tsconfig: "./tsconfig.rollup.json",
        noEmitOnError: true,
        outputToFilesystem: true,
      }),
    ],
  };

  const outputOptionsList: OutputOptions[] = [
    {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    // {
    //   file: "dist/index.min.js",
    //   format: "esm",
    //   sourcemap: true,
    //   plugins: [terser()],
    // },
  ];

  try {
    console.log("input: %s", inputOptions.input);
    bundle = await rollup(inputOptions);

    await generateOutputs(bundle, inputOptions, outputOptionsList);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  if (bundle) {
    await bundle.close();
  }
}

async function removeDirtyFiles() {}

async function generateOutputs(
  bundle: RollupBuild,
  inputOptions: InputOptions,
  outputOptionsList: OutputOptions[],
) {
  for (const outputOptions of outputOptionsList) {
    console.log(
      chalk.green("generated: %s → %s"),
      chalk.bold(inputOptions.input),
      chalk.bold(outputOptions.file),
    );

    await bundle.write(outputOptions);
  }
}

main().then();
