-- Canonical v1 — Operational Hardening Pack (FINAL)
-- Applies:
-- 1) Ensure schema "phi" exists + move PatientIdentifier there if it exists in public (brownfield)
-- 2) Composite FK enforcement to prevent org drift (incl. Encounter<->Patient)
-- 3) Optional DB-level gates: pending invite uniqueness
-- 4) Least privilege roles + grants
-- 5) DB-level immutability via column-level UPDATE privileges (no triggers)
--
-- IMPORTANT OPS MODEL:
-- - Run migrations with a migrator/admin DB user (DDL + GRANT/REVOKE capable)
-- - Run the app at runtime with a restricted principal (member of app_rw)
-- Do NOT point prisma migrate deploy at the restricted runtime principal.

BEGIN;

-- 0) Ensure PHI schema exists
CREATE SCHEMA IF NOT EXISTS phi;

-- 1) Move PatientIdentifier from public -> phi if needed (brownfield only)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'PatientIdentifier'
  ) THEN
    ALTER TABLE "public"."PatientIdentifier" SET SCHEMA phi;
  END IF;
END $$;

-- 2) Drop composite constraints first (dev/reset robustness)
ALTER TABLE "public"."Encounter" DROP CONSTRAINT IF EXISTS "fk_encounter_createdBy_membership_org";
ALTER TABLE "public"."Encounter" DROP CONSTRAINT IF EXISTS "fk_encounter_provider_membership_org";
ALTER TABLE "public"."Encounter" DROP CONSTRAINT IF EXISTS "fk_encounter_patient_org";
ALTER TABLE "phi"."PatientIdentifier" DROP CONSTRAINT IF EXISTS "fk_patientIdentifier_patient_org";
ALTER TABLE "public"."Injection" DROP CONSTRAINT IF EXISTS "fk_injection_encounter_org";

-- 3) Composite FK enforcement (foot-gun killers)

-- 3.1 Encounter creator/provider membership must match Encounter.organizationId
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

-- 3.2 Encounter.patient must match Encounter.organizationId  (CRITICAL)
ALTER TABLE "public"."Encounter"
  ADD CONSTRAINT "fk_encounter_patient_org"
  FOREIGN KEY ("organizationId","patientId")
  REFERENCES "public"."Patient" ("organizationId","id")
  ON DELETE RESTRICT
  ON UPDATE RESTRICT;

-- 3.3 PatientIdentifier must match Patient.organizationId (phi schema)
ALTER TABLE "phi"."PatientIdentifier"
  ADD CONSTRAINT "fk_patientIdentifier_patient_org"
  FOREIGN KEY ("organizationId","patientId")
  REFERENCES "public"."Patient" ("organizationId","id")
  ON DELETE CASCADE
  ON UPDATE RESTRICT;

-- 3.4 Injection.organizationId must match Encounter.organizationId (denormalized orgId)
ALTER TABLE "public"."Injection"
  ADD CONSTRAINT "fk_injection_encounter_org"
  FOREIGN KEY ("organizationId","encounterId")
  REFERENCES "public"."Encounter" ("organizationId","id")
  ON DELETE CASCADE
  ON UPDATE RESTRICT;

-- NOTE: Injection → Encounter will have TWO FKs (expected):
-- - plain FK from Prisma: Injection(encounterId) → Encounter(id)
-- - composite FK above enforcing org match

-- 4) DB-level gate: prevent multiple pending invites per (org,email)
-- Relies on app-layer email normalization (lowercase+trim). Case-insensitive requires CITEXT later.
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_invite_pending_per_org_email"
ON "public"."OrganizationInvite" ("organizationId", "email")
WHERE "acceptedAt" IS NULL;

-- 5) Least privilege roles + grants

-- 5.1 Roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_rw') THEN
    CREATE ROLE app_rw;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'reporting_ro') THEN
    CREATE ROLE reporting_ro;
  END IF;
END $$;

-- 5.2 Lock down schema access for PUBLIC
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA phi FROM PUBLIC;

-- 5.3 Schema usage
GRANT USAGE ON SCHEMA public TO app_rw;
GRANT USAGE ON SCHEMA phi TO app_rw;

GRANT USAGE ON SCHEMA public TO reporting_ro;
-- reporting_ro intentionally does NOT get USAGE on phi

-- 5.4 Existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA phi TO app_rw;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_ro;

-- 5.5 Future tables (default privileges)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA phi    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO reporting_ro;
-- none for reporting_ro in phi

-- 5.6 GLUE STEP (MANDATORY): attach your runtime login/principal to app_rw
-- Replace <RUNTIME_LOGIN> with your actual DB login user/principal (e.g., "app_user").
-- If using Entra/managed identity DB auth, grant to that mapped role/principal.
--
-- Examples:
--   GRANT app_rw TO "app_user";
--   ALTER ROLE "app_user" SET ROLE app_rw;
--
-- !!! You must set this correctly or runtime will hit permission denied.
-- NOTE: We cannot auto-detect the runtime login name here.
GRANT app_rw TO "runtime_user";
ALTER ROLE "runtime_user" SET ROLE app_rw;

-- 6) DB-level immutability via column-level UPDATE (no triggers)
-- Strategy: revoke broad UPDATE, then grant UPDATE only for safe columns.

-- Injection: organizationId and encounterId immutable
REVOKE UPDATE ON TABLE "public"."Injection" FROM app_rw;
GRANT UPDATE (
  "muscleId","side","units","volumeMl","notes","lotId","updatedAt"
) ON TABLE "public"."Injection" TO app_rw;

-- Encounter: prevent moving across org/patient/memberships after creation
REVOKE UPDATE ON TABLE "public"."Encounter" FROM app_rw;
GRANT UPDATE (
  "encounterAt","encounterLocalDate","status","treatmentSite","indication","productId",
  "dilutionText","dilutionUnitsPerMl","totalUnits","effectNotes","adverseEventNotes","updatedAt"
) ON TABLE "public"."Encounter" TO app_rw;

-- Patient: prevent changing organizationId after creation
REVOKE UPDATE ON TABLE "public"."Patient" FROM app_rw;
GRANT UPDATE (
  "status","systemLabel","notes","updatedAt"
) ON TABLE "public"."Patient" TO app_rw;

-- PatientIdentifier (PHI): prevent org/patient relinking after creation
REVOKE UPDATE ON TABLE "phi"."PatientIdentifier" FROM app_rw;
GRANT UPDATE (
  "ehrPatientId","dateOfBirth","birthYear","sourceSystem","updatedAt"
) ON TABLE "phi"."PatientIdentifier" TO app_rw;

COMMIT;
