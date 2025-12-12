import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";

/** @type {import('ts').JestConfigWithTsJest} */
export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    external: ["@oko-wallet/stdlib-js", "@keplr-wallet/types"],
    plugins: [
      json(),
      nodeResolve(),
      typescript({
        tsconfig: "./tsconfig.rollup.json",
        noEmitOnError: true,
      }),
    ],
  },
  // {
  //   file: "dist/index.min.js",
  //   format: "esm",
  //   sourcemap: true,
  //   plugins: [terser()],
  // },
];
