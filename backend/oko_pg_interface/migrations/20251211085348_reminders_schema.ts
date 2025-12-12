import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("email_sent_logs", (table) => {
    table.uuid("log_id").primary().defaultTo(knex.fn.uuid());
    table.uuid("target_id").notNullable();
    table.string("type", 32).notNullable();
    table.string("email", 255).notNullable();
    table
      .timestamp("sent_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  await knex.schema.alterTable("customer_dashboard_users", (table) => {
    table.timestamp("email_verified_at", { useTz: true }).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("customer_dashboard_users", (table) => {
    table.dropColumn("email_verified_at");
  });

  await knex.schema.dropTableIfExists("email_sent_logs");
}
