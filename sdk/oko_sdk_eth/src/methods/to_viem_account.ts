import type {
  OkoEthWalletInterface,
  EthSignParams,
  OkoViemAccount,
} from "@oko-wallet-sdk-eth/types";
import type { TypedData, TypedDataDefinition } from "viem";
import { serializeTypedData } from "viem";
import { toRpcTransactionRequest } from "@oko-wallet-sdk-eth/utils";

/**
 * Check if the typed data is an x402/EIP-3009 payment authorization.
 */
function isX402PaymentAuthorization(typedData: TypedDataDefinition): boolean {
  const { message, primaryType } = typedData;

  // Check for EIP-3009 TransferWithAuthorization (used by x402)
  if (primaryType === "TransferWithAuthorization") {
    return true;
  }

  // Fallback: check for payment-like message structure
  if (
    message &&
    typeof message === "object" &&
    "from" in message &&
    "to" in message &&
    "value" in message
  ) {
    return true;
  }

  return false;
}

/**
 * Serialize typed data, using the appropriate method based on the typed data type.
 * - For x402/EIP-3009 payment authorizations: preserves domain (fixes viem's domain stripping)
 * - For other EIP-712 requests: uses viem's serializeTypedData
 */
function serializeTypedDataForSigning<
  const T extends TypedData | Record<string, unknown>,
  P extends keyof T | "EIP712Domain",
>(typedData: TypedDataDefinition<T, P>): string {
  const data = typedData as unknown as TypedDataDefinition;
  if (isX402PaymentAuthorization(data)) {
    // Preserve domain even when types.EIP712Domain is not defined
    // (viem's serializeTypedData strips it, breaking x402/EIP-3009)
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
