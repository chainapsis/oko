import { jest } from "@jest/globals";

import { OkoSolWallet } from "@oko-wallet-sdk-sol/sol_wallet";
import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";
import {
  OkoStandardWallet,
  OkoSolanaWalletAccount,
  OKO_WALLET_NAME,
  OKO_ACCOUNT_FEATURES,
  SOLANA_CHAINS,
  SOLANA_MAINNET_CHAIN,
  SOLANA_DEVNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
  isSolanaChain,
  OKO_ICON,
  buildSignInMessage,
} from "@oko-wallet-sdk-sol/wallet-standard";
import { createMockOkoWallet } from "./mock";

describe("Wallet Standard", () => {
  describe("OkoSolanaWalletAccount", () => {
    it("should create account with correct properties", () => {
      const address = "7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f";
      const publicKey = new Uint8Array(32).fill(0x7f);

      const account = new OkoSolanaWalletAccount(address, publicKey);

      expect(account.address).toBe(address);
      expect(account.publicKey).toEqual(publicKey);
      expect(account.chains).toEqual(SOLANA_CHAINS);
      expect(account.features).toEqual(OKO_ACCOUNT_FEATURES);
    });
  });

  describe("Chain utilities", () => {
    it("should define correct chain constants", () => {
      expect(SOLANA_MAINNET_CHAIN).toBe("solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp");
      expect(SOLANA_DEVNET_CHAIN).toBe("solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1");
      expect(SOLANA_TESTNET_CHAIN).toBe("solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z");
    });

    it("should validate Solana chains correctly", () => {
      expect(isSolanaChain("solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp")).toBe(true);
      expect(isSolanaChain("solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1")).toBe(true);
      expect(isSolanaChain("solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z")).toBe(true);
      expect(isSolanaChain("ethereum:mainnet")).toBe(false);
      expect(isSolanaChain("bitcoin:mainnet")).toBe(false);
    });

    it("should include all supported chains", () => {
      expect(SOLANA_CHAINS).toContain(SOLANA_MAINNET_CHAIN);
      expect(SOLANA_CHAINS).toContain(SOLANA_DEVNET_CHAIN);
      expect(SOLANA_CHAINS).toContain(SOLANA_TESTNET_CHAIN);
      expect(SOLANA_CHAINS.length).toBe(3);
    });
  });

  describe("OkoStandardWallet", () => {
    let wallet: OkoSolWalletInterface;
    let standardWallet: OkoStandardWallet;

    beforeEach(async () => {
      const mockOkoWallet = createMockOkoWallet();
      wallet = new (OkoSolWallet as any)(
        mockOkoWallet,
      ) as OkoSolWalletInterface;
      standardWallet = new OkoStandardWallet(wallet);
    });

    describe("Wallet properties", () => {
      it("should have correct name", () => {
        expect(standardWallet.name).toBe(OKO_WALLET_NAME);
        expect(standardWallet.name).toBe("Oko");
      });

      it("should have correct version", () => {
        expect(standardWallet.version).toBe("1.0.0");
      });

      it("should have correct icon", () => {
        expect(standardWallet.icon).toBe(OKO_ICON);
        expect(standardWallet.icon).toMatch(/^data:image\//);
      });

      it("should have correct chains", () => {
        expect(standardWallet.chains).toEqual(SOLANA_CHAINS);
      });

      it("should have empty accounts when not connected", () => {
        expect(standardWallet.accounts).toEqual([]);
      });
    });

    describe("Features", () => {
      it("should have standard:connect feature", () => {
        const features = standardWallet.features;
        expect(features["standard:connect"]).toBeDefined();
        expect(features["standard:connect"].version).toBe("1.0.0");
        expect(typeof features["standard:connect"].connect).toBe("function");
      });

      it("should have standard:disconnect feature", () => {
        const features = standardWallet.features;
        expect(features["standard:disconnect"]).toBeDefined();
        expect(features["standard:disconnect"].version).toBe("1.0.0");
        expect(typeof features["standard:disconnect"].disconnect).toBe(
          "function",
        );
      });

      it("should have standard:events feature", () => {
        const features = standardWallet.features;
        expect(features["standard:events"]).toBeDefined();
        expect(features["standard:events"].version).toBe("1.0.0");
        expect(typeof features["standard:events"].on).toBe("function");
      });

      it("should have solana:signMessage feature", () => {
        const features = standardWallet.features;
        expect(features["solana:signMessage"]).toBeDefined();
        expect(features["solana:signMessage"].version).toBe("1.0.0");
      });

      it("should have solana:signTransaction feature", () => {
        const features = standardWallet.features;
        expect(features["solana:signTransaction"]).toBeDefined();
        expect(features["solana:signTransaction"].version).toBe("1.0.0");
        expect(
          features["solana:signTransaction"].supportedTransactionVersions,
        ).toContain("legacy");
        expect(
          features["solana:signTransaction"].supportedTransactionVersions,
        ).toContain(0);
      });

      it("should have solana:signAndSendTransaction feature", () => {
        const features = standardWallet.features;
        expect(features["solana:signAndSendTransaction"]).toBeDefined();
        expect(features["solana:signAndSendTransaction"].version).toBe("1.0.0");
        expect(
          features["solana:signAndSendTransaction"]
            .supportedTransactionVersions,
        ).toContain("legacy");
        expect(
          features["solana:signAndSendTransaction"]
            .supportedTransactionVersions,
        ).toContain(0);
      });
    });

    describe("Connect", () => {
      it("should connect and return accounts", async () => {
        const features = standardWallet.features;
        const result = await features["standard:connect"].connect();

        expect(result.accounts).toHaveLength(1);
        expect(result.accounts[0]).toBeInstanceOf(OkoSolanaWalletAccount);
      });

      it("should update accounts after connect", async () => {
        expect(standardWallet.accounts).toHaveLength(0);

        const features = standardWallet.features;
        await features["standard:connect"].connect();

        expect(standardWallet.accounts).toHaveLength(1);
      });
    });

    describe("Disconnect", () => {
      it("should disconnect successfully", async () => {
        const features = standardWallet.features;
        await features["standard:connect"].connect();
        expect(standardWallet.accounts).toHaveLength(1);

        await features["standard:disconnect"].disconnect();
        expect(wallet.connected).toBe(false);
      });
    });

    describe("Events", () => {
      it("should register and unregister event listeners", () => {
        const features = standardWallet.features;
        const listener = jest.fn();

        const unsubscribe = features["standard:events"].on("change", listener);

        expect(typeof unsubscribe).toBe("function");

        unsubscribe();
      });

      it("should emit change event on connect", async () => {
        const features = standardWallet.features;
        const listener = jest.fn();

        features["standard:events"].on("change", listener);
        await features["standard:connect"].connect();

        expect(listener).toHaveBeenCalled();
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            accounts: expect.any(Array),
          }),
        );
      });

      it("should emit change event on disconnect", async () => {
        const features = standardWallet.features;
        const listener = jest.fn();

        await features["standard:connect"].connect();

        features["standard:events"].on("change", listener);
        await features["standard:disconnect"].disconnect();

        expect(listener).toHaveBeenCalled();
      });
    });
  });

  describe("Account features", () => {
    it("should have correct feature identifiers", () => {
      expect(OKO_ACCOUNT_FEATURES).toContain("solana:signIn");
      expect(OKO_ACCOUNT_FEATURES).toContain("solana:signMessage");
      expect(OKO_ACCOUNT_FEATURES).toContain("solana:signTransaction");
      expect(OKO_ACCOUNT_FEATURES).toContain("solana:signAndSendTransaction");
    });
  });

  describe("Sign In (SIWS)", () => {
    describe("buildSignInMessage", () => {
      it("should build basic SIWS message", () => {
        const input = {
          domain: "example.com",
          statement: "Sign in to Example App",
        };
        const address = "7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f";

        const message = buildSignInMessage(input, address);

        expect(message).toContain("example.com wants you to sign in");
        expect(message).toContain(address);
        expect(message).toContain("Sign in to Example App");
      });

      it("should include all optional fields", () => {
        const input = {
          domain: "example.com",
          statement: "Sign in",
          uri: "https://example.com",
          version: "1",
          chainId: "mainnet",
          nonce: "abc123",
          issuedAt: "2024-01-01T00:00:00Z",
          expirationTime: "2024-01-02T00:00:00Z",
          notBefore: "2024-01-01T00:00:00Z",
          requestId: "req-123",
          resources: ["https://api.example.com", "https://storage.example.com"],
        };
        const address = "abc123";

        const message = buildSignInMessage(input, address);

        expect(message).toContain("URI: https://example.com");
        expect(message).toContain("Version: 1");
        expect(message).toContain("Chain ID: mainnet");
        expect(message).toContain("Nonce: abc123");
        expect(message).toContain("Issued At: 2024-01-01T00:00:00Z");
        expect(message).toContain("Expiration Time: 2024-01-02T00:00:00Z");
        expect(message).toContain("Not Before: 2024-01-01T00:00:00Z");
        expect(message).toContain("Request ID: req-123");
        expect(message).toContain("Resources:");
        expect(message).toContain("- https://api.example.com");
        expect(message).toContain("- https://storage.example.com");
      });

      it("should omit optional fields when not provided", () => {
        const input = {
          domain: "example.com",
        };
        const address = "abc123";

        const message = buildSignInMessage(input, address);

        expect(message).not.toContain("URI:");
        expect(message).not.toContain("Version:");
        expect(message).not.toContain("Chain ID:");
        expect(message).not.toContain("Nonce:");
        expect(message).not.toContain("Resources:");
      });
    });

    describe("signIn feature", () => {
      let wallet: OkoSolWalletInterface;
      let standardWallet: OkoStandardWallet;

      beforeEach(() => {
        const mockOkoWallet = createMockOkoWallet();
        wallet = new (OkoSolWallet as any)(
          mockOkoWallet,
        ) as OkoSolWalletInterface;
        standardWallet = new OkoStandardWallet(wallet);
      });

      it("should have solana:signIn feature", () => {
        const features = standardWallet.features;
        expect(features["solana:signIn"]).toBeDefined();
        expect(features["solana:signIn"].version).toBe("1.0.0");
        expect(typeof features["solana:signIn"].signIn).toBe("function");
      });
    });
  });
});
