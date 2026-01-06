import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable("ewallet_users", "oko_users");
  await knex.schema.renameTable("ewallet_wallets", "oko_wallets");

  await knex.raw(`
    ALTER TABLE oko_users RENAME CONSTRAINT ewallet_users_pkey TO oko_users_pkey;
    ALTER TABLE oko_users RENAME CONSTRAINT ewallet_users_email_auth_type_key TO oko_users_email_auth_type_key;
    ALTER TABLE oko_wallets RENAME CONSTRAINT ewallet_wallets_pkey TO oko_wallets_pkey;
    ALTER TABLE oko_wallets RENAME CONSTRAINT ewallet_wallets_public_key_key TO oko_wallets_public_key_key;
  `);

  await knex.raw(`
    ALTER INDEX idx_ewallet_wallets_created_at RENAME TO idx_oko_wallets_created_at;
    ALTER INDEX idx_ewallet_wallets_user_id_curve_type_status RENAME TO idx_oko_wallets_user_id_curve_type_status;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER INDEX idx_oko_wallets_created_at RENAME TO idx_ewallet_wallets_created_at;
    ALTER INDEX idx_oko_wallets_user_id_curve_type_status RENAME TO idx_ewallet_wallets_user_id_curve_type_status;
  `);

  await knex.raw(`
    ALTER TABLE oko_users RENAME CONSTRAINT oko_users_pkey TO ewallet_users_pkey;
    ALTER TABLE oko_users RENAME CONSTRAINT oko_users_email_auth_type_key TO ewallet_users_email_auth_type_key;
    ALTER TABLE oko_wallets RENAME CONSTRAINT oko_wallets_pkey TO ewallet_wallets_pkey;
    ALTER TABLE oko_wallets RENAME CONSTRAINT oko_wallets_public_key_key TO ewallet_wallets_public_key_key;
  `);

  await knex.schema.renameTable("oko_users", "ewallet_users");
  await knex.schema.renameTable("oko_wallets", "ewallet_wallets");
}
