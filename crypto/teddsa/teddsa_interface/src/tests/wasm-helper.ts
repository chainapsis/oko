import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as wasmModule from "@oko-wallet/frost-ed25519-keplr-wasm/pkg/frost_ed25519_keplr_wasm";

let initialized = false;

export async function initWasmForTest(): Promise<void> {
  if (initialized) return;

  // Node.js 환경에서 wasm 파일 직접 읽기
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const wasmPath = join(
    __dirname,
    "../../../frost_ed25519_keplr_wasm/pkg/frost_ed25519_keplr_wasm_bg.wasm",
  );
  const wasmBytes = readFileSync(wasmPath);

  // initSync로 동기 초기화
  (wasmModule as any).initSync({ module: wasmBytes });
  initialized = true;
}

export { wasmModule };
