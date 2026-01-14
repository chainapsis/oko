import { Pool } from "pg";
import {
  createKeyShare,
  createUser,
  createWallet,
} from "@oko-wallet/ksn-pg-interface";
import {
  Bytes,
  type Bytes32,
  type Bytes33,
  type Bytes64,
} from "@oko-wallet/bytes";

import { connectPG, resetPgDatabase } from "@oko-wallet-ksn-server/database";
import { testPgConfig } from "@oko-wallet-ksn-server/database/test_config";
import {
  checkKeyShareV2,
  getKeyShareV2,
  registerKeyShareV2,
  registerEd25519V2,
  reshareKeyShareV2,
  reshareRegisterV2,
} from "@oko-wallet-ksn-server/api/key_share";

const TEST_ENC_SECRET = "test_enc_secret";

// Test public keys
const TEST_SECP256K1_PK =
  "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";
const TEST_SECP256K1_PK_2 =
  "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC5600";
const TEST_ED25519_PK =
  "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
const TEST_ED25519_PK_2 =
  "e75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511b";

// Helper functions
function generateRandomShare(): Bytes64 {
  const shareArr = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 256),
  );
  const shareRes = Bytes.fromUint8Array(new Uint8Array(shareArr), 64);
  if (shareRes.success === false) {
    throw new Error("Failed to generate random share");
  }
  return shareRes.data;
}

function parseSecp256k1PublicKey(hex: string): Bytes33 {
  const res = Bytes.fromHexString(hex, 33);
  if (res.success === false) {
    throw new Error(`Failed to parse secp256k1 public key: ${res.err}`);
  }
  return res.data;
}

function parseEd25519PublicKey(hex: string): Bytes32 {
  const res = Bytes.fromHexString(hex, 32);
  if (res.success === false) {
    throw new Error(`Failed to parse ed25519 public key: ${res.err}`);
  }
  return res.data;
}

