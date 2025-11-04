import { useSDKState } from "@oko-wallet-demo-web/state/sdk";
import { useUserInfoState } from "@oko-wallet-demo-web/state/user_info";
import { useEffect, useState } from "react";

export function useAddresses() {
  const cosmosSDK = useSDKState((state) => state.keplr_sdk_cosmos);
  const ethSDK = useSDKState((state) => state.keplr_sdk_eth);
  const isSignedIn = useUserInfoState((state) => state.isSignedIn);

  const [cosmosAddress, setCosmosAddress] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const promises = [];

        if (cosmosSDK) {
          promises.push(
            cosmosSDK
              .getKey("cosmoshub-4")
              .then((key) => setCosmosAddress(key.bech32Address)),
          );
        }

        if (ethSDK) {
          promises.push(
            ethSDK.getAddress().then((addr) => setEthAddress(addr)),
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
  }, [isSignedIn, cosmosSDK, ethSDK]);

  return { cosmosAddress, ethAddress };
}
