import { useState } from "react";

import {
  Framework,
  Network,
  EVMClientLib,
  FRAMEWORKS,
  AVAILABLE_NETWORKS,
  EVM_CLIENT_LIBS,
} from "./configs";

export const useSDKConfiguration = () => {
  const [framework, setFramework] = useState<Framework>(FRAMEWORKS[0]);
  const [networks, setNetworks] = useState<Network[]>([...AVAILABLE_NETWORKS]);
  const [evmClientLib, setEvmClientLib] = useState<EVMClientLib>(
    EVM_CLIENT_LIBS[0],
  );
  const [isWagmiWrapped, setIsWagmiWrapped] = useState<boolean>(true);

  const toggleNetwork = (network: Network) => {
    setNetworks((prevNetworks) => {
      const exists = prevNetworks.find((n) => n.name === network.name);

      if (exists) {
        const filteredNetworks = prevNetworks.filter(
          (n) => n.name !== network.name,
        );
        return filteredNetworks.length ? filteredNetworks : prevNetworks;
      } else {
        return [...prevNetworks, network];
      }
    });
  };

  const config = {
    framework,
    networks,
    evmClientLib,
    isWagmiWrapped,
  };

  return {
    config,
    setFramework,
    toggleNetwork,
    setEvmClientLib,
    setIsWagmiWrapped,
  };
};
