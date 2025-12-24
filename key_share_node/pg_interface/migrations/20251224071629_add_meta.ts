import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("public").createTable("meta", (table) => {
    table
      .uuid("meta_id")
      .notNullable()
      .defaultTo(knex.raw("gen_random_uuid()"))
      .primary({ constraintName: "meta_pkey" });
    table
      .string("telemetry_node_id", 255)
      .notNullable()
      .unique({ indexName: "meta_telemetry_node_id_key" });
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

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("public").dropTableIfExists("meta");
}
