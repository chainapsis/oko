import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  // const _env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: 3200,
    },
    plugins: [
      react(),
      tsconfigPaths(),
      nodePolyfills({
        globals: {
          Buffer: true,
        },
      }),
    ],
  };
});
