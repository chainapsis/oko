import { useContext } from "react";

import { OkoEvmContext } from "@/components/OkoEvmProvider";

export default function useOkoEvm() {
  const { isReady, isSignedIn, isSigningIn, address, okoEth, signIn, signOut } =
    useContext(OkoEvmContext);

  return {
    isReady,
    isSignedIn,
    isSigningIn,
    address,
    okoEth,
    signIn,
    signOut,
  };
}
