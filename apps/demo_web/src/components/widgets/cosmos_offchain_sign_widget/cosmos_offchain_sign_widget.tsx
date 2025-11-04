import React, { useCallback } from "react";
import { CosmosIcon } from "@oko-wallet/ewallet-common-ui/icons/cosmos_icon";

import { SignWidget } from "@oko-wallet-demo-web/components/widgets/sign_widget/sign_widget";
import { useSDKState } from "@oko-wallet-demo-web/state/sdk";

const COSMOS_CHAIN_ID = "cosmoshub-4";

export const CosmosOffChainSignWidget = () => {
  const cosmosSDk = useSDKState((state) => state.keplr_sdk_cosmos);

  const handleClickCosmosArbitrarySign = useCallback(async () => {
    console.log("handleClickCosmosArbitrarySign()");

    if (cosmosSDk === null) {
      throw new Error("CosmosEWallet is not initialized");
    }

    const account = await cosmosSDk.getKey(COSMOS_CHAIN_ID);
    const address = account?.bech32Address;
    console.log("account", account);

    if (!address) {
      throw new Error("Address is not found");
    }

    const result = await cosmosSDk.signArbitrary(
      COSMOS_CHAIN_ID,
      address,
      "Welcome to Oko! 🚀 Try generating an MPC signature.",
    );

    console.log("SignDirect result:", result);
  }, [cosmosSDk]);

  return (
    <SignWidget
      chain="Cosmos Hub"
      chainIcon={<CosmosIcon />}
      signType="offchain"
      signButtonOnClick={handleClickCosmosArbitrarySign}
    />
  );
};
