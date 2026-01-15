import type {
  SolanaSignInFeature,
  SolanaSignInInput,
  SolanaSignInMethod,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

import { OkoSolanaWalletAccount } from "./account";

/**
 * Build SIWS (Sign In With Solana) message following EIP-4361 format
 * https://eips.ethereum.org/EIPS/eip-4361
 */
export function buildSignInMessage(
  input: SolanaSignInInput,
  address: string,
): string {
  const lines: string[] = [];

  // Domain and address (required)
  const domain = input.domain ?? window.location.host;
  lines.push(`${domain} wants you to sign in with your Solana account:`);
  lines.push(input.address ?? address);

  // Statement (optional)
  if (input.statement) {
    lines.push("");
    lines.push(input.statement);
  }

  lines.push("");

  // URI
  if (input.uri) {
    lines.push(`URI: ${input.uri}`);
  }

  // Version
  if (input.version) {
    lines.push(`Version: ${input.version}`);
  }

  // Chain ID
  if (input.chainId) {
    lines.push(`Chain ID: ${input.chainId}`);
  }

  // Nonce
  if (input.nonce) {
    lines.push(`Nonce: ${input.nonce}`);
  }

  // Issued At
  if (input.issuedAt) {
    lines.push(`Issued At: ${input.issuedAt}`);
  }

  // Expiration Time
  if (input.expirationTime) {
    lines.push(`Expiration Time: ${input.expirationTime}`);
  }

  // Not Before
  if (input.notBefore) {
    lines.push(`Not Before: ${input.notBefore}`);
  }

  // Request ID
  if (input.requestId) {
    lines.push(`Request ID: ${input.requestId}`);
  }

  // Resources
  if (input.resources && input.resources.length > 0) {
    lines.push("Resources:");
    for (const resource of input.resources) {
      lines.push(`- ${resource}`);
    }
  }

  return lines.join("\n");
}

export function createSignInFeature(
  wallet: OkoSolWalletInterface,
): SolanaSignInFeature {
  const signIn: SolanaSignInMethod = async (
    ...inputs
  ): Promise<SolanaSignInOutput[]> => {
    const outputs: SolanaSignInOutput[] = [];

    for (const input of inputs) {
      // Ensure connected
      if (!wallet.connected || !wallet.publicKey) {
        await wallet.connect();
      }

      const publicKey = wallet.publicKey;
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      const address = publicKey.toBase58();

      // Build SIWS message
      const message = buildSignInMessage(input, address);
      const messageBytes = new TextEncoder().encode(message);

      // Sign the message
      const signature = await wallet.signMessage(messageBytes);

      // Create account for output
      const account = new OkoSolanaWalletAccount(address, publicKey.toBytes());

      outputs.push({
        account,
        signedMessage: messageBytes,
        signature,
        signatureType: "ed25519",
      });
    }

    return outputs;
  };

  return {
    "solana:signIn": {
      version: "1.0.0",
      signIn,
    },
  };
}
