-- CreateEnums
DO $$ BEGIN
    CREATE TYPE "QualificationSpecialty" AS ENUM ('NEUROLOGY', 'NEUROPEDIATRICS', 'HNO', 'ORTHOPEDICS', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SupervisionMode" AS ENUM ('NONE', 'DIRECT', 'GUARANTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable OrganizationMembership
ALTER TABLE "OrganizationMembership" ADD COLUMN IF NOT EXISTS "specialty" "QualificationSpecialty" NOT NULL DEFAULT 'NEUROLOGY';
ALTER TABLE "OrganizationMembership" ADD COLUMN IF NOT EXISTS "supervisionMode" "SupervisionMode" NOT NULL DEFAULT 'NONE';
ALTER TABLE "OrganizationMembership" ADD COLUMN IF NOT EXISTS "defaultSupervisorName" TEXT;

-- AlterTable Encounter
ALTER TABLE "Encounter" ADD COLUMN IF NOT EXISTS "isSupervised" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Encounter" ADD COLUMN IF NOT EXISTS "supervisorName" TEXT;
