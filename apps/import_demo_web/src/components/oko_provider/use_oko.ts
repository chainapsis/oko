import { useEffect } from "react";

import { useSDKState } from "@oko-wallet-import-demo-web/state/sdk";

export function useInitOko() {
  const initOkoCosmos = useSDKState((state) => state.initOkoCosmos);
  const initOkoEth = useSDKState((state) => state.initOkoEth);

  const isInitialized = useSDKState(
    (state) => state.oko_cosmos !== null && state.oko_eth !== null,
  );

  useEffect(() => {
    initOkoCosmos();
    initOkoEth();
  }, []);

  return { isInitialized };
}
