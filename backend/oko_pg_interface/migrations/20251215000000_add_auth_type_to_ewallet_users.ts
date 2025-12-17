import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const publicSchemaBuilder = knex.schema.withSchema("public");

  // 1. Add auth_type column with default 'google'
  await publicSchemaBuilder.alterTable("ewallet_users", (table) => {
    table
      .string("auth_type", 64)
      .notNullable()
      .defaultTo("google")
      .after("email");
  });

  // 2. Drop the old unique constraint on email only
  await knex.raw(`
    ALTER TABLE public.ewallet_users
    DROP CONSTRAINT IF EXISTS ewallet_users_email_key
  `);

  // 3. Create new unique constraint on (email, auth_type)
  await knex.raw(`
    ALTER TABLE public.ewallet_users
    ADD CONSTRAINT ewallet_users_email_auth_type_key UNIQUE (email, auth_type)
  `);
}

export async function down(knex: Knex): Promise<void> {
  // 1. Drop the new unique constraint on (email, auth_type)
  await knex.raw(`
    ALTER TABLE public.ewallet_users
    DROP CONSTRAINT IF EXISTS ewallet_users_email_auth_type_key
  `);

  // 2. Restore the old unique constraint on email only
  await knex.raw(`
    ALTER TABLE public.ewallet_users
    ADD CONSTRAINT ewallet_users_email_key UNIQUE (email)
  `);

  // 3. Drop the auth_type column
  await knex.schema
    .withSchema("public")
    .alterTable("ewallet_users", (table) => {
      table.dropColumn("auth_type");
    });
}
