import React from "react";
import { EthereumBlueIcon } from "@oko-wallet/ewallet-common-ui/icons/ethereum_blue_icon";
import { isAddressEqual, recoverMessageAddress } from "viem";

import { SignWidget } from "@oko-wallet-import-demo-web/components/widgets/sign_widget/sign_widget";
import { useSDKState } from "@oko-wallet-import-demo-web/state/sdk";

export const EthereumOffchainSignWidget = () => {
  const ethSDK = useSDKState((state) => state.keplr_sdk_eth);

  const handleClickEthOffchainSign = async () => {
    if (ethSDK === null) {
      throw new Error("EthEWallet is not initialized");
    }

    const message = "Welcome to Oko! 🚀 Try generating an MPC signature.";

    const signature = await ethSDK.sign(message);

    const address = await ethSDK.getAddress();
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature,
    });

    if (!isAddressEqual(recoveredAddress, address)) {
      throw new Error("Recovered address is not equal to the address");
    }
  };

  return (
    <SignWidget
      chain="Ethereum"
      chainIcon={<EthereumBlueIcon />}
      signType="offchain"
      signButtonOnClick={handleClickEthOffchainSign}
    />
  );
};
