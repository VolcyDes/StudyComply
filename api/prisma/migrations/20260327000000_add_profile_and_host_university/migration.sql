-- Add personal profile fields to User (all nullable — safe on existing rows)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fullName"       TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dateOfBirth"    TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "homeUniversity" TEXT;

-- Add host university to MobilityProject (nullable — safe on existing rows)
ALTER TABLE "MobilityProject" ADD COLUMN IF NOT EXISTS "hostUniversity" TEXT;
