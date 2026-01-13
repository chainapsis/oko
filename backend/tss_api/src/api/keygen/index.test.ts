import { jest } from "@jest/globals";
import { Pool } from "pg";
import type { WalletStatus } from "@oko-wallet/oko-types/wallets";
import {
  type KeygenRequest,
  type KeygenRequestV2,
  type WalletKSNodeWithNodeNameAndServerUrl,
} from "@oko-wallet/oko-types/tss";
import { Participant } from "@oko-wallet/tecdsa-interface";
import { napiRunKeygenClientCentralized } from "@oko-wallet/cait-sith-keplr-addon/addon";
import { runKeygenCentralizedEd25519 } from "@oko-wallet/teddsa-addon/src/server";
import {
  insertKSNode,
  getWalletKSNodesByWalletId,
} from "@oko-wallet/oko-pg-interface/ks_nodes";
import { decryptData, decryptDataAsync } from "@oko-wallet/crypto-js/node";
import { createPgConn } from "@oko-wallet/postgres-lib";
import { createUser } from "@oko-wallet/oko-pg-interface/oko_users";
import {
  createWallet,
  getWalletById,
} from "@oko-wallet/oko-pg-interface/oko_wallets";
import { insertKeyShareNodeMeta } from "@oko-wallet/oko-pg-interface/key_share_node_meta";

import { resetPgDatabase } from "@oko-wallet-tss-api/testing/database";
import { testPgConfig } from "@oko-wallet-tss-api/database/test_config";
import { TEMP_ENC_SECRET } from "@oko-wallet-tss-api/api/utils";

const mockCheckKeyShareFromKSNodes = jest.fn() as jest.Mock;
const mockCheckKeyShareFromKSNodesV2 = jest.fn() as jest.Mock;

await jest.unstable_mockModule("@oko-wallet-tss-api/api/ks_node", () => ({
  checkKeyShareFromKSNodes: mockCheckKeyShareFromKSNodes,
  checkKeyShareFromKSNodesV2: mockCheckKeyShareFromKSNodesV2,
}));

const { runKeygen, runKeygenV2 } =
  await import("@oko-wallet-tss-api/api/keygen");

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
      console.error(res);
      throw new Error("Failed to create ks nodes");
    }
    ksNodeIds.push(res.data.node_id);
  }

  return ksNodeIds;
}

