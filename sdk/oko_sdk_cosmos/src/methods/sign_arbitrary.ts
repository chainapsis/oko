import type { StdSignature } from "@cosmjs/amino";
import type { MakeCosmosSigData } from "@oko-wallet/oko-sdk-core";

import type { OkoCosmosWalletInterface } from "@oko-wallet-sdk-cosmos/types";
import { makeADR36AminoSignDoc } from "@oko-wallet-sdk-cosmos/utils/arbitrary";

export async function signArbitrary(
  this: OkoCosmosWalletInterface,
  chainId: string,
  signer: string,
  data: string | Uint8Array,
): Promise<StdSignature> {
  try {
    // Create ADR-36 sign doc for arbitrary message signing
    const signDoc = makeADR36AminoSignDoc(signer, data);
    const origin = this.okoWallet.origin;

    const chainInfoList = await this.getCosmosChainInfo();
    const chainInfo = chainInfoList.find((info) => info.chainId === chainId);

    if (!chainInfo) {
      throw new Error("Chain info not found for chainId: " + chainId);
    }

    const msg: MakeCosmosSigData = {
      chain_type: "cosmos",
      sign_type: "arbitrary",
      payload: {
        chain_info: {
          chain_id: chainId,
          rpc_url: chainInfo.rpc,
          rest_url: chainInfo.rest,
          chain_name: chainInfo?.chainName ?? "",
          chain_symbol_image_url: chainInfo?.stakeCurrency?.coinImageUrl ?? "",
          fee_currencies: chainInfo.feeCurrencies,
          currencies: chainInfo.currencies,
          bech32_config: chainInfo?.bech32Config,
          features: chainInfo?.features,
          bip44: chainInfo?.bip44,
          evm: chainInfo?.evm,
        },
        signer,
        data,
        signDoc,
        origin,
      },
    };

    const openModalResp = await this.openModal(msg);

    if (openModalResp.modal_type !== "cosmos/make_signature") {
      throw new Error("Invalid modal type response");
    }

    switch (openModalResp.type) {
      case "approve": {
        if (openModalResp.data.chain_type !== "cosmos") {
          throw new Error("Invalid chain type sig response");
        }

        const signature = openModalResp.data.sig_result.signature;

        const verifyRes = await this.verifyArbitrary(
          chainId,
          signer,
          data,
          signature,
        );

        if (!verifyRes.isVerified) {
          console.error("Signature not verified, res: %o", verifyRes);

          throw new Error("Signature verification failed");
        }

        return {
          ...signature,
        };
      }
      case "reject": {
        throw new Error("User rejected modal request");
      }
      case "error": {
        const message = `${openModalResp.error.type}`;

        throw new Error(message);
      }
      default: {
        throw new Error("unreachable");
      }
    }
  } catch (error) {
    console.error("[oko-cosmos] Error signing arbitrary, err: %s", error);

    throw error;
  }
}
