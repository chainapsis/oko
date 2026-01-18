import { OkoSolWallet } from "@oko-wallet/oko-sdk-sol";
import { registerOkoRialoWallet } from "./rialo-wallet-standard";

export interface OkoFrostOptions {
  api_key: string;
  sdk_endpoint?: string;
}

/**
 * Initialize Oko wallet for Rialo/Frost integration.
 * This registers the wallet with wallet-standard so @rialo/frost can discover it.
 *
 * @example
 * ```typescript
 * await initOkoFrostWallet({
 *   api_key: process.env.NEXT_PUBLIC_OKO_API_KEY!,
 * });
 * ```
 */
export async function initOkoFrostWallet(options: OkoFrostOptions): Promise<void> {
  const result = OkoSolWallet.init(options);
  if (!result.success) {
    throw new Error(`Failed to initialize Oko wallet: ${JSON.stringify(result.err)}`);
  }
  await result.data.waitUntilInitialized;
  registerOkoRialoWallet(result.data);
}

// For advanced usage
export { registerOkoRialoWallet } from "./rialo-wallet-standard";
