import { useContext } from "react";

import { OkoContext } from "./OkoProvider";

export default function useCosmos() {
  const ctx = useContext(OkoContext);
  return {
    isReady: ctx.isReady,
    isSignedIn: ctx.isSignedIn,
    isSigningIn: ctx.isSigningIn,
    publicKey: ctx.publicKey,
    bech32Address: ctx.bech32Address,
    offlineSigner: ctx.offlineSigner,
    chainInfo: ctx.chainInfo,
    signIn: ctx.signIn,
    signOut: ctx.signOut,
  };
}
