import {
  generateECDSAKeypair,
  signMessage,
  //   signMessage,
  //   verifySignature,
  //   isValidPublicKey,
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
