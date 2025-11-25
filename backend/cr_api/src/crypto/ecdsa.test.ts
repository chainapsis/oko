import {
  generateECDSAKeypair,
  signMessage,
  verifySignature,
  isValidPublicKey,
} from "./ecdsa";
import { Bytes } from "@oko-wallet/bytes";

describe("ECDSA Keypair Functions", () => {
  test("generateECDSAKeypair should create a valid keypair", () => {
    const result = generateECDSAKeypair();
    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error(result.err);
    }
    const keypair = result.data;
    expect(keypair.privateKey).toBeDefined();
    expect(keypair.publicKey).toBeDefined();
  });

  test("signMessage should sign a message correctly", () => {
    const result = generateECDSAKeypair();
    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error(result.err);
    }
    const keypair = result.data;
    const message = "hello world";
    const signatureResult = signMessage(message, keypair.privateKey);
    expect(signatureResult.success).toBe(true);
    if (!signatureResult.success) {
      throw new Error(signatureResult.err);
    }
    const signature = signatureResult.data;
    expect(signature.r.toUint8Array().length).toBe(32);
    expect(signature.s.toUint8Array().length).toBe(32);

    expect([0, 1]).toContain(signature.v);
  });
});

describe("signMessage", () => {
  test("should successfully sign a message with valid private key", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const message = "Test message";
    const signatureResult = signMessage(message, keypairResult.data.privateKey);

    expect(signatureResult.success).toBe(true);
    if (!signatureResult.success) return;

    expect(signatureResult.data.r.toUint8Array().length).toBe(32);
    expect(signatureResult.data.s.toUint8Array().length).toBe(32);
    expect([0, 1]).toContain(signatureResult.data.v);
  });

  test("should produce different signatures for different messages", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const message1 = "Message 1";
    const message2 = "Message 2";

    const sig1Result = signMessage(message1, keypairResult.data.privateKey);
    const sig2Result = signMessage(message2, keypairResult.data.privateKey);

    expect(sig1Result.success).toBe(true);
    expect(sig2Result.success).toBe(true);
    if (!sig1Result.success || !sig2Result.success) return;

    // Signatures should be different
    expect(sig1Result.data.r.toHex()).not.toBe(sig2Result.data.r.toHex());
  });

  test("should produce different signatures with different private keys", () => {
    const keypair1Result = generateECDSAKeypair();
    const keypair2Result = generateECDSAKeypair();
    expect(keypair1Result.success).toBe(true);
    expect(keypair2Result.success).toBe(true);
    if (!keypair1Result.success || !keypair2Result.success) return;

    const message = "Same message";

    const sig1Result = signMessage(message, keypair1Result.data.privateKey);
    const sig2Result = signMessage(message, keypair2Result.data.privateKey);

    expect(sig1Result.success).toBe(true);
    expect(sig2Result.success).toBe(true);
    if (!sig1Result.success || !sig2Result.success) return;

    // Signatures should be different
    expect(sig1Result.data.r.toHex()).not.toBe(sig2Result.data.r.toHex());
  });

  test("should sign empty message", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const signatureResult = signMessage("", keypairResult.data.privateKey);
    expect(signatureResult.success).toBe(true);
  });

  test("should sign long message", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const longMessage = "a".repeat(10000);
    const signatureResult = signMessage(
      longMessage,
      keypairResult.data.privateKey,
    );
    expect(signatureResult.success).toBe(true);
  });
});

