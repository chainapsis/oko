import { useEffect, useRef, useState } from "react";

import { useUserInfoState } from "@oko-wallet-demo-web/state/user_info";

export function useAddresses() {
  const isSignedIn = useUserInfoState((state) => state.isSignedIn);

  // Maintenance mode: Always return null for addresses
  return { cosmosAddress: null, ethAddress: null };
}
