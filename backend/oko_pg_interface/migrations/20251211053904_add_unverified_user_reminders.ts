import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("unverified_user_reminders", (table) => {
    table.uuid("user_id").primary();
    table
      .timestamp("sent_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("unverified_user_reminders");
}
