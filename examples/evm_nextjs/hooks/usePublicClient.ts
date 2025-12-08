import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export default function usePublicClient() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  return publicClient;
}
