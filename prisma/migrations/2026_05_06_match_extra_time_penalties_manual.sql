-- =============================================================================
-- Manual migration for the Supabase SQL Editor
-- =============================================================================
-- Adds extra time and penalty shootout columns to the "Match" table for
-- knockout-stage matches (round of 32 onwards).
--
-- How to run:
--   1. Open the Supabase Dashboard for the project.
--   2. Go to SQL Editor.
--   3. Paste the contents of this file and click "Run".
--
-- Idempotent: safe to re-run multiple times. Each ADD COLUMN is guarded by
-- IF NOT EXISTS, so existing data is never touched.
-- =============================================================================

BEGIN;

ALTER TABLE "Match"
  ADD COLUMN IF NOT EXISTS "extraTimeHomeScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "extraTimeAwayScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "penaltyHomeScore"   INTEGER,
  ADD COLUMN IF NOT EXISTS "penaltyAwayScore"   INTEGER;

COMMIT;

-- Verify (optional):
-- SELECT column_name, data_type
--   FROM information_schema.columns
--  WHERE table_schema = 'public'
--    AND table_name   = 'Match'
--    AND column_name IN (
--      'extraTimeHomeScore',
--      'extraTimeAwayScore',
--      'penaltyHomeScore',
--      'penaltyAwayScore'
--    );
