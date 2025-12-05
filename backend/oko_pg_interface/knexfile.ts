import path from "node:path";
import type { Knex } from "knex";

const __dirname = import.meta.dirname;

const {
  DB_HOST = "localhost",
  DB_PORT = "5432",
  DB_USER = "postgres",
  DB_PASSWORD = "postgres",
  DB_NAME = "oko_dev",
  DB_SSL = "false",
} = process.env;

const config: Knex.Config = {
  client: "pg",
  connection: {
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: DB_SSL === "true",
  },
  migrations: {
    directory: path.join(__dirname, "migrations"),
  },
  seeds: {
    directory: path.join(__dirname, "seeds"),
  },
};

export default config;
