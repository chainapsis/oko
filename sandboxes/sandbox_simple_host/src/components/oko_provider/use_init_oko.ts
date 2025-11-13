import { useEffect } from "react";

import { useSDKState } from "@/state/sdk";
import { useUserInfoState } from "@/state/user_info";

function setupCosmosListener() {
  const okoCosmos = useSDKState.getState().oko_cosmos;
  const setUserInfo = useUserInfoState.getState().setUserInfo;

  if (okoCosmos) {
    okoCosmos.on({
      type: "accountsChanged",
      handler: ({ email, publicKey }) => {
        setUserInfo({
          email: email || null,
          publicKey: publicKey ? Buffer.from(publicKey).toString("hex") : null,
        });
      },
    });
  }
}

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

  useEffect(() => {
    if (isInitialized) {
      setupCosmosListener();
    }
  }, [isInitialized]);

  return { isInitialized };
}
