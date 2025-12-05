"use client";

import { PropsWithChildren, useEffect } from "react";
import { useRouter } from "next/navigation";

import { paths } from "@oko-wallet-user-dashboard/paths";
import { useUserInfoState } from "@oko-wallet-user-dashboard/state/user_info";
import { useSDKState } from "@oko-wallet-user-dashboard/state/sdk";
import { WholePageLoading } from "@oko-wallet-user-dashboard/components/whole_page_loading/whole_page_loading";

export const Authorized: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const okoWallet = useSDKState((state) => state.oko_cosmos)?.okoWallet;
  const isSignedIn = useUserInfoState((state) => state.isSignedIn);

  useEffect(() => {
    if (!isSignedIn && okoWallet) {
      router.push(paths.sign_in);
      return;
    }
  }, [router, isSignedIn, okoWallet]);

  if (!okoWallet || !isSignedIn) {
    return <WholePageLoading />;
  }

  return <>{children}</>;
};
