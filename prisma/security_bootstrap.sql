-- Security Bootstrap & RBAC Setup
-- Run this MANUALLY in Azure Query Editor or psql as SERVER ADMIN.
-- This is NOT run by Prisma Migrate.

BEGIN;

-- 1. Lock down schema access for PUBLIC
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA phi FROM PUBLIC;

-- 2. Schema Usage Grants
-- app_rw needs usage on both schemas
GRANT USAGE ON SCHEMA public TO app_rw;
GRANT USAGE ON SCHEMA phi TO app_rw;

-- reporting_ro only gets public
GRANT USAGE ON SCHEMA public TO reporting_ro;

-- 3. Table Privileges (Existing Tables)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA phi TO app_rw;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_ro;

-- 4. Default Privileges (Future Tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA phi    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO reporting_ro;

-- 5. Runtime User Assignment
GRANT app_rw TO "runtime_user";
ALTER ROLE "runtime_user" SET ROLE app_rw;

-- 6. Column-Level Immutability (Hardening)
-- 6.1 Injection: Immutable organizationId, encounterId
REVOKE UPDATE ON TABLE "public"."Injection" FROM app_rw;
GRANT UPDATE (
  "muscleId","side","units","volumeMl","notes","lotId","updatedAt"
) ON TABLE "public"."Injection" TO app_rw;

-- 6.2 Encounter: Immutable org/patient/memberships context
REVOKE UPDATE ON TABLE "public"."Encounter" FROM app_rw;
GRANT UPDATE (
  "encounterAt","encounterLocalDate","status","treatmentSite","indication","productId",
  "dilutionText","dilutionUnitsPerMl","totalUnits","effectNotes","adverseEventNotes","updatedAt"
) ON TABLE "public"."Encounter" TO app_rw;

-- 6.3 Patient: Immutable organizationId
REVOKE UPDATE ON TABLE "public"."Patient" FROM app_rw;
GRANT UPDATE (
  "status","systemLabel","notes","updatedAt"
) ON TABLE "public"."Patient" TO app_rw;

-- 6.4 PatientIdentifier (PHI): Immutable IDs and linkage
REVOKE UPDATE ON TABLE "phi"."PatientIdentifier" FROM app_rw;
GRANT UPDATE (
  "ehrPatientId","dateOfBirth","birthYear","sourceSystem","updatedAt"
) ON TABLE "phi"."PatientIdentifier" TO app_rw;

COMMIT;
