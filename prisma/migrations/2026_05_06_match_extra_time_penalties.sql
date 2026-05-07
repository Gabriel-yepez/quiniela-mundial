-- Migration: add extra time and penalty shootout columns to "Match".
-- Idempotent: safe to re-run.

BEGIN;

ALTER TABLE "Match"
  ADD COLUMN IF NOT EXISTS "extraTimeHomeScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "extraTimeAwayScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "penaltyHomeScore"   INTEGER,
  ADD COLUMN IF NOT EXISTS "penaltyAwayScore"   INTEGER;

COMMIT;
