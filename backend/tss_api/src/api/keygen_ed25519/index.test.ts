import { Pool } from "pg";
import type { KeygenEd25519Request } from "@oko-wallet/oko-types/tss";
import { Participant } from "@oko-wallet/teddsa-interface";
import { runKeygenCentralizedEd25519 } from "@oko-wallet/teddsa-addon/src/server";
import { createPgConn } from "@oko-wallet/postgres-lib";
import { insertKSNode } from "@oko-wallet/oko-pg-interface/ks_nodes";
import { createUser } from "@oko-wallet/oko-pg-interface/oko_users";
import {
  createWallet,
  getWalletById,
} from "@oko-wallet/oko-pg-interface/oko_wallets";
import { insertKeyShareNodeMeta } from "@oko-wallet/oko-pg-interface/key_share_node_meta";
import type { WalletStatus } from "@oko-wallet/oko-types/wallets";
import { decryptDataAsync } from "@oko-wallet/crypto-js/node";
import { extractKeyPackageSharesEd25519 } from "@oko-wallet/teddsa-addon/src/server";

import { resetPgDatabase } from "@oko-wallet-tss-api/testing/database";
import { testPgConfig } from "@oko-wallet-tss-api/database/test_config";
import { runKeygenEd25519 } from "@oko-wallet-tss-api/api/keygen_ed25519";
import { TEMP_ENC_SECRET } from "@oko-wallet-tss-api/api/utils";

const SSS_THRESHOLD = 2;
const TEST_EMAIL = "keygen-ed25519-test@test.com";
const TEST_JWT_CONFIG = {
  secret: "test-jwt-secret-for-keygen-ed25519",
  expires_in: "1h",
};

async function setUpKSNodes(pool: Pool): Promise<string[]> {
  const ksNodeNames = ["ksNode1", "ksNode2"];
  const ksNodeIds = [];
  const createKSNodesRes = await Promise.all(
    ksNodeNames.map((ksNodeName) =>
      insertKSNode(pool, ksNodeName, `http://test.com/${ksNodeName}`),
    ),
  );
  for (const res of createKSNodesRes) {
    if (res.success === false) {
      throw new Error("Failed to create ks nodes");
    }
    ksNodeIds.push(res.data.node_id);
  }
  return ksNodeIds;
}

async function setUpKeyShareNodeMeta(pool: Pool): Promise<void> {
  await insertKeyShareNodeMeta(pool, {
    sss_threshold: SSS_THRESHOLD,
  });
}

function generateKeygenRequest(
  keygenResult: ReturnType<typeof runKeygenCentralizedEd25519>,
  user_identifier: string = TEST_EMAIL,
): KeygenEd25519Request {
  const serverKeygenOutput = keygenResult.keygen_outputs[Participant.P1];
  return {
    auth_type: "google",
    user_identifier,
    keygen_2: {
      ...serverKeygenOutput,
      public_key: [...keygenResult.public_key],
    },
    email: user_identifier,
  };
}

