-- CreateTable
CREATE TABLE IF NOT EXISTS "ClinicalProtocol" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "indication" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalProtocol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClinicalProtocol_organizationId_idx" ON "ClinicalProtocol"("organizationId");
CREATE INDEX IF NOT EXISTS "ClinicalProtocol_createdByUserId_idx" ON "ClinicalProtocol"("createdByUserId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "ClinicalProtocol" ADD CONSTRAINT "ClinicalProtocol_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ClinicalProtocol" ADD CONSTRAINT "ClinicalProtocol_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Grant Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "ClinicalProtocol" TO app_rw;
