-- Add UNIVERSITY value to Role enum if it doesn't exist yet
DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'UNIVERSITY';
EXCEPTION WHEN others THEN null; END $$;

-- Add role column to User if it doesn't exist yet
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'USER';
