-- CreateEnum
CREATE TYPE "RequirementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RequirementKind" AS ENUM ('REQUIRED', 'INFO');

-- CreateEnum
CREATE TYPE "StayMode" AS ENUM ('SHORT', 'LONG', 'ANY');

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "city" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityRequirement" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" "RequirementKind" NOT NULL DEFAULT 'REQUIRED',
    "priority" "RequirementPriority" NOT NULL DEFAULT 'MEDIUM',
    "stayMode" "StayMode" NOT NULL DEFAULT 'ANY',
    "dueDate" TIMESTAMP(3),
    "dueDaysBefore" INTEGER,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");

-- CreateIndex
CREATE INDEX "UniversityRequirement_universityId_idx" ON "UniversityRequirement"("universityId");

-- CreateIndex
CREATE INDEX "UniversityRequirement_stayMode_kind_idx" ON "UniversityRequirement"("stayMode", "kind");

-- AddForeignKey
ALTER TABLE "UniversityRequirement" ADD CONSTRAINT "UniversityRequirement_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
