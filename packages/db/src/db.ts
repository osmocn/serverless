/// <reference types="node" />

import * as dotenv from "dotenv";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to initialize @grove/db");
}

declare global {
  // eslint-disable-next-line no-var
  var pgClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var drizzleDb: PostgresJsDatabase<typeof schema> | undefined;
}

let db: PostgresJsDatabase<typeof schema>;

const connectionOptions = {
  prepare: false,
  max: process.env.NODE_ENV === "production" ? 10 : 1,
};

if (!global.pgClient) {
  global.pgClient = postgres(databaseUrl, connectionOptions);
}

if (!global.drizzleDb) {
  global.drizzleDb = drizzle(global.pgClient, { schema });
}

db = global.drizzleDb;

export default db;
export type DBExecutor = typeof db;
export type DBTransaction = Parameters<DBExecutor["transaction"]>[0] extends (
  tx: infer T,
) => unknown
  ? T
  : never;
