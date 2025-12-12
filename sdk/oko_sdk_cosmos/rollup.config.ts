import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import type { RollupOptions } from "rollup";

export const config: RollupOptions[] = [
  {
    input: "src/index.ts",
    output: [
      {
        dir: "dist",
        format: "esm",
        sourcemap: true,
      },
    ],
    external: [
      "@oko-wallet/oko-sdk-core",
      "@cosmjs/amino",
      "@cosmjs/proto-signing",
      "@oko-wallet/stdlib-js",
      "@keplr-wallet/proto-types",
      "@keplr-wallet/types",
      "@noble/curves",
      "@noble/hashes",
      "bech32",
      "buffer",
    ],
    plugins: [
      json(),
      nodeResolve(),
      commonjs(),
      typescript({
        noEmitOnError: true,
        declaration: true,
      }),
    ],
  },
];

export default config;