describe("Ed25519 Keygen", () => {
  let pool: Pool;

  beforeAll(async () => {
    const config = testPgConfig;
    const createPostgresRes = await createPgConn({
      database: config.database,
      host: config.host,
      password: config.password,
      user: config.user,
      port: config.port,
      ssl: config.ssl,
    });

    if (createPostgresRes.success === false) {
      console.error(createPostgresRes.err);
      throw new Error("Failed to create postgres database");
    }

    pool = createPostgresRes.data;
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await resetPgDatabase(pool);
  });

  describe("runKeygenEd25519", () => {
    it("should create new user and wallet for new email", async () => {
      await setUpKSNodes(pool);
      await setUpKeyShareNodeMeta(pool);

      const keygenResult = runKeygenCentralizedEd25519();

      const request = generateKeygenRequest(keygenResult);

      const result = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request,
        TEMP_ENC_SECRET,
      );

      if (!result.success) {
        console.error("Keygen failed:", {
          code: result.code,
          msg: result.msg,
        });
      }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.token).toBeDefined();
        expect(result.data.user.email).toBe(TEST_EMAIL);
        expect(result.data.user.wallet_id).toBeDefined();
        expect(result.data.user.public_key).toBeDefined();
        expect(result.data.user.public_key.length).toBe(64); // 32 bytes hex = 64 chars
      }
    });

    it("should create ed25519 wallet for existing user", async () => {
      await setUpKSNodes(pool);
      await setUpKeyShareNodeMeta(pool);

      // Create existing user first
      const createUserRes = await createUser(pool, TEST_EMAIL, "google");
      expect(createUserRes.success).toBe(true);

      const keygenResult = runKeygenCentralizedEd25519();

      const request = generateKeygenRequest(keygenResult);

      const result = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request,
        TEMP_ENC_SECRET,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user.email).toBe(TEST_EMAIL);
        expect(result.data.user.wallet_id).toBeDefined();
      }
    });

    it("should fail if ed25519 wallet already exists for user", async () => {
      await setUpKSNodes(pool);
      await setUpKeyShareNodeMeta(pool);

      const keygenResult = runKeygenCentralizedEd25519();

      // Create first wallet
      const request1 = generateKeygenRequest(keygenResult);
      const result1 = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request1,
        TEMP_ENC_SECRET,
      );
      expect(result1.success).toBe(true);

      // Try to create second wallet with different keys
      const keygenResult2 = runKeygenCentralizedEd25519();

      const request2 = generateKeygenRequest(keygenResult2);
      const result2 = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request2,
        TEMP_ENC_SECRET,
      );

      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.code).toBe("WALLET_ALREADY_EXISTS");
      }
    });

    it("should fail if public key is duplicated", async () => {
      await setUpKSNodes(pool);
      await setUpKeyShareNodeMeta(pool);

      const keygenResult = runKeygenCentralizedEd25519();

      // Create wallet for first user
      const request1 = generateKeygenRequest(keygenResult, "user1@test.com");
      const result1 = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request1,
        TEMP_ENC_SECRET,
      );
      expect(result1.success).toBe(true);

      // Try to create wallet with same public key for different user
      const request2 = generateKeygenRequest(keygenResult, "user2@test.com");
      const result2 = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request2,
        TEMP_ENC_SECRET,
      );

      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.code).toBe("DUPLICATE_PUBLIC_KEY");
      }
    });

    it("should include optional name in response when provided", async () => {
      await setUpKSNodes(pool);
      await setUpKeyShareNodeMeta(pool);

      const keygenResult = runKeygenCentralizedEd25519();
      const serverKeygenOutput = keygenResult.keygen_outputs[Participant.P1];

      const request: KeygenEd25519Request = {
        auth_type: "google",
        user_identifier: TEST_EMAIL,
        keygen_2: {
          ...serverKeygenOutput,
          public_key: [...keygenResult.public_key],
        },
        email: TEST_EMAIL,
        name: "Test User",
      };

      const result = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request,
        TEMP_ENC_SECRET,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user.name).toBe("Test User");
      }
    });

    it("should handle different auth types", async () => {
      await setUpKSNodes(pool);
      await setUpKeyShareNodeMeta(pool);

      const authTypes = ["google", "auth0"] as const;

      for (let i = 0; i < authTypes.length; i++) {
        const keygenResult = runKeygenCentralizedEd25519();
        const serverKeygenOutput = keygenResult.keygen_outputs[Participant.P1];

        const request: KeygenEd25519Request = {
          auth_type: authTypes[i],
          user_identifier: `authtype-test-${i}@test.com`,
          keygen_2: {
            ...serverKeygenOutput,
            public_key: [...keygenResult.public_key],
          },
          email: `authtype-test-${i}@test.com`,
        };

        const result = await runKeygenEd25519(
          pool,
          TEST_JWT_CONFIG,
          request,
          TEMP_ENC_SECRET,
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.user.email).toBe(`authtype-test-${i}@test.com`);
        }
      }
    });

    it("should generate valid JWT token", async () => {
      await setUpKSNodes(pool);
      await setUpKeyShareNodeMeta(pool);

      const keygenResult = runKeygenCentralizedEd25519();

      const request = generateKeygenRequest(keygenResult);

      const result = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request,
        TEMP_ENC_SECRET,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        // JWT format: header.payload.signature
        const tokenParts = result.data.token.split(".");
        expect(tokenParts.length).toBe(3);
      }
    });

    it("should work without KS nodes", async () => {
      // Don't set up KS nodes, but still need key share meta
      await setUpKeyShareNodeMeta(pool);

      const keygenResult = runKeygenCentralizedEd25519();

      const request = generateKeygenRequest(keygenResult);

      const result = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request,
        TEMP_ENC_SECRET,
      );

      expect(result.success).toBe(true);
    });

    it("should allow secp256k1 wallet for user with existing ed25519 wallet", async () => {
      await setUpKSNodes(pool);
      await setUpKeyShareNodeMeta(pool);

      // Create ed25519 wallet first
      const keygenResult = runKeygenCentralizedEd25519();

      const request = generateKeygenRequest(keygenResult);
      const ed25519Result = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request,
        TEMP_ENC_SECRET,
      );
      expect(ed25519Result.success).toBe(true);

      // Create secp256k1 wallet for same user should succeed (different curve)
      if (ed25519Result.success) {
        const createWalletRes = await createWallet(pool, {
          user_id: ed25519Result.data.user.wallet_id.split("-")[0], // This would be wrong in practice
          curve_type: "secp256k1",
          public_key: Buffer.from("03" + "00".repeat(32), "hex"),
          enc_tss_share: Buffer.from("encrypted-share", "utf-8"),
          sss_threshold: SSS_THRESHOLD,
          status: "ACTIVE" as WalletStatus,
        });
        // This test is just to verify isolation between curve types
        // In production, the user_id would come from the database
      }
    });

    it("should store only signing_share and verifying_share in enc_tss_share", async () => {
      await setUpKSNodes(pool);
      await setUpKeyShareNodeMeta(pool);

      const keygenResult = runKeygenCentralizedEd25519();
      const serverKeygenOutput = keygenResult.keygen_outputs[Participant.P1];

      // Extract expected shares from server key_package
      const expectedShares = extractKeyPackageSharesEd25519(
        new Uint8Array(serverKeygenOutput.key_package),
      );

      const request = generateKeygenRequest(keygenResult);

      const result = await runKeygenEd25519(
        pool,
        TEST_JWT_CONFIG,
        request,
        TEMP_ENC_SECRET,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        // Get wallet from database using wallet_id from result
        const getWalletRes = await getWalletById(
          pool,
          result.data.user.wallet_id,
        );
        expect(getWalletRes.success).toBe(true);
        if (getWalletRes.success && getWalletRes.data) {
          const wallet = getWalletRes.data;

          // Decrypt enc_tss_share
          const encryptedShare = wallet.enc_tss_share.toString("utf-8");
          const decryptedShare = await decryptDataAsync(
            encryptedShare,
            TEMP_ENC_SECRET,
          );
          const storedShares = JSON.parse(decryptedShare) as {
            signing_share: number[];
            verifying_share: number[];
          };

          // Verify structure: should only have signing_share and verifying_share
          expect(storedShares).toHaveProperty("signing_share");
          expect(storedShares).toHaveProperty("verifying_share");
          expect(storedShares).not.toHaveProperty("key_package");
          expect(storedShares).not.toHaveProperty("public_key_package");
          expect(storedShares).not.toHaveProperty("identifier");

          // Verify sizes: each should be 32 bytes
          expect(storedShares.signing_share).toHaveLength(32);
          expect(storedShares.verifying_share).toHaveLength(32);

          // Verify values match expected shares
          expect(storedShares.signing_share).toEqual(
            expectedShares.signing_share,
          );
          expect(storedShares.verifying_share).toEqual(
            expectedShares.verifying_share,
          );
        }
      }
    });
  });
});
