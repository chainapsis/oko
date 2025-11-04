"use client";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React, { PropsWithChildren } from "react";

function makeTanStackQueryClient() {
  // Create a client
  const queryClient = new QueryClient();
  return queryClient;
}

const queryClient = makeTanStackQueryClient();

export const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <>{children}</>
      </HydrationBoundary>
    </QueryClientProvider>
  );
};
