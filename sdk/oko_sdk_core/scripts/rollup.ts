import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import {
  rollup,
  type InputOptions,
  type OutputOptions,
  type RollupBuild,
} from "rollup";

async function main() {
  console.log("Start rollup build");

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
    bundle = await rollup(inputOptions);

    await generateOutputs(bundle, outputOptionsList);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  if (bundle) {
    await bundle.close();
  }
}

async function generateOutputs(
  bundle: RollupBuild,
  outputOptionsList: OutputOptions[],
) {
  for (const outputOptions of outputOptionsList) {
    await bundle.write(outputOptions);
  }
}

main().then();
