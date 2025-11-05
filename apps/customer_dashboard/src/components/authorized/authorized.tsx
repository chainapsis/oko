"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { paths } from "@oko-wallet-ct-dashboard/paths";
import { useAppState } from "@oko-wallet-ct-dashboard/state";

export const Authorized: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const user = useAppState((state) => state.user);
  const token = useAppState((state) => state.token);

  const [isStoreHydrated, setIsStoreHydrated] = useState(false);

  useEffect(() => {
    const subscribe = useAppState.persist.onFinishHydration(() => {
      setIsStoreHydrated(true);
    });
    setIsStoreHydrated(useAppState.persist.hasHydrated());
    return () => {
      subscribe();
    };
  }, []);

  useEffect(() => {
    if (!isStoreHydrated) {
      return;
    }

    if (!user || !token) {
      router.push(paths.sign_in);
      return;
    }
  }, [isStoreHydrated, router, user, token]);

  if (!isStoreHydrated || !user || !token) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
