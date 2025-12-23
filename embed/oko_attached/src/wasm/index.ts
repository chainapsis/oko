import * as caitSithWasmModule from "@oko-wallet/cait-sith-keplr-wasm/pkg/cait_sith_keplr_wasm";
import { initWasm as initCaitSithWasm } from "@oko-wallet/cait-sith-keplr-wasm";
import * as teddsaWasmModule from "@oko-wallet/teddsa-wasm/pkg/teddsa_wasm";
import { initWasm as initTeddsaWasm } from "@oko-wallet/teddsa-wasm";

export async function initKeplrWasm() {
  try {
    await initCaitSithWasm(
      caitSithWasmModule,
      "/pkg/cait_sith_keplr_wasm_bg.wasm",
    );
    console.log("[attached] cait-sith WASM initialized");
  } catch (err) {
    console.error("[attached] Error initializing cait-sith WASM, err: %s", err);
  }

  try {
    await initTeddsaWasm(teddsaWasmModule, "/pkg/teddsa_wasm_bg.wasm");
    console.log("[attached] teddsa WASM initialized");
  } catch (err) {
    console.error("[attached] Error initializing teddsa WASM, err: %s", err);
  }
}
