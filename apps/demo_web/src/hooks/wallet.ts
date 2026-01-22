import { useEffect, useRef, useState } from "react";
import type { OkoSvmWalletInterface } from "@oko-wallet/oko-sdk-svm";
import type { Result } from "@oko-wallet/stdlib-js";

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
        const promises: Promise<any>[] = [];

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
            new Promise((resolve, reject) => {
              connectSol(okoSol, isSignedRef.current, setSolanaAddress)
                .then(resolve)
                .catch(reject);
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
  }, [
    isSignedIn,
    okoCosmos,
    okoEth,
    okoSol,
    cosmosAddress,
    ethAddress,
    solanaAddress,
  ]);

  return { cosmosAddress, ethAddress, solanaAddress };
}

async function connectSol(
  okoSol: OkoSvmWalletInterface,
  isSignedRef: boolean,
  setSolanaAddress: (pk: string) => void,
): Promise<Result<void, any>> {
  try {
    // this might have been done in lazyInit()
    if (!okoSol.connected) {
      await okoSol.connect();
    }

    if (okoSol.publicKey && isSignedRef) {
      setSolanaAddress(okoSol.publicKey.toBase58());
    }

    return { success: true, data: void 0 };
  } catch (err: any) {
    console.error("Failed to get Solana address:", err);
    return { success: false, err };
  }
}
