import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  //
  // public.key_shares
  //
  const keySharesExists = await knex.schema
    .withSchema("public")
    .hasTable("key_shares");
  if (!keySharesExists) {
    await knex.schema
      .withSchema("public")
      .createTable("key_shares", (table) => {
        table
          .uuid("share_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "key_shares_pkey" });
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
          indexName: "key_shares_unique",
        });
      });
  }

  //
  // public.pg_dumps
  //
  const pgDumpsExists = await knex.schema
    .withSchema("public")
    .hasTable("pg_dumps");
  if (!pgDumpsExists) {
    await knex.schema.withSchema("public").createTable("pg_dumps", (table) => {
      table
        .uuid("dump_id")
        .notNullable()
        .defaultTo(knex.raw("gen_random_uuid()"))
        .primary({ constraintName: "pg_dumps_pkey" });
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

  //
  // public.users
  //
  const usersExists = await knex.schema.withSchema("public").hasTable("users");
  if (!usersExists) {
    await knex.schema.withSchema("public").createTable("users", (table) => {
      table
        .uuid("user_id")
        .notNullable()
        .defaultTo(knex.raw("gen_random_uuid()"))
        .primary({ constraintName: "users_pkey" });
      table
        .string("email", 255)
        .notNullable()
        .unique({ indexName: "users_email_key" });
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
    });
  }

  //
  // public.wallets
  //
  const walletsExists = await knex.schema
    .withSchema("public")
    .hasTable("wallets");
  if (!walletsExists) {
    await knex.schema.withSchema("public").createTable("wallets", (table) => {
      table
        .uuid("wallet_id")
        .notNullable()
        .defaultTo(knex.raw("gen_random_uuid()"))
        .primary({ constraintName: "wallets_pkey" });
      table.uuid("user_id").notNullable();
      table.string("curve_type", 16).notNullable();
      table
        .binary("public_key")
        .notNullable()
        .unique({ indexName: "wallets_public_key_key" });
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
  // public.server_keypairs
  //
  const serverKeypairsExists = await knex.schema
    .withSchema("public")
    .hasTable("server_keypairs");
  if (!serverKeypairsExists) {
    await knex.schema
      .withSchema("public")
      .createTable("server_keypairs", (table) => {
        table
          .uuid("keypair_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "server_keypairs_pkey" });
        table
          .specificType("version", "integer generated always as identity")
          .notNullable()
          .unique({ indexName: "server_keypairs_version_key" });
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

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_server_keypairs_is_active
    ON public.server_keypairs (is_active)
    WHERE is_active = true
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("public").dropTableIfExists("server_keypairs");
  await knex.schema.withSchema("public").dropTableIfExists("wallets");
  await knex.schema.withSchema("public").dropTableIfExists("users");
  await knex.schema.withSchema("public").dropTableIfExists("pg_dumps");
  await knex.schema.withSchema("public").dropTableIfExists("key_shares");
}
