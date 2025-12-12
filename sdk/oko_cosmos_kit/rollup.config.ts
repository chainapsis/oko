import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
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
      "@cosmos-kit/core",
      "@keplr-wallet/types",
      "@oko-wallet/oko-sdk-core",
      "@oko-wallet/oko-sdk-cosmos",
      "@cosmjs/amino",
      "@cosmjs/proto-signing",
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.rollup.json",
        noEmitOnError: true,
      }),
    ],
  },
];

export default config;
