import { useContext } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

import { OkoContext } from "./OkoProvider";

export default function useEvm() {
  const ctx = useContext(OkoContext);
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  return {
    isReady: ctx.isReady,
    isSignedIn: ctx.isSignedIn,
    isSigningIn: ctx.isSigningIn,
    address: ctx.address,
    okoEth: ctx.okoEth,
    signIn: ctx.signIn,
    signOut: ctx.signOut,
    publicClient,
  };
}
