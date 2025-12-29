import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema("public")
    .alterTable("key_share_nodes", (table) => {
      table.string("public_key", 255).unique();
    });

  await knex.schema
    .withSchema("public")
    .createTable("ks_node_telemetry", (table) => {
      table
        .uuid("log_id")
        .notNullable()
        .defaultTo(knex.raw("gen_random_uuid()"))
        .primary({ constraintName: "ks_node_telemetry_pkey" });
      table
        .string("public_key", 255)
        .notNullable()
        .references("public_key")
        .inTable("key_share_nodes")
        .onDelete("CASCADE");
      table.integer("key_share_count").notNullable();
      table.jsonb("payload").notNullable();
      table
        .timestamp("created_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.index(["public_key"], "idx_ks_node_telemetry_public_key");
      table.index(["created_at"], "idx_ks_node_telemetry_created_at");
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("public").dropTableIfExists("ks_node_telemetry");

  await knex.schema
    .withSchema("public")
    .alterTable("key_share_nodes", (table) => {
      table.dropColumn("public_key");
    });
}
