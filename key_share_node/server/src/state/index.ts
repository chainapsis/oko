import type { Pool } from "pg";
import type { EddsaKeypair } from "@oko-wallet/common-crypto-js";

export interface ServerState {
  db: Pool;
  encryptionSecret: string;
  serverKeypair: EddsaKeypair;
  telegram_bot_token: string;
  is_db_backup_checked: boolean;
  launch_time: string;
  git_hash: string | null;
  version: string;
}
