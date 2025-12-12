import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.withSchema("public").hasTable("referrals"))) {
    await knex.schema.withSchema("public").createTable("referrals", (table) => {
      table
        .uuid("referral_id")
        .notNullable()
        .defaultTo(knex.raw("gen_random_uuid()"))
        .primary({ constraintName: "referrals_pkey" });
      table.uuid("user_id").notNullable();
      table.binary("public_key").notNullable();
      table.string("origin", 512).notNullable();
      table.string("utm_source", 128);
      table.string("utm_campaign", 128);
      table
        .timestamp("created_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table
        .timestamp("updated_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .foreign("user_id", "referrals_user_id_fkey")
        .references("user_id")
        .inTable("public.ewallet_users")
        .onDelete("CASCADE");

      table.index(["public_key"], "idx_referrals_public_key");
      table.index(["origin"], "idx_referrals_origin");
    });

    // UNIQUE index on (public_key, origin) - one referral per user per origin
    await knex.raw(`
      CREATE UNIQUE INDEX idx_referrals_unique_source
      ON public.referrals (public_key, origin)
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("public").dropTableIfExists("referrals");
}
