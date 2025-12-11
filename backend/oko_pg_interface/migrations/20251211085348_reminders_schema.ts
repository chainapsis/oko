import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("reminders", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("target_id").notNullable();
        table.text("type").notNullable();
        table
            .timestamp("sent_at", { useTz: true })
            .notNullable()
            .defaultTo(knex.fn.now());

        table.unique(["target_id", "type"]);
    });

    await knex.schema.alterTable("customer_dashboard_users", (table) => {
        table.timestamp("email_verified_at", { useTz: true }).nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("customer_dashboard_users", (table) => {
        table.dropColumn("email_verified_at");
    });

    await knex.schema.dropTableIfExists("reminders");
}
