"use client";

import React, { type PropsWithChildren } from "react";

import { useInitOko } from "./use_oko";

export const OkoProvider: React.FC<PropsWithChildren> = ({ children }) => {
  useInitOko();

  return <>{children}</>;
};
