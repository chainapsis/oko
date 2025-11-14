import React, { useCallback } from "react";
import { CosmosIcon } from "@oko-wallet/oko-common-ui/icons/cosmos_icon";

import { SignWidget } from "@oko-wallet-demo-web/components/widgets/sign_widget/sign_widget";
import { useSDKState } from "@oko-wallet-demo-web/state/sdk";
import { COSMOS_CHAIN_ID } from "@oko-wallet-demo-web/constants";

export const CosmosOffChainSignWidget = () => {
  const okoCosmos = useSDKState((state) => state.oko_cosmos);

  const handleClickCosmosArbitrarySign = useCallback(async () => {
    console.log("handleClickCosmosArbitrarySign()");

    if (okoCosmos === null) {
      throw new Error("CosmosEWallet is not initialized");
    }

    const account = await okoCosmos.getKey(COSMOS_CHAIN_ID);
    const address = account?.bech32Address;
    console.log("account", account);

    if (!address) {
      throw new Error("Address is not found");
    }

    const result = await okoCosmos.signArbitrary(
      COSMOS_CHAIN_ID,
      address,
      "Welcome to Oko! 🚀 Try generating an MPC signature.",
    );

    console.log("SignDirect result:", result);
  }, [okoCosmos]);

  return (
    <SignWidget
      chain="Cosmos Hub"
      chainIcon={<CosmosIcon />}
      signType="offchain"
      signButtonOnClick={handleClickCosmosArbitrarySign}
    />
  );
};
