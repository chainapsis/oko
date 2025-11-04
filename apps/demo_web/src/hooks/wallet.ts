import { useSDKState } from "@oko-wallet-demo-web/state/sdk";
import { useUserInfoState } from "@oko-wallet-demo-web/state/user_info";
import { useEffect, useState } from "react";

export function useAddresses() {
  const okoCosmos = useSDKState((state) => state.oko_cosmos);
  const okoEth = useSDKState((state) => state.oko_eth);
  const isSignedIn = useUserInfoState((state) => state.isSignedIn);

  const [cosmosAddress, setCosmosAddress] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const promises = [];

        if (okoCosmos) {
          promises.push(
            okoCosmos
              .getKey("cosmoshub-4")
              .then((key) => setCosmosAddress(key.bech32Address)),
          );
        }

        if (okoEth) {
          promises.push(
            okoEth.getAddress().then((addr) => setEthAddress(addr)),
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

    if (!isSignedIn) {
      if (cosmosAddress) {
        setCosmosAddress(null);
      }

      if (ethAddress) {
        setEthAddress(null);
      }
    }
  }, [isSignedIn, okoCosmos, okoEth]);

  return { cosmosAddress, ethAddress };
}
