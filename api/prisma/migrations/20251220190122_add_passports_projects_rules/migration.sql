-- CreateTable
CREATE TABLE "Passport" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Passport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobilityProject" (
    "id" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MobilityProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementRule" (
    "id" TEXT NOT NULL,
    "passportCountry" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "requiredType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "minDays" INTEGER,
    "maxDays" INTEGER,

    CONSTRAINT "RequirementRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Passport_userId_idx" ON "Passport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Passport_userId_countryCode_key" ON "Passport"("userId", "countryCode");

-- CreateIndex
CREATE INDEX "MobilityProject_userId_idx" ON "MobilityProject"("userId");

-- CreateIndex
CREATE INDEX "RequirementRule_passportCountry_destinationCountry_purpose_idx" ON "RequirementRule"("passportCountry", "destinationCountry", "purpose");

-- AddForeignKey
ALTER TABLE "Passport" ADD CONSTRAINT "Passport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobilityProject" ADD CONSTRAINT "MobilityProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
