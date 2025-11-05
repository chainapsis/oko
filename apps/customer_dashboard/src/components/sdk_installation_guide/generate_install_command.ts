import { SDKConfig } from "./configs";

export const generateInstallCommand = (config: SDKConfig): string => {
  const { networks, evmClientLib, isWagmiWrapped } = config;

  const isEthSelected = networks.some((n) => n.name === "Ethereum");
  const networkLibs = networks.map((n) => n.library).join(" ");
  const evmLib = isEthSelected ? evmClientLib.library : "";
  const wagmi = isWagmiWrapped && isEthSelected ? "wagmi" : "";

  return `npm install ${networkLibs} ${evmLib} ${wagmi}`
    .replace(/\s+/g, " ") // replace multiple spaces with a single space
    .trim();
};
