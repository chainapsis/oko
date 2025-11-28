import {
  encryptData,
  decryptData,
  encryptDataAsync,
  decryptDataAsync,
} from "./index";

describe("Encryption/Decryption Cross Compatibility Tests", () => {
  const testPassword = "test_password_123";
  const testData = "This is sensitive data that needs to be encrypted";

  describe("Cross compatibility between async and sync functions", () => {
    it("should decrypt data encrypted by encryptDataAsync using decryptData", async () => {
      const encrypted = await encryptDataAsync(testData, testPassword);

      const decrypted = decryptData(encrypted, testPassword);

      expect(decrypted).toBe(testData);
    });

    it("should decrypt data encrypted by encryptData using decryptDataAsync", async () => {
      const encrypted = encryptData(testData, testPassword);

      const decrypted = await decryptDataAsync(encrypted, testPassword);

      expect(decrypted).toBe(testData);
    });
  });

  describe("Basic encryption/decryption functionality", () => {
    it("should encrypt and decrypt data using sync functions", () => {
      const encrypted = encryptData(testData, testPassword);
      const decrypted = decryptData(encrypted, testPassword);

      expect(decrypted).toBe(testData);
    });

    it("should encrypt and decrypt data using async functions", async () => {
      const encrypted = await encryptDataAsync(testData, testPassword);
      const decrypted = await decryptDataAsync(encrypted, testPassword);

      expect(decrypted).toBe(testData);
    });
  });

  describe("Different data types", () => {
    const testCases = [
      { name: "empty string", data: "" },
      {
        name: "JSON object",
        data: JSON.stringify({ key: "value", nested: { array: [1, 2, 3] } }),
      },
      { name: "special characters", data: "!@#$%^&*()_+-=[]{}|;:',.<>?/`~" },
      { name: "unicode characters", data: "안녕하세요 こんにちは 你好 🚀" },
      { name: "long text", data: "a".repeat(10000) },
    ];

    testCases.forEach(({ name, data }) => {
      it(`should handle ${name} with encryptDataAsync -> decryptData`, async () => {
        const encrypted = await encryptDataAsync(data, testPassword);
        const decrypted = decryptData(encrypted, testPassword);

        expect(decrypted).toBe(data);
      });

      it(`should handle ${name} with encryptData -> decryptDataAsync`, async () => {
        const encrypted = encryptData(data, testPassword);
        const decrypted = await decryptDataAsync(encrypted, testPassword);

        expect(decrypted).toBe(data);
      });
    });
  });

  describe("Error handling", () => {
    it("should throw error with wrong password using decryptData", async () => {
      const encrypted = await encryptDataAsync(testData, testPassword);

      expect(() => {
        decryptData(encrypted, "wrong_password");
      }).toThrow();
    });

    it("should throw error with wrong password using decryptDataAsync", async () => {
      const encrypted = encryptData(testData, testPassword);

      await expect(
        decryptDataAsync(encrypted, "wrong_password"),
      ).rejects.toThrow();
    });

    it("should throw error with invalid encrypted data", () => {
      expect(() => {
        decryptData("invalid_base64_data", testPassword);
      }).toThrow();
    });

    it("should throw error with corrupted encrypted data", async () => {
      const encrypted = await encryptDataAsync(testData, testPassword);
      const corrupted = encrypted.slice(0, -5) + "xxxxx";

      expect(() => {
        decryptData(corrupted, testPassword);
      }).toThrow();
    });
  });

  describe("Different passwords", () => {
    const passwords = [
      "short",
      "a".repeat(100),
      "パスワード123!@#",
      "pass with spaces",
    ];

    passwords.forEach((password) => {
      it(`should work with password: "${password.substring(0, 20)}..." using cross functions`, async () => {
        // async encrypt -> sync decrypt
        const encrypted1 = await encryptDataAsync(testData, password);
        const decrypted1 = decryptData(encrypted1, password);
        expect(decrypted1).toBe(testData);

        // sync encrypt -> async decrypt
        const encrypted2 = encryptData(testData, password);
        const decrypted2 = await decryptDataAsync(encrypted2, password);
        expect(decrypted2).toBe(testData);
      });
    });
  });

  describe("Encryption uniqueness", () => {
    it("should generate different ciphertext for same data (async)", async () => {
      const encrypted1 = await encryptDataAsync(testData, testPassword);
      const encrypted2 = await encryptDataAsync(testData, testPassword);

      expect(encrypted1).not.toBe(encrypted2);

      expect(decryptData(encrypted1, testPassword)).toBe(testData);
      expect(decryptData(encrypted2, testPassword)).toBe(testData);
    });

    it("should generate different ciphertext for same data (sync)", () => {
      const encrypted1 = encryptData(testData, testPassword);
      const encrypted2 = encryptData(testData, testPassword);

      expect(encrypted1).not.toBe(encrypted2);

      expect(decryptData(encrypted1, testPassword)).toBe(testData);
      expect(decryptData(encrypted2, testPassword)).toBe(testData);
    });
  });
});
