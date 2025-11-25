loadEnv(ENV_FILE_NAME);

import {
  type ServerState,
  makeServerState,
} from "@oko-wallet/oko-api-server-state";
import { loadEnv, verifyEnv } from "@oko-wallet/dotenv";

import { makeApp } from "@oko-wallet-api/app";
import { ENV_FILE_NAME, envSchema } from "@oko-wallet-api/envs";
import { getCommitHash } from "@oko-wallet-api/git";
import { startKSNodeHealthCheckRuntime } from "@oko-wallet-api/runtime/health_check_node";

async function main() {
  console.log("NODE_ENV: %s", process.env.NODE_ENV);

  const git_hash = getCommitHash();
  console.log("git hash: %s", git_hash);

  const envRes = verifyEnv(envSchema, process.env);
  if (!envRes.success) {
    console.error("Env variable invalid\n%s", envRes.err);
    process.exit(1);
  }

  const envs = process.env;

  const state: ServerState = await makeServerState({
    git_hash,
    jwt_secret: envs.JWT_SECRET!,
    jwt_expires_in: envs.JWT_EXPIRES_IN!,
    smtp_host: envs.SMTP_HOST!,
    smtp_port: envs.SMTP_PORT!,
    smtp_user: envs.SMTP_USER!,
    smtp_pass: envs.SMTP_PASS!,
    from_email: envs.FROM_EMAIL!,
    email_verification_expiration_minutes:
      envs.EMAIL_VERIFICATION_EXPIRATION_MINUTES!,
    s3_region: envs.S3_REGION!,
    s3_access_key_id: envs.S3_ACCESS_KEY_ID!,
    s3_secret_access_key: envs.S3_SECRET_ACCESS_KEY!,
    s3_bucket: envs.S3_BUCKET!,
    db_host: envs.DB_HOST!,
    db_port: envs.DB_PORT!,
    db_user: envs.DB_USER!,
    db_password: envs.DB_PASSWORD!,
    db_name: envs.DB_NAME!,
    db_ssl: envs.DB_SSL!,
    es_url: envs.ES_URL ?? null,
    es_index: envs.ES_INDEX ?? null,
    es_client_index: envs.ES_CLIENT_INDEX ?? null,
    es_username: envs.ES_USERNAME ?? null,
    es_password: envs.ES_PASSWORD ?? null,
    encryption_secret: envs.ENCRYPTION_SECRET!,
    social_login_x_callback_url: envs.SOCIAL_LOGIN_X_CALLBACK_URL!,
    x_client_id: envs.X_CLIENT_ID!,
    x_social_login_token_url: envs.X_SOCIAL_LOGIN_TOKEN_URL!,
  });

  const app = makeApp(state);

  startKSNodeHealthCheckRuntime(state.db, state.logger, {
    intervalSeconds: 10 * 60, // 10 minutes
  });

  app.listen(envs.SERVER_PORT, () => {
    state.logger.info(`Server listening on port: %s`, envs.SERVER_PORT);
  });

  return;
}

main().then();
