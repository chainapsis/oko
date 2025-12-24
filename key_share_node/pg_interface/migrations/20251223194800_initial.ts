import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  //
  // public.2_users
  //
  const usersExists = await knex.schema
    .withSchema("public")
    .hasTable("2_users");
  if (!usersExists) {
    await knex.schema.withSchema("public").createTable("2_users", (table) => {
      table
        .uuid("user_id")
        .notNullable()
        .defaultTo(knex.raw("gen_random_uuid()"))
        .primary({ constraintName: "2_users_pkey" });
      table.string("auth_type", 64).notNullable();
      table.string("email", 255).notNullable();
      table.string("status", 16).notNullable().defaultTo("active");
      table
        .timestamp("created_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table
        .timestamp("updated_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table.jsonb("aux");

      table.unique(["auth_type", "email"], {
        indexName: "2_users_auth_type_email_key",
      });
    });
  }

  //
  // public.2_wallets
  //
  const walletsExists = await knex.schema
    .withSchema("public")
    .hasTable("2_wallets");
  if (!walletsExists) {
    await knex.schema.withSchema("public").createTable("2_wallets", (table) => {
      table
        .uuid("wallet_id")
        .notNullable()
        .defaultTo(knex.raw("gen_random_uuid()"))
        .primary({ constraintName: "2_wallets_pkey" });
      table.uuid("user_id").notNullable();
      table.string("curve_type", 16).notNullable();
      table
        .binary("public_key")
        .notNullable()
        .unique({ indexName: "2_wallets_public_key_key" });
      table
        .timestamp("created_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table
        .timestamp("updated_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table.jsonb("aux");
    });
  }

  //
  // public.2_key_shares
  //
  const keySharesExists = await knex.schema
    .withSchema("public")
    .hasTable("2_key_shares");
  if (!keySharesExists) {
    await knex.schema
      .withSchema("public")
      .createTable("2_key_shares", (table) => {
        table
          .uuid("share_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "2_key_shares_pkey" });
        table.uuid("wallet_id").notNullable();
        table.binary("enc_share").notNullable();
        table.string("status").notNullable();
        table
          .timestamp("reshared_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table.jsonb("aux");

        table.unique(["wallet_id"], {
          indexName: "2_key_shares_unique",
        });
      });
  }

  //
  // public.2_server_keypairs
  //
  const serverKeypairsExists = await knex.schema
    .withSchema("public")
    .hasTable("2_server_keypairs");
  if (!serverKeypairsExists) {
    await knex.schema
      .withSchema("public")
      .createTable("2_server_keypairs", (table) => {
        table
          .uuid("keypair_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "2_server_keypairs_pkey" });
        table
          .specificType("version", "integer generated always as identity")
          .notNullable()
          .unique({ indexName: "2_server_keypairs_version_key" });
        table.binary("public_key").notNullable();
        table.text("enc_private_key").notNullable();
        table.boolean("is_active").notNullable().defaultTo(true);
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table.timestamp("rotated_at", { useTz: true });
      });
  }

  //
  // public.2_pg_dumps
  //
  const pgDumpsExists = await knex.schema
    .withSchema("public")
    .hasTable("2_pg_dumps");
  if (!pgDumpsExists) {
    await knex.schema
      .withSchema("public")
      .createTable("2_pg_dumps", (table) => {
        table
          .uuid("dump_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "2_pg_dumps_pkey" });
        table.string("status", 16).notNullable();
        table.string("dump_path", 255);
        table.jsonb("meta");
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
      });
  }

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_2_server_keypairs_is_active
    ON public."2_server_keypairs" (is_active)
    WHERE is_active = true
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("public").dropTableIfExists("2_users");
  await knex.schema.withSchema("public").dropTableIfExists("2_wallets");
  await knex.schema.withSchema("public").dropTableIfExists("2_key_shares");
  await knex.schema.withSchema("public").dropTableIfExists("2_server_keypairs");
  await knex.schema.withSchema("public").dropTableIfExists("2_pg_dumps");
}
