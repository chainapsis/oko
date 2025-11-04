import { useEffect } from "react";

import { useSDKState } from "@oko-wallet-demo-web/state/sdk";

export function useInitKeplrEWallet() {
  const initKeplrSdkCosmos = useSDKState((state) => state.initKeplrSdkCosmos);
  const initKeplrSdkEth = useSDKState((state) => state.initKeplrSdkEth);

  const isInitialized = useSDKState(
    (state) => state.keplr_sdk_cosmos !== null && state.keplr_sdk_eth !== null,
  );

  useEffect(() => {
    initKeplrSdkCosmos();
    initKeplrSdkEth();
  }, []);

  return { isInitialized };
}
