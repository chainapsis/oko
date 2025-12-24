import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema("public")
    .alterTable("key_share_nodes", (table) => {
      table.string("telemetry_node_id", 255).unique();
    });

  await knex.schema
    .withSchema("public")
    .createTable("ks_node_telemetry", (table) => {
      table
        .uuid("log_id")
        .notNullable()
        .defaultTo(knex.raw("gen_random_uuid()"))
        .primary({ constraintName: "ks_node_telemetry_pkey" });
      table.string("telemetry_node_id", 255).notNullable();
      table.integer("key_share_count").notNullable();
      table.jsonb("payload").notNullable();
      table
        .timestamp("created_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.index(
        ["telemetry_node_id"],
        "idx_ks_node_telemetry_telemetry_node_id",
      );
      table.index(["created_at"], "idx_ks_node_telemetry_created_at");
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("public").dropTableIfExists("ks_node_telemetry");

  await knex.schema
    .withSchema("public")
    .alterTable("key_share_nodes", (table) => {
      table.dropColumn("telemetry_node_id");
    });
}
