import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", function(table) {
    table.increments("id").primary();
    table.string("username").notNullable().unique();
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
