import type { Address, SignableMessage, RpcTransactionRequest } from "viem";
import type {
  MakeEthereumSigResult,
  ChainInfoForAttachedModal,
} from "@oko-wallet/oko-sdk-core";

export interface MakeSignatureBasePayload {
  chain_info: ChainInfoForAttachedModal;
  origin: string;
  signer: string;
}

export type EthSignParams =
  | {
      type: "sign_transaction";
      data: {
        address: Address;
        transaction: RpcTransactionRequest;
      };
    }
  | {
      type: "personal_sign";
      data: {
        address: Address;
        message: SignableMessage;
      };
    }
  | {
      type: "sign_typedData_v4";
      data: {
        address: Address;
        serializedTypedData: string;
      };
    };

export type EthSignResult = MakeEthereumSigResult;

/**
 * Signer interface for Ethereum
 */
export interface OkoEthSigner {
  getAddress: () => Address | null;
  sign: (params: EthSignParams) => Promise<EthSignResult>;
}
