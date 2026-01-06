import { Connection } from "@solana/web3.js";

export const DEVNET_CONNECTION = new Connection(
  "https://api.devnet.solana.com",
  "confirmed",
);
