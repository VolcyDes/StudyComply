-- CreateTable
CREATE TABLE "Country" (
    "code" VARCHAR(2) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "StudyPurpose" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "StudyPurpose_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");
