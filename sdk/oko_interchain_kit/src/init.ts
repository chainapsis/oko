import { OkoCosmosWallet } from "@oko-wallet/oko-sdk-cosmos";
import { OkoEthWallet } from "@oko-wallet/oko-sdk-eth";
import type { OkoWalletOptions } from "./types";
import type { OkoCosmosWalletInterface } from "@oko-wallet/oko-sdk-cosmos";
import type { OkoEthWalletInterface } from "@oko-wallet/oko-sdk-eth";

export function initializeOkoCosmosWallet(
  options: OkoWalletOptions,
): OkoCosmosWalletInterface {
  const cosmosWalletResult = OkoCosmosWallet.init({
    api_key: options.apiKey,
    sdk_endpoint: options.sdkEndpoint,
  });

  if (!cosmosWalletResult.success) {
    throw new Error(
      `Failed to initialize OkoCosmosWallet: ${
        (cosmosWalletResult as any).err?.msg || "Unknown error"
      }`,
    );
  }

  return cosmosWalletResult.data;
}

export function initializeOkoEthWallet(
  options: OkoWalletOptions,
): OkoEthWalletInterface {
  const ethWalletResult = OkoEthWallet.init({
    api_key: options.apiKey,
    sdk_endpoint: options.sdkEndpoint,
  });

  if (!ethWalletResult.success) {
    throw new Error(
      `Failed to initialize OkoEthWallet: ${
        (ethWalletResult as any).err?.msg || "Unknown error"
      }`,
    );
  }

  return ethWalletResult.data;
}