describe("keygen_test", () => {
  let pool: Pool;

  const sssThreshold = 2;

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

  beforeEach(async () => {
    await resetPgDatabase(pool);
    await insertKeyShareNodeMeta(pool, {
      sss_threshold: sssThreshold,
    });
    jest.clearAllMocks();
  });

  describe("runKeygen V1", () => {
    it("run keygen success", async () => {
      const clientKeygenResult = napiRunKeygenClientCentralized();
      const { keygen_outputs } = clientKeygenResult;

      const keygen_2 = keygen_outputs[Participant.P1];

      const keygenRequest: KeygenRequest = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2,
      };

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const ksNodeIds = await setUpKSNodes(pool);
      (mockCheckKeyShareFromKSNodes as any).mockResolvedValue({
        success: true,
        data: {
          nodeIds: ksNodeIds,
        },
      });

      const keygenResponse = await runKeygen(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === false) {
        console.error(keygenResponse);
        throw new Error("Failed to run keygen");
      }

      expect(keygenResponse.success).toBe(true);
      expect(keygenResponse.data).toBeDefined();
      expect(keygenResponse.data?.user.wallet_id).toBeDefined();

      const wallet = await getWalletById(
        pool,
        keygenResponse.data?.user.wallet_id,
      );
      if (wallet.success === false) {
        console.error(wallet.err);
        throw new Error("Failed to get wallet");
      }

      expect(wallet.data).toBeDefined();
      expect(wallet.data?.wallet_id).toEqual(
        keygenResponse.data?.user.wallet_id,
      );
      expect(wallet.data?.curve_type).toEqual("secp256k1");
      expect(wallet.data?.public_key).toEqual(
        Buffer.from(keygen_2.public_key, "hex"),
      );
      const decryptedShare = decryptData(
        wallet.data?.enc_tss_share.toString("utf-8")!,
        TEMP_ENC_SECRET,
      );
      expect(decryptedShare).toEqual(keygen_2.private_share);

      const walletKSNodes = await getWalletKSNodesByWalletId(
        pool,
        keygenResponse.data?.user.wallet_id,
      );
      if (walletKSNodes.success === false) {
        console.error(walletKSNodes.err);
        throw new Error("Failed to get wallet ks nodes");
      }
      expect(walletKSNodes.data).toBeDefined();
      expect(walletKSNodes.data?.length).toEqual(ksNodeIds.length);
      expect(
        walletKSNodes.data?.every(
          (ksNode: WalletKSNodeWithNodeNameAndServerUrl) =>
            ksNodeIds.includes(ksNode.node_id),
        ),
      ).toBe(true);
      const endpoints = ["http://test.com/ksNode1", "http://test.com/ksNode2"];
      expect(
        walletKSNodes.data?.every(
          (ksNode: WalletKSNodeWithNodeNameAndServerUrl) =>
            endpoints.includes(ksNode.server_url),
        ),
      ).toBe(true);
    });

    it("run keygen failure - wallet already exists", async () => {
      const clientKeygenResult = napiRunKeygenClientCentralized();
      const { keygen_outputs } = clientKeygenResult;

      const createUserRes = await createUser(pool, "test@test.com", "google");
      if (createUserRes.success === false) {
        console.error(createUserRes.err);
        throw new Error("Failed to create user");
      }

      const publicKey = keygen_outputs[Participant.P1].public_key;
      await createWallet(pool, {
        user_id: createUserRes.data.user_id,
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKey, "hex"),
        enc_tss_share: Buffer.from(
          keygen_outputs[Participant.P1].private_share,
        ),
        status: "ACTIVE" as WalletStatus,
        sss_threshold: sssThreshold,
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygenRequest: KeygenRequest = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2: {
          public_key: keygen_outputs[Participant.P1].public_key,
          private_share: keygen_outputs[Participant.P1].private_share,
        },
      };

      const keygenResponse = await runKeygen(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygen should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("WALLET_ALREADY_EXISTS");
    });

    it("run keygen failure - duplicate public key", async () => {
      const clientKeygenResult = napiRunKeygenClientCentralized();
      const { keygen_outputs } = clientKeygenResult;

      const publicKey = keygen_outputs[Participant.P1].public_key;
      await createWallet(pool, {
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKey, "hex"),
        enc_tss_share: Buffer.from(
          keygen_outputs[Participant.P1].private_share,
        ),
        status: "ACTIVE" as WalletStatus,
        sss_threshold: sssThreshold,
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygenRequest: KeygenRequest = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2: {
          public_key: keygen_outputs[Participant.P1].public_key,
          private_share: keygen_outputs[Participant.P1].private_share,
        },
      };

      const keygenResponse = await runKeygen(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygen should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("DUPLICATE_PUBLIC_KEY");
    });

    it("run keygen failure - keyshare node insufficient", async () => {
      const clientKeygenResult = napiRunKeygenClientCentralized();
      const { keygen_outputs } = clientKeygenResult;

      (mockCheckKeyShareFromKSNodes as any).mockResolvedValue({
        success: false,
        code: "KEYSHARE_NODE_INSUFFICIENT",
        msg: "keyshare node insufficient error",
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygenRequest: KeygenRequest = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2: {
          public_key: keygen_outputs[Participant.P1].public_key,
          private_share: keygen_outputs[Participant.P1].private_share,
        },
      };

      const keygenResponse = await runKeygen(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygen should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("KEYSHARE_NODE_INSUFFICIENT");
      expect(keygenResponse.msg).toEqual("keyshare node insufficient error");
    });

    it("run keygen failure - keyshare node insufficient - no active ks nodes", async () => {
      const clientKeygenResult = napiRunKeygenClientCentralized();
      const { keygen_outputs } = clientKeygenResult;

      (mockCheckKeyShareFromKSNodes as any).mockResolvedValue({
        success: true,
        data: {
          nodeIds: [],
        },
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygenRequest: KeygenRequest = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2: {
          public_key: keygen_outputs[Participant.P1].public_key,
          private_share: keygen_outputs[Participant.P1].private_share,
        },
      };

      const keygenResponse = await runKeygen(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygen should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("KEYSHARE_NODE_INSUFFICIENT");
      expect(keygenResponse.msg).toEqual("no active ks nodes");
    });
  });

  describe("runKeygenV2", () => {
    it("run keygenV2 success - creates both secp256k1 and ed25519 wallets", async () => {
      const secp256k1KeygenResult = napiRunKeygenClientCentralized();
      const ed25519KeygenResult = runKeygenCentralizedEd25519();

      const keygen_2_secp256k1 =
        secp256k1KeygenResult.keygen_outputs[Participant.P1];
      const keygen_2_ed25519 =
        ed25519KeygenResult.keygen_outputs[Participant.P1];

      const keygenRequest: KeygenRequestV2 = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2_secp256k1: {
          public_key: keygen_2_secp256k1.public_key,
          private_share: keygen_2_secp256k1.private_share,
        },
        keygen_2_ed25519: {
          key_package: keygen_2_ed25519.key_package,
          public_key_package: keygen_2_ed25519.public_key_package,
          identifier: [...keygen_2_ed25519.identifier],
          public_key: [...ed25519KeygenResult.public_key],
        },
      };

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const ksNodeIds = await setUpKSNodes(pool);
      (mockCheckKeyShareFromKSNodesV2 as any).mockResolvedValue({
        success: true,
        data: {
          secp256k1: { nodeIds: ksNodeIds },
          ed25519: { nodeIds: ksNodeIds },
        },
      });

      const keygenResponse = await runKeygenV2(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === false) {
        console.error(keygenResponse);
        throw new Error("Failed to run keygenV2");
      }

      expect(keygenResponse.success).toBe(true);
      expect(keygenResponse.data).toBeDefined();
      expect(keygenResponse.data?.user.wallet_id_secp256k1).toBeDefined();
      expect(keygenResponse.data?.user.wallet_id_ed25519).toBeDefined();
      expect(keygenResponse.data?.user.public_key_secp256k1).toBeDefined();
      expect(keygenResponse.data?.user.public_key_ed25519).toBeDefined();

      // Verify secp256k1 wallet
      const secp256k1Wallet = await getWalletById(
        pool,
        keygenResponse.data?.user.wallet_id_secp256k1,
      );
      if (secp256k1Wallet.success === false) {
        console.error(secp256k1Wallet.err);
        throw new Error("Failed to get secp256k1 wallet");
      }
      expect(secp256k1Wallet.data).toBeDefined();
      expect(secp256k1Wallet.data?.wallet_id).toEqual(
        keygenResponse.data?.user.wallet_id_secp256k1,
      );
      expect(secp256k1Wallet.data?.curve_type).toEqual("secp256k1");
      expect(secp256k1Wallet.data?.public_key).toEqual(
        Buffer.from(keygen_2_secp256k1.public_key, "hex"),
      );
      const decryptedSecp256k1Share = decryptData(
        secp256k1Wallet.data?.enc_tss_share.toString("utf-8")!,
        TEMP_ENC_SECRET,
      );
      expect(decryptedSecp256k1Share).toEqual(keygen_2_secp256k1.private_share);

      // Verify ed25519 wallet
      const ed25519Wallet = await getWalletById(
        pool,
        keygenResponse.data?.user.wallet_id_ed25519,
      );
      if (ed25519Wallet.success === false) {
        console.error(ed25519Wallet.err);
        throw new Error("Failed to get ed25519 wallet");
      }
      expect(ed25519Wallet.data).toBeDefined();
      expect(ed25519Wallet.data?.wallet_id).toEqual(
        keygenResponse.data?.user.wallet_id_ed25519,
      );
      expect(ed25519Wallet.data?.curve_type).toEqual("ed25519");
      expect(ed25519Wallet.data?.public_key).toEqual(
        Buffer.from(ed25519KeygenResult.public_key),
      );
      const decryptedEd25519Share = await decryptDataAsync(
        ed25519Wallet.data?.enc_tss_share.toString("utf-8")!,
        TEMP_ENC_SECRET,
      );
      const ed25519SharesData = JSON.parse(decryptedEd25519Share);
      expect(ed25519SharesData).toHaveProperty("signing_share");
      expect(ed25519SharesData).toHaveProperty("verifying_share");
      expect(ed25519SharesData.signing_share).toHaveLength(32);
      expect(ed25519SharesData.verifying_share).toHaveLength(32);

      // Verify KS nodes for both wallets
      const secp256k1KSNodesRes = await getWalletKSNodesByWalletId(
        pool,
        keygenResponse.data?.user.wallet_id_secp256k1,
      );
      if (secp256k1KSNodesRes.success === false) {
        console.error(secp256k1KSNodesRes.err);
        throw new Error("Failed to get secp256k1 wallet KS nodes");
      }
      const secp256k1KSNodes = secp256k1KSNodesRes.data;
      expect(secp256k1KSNodes).toBeDefined();
      expect(secp256k1KSNodes?.length).toEqual(ksNodeIds.length);

      const ed25519KSNodesRes = await getWalletKSNodesByWalletId(
        pool,
        keygenResponse.data?.user.wallet_id_ed25519,
      );
      if (ed25519KSNodesRes.success === false) {
        console.error(ed25519KSNodesRes.err);
        throw new Error("Failed to get ed25519 wallet KS nodes");
      }
      const ed25519KSNodes = ed25519KSNodesRes.data;
      expect(ed25519KSNodes).toBeDefined();
      expect(ed25519KSNodes?.length).toEqual(ksNodeIds.length);
    });

    it("run keygenV2 failure - secp256k1 wallet already exists", async () => {
      const secp256k1KeygenResult = napiRunKeygenClientCentralized();
      const ed25519KeygenResult = runKeygenCentralizedEd25519();

      const createUserRes = await createUser(pool, "test@test.com", "google");
      if (createUserRes.success === false) {
        console.error(createUserRes.err);
        throw new Error("Failed to create user");
      }

      const publicKey =
        secp256k1KeygenResult.keygen_outputs[Participant.P1].public_key;
      await createWallet(pool, {
        user_id: createUserRes.data.user_id,
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKey, "hex"),
        enc_tss_share: Buffer.from(
          secp256k1KeygenResult.keygen_outputs[Participant.P1].private_share,
        ),
        status: "ACTIVE" as WalletStatus,
        sss_threshold: sssThreshold,
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygen_2_secp256k1 =
        secp256k1KeygenResult.keygen_outputs[Participant.P1];
      const keygen_2_ed25519 =
        ed25519KeygenResult.keygen_outputs[Participant.P1];

      const keygenRequest: KeygenRequestV2 = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2_secp256k1: {
          public_key: keygen_2_secp256k1.public_key,
          private_share: keygen_2_secp256k1.private_share,
        },
        keygen_2_ed25519: {
          key_package: keygen_2_ed25519.key_package,
          public_key_package: keygen_2_ed25519.public_key_package,
          identifier: [...keygen_2_ed25519.identifier],
          public_key: [...ed25519KeygenResult.public_key],
        },
      };

      const keygenResponse = await runKeygenV2(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygenV2 should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("WALLET_ALREADY_EXISTS");
    });

    it("run keygenV2 failure - ed25519 wallet already exists", async () => {
      const secp256k1KeygenResult = napiRunKeygenClientCentralized();
      const ed25519KeygenResult = runKeygenCentralizedEd25519();

      const createUserRes = await createUser(pool, "test@test.com", "google");
      if (createUserRes.success === false) {
        console.error(createUserRes.err);
        throw new Error("Failed to create user");
      }

      const ed25519PublicKey = Buffer.from(ed25519KeygenResult.public_key);
      await createWallet(pool, {
        user_id: createUserRes.data.user_id,
        curve_type: "ed25519",
        public_key: ed25519PublicKey,
        enc_tss_share: Buffer.from("test"),
        status: "ACTIVE" as WalletStatus,
        sss_threshold: sssThreshold,
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygen_2_secp256k1 =
        secp256k1KeygenResult.keygen_outputs[Participant.P1];
      const keygen_2_ed25519 =
        ed25519KeygenResult.keygen_outputs[Participant.P1];

      const keygenRequest: KeygenRequestV2 = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2_secp256k1: {
          public_key: keygen_2_secp256k1.public_key,
          private_share: keygen_2_secp256k1.private_share,
        },
        keygen_2_ed25519: {
          key_package: keygen_2_ed25519.key_package,
          public_key_package: keygen_2_ed25519.public_key_package,
          identifier: [...keygen_2_ed25519.identifier],
          public_key: [...ed25519KeygenResult.public_key],
        },
      };

      const keygenResponse = await runKeygenV2(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygenV2 should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("WALLET_ALREADY_EXISTS");
    });

    it("run keygenV2 failure - duplicate secp256k1 public key", async () => {
      const secp256k1KeygenResult = napiRunKeygenClientCentralized();
      const ed25519KeygenResult = runKeygenCentralizedEd25519();

      const publicKey =
        secp256k1KeygenResult.keygen_outputs[Participant.P1].public_key;
      await createWallet(pool, {
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKey, "hex"),
        enc_tss_share: Buffer.from(
          secp256k1KeygenResult.keygen_outputs[Participant.P1].private_share,
        ),
        status: "ACTIVE" as WalletStatus,
        sss_threshold: sssThreshold,
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygen_2_secp256k1 =
        secp256k1KeygenResult.keygen_outputs[Participant.P1];
      const keygen_2_ed25519 =
        ed25519KeygenResult.keygen_outputs[Participant.P1];

      const keygenRequest: KeygenRequestV2 = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2_secp256k1: {
          public_key: keygen_2_secp256k1.public_key,
          private_share: keygen_2_secp256k1.private_share,
        },
        keygen_2_ed25519: {
          key_package: keygen_2_ed25519.key_package,
          public_key_package: keygen_2_ed25519.public_key_package,
          identifier: [...keygen_2_ed25519.identifier],
          public_key: [...ed25519KeygenResult.public_key],
        },
      };

      const keygenResponse = await runKeygenV2(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygenV2 should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("DUPLICATE_PUBLIC_KEY");
    });

    it("run keygenV2 failure - duplicate ed25519 public key", async () => {
      const secp256k1KeygenResult = napiRunKeygenClientCentralized();
      const ed25519KeygenResult = runKeygenCentralizedEd25519();

      const ed25519PublicKey = Buffer.from(ed25519KeygenResult.public_key);
      await createWallet(pool, {
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        curve_type: "ed25519",
        public_key: ed25519PublicKey,
        enc_tss_share: Buffer.from("test"),
        status: "ACTIVE" as WalletStatus,
        sss_threshold: sssThreshold,
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygen_2_secp256k1 =
        secp256k1KeygenResult.keygen_outputs[Participant.P1];
      const keygen_2_ed25519 =
        ed25519KeygenResult.keygen_outputs[Participant.P1];

      const keygenRequest: KeygenRequestV2 = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2_secp256k1: {
          public_key: keygen_2_secp256k1.public_key,
          private_share: keygen_2_secp256k1.private_share,
        },
        keygen_2_ed25519: {
          key_package: keygen_2_ed25519.key_package,
          public_key_package: keygen_2_ed25519.public_key_package,
          identifier: [...keygen_2_ed25519.identifier],
          public_key: [...ed25519KeygenResult.public_key],
        },
      };

      const keygenResponse = await runKeygenV2(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygenV2 should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("DUPLICATE_PUBLIC_KEY");
    });

    it("run keygenV2 failure - keyshare node insufficient for secp256k1", async () => {
      const secp256k1KeygenResult = napiRunKeygenClientCentralized();
      const ed25519KeygenResult = runKeygenCentralizedEd25519();

      (mockCheckKeyShareFromKSNodesV2 as any).mockResolvedValue({
        success: true,
        data: {
          secp256k1: { nodeIds: [] },
          ed25519: { nodeIds: ["node1", "node2"] },
        },
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygen_2_secp256k1 =
        secp256k1KeygenResult.keygen_outputs[Participant.P1];
      const keygen_2_ed25519 =
        ed25519KeygenResult.keygen_outputs[Participant.P1];

      const keygenRequest: KeygenRequestV2 = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2_secp256k1: {
          public_key: keygen_2_secp256k1.public_key,
          private_share: keygen_2_secp256k1.private_share,
        },
        keygen_2_ed25519: {
          key_package: keygen_2_ed25519.key_package,
          public_key_package: keygen_2_ed25519.public_key_package,
          identifier: [...keygen_2_ed25519.identifier],
          public_key: [...ed25519KeygenResult.public_key],
        },
      };

      const keygenResponse = await runKeygenV2(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygenV2 should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("KEYSHARE_NODE_INSUFFICIENT");
      expect(keygenResponse.msg).toContain("no active ks nodes for secp256k1");
    });

    it("run keygenV2 failure - keyshare node insufficient for ed25519", async () => {
      const secp256k1KeygenResult = napiRunKeygenClientCentralized();
      const ed25519KeygenResult = runKeygenCentralizedEd25519();

      (mockCheckKeyShareFromKSNodesV2 as any).mockResolvedValue({
        success: true,
        data: {
          secp256k1: { nodeIds: ["node1", "node2"] },
          ed25519: { nodeIds: [] },
        },
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygen_2_secp256k1 =
        secp256k1KeygenResult.keygen_outputs[Participant.P1];
      const keygen_2_ed25519 =
        ed25519KeygenResult.keygen_outputs[Participant.P1];

      const keygenRequest: KeygenRequestV2 = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2_secp256k1: {
          public_key: keygen_2_secp256k1.public_key,
          private_share: keygen_2_secp256k1.private_share,
        },
        keygen_2_ed25519: {
          key_package: keygen_2_ed25519.key_package,
          public_key_package: keygen_2_ed25519.public_key_package,
          identifier: [...keygen_2_ed25519.identifier],
          public_key: [...ed25519KeygenResult.public_key],
        },
      };

      const keygenResponse = await runKeygenV2(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygenV2 should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("KEYSHARE_NODE_INSUFFICIENT");
      expect(keygenResponse.msg).toContain("no active ks nodes for ed25519");
    });

    it("run keygenV2 failure - keyshare node check fails", async () => {
      const secp256k1KeygenResult = napiRunKeygenClientCentralized();
      const ed25519KeygenResult = runKeygenCentralizedEd25519();

      (mockCheckKeyShareFromKSNodesV2 as any).mockResolvedValue({
        success: false,
        code: "KEYSHARE_NODE_INSUFFICIENT",
        msg: "keyshare node insufficient error",
      });

      const jwtConfig = {
        secret: "test-jwt-secret",
        expires_in: "1h",
      };

      const keygen_2_secp256k1 =
        secp256k1KeygenResult.keygen_outputs[Participant.P1];
      const keygen_2_ed25519 =
        ed25519KeygenResult.keygen_outputs[Participant.P1];

      const keygenRequest: KeygenRequestV2 = {
        auth_type: "google",
        user_identifier: "test@test.com",
        email: "test@test.com",
        keygen_2_secp256k1: {
          public_key: keygen_2_secp256k1.public_key,
          private_share: keygen_2_secp256k1.private_share,
        },
        keygen_2_ed25519: {
          key_package: keygen_2_ed25519.key_package,
          public_key_package: keygen_2_ed25519.public_key_package,
          identifier: [...keygen_2_ed25519.identifier],
          public_key: [...ed25519KeygenResult.public_key],
        },
      };

      const keygenResponse = await runKeygenV2(
        pool,
        jwtConfig,
        keygenRequest,
        TEMP_ENC_SECRET,
      );
      if (keygenResponse.success === true) {
        throw new Error("keygenV2 should fail");
      }
      expect(keygenResponse.success).toEqual(false);
      expect(keygenResponse.code).toEqual("KEYSHARE_NODE_INSUFFICIENT");
      expect(keygenResponse.msg).toEqual("keyshare node insufficient error");
    });
  });
});
