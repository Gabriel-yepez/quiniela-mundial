@AGENTS.md


# Supabase / Database Connection

## Connection Details
- **Host:** `aws-0-us-west-2.pooler.supabase.com`
- **Port:** `6543` (Transaction mode — the ONLY port that works from this network)
- **User:** `postgres.aeuhfqevgozafkqmtfer`
- Port `5432` (Session mode pooler) does NOT connect from this network — never use it.
- Direct host `db.aeuhfqevgozafkqmtfer.supabase.co` resolves to IPv6 only and is unreachable — never use it.

## Prisma + Supabase Rules

1. **`@prisma/adapter-pg` (`PrismaPg`) constructor** accepts `pg.Pool | pg.PoolConfig` directly, NOT `{ pool }` or `{ connectionString }`. Correct usage:
   ```ts
   const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
   const adapter = new PrismaPg(pool);
   ```

2. **SSL is mandatory** for Supabase connections via `pg` (node-postgres). Always pass `ssl: { rejectUnauthorized: false }` in the Pool/Client config. Do NOT rely on `sslmode=require` in the connection string — it causes `ECONNRESET` with node-postgres.

3. **Prisma CLI (`db push`, `db pull`, `migrate`)** uses its own engine, not node-postgres. For CLI commands, SSL params must be in the connection string: `?sslmode=require&sslaccept=accept_invalid_certs&pgbouncer=true`. These go in `DIRECT_URL`.

4. **Transaction mode pooler (port 6543)** does NOT support prepared statements. Prisma CLI schema engine requires prepared statements, so `db push`/`db pull` will fail with `"prepared statement s1 already exists"`. Workaround: generate SQL with `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script` and execute it directly via `pg.Client`.

5. **`DATABASE_URL`** must be clean (no `sslmode`/`sslaccept`/`pgbouncer` params) because the app uses `pg.Pool` with explicit SSL config. Adding these params causes conflicts.

6. **`DIRECT_URL`** should include `?sslmode=require&sslaccept=accept_invalid_certs&pgbouncer=true` for Prisma CLI engine commands.
