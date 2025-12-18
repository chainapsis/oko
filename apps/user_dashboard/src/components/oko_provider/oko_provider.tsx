"use client";

import { type FC, type PropsWithChildren, useEffect } from "react";

import { useInitOko } from "./use_oko";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { useUserInfoState } from "@oko-wallet-user-dashboard/state/user_info";
import { useSDKState } from "@oko-wallet-user-dashboard/state/sdk";

export const OkoProvider: FC<PropsWithChildren> = ({ children }) => {
  useInitOko();
  const { chainStore } = useRootStore();
  const { email, authType, isSignedIn, setAuthType } = useUserInfoState();

  const isCosmosLazyInitialized = useSDKState(
    (state) => state.isCosmosLazyInitialized,
  );

  useEffect(() => {
    if (email && authType) {
      chainStore.setActiveUser({ authType, email });
      return;
    }

    chainStore.setActiveUserKey(null);
  }, [chainStore, email, authType]);

  useEffect(() => {
    if (!isCosmosLazyInitialized) {
      return;
    }
    if (isSignedIn) {
      return;
    }
    setAuthType(null);
  }, [isCosmosLazyInitialized, isSignedIn, setAuthType]);

  return <>{children}</>;
};
