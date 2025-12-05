import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  //
  // public.admin_users
  //
  if (!(await knex.schema.withSchema("public").hasTable("admin_users"))) {
    await knex.schema
      .withSchema("public")
      .createTable("admin_users", (table) => {
        table
          .uuid("user_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({
            constraintName: "users_primary_key",
          });
        table
          .string("email")
          .notNullable()
          .unique({ indexName: "admin_users_email_key" });
        table.string("password_hash", 255).notNullable();
        table.string("role", 20).notNullable();
        table.boolean("is_active").notNullable().defaultTo(true);
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
  // public.customers
  //
  if (!(await knex.schema.withSchema("public").hasTable("customers"))) {
    await knex.schema.withSchema("public").createTable("customers", (table) => {
      table
        .uuid("customer_id")
        .notNullable()
        .defaultTo(knex.raw("gen_random_uuid()"))
        .primary({ constraintName: "customers_pkey" });
      table.string("label").notNullable();
      table.string("status", 32).notNullable();
      table.string("url");
      table.string("logo_url");
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
  // public.api_keys
  //
  if (!(await knex.schema.withSchema("public").hasTable("api_keys"))) {
    await knex.schema.withSchema("public").createTable("api_keys", (table) => {
      table
        .uuid("key_id")
        .notNullable()
        .defaultTo(knex.raw("gen_random_uuid()"))
        .primary({ constraintName: "api_keys_pkey" });
      table.uuid("customer_id").notNullable();
      table
        .string("hashed_key", 64)
        .notNullable()
        .unique({ indexName: "api_keys_hashed_key_key" });
      table.boolean("is_active").notNullable().defaultTo(true);
      table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
      table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());

      table.index(["customer_id"], "idx_api_keys_customer_id");
    });
  }

  //
  // public.customer_dashboard_users
  //
  if (
    !(await knex.schema
      .withSchema("public")
      .hasTable("customer_dashboard_users"))
  ) {
    await knex.schema
      .withSchema("public")
      .createTable("customer_dashboard_users", (table) => {
        table
          .uuid("user_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "customer_dashboard_users_pkey" });
        table.uuid("customer_id").notNullable();
        table.string("status", 32).notNullable();
        table
          .string("email")
          .notNullable()
          .unique({ indexName: "customer_dashboard_users_email_key" });
        table.boolean("is_email_verified").notNullable();
        table.string("password_hash", 255).notNullable();
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());

        table.index(
          ["customer_id"],
          "idx_customer_dashboard_users_customer_id",
        );
      });
  }

  //
  // public.email_verifications
  //
  if (
    !(await knex.schema.withSchema("public").hasTable("email_verifications"))
  ) {
    await knex.schema
      .withSchema("public")
      .createTable("email_verifications", (table) => {
        table
          .uuid("email_verification_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "email_verifications_pkey" });
        table.string("email", 255).notNullable();
        table.string("verification_code", 6).notNullable();
        table.string("status", 32).notNullable();
        table.timestamp("expires_at", { useTz: true }).notNullable();
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());

        table.index(["email"], "idx_email_verifications_email");
        table.index(
          ["email", "expires_at"],
          "idx_email_verifications_email_expires",
        );
        table.index(["expires_at"], "idx_email_verifications_expires");
      });
  }

  //
  // public.ewallet_users
  //
  if (!(await knex.schema.withSchema("public").hasTable("ewallet_users"))) {
    await knex.schema
      .withSchema("public")
      .createTable("ewallet_users", (table) => {
        table
          .uuid("user_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "ewallet_users_pkey" });
        table
          .string("email", 255)
          .notNullable()
          .unique({ indexName: "ewallet_users_email_key" });
        table.string("status", 32).notNullable().defaultTo("ACTIVE");
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
  // public.ewallet_wallets
  //
  if (!(await knex.schema.withSchema("public").hasTable("ewallet_wallets"))) {
    await knex.schema
      .withSchema("public")
      .createTable("ewallet_wallets", (table) => {
        table
          .uuid("wallet_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "ewallet_wallets_pkey" });
        table.uuid("user_id").notNullable();
        table.string("curve_type", 16).notNullable();
        table
          .binary("public_key")
          .notNullable()
          .unique({ indexName: "ewallet_wallets_public_key_key" });
        table.string("status", 32).notNullable().defaultTo("ACTIVE");
        table.binary("enc_tss_share").notNullable();
        table
          .specificType("sss_threshold", "smallint")
          .notNullable()
          .defaultTo(2);
        table.jsonb("metadata");
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table.index(["created_at"], "idx_ewallet_wallets_created_at");
        table.index(
          ["user_id", "curve_type", "status"],
          "idx_ewallet_wallets_user_id_curve_type_status",
        );
      });
  }

  //
  // public.key_share_node_meta
  //
  if (
    !(await knex.schema.withSchema("public").hasTable("key_share_node_meta"))
  ) {
    await knex.schema
      .withSchema("public")
      .createTable("key_share_node_meta", (table) => {
        table
          .uuid("meta_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "key_share_node_meta_pkey" });
        table.specificType("sss_threshold", "smallint").notNullable();
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
  // public.key_share_nodes
  //
  if (!(await knex.schema.withSchema("public").hasTable("key_share_nodes"))) {
    await knex.schema
      .withSchema("public")
      .createTable("key_share_nodes", (table) => {
        table
          .uuid("node_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "key_share_nodes_pkey" });
        table.string("node_name", 255).notNullable();
        table.string("server_url", 255).notNullable();
        table.string("status", 32).notNullable().defaultTo("ACTIVE");
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table.timestamp("deleted_at", { useTz: true });
      });
  }

  //
  // public.ks_node_health_checks
  //
  if (
    !(await knex.schema.withSchema("public").hasTable("ks_node_health_checks"))
  ) {
    await knex.schema
      .withSchema("public")
      .createTable("ks_node_health_checks", (table) => {
        table
          .uuid("check_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "ks_node_health_checks_pkey" });
        table.uuid("node_id").notNullable();
        table.string("status", 32).notNullable();
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
  // public.ks_node_logs
  //
  if (!(await knex.schema.withSchema("public").hasTable("ks_node_logs"))) {
    await knex.schema
      .withSchema("public")
      .createTable("ks_node_logs", (table) => {
        table.uuid("log_id").notNullable();
        table.string("action_type").notNullable();
        table.string("params").notNullable();
        table.uuid("admin_user_id").notNullable();
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
  // public.tss_activation_settings
  //
  if (
    !(await knex.schema
      .withSchema("public")
      .hasTable("tss_activation_settings"))
  ) {
    await knex.schema
      .withSchema("public")
      .createTable("tss_activation_settings", (table) => {
        table.string("activation_key", 64).notNullable();
        table.boolean("is_enabled").notNullable().defaultTo(true);
        table.text("description");
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table.primary(["activation_key"], {
          constraintName: "tss_activation_settings_pkey",
        });
      });
  }

  //
  // public.tss_sessions
  //
  if (!(await knex.schema.withSchema("public").hasTable("tss_sessions"))) {
    await knex.schema
      .withSchema("public")
      .createTable("tss_sessions", (table) => {
        table
          .uuid("session_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "tss_sessions_pkey" });
        table.uuid("customer_id").notNullable();
        table.uuid("wallet_id").notNullable();
        table.string("state", 32).notNullable();
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table.index(["created_at"], "idx_tss_sessions_created_at");
        table.index(["customer_id"], "idx_tss_sessions_customer_id");
        table.index(["wallet_id"], "idx_tss_sessions_wallet_id");
      });
  }

  //
  // public.tss_stages
  //
  if (!(await knex.schema.withSchema("public").hasTable("tss_stages"))) {
    await knex.schema
      .withSchema("public")
      .createTable("tss_stages", (table) => {
        table
          .uuid("stage_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "tss_stages_pkey" });
        table.uuid("session_id").notNullable();
        table.string("stage_type", 32).notNullable();
        table.string("stage_status", 32).notNullable();
        table.jsonb("stage_data");
        table.text("error_message");
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table.unique(["session_id", "stage_type"], {
          indexName: "tss_stages_session_id_stage_type_key",
        });
      });
  }

  //
  // public.wallet_ks_nodes
  //
  if (!(await knex.schema.withSchema("public").hasTable("wallet_ks_nodes"))) {
    await knex.schema
      .withSchema("public")
      .createTable("wallet_ks_nodes", (table) => {
        table
          .uuid("wallet_ks_node_id")
          .notNullable()
          .defaultTo(knex.raw("gen_random_uuid()"))
          .primary({ constraintName: "wallet_ks_nodes_pkey" });
        table.uuid("wallet_id").notNullable();
        table.uuid("node_id").notNullable();
        table.string("status", 32).notNullable().defaultTo("ACTIVE");
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table.unique(["wallet_id", "node_id"], {
          indexName: "wallet_ks_nodes_wallet_id_node_id_key",
        });
        table.index(["node_id"], "idx_wallet_ks_nodes_node_id");
        table.index(["wallet_id"], "idx_wallet_ks_nodes_wallet_id");
      });
  }

  //
  // public.server_keypairs
  //
  if (!(await knex.schema.withSchema("public").hasTable("server_keypairs"))) {
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

  // Indexes that need to be created using raw SQL
  if (await knex.schema.withSchema("public").hasTable("key_share_nodes")) {
    await knex.raw(`
      CREATE UNIQUE INDEX IF NOT EXISTS key_share_nodes_server_url_uniq_active
      ON public.key_share_nodes (server_url)
      WHERE deleted_at IS NULL
    `);
  }

  if (
    await knex.schema.withSchema("public").hasTable("ks_node_health_checks")
  ) {
    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_ks_node_health_checks_node_id_created_at
      ON public.ks_node_health_checks (node_id, created_at DESC)
    `);
  }

  if (await knex.schema.withSchema("public").hasTable("server_keypairs")) {
    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_server_keypairs_is_active
      ON public.server_keypairs (is_active)
      WHERE is_active = true
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("public").dropTableIfExists("tss_stages");
  await knex.schema.withSchema("public").dropTableIfExists("wallet_ks_nodes");
  await knex.schema
    .withSchema("public")
    .dropTableIfExists("ks_node_health_checks");
  await knex.schema.withSchema("public").dropTableIfExists("ks_node_logs");
  await knex.schema.withSchema("public").dropTableIfExists("tss_sessions");
  await knex.schema
    .withSchema("public")
    .dropTableIfExists("tss_activation_settings");
  await knex.schema.withSchema("public").dropTableIfExists("ewallet_wallets");
  await knex.schema.withSchema("public").dropTableIfExists("ewallet_users");
  await knex.schema
    .withSchema("public")
    .dropTableIfExists("email_verifications");
  await knex.schema.withSchema("public").dropTableIfExists("api_keys");
  await knex.schema
    .withSchema("public")
    .dropTableIfExists("customer_dashboard_users");
  await knex.schema.withSchema("public").dropTableIfExists("server_keypairs");
  await knex.schema.withSchema("public").dropTableIfExists("key_share_nodes");
  await knex.schema
    .withSchema("public")
    .dropTableIfExists("key_share_node_meta");
  await knex.schema.withSchema("public").dropTableIfExists("customers");
  await knex.schema.withSchema("public").dropTableIfExists("admin_users");
}