describe("key_share_v2_test", () => {
  let pool: Pool;

  beforeAll(async () => {
    const createPostgresRes = await connectPG(testPgConfig);
    if (createPostgresRes.success === false) {
      console.error(createPostgresRes.err);
      throw new Error("Failed to connect to postgres database");
    }
    pool = createPostgresRes.data;
  });

  beforeEach(async () => {
    await resetPgDatabase(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  // ============================================================================
  // registerKeyShareV2
  // ============================================================================
  describe("registerKeyShareV2", () => {
    it("3.1 성공 - 신규 유저 both", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();
      const ed25519Share = generateRandomShare();

      const result = await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);
    });

    it("3.2 성공 - 신규 유저 secp256k1 only", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Share = generateRandomShare();

      const result = await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);
    });

    it("3.3 실패 - DUPLICATE_PUBLIC_KEY", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Share = generateRandomShare();

      // Pre-create wallet with same public key
      await createWallet(pool, {
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        curve_type: "secp256k1",
        public_key: secp256k1Pk.toUint8Array(),
      });

      const result = await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("DUPLICATE_PUBLIC_KEY");
      }
    });

    it("3.4 실패 - USER_ALREADY_REGISTERED", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Pk2 = parseSecp256k1PublicKey(TEST_SECP256K1_PK_2);
      const secp256k1Share = generateRandomShare();

      // First registration
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      // Second registration attempt with different pk
      const result = await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk2, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("USER_ALREADY_REGISTERED");
      }
    });
  });

  // ============================================================================
  // checkKeyShareV2
  // ============================================================================
  describe("checkKeyShareV2", () => {
    it("2.1 성공 - 존재함 (both)", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();
      const ed25519Share = generateRandomShare();

      // Register first
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      const result = await checkKeyShareV2(pool, {
        user_auth_id: "test@test.com",
        auth_type: "google",
        wallets: {
          secp256k1: secp256k1Pk,
          ed25519: ed25519Pk,
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.secp256k1?.exists).toBe(true);
        expect(result.data.ed25519?.exists).toBe(true);
      }
    });

    it("2.2 성공 - 부분 존재 (secp256k1 only)", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();

      // Register secp256k1 only
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      const result = await checkKeyShareV2(pool, {
        user_auth_id: "test@test.com",
        auth_type: "google",
        wallets: {
          secp256k1: secp256k1Pk,
          ed25519: ed25519Pk,
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.secp256k1?.exists).toBe(true);
        expect(result.data.ed25519?.exists).toBe(false);
      }
    });

    it("2.3 성공 - user 없음", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);

      const result = await checkKeyShareV2(pool, {
        user_auth_id: "nonexistent@test.com",
        auth_type: "google",
        wallets: {
          secp256k1: secp256k1Pk,
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.secp256k1?.exists).toBe(false);
      }
    });

    it("2.4 성공 - wallet 없음 (user는 있음)", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Pk2 = parseSecp256k1PublicKey(TEST_SECP256K1_PK_2);
      const secp256k1Share = generateRandomShare();

      // Register with different pk
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk2, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      // Check with different pk
      const result = await checkKeyShareV2(pool, {
        user_auth_id: "test@test.com",
        auth_type: "google",
        wallets: {
          secp256k1: secp256k1Pk,
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.secp256k1?.exists).toBe(false);
      }
    });

    it("2.5 성공 - key share 없음 (wallet은 있음)", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);

      // Create user and wallet without key share
      const createUserRes = await createUser(pool, "google", "test@test.com");
      if (createUserRes.success === false) {
        throw new Error("Failed to create user");
      }

      await createWallet(pool, {
        user_id: createUserRes.data.user_id,
        curve_type: "secp256k1",
        public_key: secp256k1Pk.toUint8Array(),
      });

      const result = await checkKeyShareV2(pool, {
        user_auth_id: "test@test.com",
        auth_type: "google",
        wallets: {
          secp256k1: secp256k1Pk,
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.secp256k1?.exists).toBe(false);
      }
    });
  });

  // ============================================================================
  // getKeyShareV2
  // ============================================================================
  describe("getKeyShareV2", () => {
    it("1.1 성공 - secp256k1 only", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Share = generateRandomShare();

      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      const result = await getKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: secp256k1Pk,
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.secp256k1).toBeDefined();
        expect(result.data.secp256k1?.share).toBe(secp256k1Share.toHex());
      }
    });

    it("1.2 성공 - ed25519 only", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();
      const ed25519Share = generateRandomShare();

      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      const result = await getKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            ed25519: ed25519Pk,
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ed25519).toBeDefined();
        expect(result.data.ed25519?.share).toBe(ed25519Share.toHex());
        expect(result.data.secp256k1).toBeUndefined();
      }
    });

    it("1.3 성공 - both", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();
      const ed25519Share = generateRandomShare();

      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      const result = await getKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: secp256k1Pk,
            ed25519: ed25519Pk,
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.secp256k1?.share).toBe(secp256k1Share.toHex());
        expect(result.data.ed25519?.share).toBe(ed25519Share.toHex());
      }
    });

    it("1.4 실패 - USER_NOT_FOUND", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);

      const result = await getKeyShareV2(
        pool,
        {
          user_auth_id: "nonexistent@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: secp256k1Pk,
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("USER_NOT_FOUND");
      }
    });

    it("1.5 실패 - WALLET_NOT_FOUND", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Pk2 = parseSecp256k1PublicKey(TEST_SECP256K1_PK_2);
      const secp256k1Share = generateRandomShare();

      // Register with different pk
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk2, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      const result = await getKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: secp256k1Pk,
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("WALLET_NOT_FOUND");
      }
    });

    it("1.6 실패 - UNAUTHORIZED (wallet belongs to different user)", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);

      // Create user and wallet belonging to a different user
      await createUser(pool, "google", "test@test.com");
      await createWallet(pool, {
        user_id: "550e8400-e29b-41d4-a716-446655440000", // Different user_id
        curve_type: "secp256k1",
        public_key: secp256k1Pk.toUint8Array(),
      });

      const result = await getKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: secp256k1Pk,
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("UNAUTHORIZED");
      }
    });

    it("1.7 실패 - KEY_SHARE_NOT_FOUND", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);

      // Create user and wallet without key share
      const createUserRes = await createUser(pool, "google", "test@test.com");
      if (createUserRes.success === false) {
        throw new Error("Failed to create user");
      }

      await createWallet(pool, {
        user_id: createUserRes.data.user_id,
        curve_type: "secp256k1",
        public_key: secp256k1Pk.toUint8Array(),
      });

      const result = await getKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: secp256k1Pk,
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("KEY_SHARE_NOT_FOUND");
      }
    });
  });

  // ============================================================================
  // registerEd25519V2
  // ============================================================================
  describe("registerEd25519V2", () => {
    it("4.1 성공 - secp256k1 보유 유저에 ed25519 추가", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();
      const ed25519Share = generateRandomShare();

      // First register secp256k1
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      // Then add ed25519
      const result = await registerEd25519V2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          public_key: ed25519Pk,
          share: ed25519Share,
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);

      // Verify both exist
      const checkResult = await checkKeyShareV2(pool, {
        user_auth_id: "test@test.com",
        auth_type: "google",
        wallets: {
          secp256k1: secp256k1Pk,
          ed25519: ed25519Pk,
        },
      });

      expect(checkResult.success).toBe(true);
      if (checkResult.success) {
        expect(checkResult.data.secp256k1?.exists).toBe(true);
        expect(checkResult.data.ed25519?.exists).toBe(true);
      }
    });

    it("4.2 실패 - USER_NOT_FOUND", async () => {
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const ed25519Share = generateRandomShare();

      const result = await registerEd25519V2(
        pool,
        {
          user_auth_id: "nonexistent@test.com",
          auth_type: "google",
          public_key: ed25519Pk,
          share: ed25519Share,
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("USER_NOT_FOUND");
      }
    });

    it("4.3 실패 - WALLET_NOT_FOUND (secp256k1 없음)", async () => {
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const ed25519Share = generateRandomShare();

      // Create user without any wallets
      await createUser(pool, "google", "test@test.com");

      const result = await registerEd25519V2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          public_key: ed25519Pk,
          share: ed25519Share,
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("WALLET_NOT_FOUND");
      }
    });

    it("4.4 실패 - DUPLICATE_PUBLIC_KEY (ed25519 이미 있음)", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();
      const ed25519Share = generateRandomShare();

      // Register both
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      // Try to add ed25519 again
      const result = await registerEd25519V2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          public_key: ed25519Pk,
          share: ed25519Share,
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("DUPLICATE_PUBLIC_KEY");
      }
    });
  });

  // ============================================================================
  // reshareKeyShareV2
  // ============================================================================
  describe("reshareKeyShareV2", () => {
    it("5.1 성공 - both", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();
      const ed25519Share = generateRandomShare();

      // Register first
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      // Reshare both
      const result = await reshareKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);
    });

    it("5.2 성공 - secp256k1 only", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();
      const ed25519Share = generateRandomShare();

      // Register both
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      // Reshare secp256k1 only
      const result = await reshareKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);
    });

    it("5.3 성공 - ed25519 only", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();
      const ed25519Share = generateRandomShare();

      // Register both
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      // Reshare ed25519 only
      const result = await reshareKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);
    });

    it("5.4 실패 - USER_NOT_FOUND", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Share = generateRandomShare();

      const result = await reshareKeyShareV2(
        pool,
        {
          user_auth_id: "nonexistent@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("USER_NOT_FOUND");
      }
    });

    it("5.5 실패 - WALLET_NOT_FOUND", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Pk2 = parseSecp256k1PublicKey(TEST_SECP256K1_PK_2);
      const secp256k1Share = generateRandomShare();

      // Register with different pk
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk2, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      // Try to reshare with non-existent pk
      const result = await reshareKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("WALLET_NOT_FOUND");
      }
    });

    it("5.6 실패 - KEY_SHARE_NOT_FOUND", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Share = generateRandomShare();

      // Create user and wallet without key share
      const createUserRes = await createUser(pool, "google", "test@test.com");
      if (createUserRes.success === false) {
        throw new Error("Failed to create user");
      }

      await createWallet(pool, {
        user_id: createUserRes.data.user_id,
        curve_type: "secp256k1",
        public_key: secp256k1Pk.toUint8Array(),
      });

      const result = await reshareKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("KEY_SHARE_NOT_FOUND");
      }
    });

    it("5.7 실패 - RESHARE_FAILED (잘못된 share 값)", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Share = generateRandomShare();
      const wrongShare = generateRandomShare();

      // Register
      await registerKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      // Try to reshare with wrong share
      const result = await reshareKeyShareV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: wrongShare },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("RESHARE_FAILED");
      }
    });
  });

  // ============================================================================
  // reshareRegisterV2
  // ============================================================================
  describe("reshareRegisterV2", () => {
    it("6.1 성공 - 기존 유저 both", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const secp256k1Share = generateRandomShare();
      const ed25519Share = generateRandomShare();

      // Create user only (simulating user exists on other nodes)
      await createUser(pool, "google", "test@test.com");

      // Register via reshareRegisterV2
      const result = await reshareRegisterV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);

      // Verify both exist
      const checkResult = await checkKeyShareV2(pool, {
        user_auth_id: "test@test.com",
        auth_type: "google",
        wallets: {
          secp256k1: secp256k1Pk,
          ed25519: ed25519Pk,
        },
      });

      expect(checkResult.success).toBe(true);
      if (checkResult.success) {
        expect(checkResult.data.secp256k1?.exists).toBe(true);
        expect(checkResult.data.ed25519?.exists).toBe(true);
      }
    });

    it("6.2 성공 - 기존 유저 secp256k1 only", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Share = generateRandomShare();

      // Create user only
      await createUser(pool, "google", "test@test.com");

      // Register secp256k1 via reshareRegisterV2
      const result = await reshareRegisterV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);
    });

    it("6.3 성공 - 기존 유저 ed25519 only", async () => {
      const ed25519Pk = parseEd25519PublicKey(TEST_ED25519_PK);
      const ed25519Share = generateRandomShare();

      // Create user only
      await createUser(pool, "google", "test@test.com");

      // Register ed25519 via reshareRegisterV2
      const result = await reshareRegisterV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            ed25519: { public_key: ed25519Pk, share: ed25519Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(true);
    });

    it("6.4 실패 - USER_NOT_FOUND", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Share = generateRandomShare();

      const result = await reshareRegisterV2(
        pool,
        {
          user_auth_id: "nonexistent@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("USER_NOT_FOUND");
      }
    });

    it("6.5 실패 - DUPLICATE_PUBLIC_KEY", async () => {
      const secp256k1Pk = parseSecp256k1PublicKey(TEST_SECP256K1_PK);
      const secp256k1Share = generateRandomShare();

      // Create user and wallet
      const createUserRes = await createUser(pool, "google", "test@test.com");
      if (createUserRes.success === false) {
        throw new Error("Failed to create user");
      }

      await createWallet(pool, {
        user_id: createUserRes.data.user_id,
        curve_type: "secp256k1",
        public_key: secp256k1Pk.toUint8Array(),
      });

      // Try to register same pk via reshareRegisterV2
      const result = await reshareRegisterV2(
        pool,
        {
          user_auth_id: "test@test.com",
          auth_type: "google",
          wallets: {
            secp256k1: { public_key: secp256k1Pk, share: secp256k1Share },
          },
        },
        TEST_ENC_SECRET,
      );

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.code).toBe("DUPLICATE_PUBLIC_KEY");
      }
    });
  });
});
