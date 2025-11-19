/**
 * Application-level AES-256-GCM Encryption
 * Used for encrypting sensitive data like private keys and shared secrets
 */

import * as crypto from "crypto";

export interface EncryptedData {
  ciphertext: string; // Hex-encoded encrypted data
  iv: string; // Hex-encoded initialization vector (16 bytes)
  authTag: string; // Hex-encoded authentication tag (16 bytes)
}

/**
 * Encrypt data using AES-256-GCM
 * @param plaintext - Data to encrypt (string)
 * @param encryptionKey - 32-byte encryption key (Buffer or hex string)
 * @returns EncryptedData with iv, authTag, and ciphertext
 */
export function encryptData(
  plaintext: string,
  encryptionKey: Buffer | string,
): EncryptedData {
  // Convert encryption key to Buffer if it's a hex string
  const keyBuffer =
    typeof encryptionKey === "string"
      ? Buffer.from(encryptionKey, "hex")
      : encryptionKey;

  if (keyBuffer.length !== 32) {
    throw new Error("Encryption key must be 32 bytes (256 bits)");
  }

  // Generate random 16-byte IV (128 bits)
  const iv = crypto.randomBytes(16);

  // Create cipher
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);

  // Encrypt the plaintext
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt data using AES-256-GCM
 * @param encrypted - EncryptedData object
 * @param encryptionKey - 32-byte encryption key (Buffer or hex string)
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails (wrong key or tampered data)
 */
export function decryptData(
  encrypted: EncryptedData,
  encryptionKey: Buffer | string,
): string {
  // Convert encryption key to Buffer if it's a hex string
  const keyBuffer =
    typeof encryptionKey === "string"
      ? Buffer.from(encryptionKey, "hex")
      : encryptionKey;

  if (keyBuffer.length !== 32) {
    throw new Error("Encryption key must be 32 bytes (256 bits)");
  }

  // Convert hex strings to Buffers
  const iv = Buffer.from(encrypted.iv, "hex");
  const authTag = Buffer.from(encrypted.authTag, "hex");
  const ciphertext = Buffer.from(encrypted.ciphertext, "hex");

  // Create decipher
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, iv);

  // Set authentication tag
  decipher.setAuthTag(authTag);

  try {
    // Decrypt the ciphertext
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (error) {
    throw new Error("Decryption failed: wrong key or tampered data");
  }
}

/**
 * Serialize EncryptedData to a single string (for database storage)
 * Format: iv:authTag:ciphertext (all hex)
 * @param encrypted - EncryptedData object
 * @returns Serialized string
 */
export function serializeEncrypted(encrypted: EncryptedData): string {
  return `${encrypted.iv}:${encrypted.authTag}:${encrypted.ciphertext}`;
}

/**
 * Deserialize string back to EncryptedData
 * @param serialized - Serialized string (iv:authTag:ciphertext)
 * @returns EncryptedData object
 * @throws Error if format is invalid
 */
export function deserializeEncrypted(serialized: string): EncryptedData {
  const parts = serialized.split(":");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted data format. Expected: iv:authTag:ciphertext",
    );
  }

  const [iv, authTag, ciphertext] = parts;

  // Validate hex format
  if (
    !/^[0-9a-fA-F]+$/.test(iv) ||
    !/^[0-9a-fA-F]+$/.test(authTag) ||
    !/^[0-9a-fA-F]+$/.test(ciphertext)
  ) {
    throw new Error(
      "Invalid encrypted data format. All parts must be hex-encoded",
    );
  }

  // Validate lengths
  if (iv.length !== 32) {
    // 16 bytes = 32 hex chars
    throw new Error("Invalid IV length. Expected 32 hex chars (16 bytes)");
  }

  if (authTag.length !== 32) {
    // 16 bytes = 32 hex chars
    throw new Error("Invalid authTag length. Expected 32 hex chars (16 bytes)");
  }

  return { iv, authTag, ciphertext };
}

/**
 * Generate a random encryption key (32 bytes for AES-256)
 * @returns 32-byte Buffer
 */
export function generateEncryptionKey(): Buffer {
  return crypto.randomBytes(32);
}

/**
 * Derive encryption key from a master key using HKDF
 * @param masterKey - Master key (Buffer or hex string)
 * @param salt - Salt for key derivation (string)
 * @param info - Context information (string)
 * @returns 32-byte derived key
 */
export function deriveEncryptionKey(
  masterKey: Buffer | string,
  salt: string,
  info: string = "oko-encryption-key",
): Buffer {
  const keyBuffer =
    typeof masterKey === "string" ? Buffer.from(masterKey, "hex") : masterKey;

  // Use HKDF (HMAC-based Key Derivation Function)
  const derived = crypto.hkdfSync(
    "sha256",
    keyBuffer,
    Buffer.from(salt, "utf8"),
    Buffer.from(info, "utf8"),
    32, // 32 bytes for AES-256
  );

  return Buffer.from(derived);
}
