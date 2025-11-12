import { useSDKState } from "@oko-wallet-demo-web/state/sdk";
import { useUserInfoState } from "@oko-wallet-demo-web/state/user_info";
import { useEffect, useRef, useState } from "react";

export function useAddresses() {
  const okoCosmos = useSDKState((state) => state.oko_cosmos);
  const okoEth = useSDKState((state) => state.oko_eth);
  const isSignedIn = useUserInfoState((state) => state.isSignedIn);
  const isSignedRef = useRef(isSignedIn);
  isSignedRef.current = isSignedIn;

  const [cosmosAddress, setCosmosAddress] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      if (cosmosAddress) {
        setCosmosAddress(null);
      }

      if (ethAddress) {
        setEthAddress(null);
      }
      return;
    }

    const loadAddresses = async () => {
      try {
        const promises = [];

        if (okoCosmos) {
          promises.push(
            okoCosmos.getKey("cosmoshub-4").then((key) => {
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

        await Promise.all(promises);
      } catch (err) {
        console.error("Failed to load addresses:", err);
      }
    };

    if (isSignedIn) {
      loadAddresses();
    }
  }, [isSignedIn, okoCosmos, okoEth]);

  return { cosmosAddress, ethAddress };
}
