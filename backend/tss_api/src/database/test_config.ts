import type { PgDatabaseConfig } from "@oko-wallet/postgres-lib";

export const testPgConfig: PgDatabaseConfig = {
  database: "oko_dev",
  host: "localhost",
  password: "postgres",
  user: "postgres",
  port: 5432,
  ssl: false,
};
