import { Pool } from "pg";
import type { PresignEd25519Request } from "@oko-wallet/oko-types/tss";
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
import { insertCustomer } from "@oko-wallet/oko-pg-interface/customers";
import type { WalletStatus } from "@oko-wallet/oko-types/wallets";
import {
  TssStageType,
  PresignEd25519StageStatus,
} from "@oko-wallet/oko-types/tss";
import { getTssStageWithSessionData } from "@oko-wallet/oko-pg-interface/tss";

import { resetPgDatabase } from "@oko-wallet-tss-api/testing/database";
import { testPgConfig } from "@oko-wallet-tss-api/database/test_config";
import { runKeygenEd25519 } from "@oko-wallet-tss-api/api/keygen_ed25519";
import { runPresignEd25519 } from "@oko-wallet-tss-api/api/presign_ed25519";
import { TEMP_ENC_SECRET } from "@oko-wallet-tss-api/api/utils";
import { TEST_CUSTOMER } from "@oko-wallet-tss-api/api/tests";

const SSS_THRESHOLD = 2;
const TEST_EMAIL = "presign-ed25519-test@test.com";
const TEST_JWT_CONFIG = {
  secret: "test-jwt-secret-for-presign-ed25519",
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

async function setUpEd25519Wallet(
  pool: Pool,
  email: string = TEST_EMAIL,
): Promise<{ walletId: string; customerId: string }> {
  // Create customer
  const insertCustomerRes = await insertCustomer(pool, TEST_CUSTOMER);
  if (insertCustomerRes.success === false) {
    throw new Error(`Failed to create customer: ${insertCustomerRes.err}`);
  }

  // Set up KS nodes and metadata
  await setUpKSNodes(pool);
  await setUpKeyShareNodeMeta(pool);

  // Create wallet using keygen
  const keygenResult = runKeygenCentralizedEd25519();
  const serverKeygenOutput = keygenResult.keygen_outputs[Participant.P1];

  const keygenRequest = {
    auth_type: "google" as const,
    user_identifier: email,
    keygen_2: {
      ...serverKeygenOutput,
      public_key: [...keygenResult.public_key],
    },
    email: email,
  };

  const keygenResult_res = await runKeygenEd25519(
    pool,
    TEST_JWT_CONFIG,
    keygenRequest,
    TEMP_ENC_SECRET,
  );

  if (!keygenResult_res.success) {
    throw new Error(`Failed to create wallet: ${keygenResult_res.msg}`);
  }

  return {
    walletId: keygenResult_res.data.user.wallet_id,
    customerId: TEST_CUSTOMER.customer_id,
  };
}

function generatePresignRequest(
  email: string,
  walletId: string,
  customerId: string,
): PresignEd25519Request {
  return {
    email,
    wallet_id: walletId,
    customer_id: customerId,
  };
}

describe("Ed25519 Presign", () => {
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

  describe("runPresignEd25519", () => {
    it("should successfully generate presign and create session", async () => {
      const { walletId, customerId } = await setUpEd25519Wallet(pool);

      const request = generatePresignRequest(TEST_EMAIL, walletId, customerId);

      const result = await runPresignEd25519(pool, TEMP_ENC_SECRET, request);

      if (!result.success) {
        console.error("Presign failed:", {
          code: result.code,
          msg: result.msg,
        });
      }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.session_id).toBeDefined();
        expect(result.data.commitments_0).toBeDefined();
        expect(result.data.commitments_0.identifier).toBeDefined();
        expect(result.data.commitments_0.commitments).toBeDefined();
        expect(result.data.commitments_0.identifier.length).toBe(32);
        expect(result.data.commitments_0.commitments.length).toBeGreaterThan(0);
      }
    });

    it("should create TSS session and stage in database", async () => {
      const { walletId, customerId } = await setUpEd25519Wallet(pool);

      const request = generatePresignRequest(TEST_EMAIL, walletId, customerId);

      const result = await runPresignEd25519(pool, TEMP_ENC_SECRET, request);

      expect(result.success).toBe(true);
      if (result.success) {
        const sessionId = result.data.session_id;

        // Verify TSS session was created
        const sessionQuery = await pool.query(
          "SELECT session_id, wallet_id, customer_id FROM tss_sessions WHERE session_id = $1",
          [sessionId],
        );
        expect(sessionQuery.rows).toHaveLength(1);
        expect(sessionQuery.rows[0].wallet_id).toBe(walletId);
        expect(sessionQuery.rows[0].customer_id).toBe(customerId);

        // Verify TSS stage was created
        const getStageRes = await getTssStageWithSessionData(
          pool,
          sessionId,
          TssStageType.PRESIGN_ED25519,
        );
        expect(getStageRes.success).toBe(true);
        if (getStageRes.success && getStageRes.data) {
          const stage = getStageRes.data;
          expect(stage.session_id).toBe(sessionId);
          expect(stage.stage_type).toBe(TssStageType.PRESIGN_ED25519);
          expect(stage.stage_status).toBe(PresignEd25519StageStatus.COMPLETED);
          expect(stage.stage_data).toBeDefined();

          const stageData = stage.stage_data as {
            nonces: number[];
            identifier: number[];
            commitments: number[];
          };
          expect(stageData.nonces).toBeDefined();
          expect(stageData.identifier).toBeDefined();
          expect(stageData.commitments).toBeDefined();
          expect(stageData.identifier.length).toBe(32);
        }
      }
    });

    it("should return valid commitments structure", async () => {
      const { walletId, customerId } = await setUpEd25519Wallet(pool);

      const request = generatePresignRequest(TEST_EMAIL, walletId, customerId);

      const result = await runPresignEd25519(pool, TEMP_ENC_SECRET, request);

      expect(result.success).toBe(true);
      if (result.success) {
        const commitments = result.data.commitments_0;

        // Verify commitments structure
        expect(commitments).toBeDefined();
        expect(commitments.identifier).toBeDefined();
        expect(Array.isArray(commitments.identifier)).toBe(true);
        expect(commitments.identifier.length).toBe(32);

        expect(commitments.commitments).toBeDefined();
        expect(Array.isArray(commitments.commitments)).toBe(true);
        expect(commitments.commitments.length).toBeGreaterThan(0);
      }
    });

    it("should fail with UNAUTHORIZED for invalid email", async () => {
      const { walletId, customerId } = await setUpEd25519Wallet(pool);

      const request = generatePresignRequest(
        "wrong-email@test.com",
        walletId,
        customerId,
      );

      const result = await runPresignEd25519(pool, TEMP_ENC_SECRET, request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe("UNAUTHORIZED");
      }
    });

    it("should fail with UNAUTHORIZED for invalid wallet_id", async () => {
      const { customerId } = await setUpEd25519Wallet(pool);

      const request = generatePresignRequest(
        TEST_EMAIL,
        "invalid-wallet-id",
        customerId,
      );

      const result = await runPresignEd25519(pool, TEMP_ENC_SECRET, request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe("UNAUTHORIZED");
      }
    });

    it("should fail with INVALID_WALLET_TYPE for non-ed25519 wallet", async () => {
      // Create user and secp256k1 wallet
      const createUserRes = await createUser(pool, TEST_EMAIL, "google");
      expect(createUserRes.success).toBe(true);
      if (!createUserRes.success) {
        throw new Error("Failed to create user");
      }

      const userId = createUserRes.data.user_id;

      // Create secp256k1 wallet
      const createWalletRes = await createWallet(pool, {
        user_id: userId,
        curve_type: "secp256k1",
        public_key: Buffer.from("03" + "00".repeat(32), "hex"),
        enc_tss_share: Buffer.from("encrypted-share", "utf-8"),
        sss_threshold: SSS_THRESHOLD,
        status: "ACTIVE" as WalletStatus,
      });
      expect(createWalletRes.success).toBe(true);
      if (!createWalletRes.success) {
        throw new Error("Failed to create wallet");
      }

      const walletId = createWalletRes.data.wallet_id;
      const insertCustomerRes = await insertCustomer(pool, TEST_CUSTOMER);
      if (insertCustomerRes.success === false) {
        throw new Error("Failed to create customer");
      }

      const request = generatePresignRequest(
        TEST_EMAIL,
        walletId,
        TEST_CUSTOMER.customer_id,
      );

      const result = await runPresignEd25519(pool, TEMP_ENC_SECRET, request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe("INVALID_WALLET_TYPE");
        expect(result.msg).toContain("not ed25519 type");
      }
    });

    it("should handle multiple presigns for same wallet", async () => {
      const { walletId, customerId } = await setUpEd25519Wallet(pool);

      // Generate first presign
      const request1 = generatePresignRequest(TEST_EMAIL, walletId, customerId);
      const result1 = await runPresignEd25519(pool, TEMP_ENC_SECRET, request1);

      expect(result1.success).toBe(true);

      // Generate second presign
      const request2 = generatePresignRequest(TEST_EMAIL, walletId, customerId);
      const result2 = await runPresignEd25519(pool, TEMP_ENC_SECRET, request2);

      expect(result2.success).toBe(true);
      if (result1.success && result2.success) {
        // Should create different sessions
        expect(result1.data.session_id).not.toBe(result2.data.session_id);

        // Both should have valid commitments
        expect(result1.data.commitments_0).toBeDefined();
        expect(result2.data.commitments_0).toBeDefined();
      }
    });

    it("should reconstruct key_package from stored shares correctly", async () => {
      const { walletId, customerId } = await setUpEd25519Wallet(pool);

      // Get wallet to verify shares are stored correctly
      const getWalletRes = await getWalletById(pool, walletId);
      expect(getWalletRes.success).toBe(true);
      if (!getWalletRes.success || !getWalletRes.data) {
        throw new Error("Failed to get wallet");
      }

      const wallet = getWalletRes.data;
      expect(wallet.curve_type).toBe("ed25519");

      // Presign should succeed using reconstructed key_package
      const request = generatePresignRequest(TEST_EMAIL, walletId, customerId);
      const result = await runPresignEd25519(pool, TEMP_ENC_SECRET, request);

      expect(result.success).toBe(true);
      if (result.success) {
        // If key_package reconstruction failed, we would get an error
        // So success means reconstruction worked
        expect(result.data.session_id).toBeDefined();
      }
    });
  });
});
