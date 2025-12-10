"use client";

import { type FC, type PropsWithChildren } from "react";

import { useInitOko } from "./use_oko";

export const OkoProvider: FC<PropsWithChildren> = ({ children }) => {
  useInitOko();

  return <>{children}</>;
};
