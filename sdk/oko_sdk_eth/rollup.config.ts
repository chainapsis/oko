import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import type { RollupOptions } from "rollup";

const config: RollupOptions[] = [
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "esm",
      sourcemap: true,
    },
    external: [
      "@oko-wallet/stdlib-js",
      "@keplr-wallet/types",
      "@oko-wallet/oko-sdk-core",
      "eventemitter3",
      "viem",
      "uuid",
      /^viem\//,
      /^ox\//,
    ],
    plugins: [
      json(),
      nodeResolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs({
        include: /node_modules/,
        transformMixedEsModules: true,
      }),
      typescript({
        // declaration: false,
        noEmitOnError: true,
        exclude: ["**/*.test.ts", "**/tests/**/*", "**/*.spec.ts"],
      }),
    ],
  },
];

export default config;
