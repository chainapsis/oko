// TODO: refactor this tests @chemonoworld

// import { jest } from "@jest/globals";
// import { Pool } from "pg";
// import type {
//   SignEd25519Round1Request,
//   SignEd25519Round2Request,
//   SignEd25519AggregateRequest,
// } from "@oko-wallet/oko-types/tss";
// import type { TeddsaKeygenOutput } from "@oko-wallet/teddsa-interface";
// import { Participant } from "@oko-wallet/teddsa-interface";
// import {
//   runKeygenCentralizedEd25519,
//   runSignRound1Ed25519 as clientRunSignRound1Ed25519,
//   runSignRound2Ed25519 as clientRunSignRound2Ed25519,
//   runAggregateEd25519 as clientRunAggregateEd25519,
//   runVerifyEd25519,
// } from "@oko-wallet/teddsa-addon/src/server";
// import { createPgConn } from "@oko-wallet/postgres-lib";
// import type { WalletStatus } from "@oko-wallet/oko-types/wallets";
// import { insertKSNode } from "@oko-wallet/oko-pg-interface/ks_nodes";
// import { createWallet } from "@oko-wallet/oko-pg-interface/oko_wallets";
// import { createUser } from "@oko-wallet/oko-pg-interface/oko_users";
// import { insertKeyShareNodeMeta } from "@oko-wallet/oko-pg-interface/key_share_node_meta";
// import { insertCustomer } from "@oko-wallet/oko-pg-interface/customers";
// import { encryptDataAsync } from "@oko-wallet/crypto-js/node";

// import { resetPgDatabase } from "@oko-wallet-tss-api/testing/database";
// import { testPgConfig } from "@oko-wallet-tss-api/database/test_config";
// import {
//   runSignEd25519Round1,
//   runSignEd25519Round2,
//   runSignEd25519Aggregate,
// } from "@oko-wallet-tss-api/api/sign_ed25519";
// import { TEMP_ENC_SECRET } from "@oko-wallet-tss-api/api/utils";

// const SSS_THRESHOLD = 2;
// const TEST_EMAIL = "test-ed25519@test.com";

// interface TestSetupResult {
//   pool: Pool;
//   walletId: string;
//   customerId: string;
//   clientKeygenOutput: TeddsaKeygenOutput;
//   serverKeygenOutput: TeddsaKeygenOutput;
// }

// async function setUpKSNodes(pool: Pool): Promise<string[]> {
//   const ksNodeNames = ["ksNode1", "ksNode2"];
//   const ksNodeIds = [];
//   const createKSNodesRes = await Promise.all(
//     ksNodeNames.map((ksNodeName) =>
//       insertKSNode(pool, ksNodeName, `http://test.com/${ksNodeName}`),
//     ),
//   );
//   for (const res of createKSNodesRes) {
//     if (res.success === false) {
//       throw new Error("Failed to create ks nodes");
//     }
//     ksNodeIds.push(res.data.node_id);
//   }
//   return ksNodeIds;
// }

// async function setUpEd25519Wallet(pool: Pool): Promise<TestSetupResult> {
//   // Generate keys using centralized keygen
//   const keygenResult = runKeygenCentralizedEd25519();
//   const clientKeygenOutput = keygenResult.keygen_outputs[Participant.P0];
//   const serverKeygenOutput = keygenResult.keygen_outputs[Participant.P1];

//   // Set up KS nodes and metadata
//   const ksNodeIds = await setUpKSNodes(pool);
//   await insertKeyShareNodeMeta(pool, {
//     sss_threshold: SSS_THRESHOLD,
//   });

//   // Create customer
//   const customerId = crypto.randomUUID();
//   const insertCustomerRes = await insertCustomer(pool, {
//     customer_id: customerId,
//     label: "test-customer",
//     status: "ACTIVE",
//     url: null,
//     logo_url: null,
//     theme: "dark",
//   });
//   if (insertCustomerRes.success === false) {
//     throw new Error(`Failed to create customer: ${insertCustomerRes.err}`);
//   }

