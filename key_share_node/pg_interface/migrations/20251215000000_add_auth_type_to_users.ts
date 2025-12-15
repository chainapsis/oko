import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const publicSchemaBuilder = knex.schema.withSchema("public");

  // 1. Add auth_type column with default 'google'
  await publicSchemaBuilder.alterTable("users", (table) => {
    table
      .string("auth_type", 64)
      .notNullable()
      .defaultTo("google")
      .after("email");
  });

  // 2. Drop the old unique constraint on email only
  await knex.raw(`
    ALTER TABLE public.users
    DROP CONSTRAINT IF EXISTS users_email_key
  `);

  // 3. Create new unique constraint on (email, auth_type)
  await knex.raw(`
    ALTER TABLE public.users
    ADD CONSTRAINT users_email_auth_type_key UNIQUE (email, auth_type)
  `);
}

export async function down(knex: Knex): Promise<void> {
  // 1. Drop the new unique constraint on (email, auth_type)
  await knex.raw(`
    ALTER TABLE public.users
    DROP CONSTRAINT IF EXISTS users_email_auth_type_key
  `);

  // 2. Restore the old unique constraint on email only
  await knex.raw(`
    ALTER TABLE public.users
    ADD CONSTRAINT users_email_key UNIQUE (email)
  `);

  // 3. Drop the auth_type column
  await knex.schema.withSchema("public").alterTable("users", (table) => {
    table.dropColumn("auth_type");
  });
}
