#!/usr/bin/env node
/**
 * CLI Tool for ECDSA Key Management
 * Commands:
 * - generate: Generate a new ECDSA keypair
 * - rotate: Rotate the active keypair
 * - show-public: Show the currently active public key
 */

import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { generateECDSAKeypair, isValidPublicKey } from "../crypto/ecdsa";
import {
  encryptData,
  serializeEncrypted,
  generateEncryptionKey,
} from "../crypto/encryption";
import {
  insertECDSAKeypair,
  getActiveECDSAKeypair,
  listECDSAKeypairs,
  rotateECDSAKeypair,
} from "@oko-wallet/oko-pg-interface/ecdsa_keypairs";

interface PgDatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

interface CLIConfig {
  database: PgDatabaseConfig;
  encryptionKeyPath: string;
}

/**
 * Load configuration from environment or config file
 */
function loadConfig(): CLIConfig {
  return {
    database: {
      host: process.env.PGHOST || "localhost",
      port: parseInt(process.env.PGPORT || "5432"),
      database: process.env.PGDATABASE || "oko_wallet",
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "",
      ssl: process.env.PGSSL === "true",
    },
    encryptionKeyPath: process.env.ENCRYPTION_KEY_PATH || "./.encryption-key",
  };
}

/**
 * Get or generate encryption key
 */