describe("verifySignature", () => {
  test("should verify a valid signature", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const message = "Test message";
    const signatureResult = signMessage(message, keypairResult.data.privateKey);
    expect(signatureResult.success).toBe(true);
    if (!signatureResult.success) return;

    const verifyResult = verifySignature(
      message,
      signatureResult.data,
      keypairResult.data.publicKey,
    );

    expect(verifyResult.success).toBe(true);
    if (!verifyResult.success) return;
    expect(verifyResult.data).toBe(true);
  });

  test("should reject signature with wrong message", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const originalMessage = "Original message";
    const wrongMessage = "Wrong message";

    const signatureResult = signMessage(
      originalMessage,
      keypairResult.data.privateKey,
    );
    expect(signatureResult.success).toBe(true);
    if (!signatureResult.success) return;

    const verifyResult = verifySignature(
      wrongMessage,
      signatureResult.data,
      keypairResult.data.publicKey,
    );

    expect(verifyResult.success).toBe(true);
    if (!verifyResult.success) return;
    expect(verifyResult.data).toBe(false);
  });

  test("should reject signature with wrong public key", () => {
    const keypair1Result = generateECDSAKeypair();
    const keypair2Result = generateECDSAKeypair();
    expect(keypair1Result.success).toBe(true);
    expect(keypair2Result.success).toBe(true);
    if (!keypair1Result.success || !keypair2Result.success) return;

    const message = "Test message";
    const signatureResult = signMessage(
      message,
      keypair1Result.data.privateKey,
    );
    expect(signatureResult.success).toBe(true);
    if (!signatureResult.success) return;

    // Try to verify with different public key
    const verifyResult = verifySignature(
      message,
      signatureResult.data,
      keypair2Result.data.publicKey,
    );

    expect(verifyResult.success).toBe(true);
    if (!verifyResult.success) return;
    expect(verifyResult.data).toBe(false);
  });

  test("should verify signature for empty message", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const message = "";
    const signatureResult = signMessage(message, keypairResult.data.privateKey);
    expect(signatureResult.success).toBe(true);
    if (!signatureResult.success) return;

    const verifyResult = verifySignature(
      message,
      signatureResult.data,
      keypairResult.data.publicKey,
    );

    expect(verifyResult.success).toBe(true);
    if (!verifyResult.success) return;
    expect(verifyResult.data).toBe(true);
  });

  test("should verify signature for long message", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const message = "a".repeat(10000);
    const signatureResult = signMessage(message, keypairResult.data.privateKey);
    expect(signatureResult.success).toBe(true);
    if (!signatureResult.success) return;

    const verifyResult = verifySignature(
      message,
      signatureResult.data,
      keypairResult.data.publicKey,
    );

    expect(verifyResult.success).toBe(true);
    if (!verifyResult.success) return;
    expect(verifyResult.data).toBe(true);
  });

  test("should handle invalid signature data: zero-bytes -> success: false", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const message = "Test message";

    // Create an invalid signature with all zeros
    const zeroBytes = Bytes.fromUint8Array(new Uint8Array(32), 32);
    expect(zeroBytes.success).toBe(true);
    if (!zeroBytes.success) return;

    const invalidSignature = {
      v: 0 as const,
      r: zeroBytes.data,
      s: zeroBytes.data,
    };

    const verifyResult = verifySignature(
      message,
      invalidSignature,
      keypairResult.data.publicKey,
    );

    expect(verifyResult.success).toBe(false);
  });

  test("should handle invalid signature data: non-zero-bytes", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const message = "Test message";

    // Create an invalid signature with all zeros
    const testU8Arr = new Uint8Array(32);
    testU8Arr[0] = 0x01;
    const testBytes = Bytes.fromUint8Array(testU8Arr, 32);
    expect(testBytes.success).toBe(true);
    if (!testBytes.success) return;

    const verifyResult = verifySignature(
      message,
      {
        v: 0 as const,
        r: testBytes.data,
        s: testBytes.data,
      },
      keypairResult.data.publicKey,
    );

    expect(verifyResult.success).toBe(true);
    if (!verifyResult.success) return;
    expect(verifyResult.data).toBe(false);
  });
});