//   // Create user
//   const createUserRes = await createUser(pool, TEST_EMAIL, "google");
//   if (createUserRes.success === false) {
//     throw new Error(`Failed to create user: ${createUserRes.err}`);
//   }
//   const userId = createUserRes.data.user_id;

//   // Encrypt server key package
//   const serverKeyPackageJson = JSON.stringify(serverKeygenOutput);
//   const encryptedShare = await encryptDataAsync(
//     serverKeyPackageJson,
//     TEMP_ENC_SECRET,
//   );

//   // Create Ed25519 wallet
//   const createWalletRes = await createWallet(pool, {
//     user_id: userId,
//     curve_type: "ed25519",
//     public_key: Buffer.from(keygenResult.public_key),
//     enc_tss_share: Buffer.from(encryptedShare, "utf-8"),
//     sss_threshold: SSS_THRESHOLD,
//     status: "ACTIVE" as WalletStatus,
//   });
//   if (createWalletRes.success === false) {
//     throw new Error(`Failed to create wallet: ${createWalletRes.err}`);
//   }
//   const walletId = createWalletRes.data.wallet_id;

//   return {
//     pool,
//     walletId,
//     customerId,
//     clientKeygenOutput,
//     serverKeygenOutput,
//   };
// }

// describe("Ed25519 Signing", () => {
//   let pool: Pool;

//   beforeAll(async () => {
//     const config = testPgConfig;
//     const createPostgresRes = await createPgConn({
//       database: config.database,
//       host: config.host,
//       password: config.password,
//       user: config.user,
//       port: config.port,
//       ssl: config.ssl,
//     });

//     if (createPostgresRes.success === false) {
//       console.error(createPostgresRes.err);
//       throw new Error("Failed to create postgres database");
//     }

//     pool = createPostgresRes.data;
//   });

//   afterAll(async () => {
//     await pool.end();
//   });

//   beforeEach(async () => {
//     await resetPgDatabase(pool);
//   });

//   describe("runSignEd25519Round1", () => {
//     it("should generate commitments successfully", async () => {
//       const { walletId, customerId } = await setUpEd25519Wallet(pool);
//       const testMessage = new TextEncoder().encode("Test message");

//       const request: SignEd25519Round1Request = {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         customer_id: customerId,
//         msg: [...testMessage],
//       };

//       const result = await runSignEd25519Round1(pool, TEMP_ENC_SECRET, request);

//       expect(result.success).toBe(true);
//       if (result.success) {
//         expect(result.data.session_id).toBeDefined();
//         expect(result.data.commitments_0).toBeDefined();
//         expect(result.data.commitments_0.identifier).toBeDefined();
//         expect(result.data.commitments_0.commitments).toBeDefined();
//         expect(Array.isArray(result.data.commitments_0.identifier)).toBe(true);
//         expect(Array.isArray(result.data.commitments_0.commitments)).toBe(true);
//       }
//     });

//     it("should fail with invalid email", async () => {
//       const { walletId, customerId } = await setUpEd25519Wallet(pool);
//       const testMessage = new TextEncoder().encode("Test message");

//       const request: SignEd25519Round1Request = {
//         email: "wrong@test.com",
//         wallet_id: walletId,
//         customer_id: customerId,
//         msg: [...testMessage],
//       };

//       const result = await runSignEd25519Round1(pool, TEMP_ENC_SECRET, request);

//       expect(result.success).toBe(false);
//       if (!result.success) {
//         expect(result.code).toBe("UNAUTHORIZED");
//       }
//     });

//     it("should fail with invalid wallet_id", async () => {
//       const { customerId } = await setUpEd25519Wallet(pool);
//       const testMessage = new TextEncoder().encode("Test message");

//       const request: SignEd25519Round1Request = {
//         email: TEST_EMAIL,
//         wallet_id: "00000000-0000-0000-0000-000000000000",
//         customer_id: customerId,
//         msg: [...testMessage],
//       };

//       const result = await runSignEd25519Round1(pool, TEMP_ENC_SECRET, request);

//       expect(result.success).toBe(false);
//       if (!result.success) {
//         expect(result.code).toBe("UNAUTHORIZED");
//       }
//     });
//   });

