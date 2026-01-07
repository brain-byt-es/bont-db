-- CreateEnum safely
DO $$ BEGIN
    CREATE TYPE "LegalDocumentType" AS ENUM ('TOS', 'PRIVACY', 'DPA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable safely
CREATE TABLE IF NOT EXISTS "LegalAcceptance" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "organizationId" UUID,
    "documentType" "LegalDocumentType" NOT NULL,
    "documentVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedIp" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "LegalAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LegalAcceptance_userId_idx" ON "LegalAcceptance"("userId");
CREATE INDEX IF NOT EXISTS "LegalAcceptance_organizationId_idx" ON "LegalAcceptance"("organizationId");

-- AddForeignKey (UserId)
DO $$ BEGIN
    ALTER TABLE "LegalAcceptance" ADD CONSTRAINT "LegalAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (OrganizationId)
DO $$ BEGIN
    ALTER TABLE "LegalAcceptance" ADD CONSTRAINT "LegalAcceptance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Grant Permissions (Fix for permission denied error)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "LegalAcceptance" TO app_rw;