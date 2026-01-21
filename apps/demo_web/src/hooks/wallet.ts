import { useEffect, useRef, useState } from "react";

import { COSMOS_CHAIN_ID } from "@oko-wallet-demo-web/constants/cosmos";
import { useSDKState } from "@oko-wallet-demo-web/state/sdk";
import { useUserInfoState } from "@oko-wallet-demo-web/state/user_info";

export function useAddresses() {
  const okoCosmos = useSDKState((state) => state.oko_cosmos);
  const okoEth = useSDKState((state) => state.oko_eth);
  const okoSol = useSDKState((state) => state.oko_sol);
  const isSignedIn = useUserInfoState((state) => state.isSignedIn);
  const isSignedRef = useRef(isSignedIn);
  isSignedRef.current = isSignedIn;

  const [cosmosAddress, setCosmosAddress] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      if (cosmosAddress) {
        setCosmosAddress(null);
      }

      if (ethAddress) {
        setEthAddress(null);
      }

      if (solanaAddress) {
        setSolanaAddress(null);
      }
      return;
    }

    const loadAddresses = async () => {
      try {
        const promises = [];

        if (okoCosmos) {
          promises.push(
            okoCosmos.getKey(COSMOS_CHAIN_ID).then((key) => {
              if (isSignedRef.current) {
                setCosmosAddress(key.bech32Address);
              }
            }),
          );
        }

        if (okoEth) {
          promises.push(
            okoEth.getAddress().then((addr) => {
              if (isSignedRef.current) {
                setEthAddress(addr);
              }
            }),
          );
        }

        if (okoSol) {
          promises.push(
            (async () => {
              try {
                if (!okoSol.connected) {
                  await okoSol.connect();
                }
                if (okoSol.publicKey && isSignedRef.current) {
                  setSolanaAddress(okoSol.publicKey.toBase58());
                }
              } catch (err) {
                console.error("Failed to get Solana address:", err);
              }
            })(),
          );
        }

        await Promise.all(promises);
      } catch (err) {
        console.error("Failed to load addresses:", err);
      }
    };

    if (isSignedIn) {
      loadAddresses();
    }
  }, [isSignedIn, okoCosmos, okoEth, okoSol]);

  return { cosmosAddress, ethAddress, solanaAddress };
}