//   describe("runSignEd25519Round2", () => {
//     it("should generate signature share successfully", async () => {
//       const { walletId, customerId, clientKeygenOutput } =
//         await setUpEd25519Wallet(pool);
//       const testMessage = new TextEncoder().encode("Test message for Ed25519");

//       // Round 1: Get server commitments
//       const round1Request: SignEd25519Round1Request = {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         customer_id: customerId,
//         msg: [...testMessage],
//       };
//       const round1Result = await runSignEd25519Round1(
//         pool,
//         TEMP_ENC_SECRET,
//         round1Request,
//       );
//       expect(round1Result.success).toBe(true);
//       if (!round1Result.success) throw new Error("Round 1 failed");

//       // Client generates their round 1 output
//       const clientRound1 = clientRunSignRound1Ed25519(
//         new Uint8Array(clientKeygenOutput.key_package),
//       );

//       // Round 2: Get server signature share
//       const round2Request: SignEd25519Round2Request = {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         session_id: round1Result.data.session_id,
//         commitments_1: {
//           identifier: clientRound1.identifier,
//           commitments: clientRound1.commitments,
//         },
//       };
//       const round2Result = await runSignEd25519Round2(
//         pool,
//         TEMP_ENC_SECRET,
//         round2Request,
//       );

//       expect(round2Result.success).toBe(true);
//       if (round2Result.success) {
//         expect(round2Result.data.signature_share_0).toBeDefined();
//         expect(round2Result.data.signature_share_0.identifier).toBeDefined();
//         expect(
//           round2Result.data.signature_share_0.signature_share,
//         ).toBeDefined();
//       }
//     });

//     it("should fail with invalid session_id", async () => {
//       const { walletId, customerId, clientKeygenOutput } =
//         await setUpEd25519Wallet(pool);
//       const testMessage = new TextEncoder().encode("Test message");

//       const clientRound1 = clientRunSignRound1Ed25519(
//         new Uint8Array(clientKeygenOutput.key_package),
//       );

//       const round2Request: SignEd25519Round2Request = {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         session_id: "00000000-0000-0000-0000-000000000000",
//         commitments_1: {
//           identifier: clientRound1.identifier,
//           commitments: clientRound1.commitments,
//         },
//       };
//       const result = await runSignEd25519Round2(
//         pool,
//         TEMP_ENC_SECRET,
//         round2Request,
//       );

//       expect(result.success).toBe(false);
//       if (!result.success) {
//         expect(result.code).toBe("INVALID_TSS_SESSION");
//       }
//     });

//     it("should fail when Round2 is called twice (duplicate call prevention)", async () => {
//       const { walletId, customerId, clientKeygenOutput } =
//         await setUpEd25519Wallet(pool);
//       const testMessage = new TextEncoder().encode("Test message");

//       // Round 1: Get server commitments
//       const round1Request: SignEd25519Round1Request = {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         customer_id: customerId,
//         msg: [...testMessage],
//       };
//       const round1Result = await runSignEd25519Round1(
//         pool,
//         TEMP_ENC_SECRET,
//         round1Request,
//       );
//       expect(round1Result.success).toBe(true);
//       if (!round1Result.success) throw new Error("Round 1 failed");

//       const clientRound1 = clientRunSignRound1Ed25519(
//         new Uint8Array(clientKeygenOutput.key_package),
//       );

//       // First Round 2 call - should succeed
//       const round2Request: SignEd25519Round2Request = {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         session_id: round1Result.data.session_id,
//         commitments_1: {
//           identifier: clientRound1.identifier,
//           commitments: clientRound1.commitments,
//         },
//       };
//       const round2Result = await runSignEd25519Round2(
//         pool,
//         TEMP_ENC_SECRET,
//         round2Request,
//       );
//       expect(round2Result.success).toBe(true);

//       // Second Round 2 call with same session - should fail
//       const duplicateRound2Result = await runSignEd25519Round2(
//         pool,
//         TEMP_ENC_SECRET,
//         round2Request,
//       );

