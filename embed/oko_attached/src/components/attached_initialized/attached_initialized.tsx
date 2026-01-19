"use client";

import { ThemeProvider } from "@oko-wallet/oko-common-ui/theme";
import type { FC, PropsWithChildren } from "react";

import { useInitializeApp } from "./use_initialize_app";

export const AttachedInitialized: FC<PropsWithChildren> = ({ children }) => {
  const { theme } = useInitializeApp();

  return theme ? (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  ) : (
    <>Initializing...</>
  );
};
