import { describe, expect, it } from "@jest/globals";

import { generateEddsaKeypair, signMessage, verifySignature } from "./x25519";
import { Bytes } from "@oko-wallet/bytes";

describe("x25519_keypair_test_1", () => {
  it("generate_eddsa_keypair", () => {
    const keypair = generateEddsaKeypair();
    console.log(keypair);
  });
});

describe("EdDSA signature and verification", () => {
  describe("signMessage", () => {
    it("should successfully sign a message", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const message = "Hello, world!";
      const signature = signMessage(message, keypair.data.privateKey);

      expect(signature.success).toBe(true);
      if (!signature.success) return;

      expect(signature.data.r).toBeDefined();
      expect(signature.data.s).toBeDefined();
      expect(signature.data.r.toUint8Array()).toHaveLength(32);
      expect(signature.data.s.toUint8Array()).toHaveLength(32);
    });

    it("should sign different messages with different signatures", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const message1 = "Hello, world!";
      const message2 = "Different message";

      const sig1 = signMessage(message1, keypair.data.privateKey);
      const sig2 = signMessage(message2, keypair.data.privateKey);

      expect(sig1.success).toBe(true);
      expect(sig2.success).toBe(true);
      if (!sig1.success || !sig2.success) return;

      // 서명이 달라야 함
      const sig1Bytes = sig1.data.r.toHex() + sig1.data.s.toHex();
      const sig2Bytes = sig2.data.r.toHex() + sig2.data.s.toHex();
      expect(sig1Bytes).not.toBe(sig2Bytes);
    });

    it("should handle empty message", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const signature = signMessage("", keypair.data.privateKey);
      expect(signature.success).toBe(true);
    });

    it("should handle long messages", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const longMessage = "a".repeat(10000);
      const signature = signMessage(longMessage, keypair.data.privateKey);
      expect(signature.success).toBe(true);
    });

    it("should handle unicode messages", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const unicodeMessage = "안녕하세요 🚀 こんにちは";
      const signature = signMessage(unicodeMessage, keypair.data.privateKey);
      expect(signature.success).toBe(true);
    });
  });

  describe("verifySignature", () => {
    it("should verify a valid signature", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const message = "Hello, world!";
      const signature = signMessage(message, keypair.data.privateKey);
      expect(signature.success).toBe(true);
      if (!signature.success) return;

      const isValid = verifySignature(
        message,
        signature.data,
        keypair.data.publicKey,
      );
      expect(isValid.success).toBe(true);
      if (!isValid.success) return;
      expect(isValid.data).toBe(true);
    });

    it("should reject signature for modified message", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const originalMessage = "Hello, world!";
      const modifiedMessage = "Hello, world";

      const signature = signMessage(originalMessage, keypair.data.privateKey);
      expect(signature.success).toBe(true);
      if (!signature.success) return;

      const isValid = verifySignature(
        modifiedMessage,
        signature.data,
        keypair.data.publicKey,
      );
      expect(isValid.success).toBe(true);
      if (!isValid.success) return;
      expect(isValid.data).toBe(false);
    });

    it("should reject signature with wrong public key", () => {
      const keypair1 = generateEddsaKeypair();
      const keypair2 = generateEddsaKeypair();
      expect(keypair1.success).toBe(true);
      expect(keypair2.success).toBe(true);
      if (!keypair1.success || !keypair2.success) return;

      const message = "Hello, world!";
      const signature = signMessage(message, keypair1.data.privateKey);
      expect(signature.success).toBe(true);
      if (!signature.success) return;

      const isValid = verifySignature(
        message,
        signature.data,
        keypair2.data.publicKey,
      );
      expect(isValid.success).toBe(true);
      if (!isValid.success) return;
      expect(isValid.data).toBe(false);
    });

    it("should reject invalid signature (modified r)", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const message = "Hello, world!";
      const signature = signMessage(message, keypair.data.privateKey);
      expect(signature.success).toBe(true);
      if (!signature.success) return;

      // r 값을 변조
      const modifiedR = Bytes.fromUint8Array(new Uint8Array(32).fill(0xff), 32);
      expect(modifiedR.success).toBe(true);
      if (!modifiedR.success) return;

      const modifiedSignature = {
        r: modifiedR.data,
        s: signature.data.s,
      };

      const isValid = verifySignature(
        message,
        modifiedSignature,
        keypair.data.publicKey,
      );
      expect(isValid.success).toBe(true);
      if (!isValid.success) return;
      expect(isValid.data).toBe(false);
    });

    it("should reject invalid signature (modified s)", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const message = "Hello, world!";
      const signature = signMessage(message, keypair.data.privateKey);
      expect(signature.success).toBe(true);
      if (!signature.success) return;

      // s 값을 변조
      const modifiedS = Bytes.fromUint8Array(new Uint8Array(32).fill(0xff), 32);
      expect(modifiedS.success).toBe(true);
      if (!modifiedS.success) return;

      const modifiedSignature = {
        r: signature.data.r,
        s: modifiedS.data,
      };

      const isValid = verifySignature(
        message,
        modifiedSignature,
        keypair.data.publicKey,
      );
      expect(isValid.success).toBe(true);
      if (!isValid.success) return;
      expect(isValid.data).toBe(false);
    });

    it("should verify signature for empty message", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const message = "";
      const signature = signMessage(message, keypair.data.privateKey);
      expect(signature.success).toBe(true);
      if (!signature.success) return;

      const isValid = verifySignature(
        message,
        signature.data,
        keypair.data.publicKey,
      );
      expect(isValid.success).toBe(true);
      if (!isValid.success) return;
      expect(isValid.data).toBe(true);
    });

    it("should verify signature for unicode message", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const message = "안녕하세요 🚀 こんにちは";
      const signature = signMessage(message, keypair.data.privateKey);
      expect(signature.success).toBe(true);
      if (!signature.success) return;

      const isValid = verifySignature(
        message,
        signature.data,
        keypair.data.publicKey,
      );
      expect(isValid.success).toBe(true);
      if (!isValid.success) return;
      expect(isValid.data).toBe(true);
    });
  });

  describe("sign and verify integration", () => {
    it("should handle multiple sign-verify cycles", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const messages = [
        "Message 1",
        "Message 2",
        "Message 3",
        "Message 4",
        "Message 5",
      ];

      for (const message of messages) {
        const signature = signMessage(message, keypair.data.privateKey);
        expect(signature.success).toBe(true);
        if (!signature.success) continue;

        const isValid = verifySignature(
          message,
          signature.data,
          keypair.data.publicKey,
        );
        expect(isValid.success).toBe(true);
        if (!isValid.success) continue;
        expect(isValid.data).toBe(true);
      }
    });

    it("should produce deterministic signatures with same options", () => {
      const keypair = generateEddsaKeypair();
      expect(keypair.success).toBe(true);
      if (!keypair.success) return;

      const message = "Deterministic test";
      const sig1 = signMessage(message, keypair.data.privateKey);
      const sig2 = signMessage(message, keypair.data.privateKey);

      expect(sig1.success).toBe(true);
      expect(sig2.success).toBe(true);
      if (!sig1.success || !sig2.success) return;

      expect(sig1.data.r.toHex()).toBe(sig2.data.r.toHex());
      expect(sig1.data.s.toHex()).toBe(sig2.data.s.toHex());
    });
  });
});