describe("isValidPublicKey", () => {
  test("should validate a valid compressed public key", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const isValid = isValidPublicKey(keypairResult.data.publicKey);
    expect(isValid).toBe(true);
  });

  test("should reject public key with invalid prefix", () => {
    // Create a 33-byte array with invalid prefix (0x04 instead of 0x02 or 0x03)
    const invalidBytes = new Uint8Array(33);
    invalidBytes[0] = 0x04; // Invalid prefix for compressed key
    for (let i = 1; i < 33; i++) {
      invalidBytes[i] = 0x1f;
    }

    const bytesResult = Bytes.fromUint8Array(invalidBytes, 33);
    expect(bytesResult.success).toBe(true);
    if (!bytesResult.success) return;

    const isValid = isValidPublicKey(bytesResult.data);
    expect(isValid).toBe(false);
  });

  test("should reject public key with prefix 0x00", () => {
    const invalidBytes = new Uint8Array(33);
    invalidBytes[0] = 0x00;
    for (let i = 1; i < 33; i++) {
      invalidBytes[i] = 0xff;
    }

    const bytesResult = Bytes.fromUint8Array(invalidBytes, 33);
    expect(bytesResult.success).toBe(true);
    if (!bytesResult.success) return;

    const isValid = isValidPublicKey(bytesResult.data);
    expect(isValid).toBe(false);
  });

  test("should accept public key with prefix 0x02", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const publicKey = keypairResult.data.publicKey;
    const bytes = publicKey.toUint8Array();

    // Ensure it has 0x02 or 0x03 prefix
    expect([0x02, 0x03]).toContain(bytes[0]);

    const isValid = isValidPublicKey(publicKey);
    expect(isValid).toBe(true);
  });

  test("should reject all-zero bytes (except valid prefix)", () => {
    const invalidBytes = new Uint8Array(33);
    invalidBytes[0] = 0x02; // Valid prefix
    // Rest are zeros

    const bytesResult = Bytes.fromUint8Array(invalidBytes, 33);
    expect(bytesResult.success).toBe(true);
    if (!bytesResult.success) return;

    const isValid = isValidPublicKey(bytesResult.data);
    expect(isValid).toBe(false);
  });

  test("should reject all-ff bytes", () => {
    const invalidBytes = new Uint8Array(33);
    invalidBytes[0] = 0x02; // Valid prefix
    for (let i = 1; i < 33; i++) {
      invalidBytes[i] = 0xff;
    }

    const bytesResult = Bytes.fromUint8Array(invalidBytes, 33);
    expect(bytesResult.success).toBe(true);
    if (!bytesResult.success) return;

    const isValid = isValidPublicKey(bytesResult.data);
    expect(isValid).toBe(false);
  });
});

describe("Integration: Sign and Verify", () => {
  test("should sign and verify multiple messages with same keypair", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const messages = [
      "Message 1",
      "Message 2",
      "Message 3",
      "",
      "Long message: " + "a".repeat(1000),
    ];

    for (const message of messages) {
      const signatureResult = signMessage(
        message,
        keypairResult.data.privateKey,
      );
      expect(signatureResult.success).toBe(true);
      if (!signatureResult.success) continue;

      const verifyResult = verifySignature(
        message,
        signatureResult.data,
        keypairResult.data.publicKey,
      );
      expect(verifyResult.success).toBe(true);
      if (!verifyResult.success) continue;
      expect(verifyResult.data).toBe(true);
    }
  });

  test("should fail verification when message is modified", () => {
    const keypairResult = generateECDSAKeypair();
    expect(keypairResult.success).toBe(true);
    if (!keypairResult.success) return;

    const originalMessage = "Original message";
    const signatureResult = signMessage(
      originalMessage,
      keypairResult.data.privateKey,
    );
    expect(signatureResult.success).toBe(true);
    if (!signatureResult.success) return;

    const modifiedMessages = [
      "Original messag", // Truncated
      "Original message ", // Space added
      "original message", // Case changed
      "Different message",
    ];

    for (const modifiedMessage of modifiedMessages) {
      const verifyResult = verifySignature(
        modifiedMessage,
        signatureResult.data,
        keypairResult.data.publicKey,
      );
      expect(verifyResult.success).toBe(true);
      if (!verifyResult.success) continue;
      expect(verifyResult.data).toBe(false);
    }
  });
});
