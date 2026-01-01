-- 1. Encounter creator/provider membership must match Encounter.organizationId
ALTER TABLE "public"."Encounter"
  ADD CONSTRAINT "fk_encounter_createdBy_membership_org"
  FOREIGN KEY ("organizationId","createdByMembershipId")
  REFERENCES "public"."OrganizationMembership" ("organizationId","id")
  ON DELETE RESTRICT
  ON UPDATE RESTRICT;

ALTER TABLE "public"."Encounter"
  ADD CONSTRAINT "fk_encounter_provider_membership_org"
  FOREIGN KEY ("organizationId","providerMembershipId")
  REFERENCES "public"."OrganizationMembership" ("organizationId","id")
  ON DELETE RESTRICT
  ON UPDATE RESTRICT;

-- 2. Encounter.patient must match Encounter.organizationId (CRITICAL)
ALTER TABLE "public"."Encounter"
  ADD CONSTRAINT "fk_encounter_patient_org"
  FOREIGN KEY ("organizationId","patientId")
  REFERENCES "public"."Patient" ("organizationId","id")
  ON DELETE RESTRICT
  ON UPDATE RESTRICT;

-- 3. PatientIdentifier must match Patient.organizationId (phi schema)
ALTER TABLE "phi"."PatientIdentifier"
  ADD CONSTRAINT "fk_patientIdentifier_patient_org"
  FOREIGN KEY ("organizationId","patientId")
  REFERENCES "public"."Patient" ("organizationId","id")
  ON DELETE CASCADE
  ON UPDATE RESTRICT;

-- 4. Injection.organizationId must match Encounter.organizationId (denormalized orgId)
ALTER TABLE "public"."Injection"
  ADD CONSTRAINT "fk_injection_encounter_org"
  FOREIGN KEY ("organizationId","encounterId")
  REFERENCES "public"."Encounter" ("organizationId","id")
  ON DELETE CASCADE
  ON UPDATE RESTRICT;

-- 5. Prevent multiple pending invites per (org,email)
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_invite_pending_per_org_email"
ON "public"."OrganizationInvite" ("organizationId", "email")
WHERE "acceptedAt" IS NULL;