function getEncryptionKey(keyPath: string): Buffer {
  try {
    // Try to read existing key
    if (fs.existsSync(keyPath)) {
      const keyHex = fs.readFileSync(keyPath, "utf8").trim();
      return Buffer.from(keyHex, "hex");
    }

    // Generate new key
    console.log("No encryption key found. Generating new key...");
    const key = generateEncryptionKey();

    // Save key to file (ensure directory exists)
    const dir = path.dirname(keyPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(keyPath, key.toString("hex"), { mode: 0o600 });
    console.log(`Encryption key saved to: ${keyPath}`);
    console.log("⚠️  IMPORTANT: Back up this key in a secure location!");

    return key;
  } catch (error) {
    console.error("Failed to get encryption key:", error);
    process.exit(1);
  }
}

/**
 * Command: Generate a new ECDSA keypair
 */
async function cmdGenerate(
  pool: Pool,
  encryptionKey: Buffer,
  options: { backupOld?: boolean },
) {
  try {
    console.log("Generating new ECDSA keypair...");

    // Check if there's already an active keypair
    const activeResult = await getActiveECDSAKeypair(pool);
    if (!activeResult.success) {
      console.error("Error checking for active keypair:", activeResult.err);
      process.exit(1);
    }

    if (activeResult.data) {
      console.log("⚠️  Warning: There is already an active keypair:");
      console.log(`   Public Key: ${activeResult.data.public_key}`);
      console.log(
        `   Created At: ${activeResult.data.created_at.toISOString()}`,
      );
      console.log("");
      console.log('Use "ecdsa-keys rotate" to rotate keys instead.');
      process.exit(1);
    }

    // Generate new keypair
    const keypairResult = generateECDSAKeypair();
    if (!keypairResult.success) {
      console.error("Failed to generate keypair:", keypairResult.err);
      process.exit(1);
    }

    const keypair = keypairResult.data;

    // Validate generated public key
    if (!isValidPublicKey(keypair.publicKey)) {
      console.error("Generated public key is invalid!");
      process.exit(1);
    }

    // Encrypt private key
    const encrypted = encryptData(keypair.privateKey.toHex(), encryptionKey);
    const encryptedPrivateKey = serializeEncrypted(encrypted);

    // Insert into database
    const insertResult = await insertECDSAKeypair(
      pool,
      encryptedPrivateKey,
      keypair.publicKey,
    );

    if (!insertResult.success) {
      console.error("Failed to insert keypair:", insertResult.err);
      process.exit(1);
    }

    console.log("✓ ECDSA keypair generated successfully!");
    console.log("");
    console.log("Public Key:", keypair.publicKey.toHex());
    console.log("Keypair ID:", insertResult.data);
    console.log("");
    console.log("Private key has been encrypted and stored in the database.");
    console.log("");
  } catch (error) {
    console.error("Failed to generate keypair:", error);
    process.exit(1);
  }
}

/**
 * Command: Rotate ECDSA keypair
 */
async function cmdRotate(
  pool: Pool,
  encryptionKey: Buffer,
  options: { backupOld?: boolean },
) {
  try {
    console.log("Rotating ECDSA keypair...");

    // Get current active keypair
    const activeResult = await getActiveECDSAKeypair(pool);
    if (!activeResult.success) {
      console.error("Error getting active keypair:", activeResult.err);
      process.exit(1);
    }

    if (!activeResult.data) {
      console.error(
        'No active keypair found. Use "ecdsa-keys generate" first.',
      );
      process.exit(1);
    }

    const oldKeypair = activeResult.data;
    console.log("Current active keypair:");
    console.log(`  Public Key: ${oldKeypair.public_key}`);
    console.log(`  Created At: ${oldKeypair.created_at.toISOString()}`);
    console.log("");

    // Generate new keypair
    console.log("Generating new keypair...");
    const keypairResult = generateECDSAKeypair();
    if (!keypairResult.success) {
      console.error("Failed to generate keypair:", keypairResult.err);
      process.exit(1);
    }

    const newKeypair = keypairResult.data;

    // Encrypt private key
    const encrypted = encryptData(newKeypair.privateKey.toHex(), encryptionKey);
    const encryptedPrivateKey = serializeEncrypted(encrypted);

    // Insert new keypair (initially inactive)
    const insertResult = await insertECDSAKeypair(
      pool,
      encryptedPrivateKey,
      newKeypair.publicKey,
    );

    if (!insertResult.success) {
      console.error("Failed to insert new keypair:", insertResult.err);
      process.exit(1);
    }

    const newKeypairId = insertResult.data;

    // Rotate: deactivate old, activate new
    const rotateResult = await rotateECDSAKeypair(
      pool,
      oldKeypair.id,
      newKeypairId,
    );

    if (!rotateResult.success) {
      console.error("Failed to rotate keypair:", rotateResult.err);
      process.exit(1);
    }

    console.log("✓ ECDSA keypair rotated successfully!");
    console.log("");
    console.log("New active public key:", newKeypair.publicKey.toHex());
    console.log("New keypair ID:", newKeypairId);
    console.log("");
    console.log(
      "Old keypair has been deactivated (but kept in database for audit).",
    );
    console.log("");
  } catch (error) {
    console.error("Failed to rotate keypair:", error);
    process.exit(1);
  }
}

/**
 * Command: Show active public key
 */
async function cmdShowPublic(pool: Pool) {
  try {
    const activeResult = await getActiveECDSAKeypair(pool);

    if (!activeResult.success) {
      console.error("Error getting active keypair:", activeResult.err);
      process.exit(1);
    }

    if (!activeResult.data) {
      console.log("No active ECDSA keypair found.");
      console.log('Use "ecdsa-keys generate" to create one.');
      process.exit(0);
    }

    const keypair = activeResult.data;
    console.log("Active ECDSA Keypair:");
    console.log("  Public Key:", keypair.public_key);
    console.log("  Created At:", keypair.created_at.toISOString());
    console.log("  Keypair ID:", keypair.id);
    console.log("");
  } catch (error) {
    console.error("Failed to get active keypair:", error);
    process.exit(1);
  }
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log("Usage: tss-api ecdsa-keys <command> [options]");
    console.log("");
    console.log("Commands:");
    console.log(
      "  generate        Generate a new ECDSA keypair (fails if one already exists)",
    );
    console.log(
      "  rotate          Rotate the active keypair (creates new, deactivates old)",
    );
    console.log("  show-public     Show the currently active public key");
    console.log("");
    console.log("Options:");
    console.log(
      "  --backup-old    Backup old keypair before rotation (for rotate command)",
    );
    console.log("");
    console.log("Environment Variables:");
    console.log("  PGHOST          PostgreSQL host (default: localhost)");
    console.log("  PGPORT          PostgreSQL port (default: 5432)");
    console.log("  PGDATABASE      PostgreSQL database (default: oko_wallet)");
    console.log("  PGUSER          PostgreSQL user (default: postgres)");
    console.log("  PGPASSWORD      PostgreSQL password");
    console.log("  PGSSL           Use SSL (default: false)");
    console.log(
      "  ENCRYPTION_KEY_PATH  Path to encryption key file (default: ./.encryption-key)",
    );
    console.log("");
    process.exit(0);
  }

  const config = loadConfig();
  const encryptionKey = getEncryptionKey(config.encryptionKeyPath);

  // Connect to database
  const pool = new Pool(config.database);

  try {
    // Test connection
    await pool.query("SELECT NOW()");

    const options = {
      backupOld: args.includes("--backup-old"),
    };

    switch (command) {
      case "generate":
        await cmdGenerate(pool, encryptionKey, options);
        break;
      case "rotate":
        await cmdRotate(pool, encryptionKey, options);
        break;
      case "show-public":
        await cmdShowPublic(pool);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log("Use --help for usage information");
        process.exit(1);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Database error:", error);
    await pool.end();
    process.exit(1);
  }
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
