import { useEffect } from "react";

import {
  selectCosmosSDK,
  selectEthSDK,
  useSDKState,
} from "@oko-wallet-user-dashboard/state/sdk";

export function useInitOko() {
  const initOkoCosmos = useSDKState((state) => state.initOkoCosmos);
  const initOkoEth = useSDKState((state) => state.initOkoEth);

  const isInitialized = useSDKState(
    (state) => selectEthSDK(state) !== null && selectCosmosSDK(state) !== null,
  );

  useEffect(() => {
    initOkoCosmos();
    initOkoEth();
  }, [initOkoCosmos, initOkoEth]);

  return { isInitialized };
}