//       expect(duplicateRound2Result.success).toBe(false);
//       if (!duplicateRound2Result.success) {
//         expect(duplicateRound2Result.code).toBe("INVALID_TSS_SESSION");
//       }
//     });

//     it("should fail when using COMPLETED session for Round2", async () => {
//       const { walletId, customerId, clientKeygenOutput } =
//         await setUpEd25519Wallet(pool);
//       const testMessage = new TextEncoder().encode("Test message for signing");

//       // Complete full signing flow first
//       const round1Res = await runSignEd25519Round1(pool, TEMP_ENC_SECRET, {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         customer_id: customerId,
//         msg: [...testMessage],
//       });
//       expect(round1Res.success).toBe(true);
//       if (!round1Res.success) throw new Error("Round 1 failed");

//       const clientR1 = clientRunSignRound1Ed25519(
//         new Uint8Array(clientKeygenOutput.key_package),
//       );

//       const allCommitments = [
//         { identifier: clientR1.identifier, commitments: clientR1.commitments },
//         {
//           identifier: round1Res.data.commitments_0.identifier,
//           commitments: round1Res.data.commitments_0.commitments,
//         },
//       ].sort((a, b) => (a.identifier[0] ?? 0) - (b.identifier[0] ?? 0));

//       const round2Res = await runSignEd25519Round2(pool, TEMP_ENC_SECRET, {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         session_id: round1Res.data.session_id,
//         commitments_1: {
//           identifier: clientR1.identifier,
//           commitments: clientR1.commitments,
//         },
//       });
//       expect(round2Res.success).toBe(true);
//       if (!round2Res.success) throw new Error("Round 2 failed");

//       const clientR2 = clientRunSignRound2Ed25519(
//         testMessage,
//         new Uint8Array(clientKeygenOutput.key_package),
//         new Uint8Array(clientR1.nonces),
//         allCommitments,
//       );

//       const allShares = [
//         {
//           identifier: clientR2.identifier,
//           signature_share: clientR2.signature_share,
//         },
//         {
//           identifier: round2Res.data.signature_share_0.identifier,
//           signature_share: round2Res.data.signature_share_0.signature_share,
//         },
//       ].sort((a, b) => (a.identifier[0] ?? 0) - (b.identifier[0] ?? 0));

//       // Complete the signing with Aggregate
//       const aggRes = await runSignEd25519Aggregate(pool, TEMP_ENC_SECRET, {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         msg: [...testMessage],
//         all_commitments: allCommitments,
//         all_signature_shares: allShares,
//       });
//       expect(aggRes.success).toBe(true);

//       // Now try to use the COMPLETED session for Round2 - should fail
//       const newClientR1 = clientRunSignRound1Ed25519(
//         new Uint8Array(clientKeygenOutput.key_package),
//       );
//       const replayRound2Res = await runSignEd25519Round2(
//         pool,
//         TEMP_ENC_SECRET,
//         {
//           email: TEST_EMAIL,
//           wallet_id: walletId,
//           session_id: round1Res.data.session_id, // Reusing completed session
//           commitments_1: {
//             identifier: newClientR1.identifier,
//             commitments: newClientR1.commitments,
//           },
//         },
//       );

//       expect(replayRound2Res.success).toBe(false);
//       if (!replayRound2Res.success) {
//         expect(replayRound2Res.code).toBe("INVALID_TSS_SESSION");
//       }
//     });
//   });

//   describe("runSignEd25519Aggregate", () => {
//     it("should aggregate signatures and produce valid signature", async () => {
//       const { walletId, customerId, clientKeygenOutput, serverKeygenOutput } =
//         await setUpEd25519Wallet(pool);
//       const testMessage = new TextEncoder().encode("Test message for signing");

//       // Round 1: Both parties generate commitments
//       const round1Request: SignEd25519Round1Request = {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         customer_id: customerId,
//         msg: [...testMessage],
//       };
//       const serverRound1Result = await runSignEd25519Round1(
//         pool,
//         TEMP_ENC_SECRET,
//         round1Request,
//       );
//       expect(serverRound1Result.success).toBe(true);
//       if (!serverRound1Result.success) throw new Error("Server Round 1 failed");

