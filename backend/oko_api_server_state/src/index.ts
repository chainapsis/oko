import { Pool } from "pg";
import type { Logger } from "winston";

import { createPgDatabase } from "./database";
import { initLogger } from "./logger";

export async function makeServerState(
  args: InitStateArgs,
): Promise<ServerState> {
  try {
    const { smtp_port, email_verification_expiration_minutes, ...rest } = args;

    const createPostgresRes = await createPgDatabase({
      database: args.db_name,
      host: args.db_host,
      password: args.db_password,
      user: args.db_user,
      port: parseInt(args.db_port, 10),
      ssl: args.db_ssl === "true",
    });
    if (createPostgresRes.success === false) {
      throw new Error(createPostgresRes.err);
    }
    const db = createPostgresRes.data;

    const logger = initLogger({
      esUrl: args.es_url,
      esIndex: args.es_index,
      esUsername: args.es_username,
      esPassword: args.es_password,
    });

    const smtpPort = parseInt(smtp_port, 10);
    const emailVerificationExpirationMinutes = parseInt(
      email_verification_expiration_minutes,
      10,
    );
    if (Number.isNaN(smtpPort) || smtpPort <= 0) {
      throw new Error("Invalid arguments: smtpPort");
    }
    if (
      Number.isNaN(emailVerificationExpirationMinutes) ||
      emailVerificationExpirationMinutes <= 0
    ) {
      throw new Error("Invalid arguments: emailVerificationExpirationMinutes");
    }

    return {
      db,
      logger,
      smtp_port: smtpPort,
      email_verification_expiration_minutes: emailVerificationExpirationMinutes,
      ...rest,
    };
  } catch (error) {
    console.error("Failed to make server state: %s", error);
    throw error;
  }
}

export interface ServerState {
  git_hash: string;
  db: Pool;
  logger: Logger;
  jwt_secret: string;
  jwt_expires_in: string;
  es_url: string | null;
  es_index: string | null;
  es_client_index: string | null;
  es_username: string | null;
  es_password: string | null;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  from_email: string;
  email_verification_expiration_minutes: number;
  s3_region: string;
  s3_access_key_id: string;
  s3_secret_access_key: string;
  s3_bucket: string;
  encryption_secret: string;
  social_login_x_callback_url: string;
  x_client_id: string;
}

export interface InitStateArgs {
  git_hash: string;
  jwt_secret: string;
  jwt_expires_in: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  from_email: string;
  email_verification_expiration_minutes: string;
  s3_region: string;
  s3_access_key_id: string;
  s3_secret_access_key: string;
  s3_bucket: string;
  db_host: string;
  db_port: string;
  db_user: string;
  db_password: string;
  db_name: string;
  db_ssl: string;
  es_url: string | null;
  es_index: string | null;
  es_client_index: string | null;
  es_username: string | null;
  es_password: string | null;
  encryption_secret: string;
  social_login_x_callback_url: string;
  x_client_id: string;
}
