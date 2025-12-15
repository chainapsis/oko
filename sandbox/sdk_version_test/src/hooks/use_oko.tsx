"use client";

import { useSDKState } from "@/state/sdk";

export const useOko = () => {
  const okoCosmos = useSDKState((state) => state.oko_cosmos);
  const okoEth = useSDKState((state) => state.oko_eth);

  return {
    okoCosmos,
    okoEth,
  };
};
