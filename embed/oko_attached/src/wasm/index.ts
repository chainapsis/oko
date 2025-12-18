import * as wasmModule from "@oko-wallet/cait-sith-keplr-wasm/pkg/cait_sith_keplr_wasm";
import { initWasm } from "@oko-wallet/cait-sith-keplr-wasm";
import * as teddsaWasmModule from "@oko-wallet/teddsa-wasm/pkg/teddsa_wasm";
import { initWasm as initTeddsaWasm } from "@oko-wallet/teddsa-wasm";

export async function initKeplrWasm() {
  try {
    await initWasm(wasmModule, "/pkg/cait_sith_keplr_wasm_bg.wasm");
    console.log("[attached] Cait-Sith WASM initialized");
  } catch (err) {
    console.error("[attached] Error initializing Cait-Sith WASM, err: %s", err);
  }
}

export async function initTeddsaWasmModule() {
  try {
    await initTeddsaWasm(
      teddsaWasmModule,
      "/pkg/teddsa_wasm_bg.wasm",
    );
    console.log("[attached] TEdDSA WASM initialized");
  } catch (err) {
    console.error("[attached] Error initializing TEdDSA WASM, err: %s", err);
  }
}
