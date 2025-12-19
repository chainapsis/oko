import * as wasmModule from "@oko-wallet/cait-sith-keplr-wasm/pkg/cait_sith_keplr_wasm";
import { initWasm } from "@oko-wallet/cait-sith-keplr-wasm";

export async function initKeplrWasm() {
  try {
    await initWasm(wasmModule, "/pkg/cait_sith_keplr_wasm_bg.wasm");
    console.log("[attached] WASM initialized");
  } catch (err) {
    console.error("[attached] Error initializing WASM, err: %s", err);
  }
}
