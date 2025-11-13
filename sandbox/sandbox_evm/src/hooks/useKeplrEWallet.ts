import { useAppState } from "@oko-wallet-sandbox-evm/services/store/app";

export const useKeplrEwallet = () => {
  const ethEWallet = useAppState((state) => state.keplr_sdk_eth);

  return {
    ethEWallet,
  };
};
