"use client";

import React, { type PropsWithChildren } from "react";
import { useInitKeplrEWallet } from "./use_keplr_ewallet";

export const KeplrEWalletProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  useInitKeplrEWallet();

  return <>{children}</>;
};