//       const clientRound1 = clientRunSignRound1Ed25519(
//         new Uint8Array(clientKeygenOutput.key_package),
//       );

//       // Collect all commitments (sorted by identifier)
//       const allCommitments = [
//         {
//           identifier: clientRound1.identifier,
//           commitments: clientRound1.commitments,
//         },
//         {
//           identifier: serverRound1Result.data.commitments_0.identifier,
//           commitments: serverRound1Result.data.commitments_0.commitments,
//         },
//       ].sort((a, b) => (a.identifier[0] ?? 0) - (b.identifier[0] ?? 0));

//       // Round 2: Both parties generate signature shares
//       const round2Request: SignEd25519Round2Request = {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         session_id: serverRound1Result.data.session_id,
//         commitments_1: {
//           identifier: clientRound1.identifier,
//           commitments: clientRound1.commitments,
//         },
//       };
//       const serverRound2Result = await runSignEd25519Round2(
//         pool,
//         TEMP_ENC_SECRET,
//         round2Request,
//       );
//       expect(serverRound2Result.success).toBe(true);
//       if (!serverRound2Result.success) throw new Error("Server Round 2 failed");

//       const clientRound2 = clientRunSignRound2Ed25519(
//         testMessage,
//         new Uint8Array(clientKeygenOutput.key_package),
//         new Uint8Array(clientRound1.nonces),
//         allCommitments,
//       );

//       // Collect all signature shares (sorted by identifier)
//       const allSignatureShares = [
//         {
//           identifier: clientRound2.identifier,
//           signature_share: clientRound2.signature_share,
//         },
//         {
//           identifier: serverRound2Result.data.signature_share_0.identifier,
//           signature_share:
//             serverRound2Result.data.signature_share_0.signature_share,
//         },
//       ].sort((a, b) => (a.identifier[0] ?? 0) - (b.identifier[0] ?? 0));

//       // Aggregate
//       const aggregateRequest: SignEd25519AggregateRequest = {
//         email: TEST_EMAIL,
//         wallet_id: walletId,
//         msg: [...testMessage],
//         all_commitments: allCommitments,
//         all_signature_shares: allSignatureShares,
//       };
//       const aggregateResult = await runSignEd25519Aggregate(
//         pool,
//         TEMP_ENC_SECRET,
//         aggregateRequest,
//       );

//       expect(aggregateResult.success).toBe(true);
//       if (aggregateResult.success) {
//         expect(aggregateResult.data.signature).toBeDefined();
//         expect(aggregateResult.data.signature.length).toBe(64);

//         // Verify the signature
//         const isValid = runVerifyEd25519(
//           testMessage,
//           new Uint8Array(aggregateResult.data.signature),
//           new Uint8Array(clientKeygenOutput.public_key_package),
//         );
//         expect(isValid).toBe(true);
//       }
//     });

//     it("should fail with wrong wallet type", async () => {
//       // Create a secp256k1 wallet instead of ed25519
//       await setUpKSNodes(pool);
//       await insertKeyShareNodeMeta(pool, { sss_threshold: SSS_THRESHOLD });

//       const createUserRes = await createUser(pool, TEST_EMAIL, "google");
//       if (!createUserRes.success) throw new Error("Failed to create user");

//       const encryptedShare = await encryptDataAsync(
//         JSON.stringify({ private_share: "test", public_key: "test" }),
//         TEMP_ENC_SECRET,
//       );

//       const createWalletRes = await createWallet(pool, {
//         user_id: createUserRes.data.user_id,
//         curve_type: "secp256k1",
//         public_key: Buffer.from("03" + "00".repeat(32), "hex"),
//         enc_tss_share: Buffer.from(encryptedShare, "utf-8"),
//         sss_threshold: SSS_THRESHOLD,
//         status: "ACTIVE" as WalletStatus,
//       });
//       if (!createWalletRes.success) throw new Error("Failed to create wallet");

//       const aggregateRequest: SignEd25519AggregateRequest = {
//         email: TEST_EMAIL,
//         wallet_id: createWalletRes.data.wallet_id,
//         msg: [1, 2, 3],
//         all_commitments: [],
//         all_signature_shares: [],
//       };

