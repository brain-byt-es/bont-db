-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "Region" AS ENUM ('EU', 'US');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'CLINIC_ADMIN', 'PROVIDER', 'ASSISTANT', 'READONLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "BodySide" AS ENUM ('L', 'R', 'B');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "EncounterStatus" AS ENUM ('DRAFT', 'SIGNED', 'VOID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "Timepoint" AS ENUM ('baseline', 'peak_effect', 'reinjection', 'followup', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "AuthProvider" AS ENUM ('azure_ad', 'google', 'linkedin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "entraUserId" TEXT,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "profilePhotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserIdentity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerSubject" TEXT NOT NULL,
    "emailAtAuth" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "billingExternalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMembership" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "mfaEnforced" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationInvite" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdByMembershipId" UUID NOT NULL,
    "acceptedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE',
    "systemLabel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phi"."PatientIdentifier" (
    "patientId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "ehrPatientId" TEXT NOT NULL,
    "dateOfBirth" DATE,
    "birthYear" INTEGER,
    "sourceSystem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientIdentifier_pkey" PRIMARY KEY ("patientId")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "createdByMembershipId" UUID NOT NULL,
    "providerMembershipId" UUID NOT NULL,
    "encounterAt" TIMESTAMPTZ(6) NOT NULL,
    "encounterLocalDate" DATE NOT NULL,
    "status" "EncounterStatus" NOT NULL DEFAULT 'DRAFT',
    "treatmentSite" TEXT NOT NULL,
    "indication" TEXT NOT NULL,
    "productId" UUID,
    "dilutionText" TEXT NOT NULL,
    "dilutionUnitsPerMl" DECIMAL(12,4),
    "totalUnits" DECIMAL(10,2) NOT NULL,
    "effectNotes" TEXT,
    "adverseEventNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Injection" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "muscleId" UUID,
    "side" "BodySide" NOT NULL DEFAULT 'B',
    "units" DECIMAL(10,2) NOT NULL,
    "volumeMl" DECIMAL(10,3),
    "notes" TEXT,
    "lotId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Injection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "timepoint" "Timepoint" NOT NULL DEFAULT 'other',
    "assessedAt" DATE NOT NULL,
    "scale" TEXT NOT NULL,
    "valueNum" DECIMAL(12,4),
    "valueText" TEXT,
    "unit" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InjectionAssessment" (
    "id" UUID NOT NULL,
    "injectionId" UUID NOT NULL,
    "timepoint" "Timepoint" NOT NULL,
    "scale" TEXT NOT NULL,
    "valueText" TEXT NOT NULL,
    "valueNum" DECIMAL(12,4),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InjectionAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Followup" (
    "id" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "followupDate" DATE NOT NULL,
    "outcome" TEXT,
    "assessmentNotes" TEXT,
    "adverseEventNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Followup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterRegion" (
    "id" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "regionCode" TEXT NOT NULL,

    CONSTRAINT "EncounterRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuscleRegion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MuscleRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Muscle" (
    "id" UUID NOT NULL,
    "regionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Muscle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMusclePreference" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "muscleId" UUID NOT NULL,
    "alias" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationMusclePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" UUID NOT NULL,
    "codeSystem" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterDiagnosis" (
    "id" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "diagnosisId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncounterDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "manufacturer" TEXT,
    "name" TEXT NOT NULL,
    "unitsPerVial" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLot" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "expiresOn" DATE,
    "receivedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "actorMembershipId" UUID,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" UUID,
    "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "details" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_entraUserId_key" ON "User"("entraUserId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserIdentity_userId_idx" ON "UserIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserIdentity_provider_providerSubject_key" ON "UserIdentity"("provider", "providerSubject");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_billingExternalId_key" ON "Organization"("billingExternalId");

-- CreateIndex
CREATE INDEX "Organization_region_idx" ON "Organization"("region");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "OrganizationMembership_organizationId_role_idx" ON "OrganizationMembership"("organizationId", "role");

-- CreateIndex
CREATE INDEX "OrganizationMembership_organizationId_status_idx" ON "OrganizationMembership"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_organizationId_userId_key" ON "OrganizationMembership"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_organizationId_id_key" ON "OrganizationMembership"("organizationId", "id");

-- CreateIndex
CREATE INDEX "OrganizationInvite_organizationId_email_idx" ON "OrganizationInvite"("organizationId", "email");

-- CreateIndex
CREATE INDEX "OrganizationInvite_expiresAt_idx" ON "OrganizationInvite"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvite_tokenHash_key" ON "OrganizationInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "Patient_organizationId_status_idx" ON "Patient"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Patient_organizationId_createdAt_idx" ON "Patient"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_organizationId_systemLabel_key" ON "Patient"("organizationId", "systemLabel");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_organizationId_id_key" ON "Patient"("organizationId", "id");

-- CreateIndex
CREATE INDEX "PatientIdentifier_organizationId_birthYear_idx" ON "phi"."PatientIdentifier"("organizationId", "birthYear");

-- CreateIndex
CREATE INDEX "PatientIdentifier_organizationId_dateOfBirth_idx" ON "phi"."PatientIdentifier"("organizationId", "dateOfBirth");

-- CreateIndex
CREATE UNIQUE INDEX "PatientIdentifier_organizationId_ehrPatientId_key" ON "phi"."PatientIdentifier"("organizationId", "ehrPatientId");

-- CreateIndex
CREATE INDEX "Encounter_organizationId_encounterLocalDate_idx" ON "Encounter"("organizationId", "encounterLocalDate");

-- CreateIndex
CREATE INDEX "Encounter_organizationId_encounterAt_idx" ON "Encounter"("organizationId", "encounterAt");

-- CreateIndex
CREATE INDEX "Encounter_organizationId_patientId_encounterAt_idx" ON "Encounter"("organizationId", "patientId", "encounterAt");

-- CreateIndex
CREATE INDEX "Encounter_organizationId_providerMembershipId_encounterAt_idx" ON "Encounter"("organizationId", "providerMembershipId", "encounterAt");

-- CreateIndex
CREATE INDEX "Encounter_organizationId_status_idx" ON "Encounter"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Encounter_organizationId_createdByMembershipId_encounterAt_idx" ON "Encounter"("organizationId", "createdByMembershipId", "encounterAt");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_organizationId_id_key" ON "Encounter"("organizationId", "id");

-- CreateIndex
CREATE INDEX "Injection_organizationId_encounterId_idx" ON "Injection"("organizationId", "encounterId");

-- CreateIndex
CREATE INDEX "Injection_encounterId_idx" ON "Injection"("encounterId");

-- CreateIndex
CREATE INDEX "Injection_muscleId_idx" ON "Injection"("muscleId");

-- CreateIndex
CREATE INDEX "Injection_lotId_idx" ON "Injection"("lotId");

-- CreateIndex
CREATE INDEX "Assessment_encounterId_assessedAt_idx" ON "Assessment"("encounterId", "assessedAt");

-- CreateIndex
CREATE INDEX "Assessment_encounterId_timepoint_idx" ON "Assessment"("encounterId", "timepoint");

-- CreateIndex
CREATE INDEX "Assessment_scale_idx" ON "Assessment"("scale");

-- CreateIndex
CREATE INDEX "InjectionAssessment_injectionId_timepoint_idx" ON "InjectionAssessment"("injectionId", "timepoint");

-- CreateIndex
CREATE INDEX "InjectionAssessment_scale_idx" ON "InjectionAssessment"("scale");

-- CreateIndex
CREATE INDEX "Followup_encounterId_followupDate_idx" ON "Followup"("encounterId", "followupDate");

-- CreateIndex
CREATE INDEX "EncounterRegion_regionCode_idx" ON "EncounterRegion"("regionCode");

-- CreateIndex
CREATE UNIQUE INDEX "EncounterRegion_encounterId_regionCode_key" ON "EncounterRegion"("encounterId", "regionCode");

-- CreateIndex
CREATE INDEX "MuscleRegion_sortOrder_idx" ON "MuscleRegion"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MuscleRegion_name_key" ON "MuscleRegion"("name");

-- CreateIndex
CREATE INDEX "Muscle_regionId_sortOrder_idx" ON "Muscle"("regionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Muscle_name_key" ON "Muscle"("name");

-- CreateIndex
CREATE INDEX "OrganizationMusclePreference_organizationId_isFavorite_idx" ON "OrganizationMusclePreference"("organizationId", "isFavorite");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMusclePreference_organizationId_muscleId_key" ON "OrganizationMusclePreference"("organizationId", "muscleId");

-- CreateIndex
CREATE INDEX "Diagnosis_codeSystem_idx" ON "Diagnosis"("codeSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_codeSystem_code_key" ON "Diagnosis"("codeSystem", "code");

-- CreateIndex
CREATE INDEX "EncounterDiagnosis_diagnosisId_idx" ON "EncounterDiagnosis"("diagnosisId");

-- CreateIndex
CREATE UNIQUE INDEX "EncounterDiagnosis_encounterId_diagnosisId_key" ON "EncounterDiagnosis"("encounterId", "diagnosisId");

-- CreateIndex
CREATE INDEX "Product_organizationId_idx" ON "Product"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_organizationId_name_key" ON "Product"("organizationId", "name");

-- CreateIndex
CREATE INDEX "InventoryLot_organizationId_expiresOn_idx" ON "InventoryLot"("organizationId", "expiresOn");

-- CreateIndex
CREATE INDEX "InventoryLot_productId_idx" ON "InventoryLot"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLot_organizationId_productId_lotNumber_key" ON "InventoryLot"("organizationId", "productId", "lotNumber");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_occurredAt_idx" ON "AuditLog"("organizationId", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_action_occurredAt_idx" ON "AuditLog"("organizationId", "action", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_resourceType_resourceId_idx" ON "AuditLog"("organizationId", "resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "UserIdentity" ADD CONSTRAINT "UserIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganizationMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phi"."PatientIdentifier" ADD CONSTRAINT "PatientIdentifier_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganizationMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_providerMembershipId_fkey" FOREIGN KEY ("providerMembershipId") REFERENCES "OrganizationMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Injection" ADD CONSTRAINT "Injection_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Injection" ADD CONSTRAINT "Injection_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Injection" ADD CONSTRAINT "Injection_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjectionAssessment" ADD CONSTRAINT "InjectionAssessment_injectionId_fkey" FOREIGN KEY ("injectionId") REFERENCES "Injection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Followup" ADD CONSTRAINT "Followup_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterRegion" ADD CONSTRAINT "EncounterRegion_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Muscle" ADD CONSTRAINT "Muscle_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "MuscleRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMusclePreference" ADD CONSTRAINT "OrganizationMusclePreference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMusclePreference" ADD CONSTRAINT "OrganizationMusclePreference_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterDiagnosis" ADD CONSTRAINT "EncounterDiagnosis_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterDiagnosis" ADD CONSTRAINT "EncounterDiagnosis_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "Diagnosis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorMembershipId_fkey" FOREIGN KEY ("actorMembershipId") REFERENCES "OrganizationMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
