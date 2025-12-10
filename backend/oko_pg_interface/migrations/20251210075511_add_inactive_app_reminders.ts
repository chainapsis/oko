import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("inactive_app_reminders", (table) => {
    table.uuid("customer_id").primary();
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

  await knex.schema.dropTableIfExists("inactive_app_reminders");
}
