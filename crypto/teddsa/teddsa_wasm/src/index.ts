import * as wasmModule from "../pkg/teddsa_wasm";

export { wasmModule };

let isInitialized = false;
let wasmInstance: typeof wasmModule | null = null;
const exportedFunctions: Record<string, Function> = {};

type WasmModule = typeof wasmModule;
export type WasmFunctionNames = keyof WasmModule;

export async function initWasm(
  wasmMod: typeof wasmModule,
  wasmPath: string,
): Promise<Record<string, Function>> {
  if (isInitialized && wasmInstance) {
    return exportedFunctions;
  }

  try {
    const response = await fetch(wasmPath);
    if (!response.ok) {
      throw new Error(
        `Cannot load WASM file: ${response.status} ${response.statusText}`,
      );
    }

    const wasmBytes = await response.arrayBuffer();
    (wasmMod as any).initSync(wasmBytes);
    wasmInstance = wasmMod;

    Object.keys(wasmMod)
      .filter((key) => typeof (wasmMod as any)[key] === "function")
      .forEach((funcName) => {
        exportedFunctions[funcName] = (...args: unknown[]) =>
          (wasmMod as any)[funcName](...args);
      });

    isInitialized = true;
    return exportedFunctions;
  } catch (error) {
    throw error;
  }
}

export function isWasmInitialized(): boolean {
  return isInitialized;
}
