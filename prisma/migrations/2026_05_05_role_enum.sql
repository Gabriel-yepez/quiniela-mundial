-- Migration: convert "User"."role" from text to enum "Role"
-- Idempotent: safe to re-run.

BEGIN;

-- 1. Create the enum type if it does not exist yet.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    CREATE TYPE "Role" AS ENUM ('user', 'admin');
  END IF;
END $$;

-- 2. Normalize any unexpected role values so the cast does not fail.
UPDATE "User"
SET "role" = 'user'
WHERE "role" IS NULL OR "role" NOT IN ('user', 'admin');

-- 3. Convert the column.
DO $$
DECLARE
  current_type TEXT;
BEGIN
  SELECT data_type
    INTO current_type
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name   = 'User'
     AND column_name  = 'role';

  IF current_type IS DISTINCT FROM 'USER-DEFINED' THEN
    ALTER TABLE "User"
      ALTER COLUMN "role" DROP DEFAULT,
      ALTER COLUMN "role" TYPE "Role" USING ("role"::"Role"),
      ALTER COLUMN "role" SET DEFAULT 'user',
      ALTER COLUMN "role" SET NOT NULL;
  END IF;
END $$;

COMMIT;
