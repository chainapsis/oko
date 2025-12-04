import type { Pool } from "pg";
import type { EddsaKeypair } from "@oko-wallet/crypto-js/node/ecdhe";

export interface ServerState {
  db: Pool;
  encryptionSecret: string;
  serverKeypair: EddsaKeypair;

  is_db_backup_checked: boolean;
  launch_time: string;
  git_hash: string | null;
  version: string;
}
