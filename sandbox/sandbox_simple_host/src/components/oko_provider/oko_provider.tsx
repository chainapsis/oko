"use client";

import type { FC, PropsWithChildren } from "react";

import { useInitOko } from "./use_init_oko";
import { Skeleton } from "@/components/skeleton/skeleton";
import { ToggleColorScheme } from "@/components/toggle_color_scheme/toggle_color_scheme";

export const OkoProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isInitialized } = useInitOko();

  return (
    <div>
      <p>isInitialized {isInitialized ? "true" : "false"}</p>

      <p>Animation check</p>

      <ToggleColorScheme />

      <Skeleton width="100px" height="100px" borderRadius="20px" />

      {isInitialized && <>{children}</>}
    </div>
  );
};
