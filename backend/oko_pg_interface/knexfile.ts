import path from "node:path";
import type { Knex } from "knex";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  // production: {
  //   client: "postgresql",
  //   connection: {
  //     database: "my_db",
  //     user: "username",
  //     password: "password",
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10,
  //   },
  //   migrations: {
  //     tableName: "knex_migrations",
  //   },
  // },
  //
  development: {
    client: "pg",
    connection: {
      host: "localhost",
      user: "your_user",
      password: "your_password",
      database: "your_database_dev", // some_other_your_local_db
    },
    migrations: {
      directory: path.join(__dirname, "migrations"), // Path to your migration files
    },
    seeds: {
      directory: path.join(__dirname, "seeds"), // Path to your seed files (optional)
    },
  },
};

export default config;

// module.exports = config;
