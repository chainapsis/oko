import { useCallback, useEffect } from "react";

import {
  useSDKState,
  selectEthSDK,
  selectCosmosSDK,
  type AccountsChangedEvent,
} from "@oko-wallet-user-dashboard/state/sdk";
import { useUserInfoState } from "@oko-wallet-user-dashboard/state/user_info";

export function useInitOko() {
  const initOkoCosmos = useSDKState((state) => state.initOkoCosmos);
  const initOkoEth = useSDKState((state) => state.initOkoEth);
  const setUserInfo = useUserInfoState((state) => state.setUserInfo);

  const isInitialized = useSDKState(
    (state) => selectEthSDK(state) !== null && selectCosmosSDK(state) !== null,
  );

  const handleAccountsChanged = useCallback(
    (event: AccountsChangedEvent) => {
      setUserInfo(event);
    },
    [setUserInfo]
  );

  useEffect(() => {
    initOkoCosmos(handleAccountsChanged);
    initOkoEth();
  }, [initOkoCosmos, initOkoEth, handleAccountsChanged]);

  return { isInitialized };
}