//       const result = await runSignEd25519Aggregate(
//         pool,
//         TEMP_ENC_SECRET,
//         aggregateRequest,
//       );

//       expect(result.success).toBe(false);
//       if (!result.success) {
//         expect(result.code).toBe("INVALID_WALLET_TYPE");
//       }
//     });

//     it("should fail with invalid wallet_id", async () => {
//       await setUpEd25519Wallet(pool);

//       const aggregateRequest: SignEd25519AggregateRequest = {
//         email: TEST_EMAIL,
//         wallet_id: "00000000-0000-0000-0000-000000000000",
//         msg: [1, 2, 3],
//         all_commitments: [],
//         all_signature_shares: [],
//       };

//       const result = await runSignEd25519Aggregate(
//         pool,
//         TEMP_ENC_SECRET,
//         aggregateRequest,
//       );

//       expect(result.success).toBe(false);
//       if (!result.success) {
//         expect(result.code).toBe("UNAUTHORIZED");
//       }
//     });
//   });

//   describe("Full signing flow", () => {
//     it("should complete full signing flow with valid signature verification", async () => {
//       const { walletId, customerId, clientKeygenOutput } =
//         await setUpEd25519Wallet(pool);
//       const messages = [
//         "Hello, Solana!",
//         "Transaction data",
//         "Another message to sign",
//       ];

//       for (const msgStr of messages) {
//         const message = new TextEncoder().encode(msgStr);

//         // Round 1
//         const round1Res = await runSignEd25519Round1(pool, TEMP_ENC_SECRET, {
//           email: TEST_EMAIL,
//           wallet_id: walletId,
//           customer_id: customerId,
//           msg: [...message],
//         });
//         expect(round1Res.success).toBe(true);
//         if (!round1Res.success) continue;

//         const clientR1 = clientRunSignRound1Ed25519(
//           new Uint8Array(clientKeygenOutput.key_package),
//         );

//         const allCommitments = [
//           {
//             identifier: clientR1.identifier,
//             commitments: clientR1.commitments,
//           },
//           {
//             identifier: round1Res.data.commitments_0.identifier,
//             commitments: round1Res.data.commitments_0.commitments,
//           },
//         ].sort((a, b) => (a.identifier[0] ?? 0) - (b.identifier[0] ?? 0));

//         // Round 2
//         const round2Res = await runSignEd25519Round2(pool, TEMP_ENC_SECRET, {
//           email: TEST_EMAIL,
//           wallet_id: walletId,
//           session_id: round1Res.data.session_id,
//           commitments_1: {
//             identifier: clientR1.identifier,
//             commitments: clientR1.commitments,
//           },
//         });
//         expect(round2Res.success).toBe(true);
//         if (!round2Res.success) continue;

//         const clientR2 = clientRunSignRound2Ed25519(
//           message,
//           new Uint8Array(clientKeygenOutput.key_package),
//           new Uint8Array(clientR1.nonces),
//           allCommitments,
//         );

//         const allShares = [
//           {
//             identifier: clientR2.identifier,
//             signature_share: clientR2.signature_share,
//           },
//           {
//             identifier: round2Res.data.signature_share_0.identifier,
//             signature_share: round2Res.data.signature_share_0.signature_share,
//           },
//         ].sort((a, b) => (a.identifier[0] ?? 0) - (b.identifier[0] ?? 0));

//         // Aggregate
//         const aggRes = await runSignEd25519Aggregate(pool, TEMP_ENC_SECRET, {
//           email: TEST_EMAIL,
//           wallet_id: walletId,
//           msg: [...message],
//           all_commitments: allCommitments,
//           all_signature_shares: allShares,
//         });
//         expect(aggRes.success).toBe(true);
//         if (!aggRes.success) continue;

//         // Verify
//         const isValid = runVerifyEd25519(
//           message,
//           new Uint8Array(aggRes.data.signature),
//           new Uint8Array(clientKeygenOutput.public_key_package),
//         );
//         expect(isValid).toBe(true);
//       }
//     });
//   });
// });
