#!/usr/bin/env tsx
/**
 * Runs a raw SQL migration file via pg.Client. Used because the Supabase
 * transaction-mode pooler (port 6543) rejects the prepared statements that
 * Prisma's schema engine emits, so `prisma db push` is unreliable here.
 *
 * Usage:
 *   npx tsx scripts/run-migration.ts prisma/migrations/2026_05_05_role_enum.sql
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env" });
config({ path: ".env.local", override: true });

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: tsx scripts/run-migration.ts <path-to-sql>");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = await readFile(resolve(file), "utf8");
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    console.log(`Running migration: ${file}`);
    await client.query(sql);
    console.log("OK");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
