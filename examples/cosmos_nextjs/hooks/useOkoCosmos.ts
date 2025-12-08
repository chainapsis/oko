import { useContext } from "react";

import { OkoCosmosContext } from "@/components/OkoCosmosProvider";

export default function useOkoCosmos() {
  const {
    isReady,
    isSignedIn,
    isSigningIn,
    publicKey,
    offlineSigner,
    chainInfo,
    bech32Address,
    signIn,
    signOut,
  } = useContext(OkoCosmosContext);

  return {
    isReady,
    isSignedIn,
    isSigningIn,
    publicKey,
    offlineSigner,
    chainInfo,
    bech32Address,
    signIn,
    signOut,
  };
}
