import type {
  OkoEthWalletInterface,
  EthSignParams,
  OkoViemAccount,
} from "@oko-wallet-sdk-eth/types";
import type { TypedData, TypedDataDefinition } from "viem";
import { serializeTypedData } from "viem";
import { toRpcTransactionRequest } from "@oko-wallet-sdk-eth/utils";

/**
 * Check if the typed data is an EIP-3009 TransferWithAuthorization.
 */
function isEIP3009TransferWithAuthorization(
  typedData: TypedDataDefinition,
): boolean {
  return typedData.primaryType === "TransferWithAuthorization";
}

/**
 * Serialize typed data, using the appropriate method based on the typed data type.
 * - For EIP-3009 TransferWithAuthorization: preserves domain (fixes viem's domain stripping)
 * - For other EIP-712 requests: uses viem's serializeTypedData
 */
function serializeTypedDataForSigning<
  const T extends TypedData | Record<string, unknown>,
  P extends keyof T | "EIP712Domain",
>(typedData: TypedDataDefinition<T, P>): string {
  const data = typedData as unknown as TypedDataDefinition;
  if (isEIP3009TransferWithAuthorization(data)) {
    // Preserve domain even when types.EIP712Domain is not defined
    // (viem's serializeTypedData strips it, breaking EIP-3009)
    return JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    );
  }
  return serializeTypedData(typedData);
}

export async function toViemAccount(
  this: OkoEthWalletInterface,
): Promise<OkoViemAccount> {
  await this.waitUntilInitialized;

  const publicKey = await this.getPublicKey();
  const address = await this.getAddress();

  const sign = (params: EthSignParams) => this.makeSignature(params);

  const account: OkoViemAccount = {
    address,
    type: "local",
    source: "oko_wallet",
    publicKey,
    signMessage: async ({ message }) => {
      const result = await sign({
        type: "personal_sign",
        data: {
          address,
          message,
        },
      });

      if (result.type !== "signature") {
        throw new Error("Invalid result type");
      }

      return result.signature;
    },
    signTransaction: async (transaction) => {
      const result = await sign({
        type: "sign_transaction",
        data: {
          address,
          transaction: toRpcTransactionRequest(transaction),
        },
      });

      if (result.type !== "signed_transaction") {
        throw new Error("Invalid result type");
      }

      return result.signedTransaction;
    },
    signTypedData: async (typedData) => {
      const result = await sign({
        type: "sign_typedData_v4",
        data: {
          address,
          serializedTypedData: serializeTypedDataForSigning(typedData),
        },
      });

      if (result.type !== "signature") {
        throw new Error("Invalid result type");
      }

      return result.signature;
    },
  };

  return account;
}
