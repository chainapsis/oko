import { useEffect } from "react";

import {
  useSDKState,
  selectEthSDK,
  selectCosmosSDK,
  selectSolSDK,
} from "@oko-wallet-user-dashboard/state/sdk";

export function useInitOko() {
  const initOkoCosmos = useSDKState((state) => state.initOkoCosmos);
  const initOkoEth = useSDKState((state) => state.initOkoEth);
  const initOkoSol = useSDKState((state) => state.initOkoSol);

  const isInitialized = useSDKState(
    (state) =>
      selectEthSDK(state) !== null &&
      selectCosmosSDK(state) !== null &&
      selectSolSDK(state) !== null,
  );

  useEffect(() => {
    initOkoCosmos();
    initOkoEth();
    initOkoSol();
  }, [initOkoCosmos, initOkoEth, initOkoSol]);

  return { isInitialized };
}
